#!/usr/bin/env python3
"""Download Wellcome MS Chinese 99 and optionally draft OCR + English translations.

Source: https://wellcomecollection.org/works/f8b2bkkd (Public Domain Mark).
This does not alter other manuscripts. All model readings remain unverified.
Install optional dependencies: pip install requests openai
Examples:
  python scripts/process_wellcome_ms99.py --mode download --pages 1-52
  OPENAI_API_KEY=... python scripts/process_wellcome_ms99.py --mode ocr --pages 2-4 --publish
"""
import argparse
import base64
import json
import os
import sys
import time
from pathlib import Path

import requests

STEM = "b14870435_chinese_99"
ROOT = Path(__file__).resolve().parent.parent
DRAFT_FILE = ROOT / "data/wellcome_ms99_api_ocr_candidates.js"
OUT_DEFAULT = Path.home() / "Downloads" / "wellcome_ms99"
OCR_PROMPT = """Examine this Qing Chinese manuscript scan. Return a JSON object only:
{"kind":"illustration|non_text|text|mixed|uncertain","chinese":"","uncertainty":""}.
Classify illustration if there is no text, and do NOT invent a transcription.
For text use traditional Chinese and read columns top-to-bottom, right-to-left.
Use □ for any illegible character. Retain historical characters and language.
For mixed painting and caption give both a transcription and kind mixed.
Do not invent missing columns. Give uncertainty notes in Chinese."""
TRANSLATION_PROMPT = """Translate this provisional Qing Chinese transcription faithfully
into English. Treat derogatory ethnic descriptions as claims by the historical author.
Preserve uncertain characters □ as [illegible]. Do not fill gaps or invent context.
Return translation only.
"""

def page_list(spec):
    result = set()
    for bit in spec.split(","):
        a = bit.strip().split("-")
        if len(a) == 2:
            result.update(range(int(a[0]), int(a[1]) + 1))
        elif len(a) == 1:
            result.add(int(a[0]))
    if not result or min(result) < 1 or max(result) > 52:
        raise ValueError("Allowed page numbers: 1-52")
    return sorted(result)

def download(page, output, width):
    path = output / "scans" / ("page_%04d.jpg" % page)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.stat().st_size > 1000:
        return path
    url = "https://iiif.wellcomecollection.org/image/%s_%04d.jp2/full/%d,/0/default.jpg" % (STEM, page, width)
    for retry in range(3):
        try:
            response = requests.get(url, headers={"User-Agent": "MiaoAlbumsAcademicResearch/1.0"}, timeout=(15, 120))
            response.raise_for_status()
            if not response.headers.get("content-type", "").startswith("image/") or len(response.content) < 1000:
                raise ValueError("Response is not a usable image")
            path.write_bytes(response.content)
            return path
        except (requests.RequestException, ValueError):
            if retry == 2:
                raise
            time.sleep(retry + 2)

def ask(client, model, prompt, image_path=None):
    parts = [{"type": "input_text", "text": prompt}]
    if image_path:
        encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
        parts.append({"type": "input_image", "image_url": "data:image/jpeg;base64," + encoded, "detail": "high"})
    result = client.responses.create(model=model, input=[{"role": "user", "content": parts}])
    return (result.output_text or "").strip()

def draft(ocr, translation):
    kind = str(ocr.get("kind", "uncertain"))
    chinese = str(ocr.get("chinese", "")).strip()
    if kind not in {"illustration", "non_text", "text", "mixed", "uncertain"}:
        kind = "uncertain"
    note = "Wellcome MS Chinese 99；Public Domain Mark。AI 圖像校讀初稿，尚未經研究者核校。疑字：" + str(ocr.get("uncertainty") or "未報告")
    if kind in {"illustration", "non_text"}:
        return {"page_kind": kind, "status": "image_only" if kind == "illustration" else "non_text",
                "ocr_raw": "", "transcription": "", "translation": "", "notes": note}
    if not chinese:
        return {"page_kind": "scan_only", "status": "scan_only",
                "ocr_raw": "", "transcription": "", "translation": "", "notes": note}
    return {"page_kind": "caption_and_illustration" if kind == "mixed" else "caption",
            "status": "image_checked_draft", "ocr_raw": chinese, "transcription": chinese,
            "translation": translation, "translation_status": "ai_draft" if translation else "not_started",
            "notes": note + "。中英文字稿未人工校訂，引用前必須逐列核對原圖。"}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=["download", "ocr"], default="download")
    parser.add_argument("--pages", default="1-52")
    parser.add_argument("--width", type=int, default=2200)
    parser.add_argument("--model", default="gpt-4.1")
    parser.add_argument("--out", type=Path, default=OUT_DEFAULT)
    parser.add_argument("--publish", action="store_true", help="Write API candidate JS only; never overwrite curated Wellcome transcriptions")
    args = parser.parse_args()
    if args.publish and args.mode != "ocr":
        parser.error("--publish only works with --mode ocr")
    client = None
    if args.mode == "ocr":
        if not os.environ.get("OPENAI_API_KEY"):
            parser.error("Set OPENAI_API_KEY in your environment first; never commit the key")
        from openai import OpenAI
        client = OpenAI()
    ocr_dir = args.out / "ocr"
    ocr_dir.mkdir(parents=True, exist_ok=True)
    for page in page_list(args.pages):
        try:
            image_path = download(page, args.out, args.width)
            print("Downloaded/verified page %02d: %s" % (page, image_path))
            if args.mode != "ocr":
                continue
            output = ocr_dir / ("page_%04d.json" % page)
            if output.exists():
                print("Kept existing draft:", output)
                continue
            response = ask(client, args.model, OCR_PROMPT, image_path)
            a, b = response.find("{"), response.rfind("}")
            if a < 0 or b <= a:
                raise ValueError("Model did not produce a JSON OCR result")
            result = json.loads(response[a:b+1])
            kind, chinese = result.get("kind"), str(result.get("chinese", "")).strip()
            translation = ""
            if chinese and kind not in ("illustration", "non_text"):
                translation = ask(client, args.model, TRANSLATION_PROMPT + "\n" + chinese)
            output.write_text(json.dumps(draft(result, translation), ensure_ascii=False, indent=2), encoding="utf-8")
            print("Saved provisional reading:", output)
        except Exception as exc:
            print("Page %d failed: %s" % (page, exc), file=sys.stderr)
    if args.publish:
        patches = {}
        for path in sorted(ocr_dir.glob("page_*.json")):
            page = int(path.stem[-4:])
            if 1 <= page <= 52:
                patches["wellcome-ms99-p%04d" % page] = json.loads(path.read_text(encoding="utf-8"))
        DRAFT_FILE.write_text(
            "// Provisional machine image-reading drafts. NOT human-verified.\n"
            "window.MIAO_WELLCOME_MS99_API_OCR_CANDIDATES = " + json.dumps(patches, ensure_ascii=False, indent=2) + ";\n",
            encoding="utf-8")
        print("Wrote draft overlay:", DRAFT_FILE, "pages:", len(patches))

if __name__ == "__main__":
    main()

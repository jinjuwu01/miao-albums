#!/usr/bin/env python3
"""Manchester Chinese Crawford 398: source-specific IIIF scans and provisional OCR.

No texts are taken from parallel Miao-album recensions. The site records and
existing reviewed drafts are not modified by the OCR step. Requires network
access to the University of Manchester's own IIIF image service.

Examples (from repository root):
  python3 scripts/process_manchester_c398.py --mode download --pages candidate
  python3 scripts/process_manchester_c398.py --mode ocr --pages 9,11,13
  python3 scripts/process_manchester_c398.py --mode publish

Optional OCR dependency: pip install openai
Set OPENAI_API_KEY in your shell (never commit API keys).
"""
import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://image.digitalcollections.manchester.ac.uk/iiif"
PREFIX = "PR-CHCR-00398-000-"
COLLECTION = "Chinese Crawford 398"
CANDIDATE_PAGES = [75] + list(range(77, 96, 2)) + list(range(105, 196, 2))
ALL_POSSIBLE_TEXT_PAGES = [6, 7] + list(range(9, 96, 2)) + list(range(105, 196, 2))
PROMPT = """You are transcribing a photographed eighteenth-century Chinese manuscript
from the University of Manchester, Chinese Crawford 398, not from any other edition.
FIRST inspect this very image. Classify it as 'caption', 'preface',
'illustration', 'blank', or 'other'. A painting without written passages
must have an empty transcription. If there is handwritten Chinese text,
transcribe ALL VISIBLE characters in the original vertical-column order:
rightmost column to leftmost; within each column top to bottom.
Keep historical spellings/ethnonyms, and do NOT normalize or supply missing
words from any other Miao Album edition. For genuinely unreadable single
characters write □. Do not infer complete sentences where the image is
illegible. No invented words. Provide a careful English draft translation
of ONLY the transcribed Chinese; if the transcription is fragmentary,
describe the translation as partial. Return exactly one JSON object with
keys page_kind, title, transcription, translation, uncertainty_notes.
All fields must be strings. Do not use Markdown code fences."""

def pages_from_spec(raw):
    if raw == "candidate":
        return CANDIDATE_PAGES
    if raw == "text":
        return ALL_POSSIBLE_TEXT_PAGES
    if raw == "all":
        return list(range(1, 203))
    pages = set()
    for token in raw.split(","):
        token = token.strip()
        if not token:
            continue
        if "-" in token:
            a, b = map(int, token.split("-", 1))
            if a > b:
                raise ValueError("Descending page range is not supported")
            pages.update(range(a, b + 1))
        else:
            pages.add(int(token))
    if not pages or min(pages) < 1 or max(pages) > 202:
        raise ValueError("Image numbers must be within 1..202")
    return sorted(pages)

def path_for(root, number):
    return root / "scans" / f"page_{number:04d}.jpg"

def image_url(number, width):
    return f"{BASE}/{PREFIX}{number:05d}.jp2/full/{width},/0/default.jpg"

def download_one(root, number, width):
    dest = path_for(root, number)
    if dest.exists() and dest.stat().st_size > 5000:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    url = image_url(number, width)
    request = urllib.request.Request(url, headers={"User-Agent": "MiaoAlbumsResearch/1.0 (scholarly OCR)", "Accept": "image/jpeg"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=75) as reply:
                data = reply.read()
                mime = reply.headers.get("content-type", "")
            if "image" not in mime or not data.startswith(b"\xff\xd8"):
                raise ValueError(f"IIIF did not return JPEG for canvas {number}: {mime}")
            if len(data) < 5000:
                raise ValueError(f"Image too small ({len(data)} bytes)")
            dest.write_bytes(data)
            return dest
        except (OSError, ValueError, urllib.error.URLError) as err:
            if attempt == 2:
                raise RuntimeError(f"Canvas {number}: {err}") from err
            time.sleep(2 * (attempt + 1))

def transcribe_image(image_path, number, model):
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("Install the OpenAI package: python3 -m pip install openai") from exc
    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is missing. Set it locally; do not commit the key.")
    image_b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    client = OpenAI()
    result = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": [
                {"type": "text", "text": f"Transcribe Manchester collection canvas {number}; use this image only."},
                {"type": "image_url", "image_url": {
                    "url": "data:image/jpeg;base64," + image_b64,
                    "detail": "high"
                }},
            ]},
        ],
    )
    answer = json.loads(result.choices[0].message.content or "{}")
    for field in ("page_kind", "title", "transcription", "translation", "uncertainty_notes"):
        answer[field] = str(answer.get(field, "") or "")
    if answer["page_kind"] not in {"caption", "preface", "illustration", "blank", "other"}:
        answer["page_kind"] = "other"
    if answer["page_kind"] in {"illustration", "blank", "other"}:
        answer["transcription"] = ""
        answer["translation"] = ""
    return answer

def read_existing_drafts(repo):
    data_file = repo / "data" / "rsl_manchester_ocr_drafts.js"
    content = data_file.read_text(encoding="utf-8")
    i, j = content.index("{"), content.rindex("}") + 1
    return json.loads(content[i:j])

def read_candidate_overlay(repo):
    """Read any previously published source-specific OCR overlay without erasing it."""
    file = repo / "data" / "manchester_ocr_candidates.js"
    if not file.exists():
        return {}
    text = file.read_text(encoding="utf-8")
    match = re.search(r"window\\.MIAO_MANCHESTER_OCR_CANDIDATES\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*;", text)
    if not match:
        raise ValueError(f"Cannot parse existing OCR overlay; refusing to overwrite {file}")
    return json.loads(match.group(1))


def publish(root, repo):
    existing = read_existing_drafts(repo)
    records = read_candidate_overlay(repo)
    skipped = []
    for path in sorted((root / "ocr").glob("page_*.json")):
        obj = json.loads(path.read_text(encoding="utf-8"))
        n = int(path.stem.split("_")[-1])
        rid = f"manchester-c398-p{n:03d}"
        if existing.get(rid, {}).get("transcription") or records.get(rid, {}).get("transcription"):
            skipped.append(n)
            continue
        kind = obj.get("page_kind")
        text = str(obj.get("transcription", "")).strip()
        if kind not in {"caption", "preface"} or not text:
            continue
        translation = str(obj.get("translation", "")).strip()
        notes = str(obj.get("uncertainty_notes", "")).strip()
        records[rid] = {
            "title": str(obj.get("title", "")).strip() or f"IIIF canvas {n}（待校讀）",
            "page_kind": kind,
            "status": "image_checked_draft",
            "ocr_raw": text,
            "transcription": text,
            "transcription_scope": "ai_image_transcription_unverified",
            "text_completeness": "unverified_candidate",
            "translation": translation,
            "translation_status": "ai_draft" if translation else "not_started",
            "english_completeness": "provisional" if translation else "none",
            "translation_scope": "AI trial translation of this image only; verify before citing",
            "ocr_engine": "OpenAI image-led OCR draft; NOT human-reviewed",
            "source_review": f"University of Manchester, Chinese Crawford 398, IIIF canvas {n}",
            "notes": f"逐頁 AI 圖像識讀草稿，非人工校定。{notes}",
        }
    dest = repo / "data" / "manchester_ocr_candidates.js"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(
        "// Provisional Manchester-specific AI readings. Existing visual drafts take priority.\n"
        "window.MIAO_MANCHESTER_OCR_CANDIDATES = "
        + json.dumps(records, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Overlay contains {len(records)} candidate entries after a non-destructive merge: {dest}.")
    print(f"Skipped {len(skipped)} pages with existing transcriptions (legacy or candidate overlay).")
    return len(records)

def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--mode", choices=["download", "ocr", "publish"], required=True)
    parser.add_argument("--pages", default="candidate", help="text (92 text-page candidates), candidate (57 new), all (202), or 9,11,13")
    parser.add_argument("--width", type=int, default=2400)
    parser.add_argument("--model", default="gpt-4.1", help="API vision model, for example gpt-4.1")
    parser.add_argument("--root", type=Path, default=Path("manchester_c398_work"))
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[1]
    root = args.root.resolve()
    if args.mode == "publish":
        publish(root, repo)
        return
    pages = pages_from_spec(args.pages)
    failures = []
    for count, n in enumerate(pages, 1):
        try:
            image = download_one(root, n, args.width)
            if args.mode == "ocr":
                output = root / "ocr" / f"page_{n:04d}.json"
                if output.exists() and not args.force:
                    print(f"[{count}/{len(pages)}] Canvas {n}: already OCR'd")
                    continue
                obj = transcribe_image(image, n, args.model)
                obj.update({
                    "canvas": n, "manuscript": COLLECTION,
                    "image_url": image_url(n, args.width),
                    "ocr_source": "image-led AI candidate only; unverified",
                })
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                print(f"[{count}/{len(pages)}] Canvas {n}: {obj['page_kind']} ({len(obj['transcription'])} characters)")
            else:
                print(f"[{count}/{len(pages)}] Downloaded canvas {n}: {image}")
        except Exception as err:
            failures.append(n)
            print(f"WARNING: {err}", file=sys.stderr)
    if failures:
        print("Unprocessed canvases:", ", ".join(map(str, failures)), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Import completed PaddleOCR batch results as new searchable Miao album records.
Uses the *_done.json and *_draft.txt created by run_miao_ocr_batch.py.
Requires pypdfium2 and Pillow, installed in the user's working PaddleOCR venv.
Leaves the original PDF, OCR JSON, and legacy 40 website records untouched.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

NOTE = "PaddleOCR 自动识别稿，未校对；可能漏字、误字及竖排列序错误。引证前须核对原图。"

def save(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    temp.write_text(content, encoding="utf-8")
    temp.replace(path)

def generate_images(doc, index, image, thumb, edge, quality):
    page = doc[index]
    try:
        w, h = page.get_size()
        bitmap = page.render(scale=edge / max(w, h))
        try:
            picture = bitmap.to_pil()
            if picture.mode != "RGB":
                picture = picture.convert("RGB")
            try:
                image.parent.mkdir(parents=True, exist_ok=True)
                picture.save(image, "WEBP", quality=quality, method=4)
                picture.thumbnail((320, 320))
                picture.save(thumb, "WEBP", quality=65, method=4)
            finally:
                picture.close()
        finally:
            bitmap.close()
    finally:
        page.close()

def main():
    parser = argparse.ArgumentParser(description="Import local PaddleOCR PDFs into Miao Albums GitHub Pages")
    parser.add_argument("--ocr-root", type=Path, default=Path.home()/"miao-ocr"/"results_batch")
    parser.add_argument("--pdf-root", type=Path, default=Path.home()/"miao-ocr"/"images")
    parser.add_argument("--site-root", type=Path, default=Path.cwd())
    parser.add_argument("--max-pages", type=int, help="Import only the first N completed pages for a test")
    parser.add_argument("--image-edge", type=int, default=1500, help="Max dimension of web preview (default 1500 px)")
    parser.add_argument("--quality", type=int, default=76, help="WEBP quality (default 76)")
    parser.add_argument("--refresh-images", action="store_true")
    args = parser.parse_args()
    if args.max_pages is not None and args.max_pages <= 0:
        parser.error("--max-pages must be positive")
    if not 800 <= args.image_edge <= 3000 or not 35 <= args.quality <= 95:
        parser.error("Invalid image size / quality")
    ocr, pdfroot, site = (x.expanduser().resolve() for x in (args.ocr_root,args.pdf_root,args.site_root))
    for path in (ocr,pdfroot):
        if not path.is_dir():
            parser.error(f"Folder not found: {path}")
    if not (site/"index.html").is_file() or not (site/"data"/"records.js").is_file():
        parser.error("--site-root must point to the downloaded miao-albums repository")
    try:
        import pypdfium2 as pdfium
        from PIL import Image
    except ImportError as e:
        parser.error(f"Missing PDF/image packages in this environment: {e}")
    records_file = site/"data"/"imported_ocr.json"
    old = json.loads(records_file.read_text(encoding="utf-8")) if records_file.exists() else []
    if not isinstance(old,list):
        parser.error("data/imported_ocr.json must contain a JSON list")
    existing = {r["id"]:r for r in old if isinstance(r,dict) and isinstance(r.get("id"),str)}
    combined = existing.copy()
    docs = {}
    count = 0
    errors = []
    try:
        for marker in sorted(ocr.rglob("page_*_done.json")):
            if args.max_pages is not None and count >= args.max_pages:
                break
            try:
                done = json.loads(marker.read_text(encoding="utf-8"))
                source = done.get("source","")
                page = int(done["page"])
                if not isinstance(source,str) or not source.lower().endswith(".pdf"):
                    continue
                if Path(source).is_absolute() or ".." in Path(source).parts or page < 1:
                    continue
                if marker.name != f"page_{page:04d}_done.json":
                    continue
                txt = marker.with_name(f"page_{page:04d}_draft.txt")
                raw_json = marker.with_name(f"page_{page:04d}.json")
                if not txt.is_file() or not raw_json.is_file():
                    continue
                original = (pdfroot/source).resolve()
                try:
                    original.relative_to(pdfroot)
                except ValueError:
                    continue
                if not original.is_file():
                    errors.append(f"Original PDF missing: {source}")
                    continue
                stat = original.stat()
                if done.get("source_size", stat.st_size) != stat.st_size or done.get("source_mtime_ns", stat.st_mtime_ns) != stat.st_mtime_ns:
                    errors.append(f"Original PDF changed since OCR: {source} p.{page}")
                    continue
                if source not in docs:
                    docs[source] = pdfium.PdfDocument(str(original))
                doc = docs[source]
                total = len(doc)
                if page > total:
                    errors.append(f"Page outside PDF: {source} p.{page}")
                    continue
                slug = hashlib.sha256(source.encode("utf-8")).hexdigest()[:12]
                rid = f"ocr-{slug}-p{page:04d}"
                image = site/"images"/"collections"/slug/f"page_{page:04d}.webp"
                thumb = site/"images"/"collections"/slug/f"thumb_{page:04d}.webp"
                if args.refresh_images or not image.is_file() or not thumb.is_file():
                    generate_images(doc,page-1,image,thumb,args.image_edge,args.quality)
                prior = existing.get(rid,{})
                title = Path(source).stem
                image_url = image.relative_to(site).as_posix()
                combined[rid] = {
                    "id":rid,"folio":page,"pdf_page":page,"page_total":total,
                    "source_title":title,"source_file":source,"collection_id":slug,
                    "title":prior.get("title") or f"第 {page} 页",
                    "title_en":prior.get("title_en") or f"Page {page}",
                    "image":image_url,
                    "thumb":thumb.relative_to(site).as_posix(),
                    "text_image":prior.get("text_image") or image_url,
                    "ocr_raw":txt.read_text(encoding="utf-8").strip(),
                    "transcription":prior.get("transcription",""),
                    "translation":prior.get("translation",""),
                    "status":prior.get("status","ocr_unverified"),
                    "notes":prior.get("notes") or NOTE,
                    "tags":prior.get("tags",[]),
                    "visual_tags":prior.get("visual_tags",[]),
                    "ocr_engine":"PaddleOCR PP-OCRv5 chinese_cht",
                    "segment_count":done.get("segment_count",0),
                }
                count += 1
                print(f"✓ {title}: {page}/{total} → {image_url}",flush=True)
            except (OSError,ValueError,TypeError,RuntimeError,KeyError) as exc:
                errors.append(f"{marker}: {exc}")
    finally:
        for doc in docs.values():
            doc.close()
    if count == 0:
        print("No completed OCR PDF pages were imported.",file=sys.stderr)
        for err in errors[:20]:
            print("✗ "+err,file=sys.stderr)
        return 1
    output = sorted(combined.values(), key=lambda r:(r.get("source_title",""),int(r.get("pdf_page",0)),r["id"]))
    save(records_file,json.dumps(output,ensure_ascii=False,indent=2)+"\n")
    save(site/"data"/"imported_ocr.js","window.MIAO_IMPORTED_RECORDS = "+json.dumps(output,ensure_ascii=False,separators=(",",":"))+";\n")
    print(f"\nImported {count} page(s); new album catalogue contains {len(output)} page(s).")
    print("Existing curated records are unchanged. Do not mistake OCR for edited transcription.")
    print("Warning: GitHub Pages has a 1 GB published site limit; use external image storage as you scale.")
    for err in errors[:20]:
        print("✗ "+err)
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Publish only fully human-reviewed column transcriptions to the static archive.

Usage:
  python3 scripts/publish_column_reviews.py ~/Downloads/miao-review-miao-001.json
  python3 scripts/publish_column_reviews.py ~/Downloads/miao-review-all-pages.json --dry-run

This never changes data/records.*, data/imported_ocr.*, or OCR originals.
"""
import argparse
import json
import sys
from pathlib import Path

SCHEMA = "miao-column-review-v1"
PREFIX = "window.MIAO_COLUMN_REVIEWS = "
DEFAULT_ROOT = Path(__file__).resolve().parents[1]


def load_export(path):
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict) or raw.get("schema") != SCHEMA:
        raise ValueError("Not a miao-column-review-v1 export")
    if isinstance(raw.get("pages"), dict):
        return list(raw["pages"].values())
    return [raw]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("review_json", type=Path, help="File exported from review.html")
    parser.add_argument("--site-root", type=Path, default=DEFAULT_ROOT)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--replace", action="store_true", help="Replace a previously published column transcription")
    args = parser.parse_args()
    root = args.site_root.expanduser().resolve()
    path = args.review_json.expanduser().resolve()
    if not path.is_file():
        parser.error("Review file not found: " + str(path))
    known = {}
    for name in ("records.json", "imported_ocr.json"):
        for item in json.loads((root / "data" / name).read_text(encoding="utf-8")):
            known[item["id"]] = item
    destination = root / "data" / "column_reviews.js"
    content = destination.read_text(encoding="utf-8").strip() if destination.exists() else PREFIX + "{};"
    if not content.startswith(PREFIX):
        parser.error("Unexpected data/column_reviews.js format")
    existing = json.loads(content[len(PREFIX):].rstrip(";").strip())
    if not isinstance(existing, dict):
        parser.error("Expected object in data/column_reviews.js")
    updated = 0
    for page in load_export(path):
        if not isinstance(page, dict):
            continue
        rid = page.get("record_id")
        columns = page.get("columns")
        if rid not in known:
            print(f"SKIP unknown record: {rid!r}", file=sys.stderr)
            continue
        if not isinstance(columns, list) or not columns:
            print(f"SKIP {rid}: no columns", file=sys.stderr)
            continue
        record = known[rid]
        if int(record.get("pdf_page") or 0) != int(page.get("pdf_page") or 0):
            print(f"SKIP {rid}: PDF page mismatch", file=sys.stderr)
            continue
        if any(not isinstance(c, dict)
               or c.get("status") != "human_reviewed"
               or not isinstance(c.get("reviewed"), str)
               or not c.get("reviewed", "").strip() for c in columns):
            print(f"SKIP {rid}: every column must be human-reviewed and non-empty", file=sys.stderr)
            continue
        if rid in existing and not args.replace:
            print(f"SKIP {rid}: already published (pass --replace to update)", file=sys.stderr)
            continue
        text = "\n".join(c["reviewed"].strip() for c in columns)
        notes = "逐列人工核读文本；原始 OCR 独立保留。须核对图像版本、字形及引文出处。"
        details = [c.get("notes", "").strip() for c in columns if isinstance(c.get("notes"), str) and c.get("notes", "").strip()]
        if details:
            notes += " 疑字说明：" + "；".join(details)
        existing[rid] = {
            "transcription": text,
            "status": "human_reviewed",
            "notes": notes,
            "reviewed_columns": len(columns),
            "reviewed_at": page.get("updated_at") or None,
        }
        updated += 1
        print(f"READY {rid}: {len(columns)} columns, {len(text)} characters")
    if args.dry_run:
        print(f"DRY RUN: {updated} page(s) eligible; no files changed")
        return 0
    if updated == 0:
        print("No eligible new reviews; data unchanged")
        return 0
    destination.write_text(
        PREFIX + json.dumps(existing, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")
    print(f"Published {updated} page(s) to {destination}. Commit this file to GitHub to update the website.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

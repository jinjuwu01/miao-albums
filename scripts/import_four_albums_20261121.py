#!/usr/bin/env python3
"""Import four separately downloaded Miao album bundles into this static website.
Usage: python scripts/import_four_albums_20261121.py /path/to/four_zip_folder
This program updates local files only; inspect and git push manually.
"""
import json, shutil, zipfile, tempfile, sys
from pathlib import Path

def replace_once(p, old, new):
    s=p.read_text(encoding="utf-8")
    if new in s: return
    if old not in s: raise RuntimeError("Missing anchor in "+str(p))
    p.write_text(s.replace(old,new,1),encoding="utf-8")

def main():
    root=Path(__file__).resolve().parents[1]
    source=Path(sys.argv[1]).expanduser().resolve() if len(sys.argv)>1 else Path.cwd()
    for p in ("index.html","review.html","assets/app.js","assets/review.js"):
        if not (root/p).exists():raise RuntimeError("Missing "+p)
    records=[]
    with tempfile.TemporaryDirectory(prefix="miao_20261121_") as work:
        tmp=Path(work)
        for key in ("jingong","qiansheng","qianmiao57","mukong"):
            folder=source/key
            if not (folder/"plate_records.json").is_file():
                zpath=source/(key+"_highres_ocr_first_pass.zip")
                if not zpath.is_file(): raise RuntimeError("Missing "+str(zpath))
                with zipfile.ZipFile(zpath) as z:z.extractall(tmp)
                folder=tmp/key
            source_records=json.loads((folder/"plate_records.json").read_text(encoding="utf-8"))
            target=root/"images"/"four_albums_20261121"/key
            for sub in ("scans","text","paintings"):
                shutil.copytree(folder/sub,target/sub,dirs_exist_ok=True)
            for p in source_records:
                base="images/four_albums_20261121/"+key+"/"
                art=p["source_pdf_page_art"]; caption=p["source_pdf_page_text"]
                records.append({
                    "id":p["id"],"folio":p["plate_number"],"plate_total":p["plate_total"],
                    "pdf_page":art,"source_title":p["source_title"],"source_file":p["source_file"],
                    "volume":p["volume"],"title":p["title"],
                    "title_en":"Plate %02d - unverified historical label"%p["plate_number"],
                    "image":base+p["image_scan"],"thumb":base+p["image_scan"],
                    "text_image":base+p["text_image"],
                    "paired_image":base+(p["text_scan"] if art!=caption else p["image"]),
                    "paired_pdf_page":caption,"picture_pdf_page":art,
                    "ocr_raw":p["ocr_hant_vert"] or p["ocr_chitra_vert"],
                    "ocr_raw_secondary":p["ocr_chitra_vert"],
                    "transcription":p["transcription"],"translation":"","status":p["status"],
                    "notes":p["notes"]+" Painting PDF p.%d, caption PDF p.%d. OCR is from Tesseract, not PaddleOCR."%(art,caption),
                    "page_kind":"caption","spread_layout":p["spread_layout"],
                    "tags":[],"visual_tags":[]
                })
    if len(records)!=230:raise RuntimeError("Expected 230 plates, got "+str(len(records)))
    data=root/"data"
    (data/"four_albums_20261121.json").write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding="utf-8")
    (data/"four_albums_20261121.js").write_text("window.MIAO_FOUR_ALBUMS = "+json.dumps(records,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
    script='<script src="data/four_albums_20261121.js"></script>\n'
    for name,next_script in (("index.html","<script src=\"assets/app.js"),("review.html","<script src=\"assets/review.js")):
        p=root/name;s=p.read_text(encoding="utf-8")
        if script.strip() not in s:replace_once(p,next_script,script+next_script)
    app=root/"assets/app.js"
    s=app.read_text(encoding="utf-8")
    suffix="...(Array.isArray(window.MIAO_FOUR_ALBUMS) ? window.MIAO_FOUR_ALBUMS : [])"
    if suffix not in s:
        s=s.replace("const IMPORTED_DISPLAY = IMPORTED.flatMap(","const IMPORTED_DISPLAY = [...IMPORTED.flatMap(",1)
        s=s.replace(":[r]);",":[r]), "+suffix+"];",1)
        app.write_text(s,encoding="utf-8")
    review=root/"assets/review.js"
    replace_once(review,
        "const IMPORTED = Array.isArray(window.MIAO_IMPORTED_RECORDS) ? window.MIAO_IMPORTED_RECORDS : [];",
        "const IMPORTED = [...(Array.isArray(window.MIAO_IMPORTED_RECORDS) ? window.MIAO_IMPORTED_RECORDS : []), ...(Array.isArray(window.MIAO_FOUR_ALBUMS) ? window.MIAO_FOUR_ALBUMS : [])];")
    print("Created 230 entries. Check git diff and test images before publishing.")

if __name__=="__main__": main()

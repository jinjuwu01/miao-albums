#!/usr/bin/env python3
"""Download external album images; optionally create separately marked AI OCR/English drafts.

Install: python3 -m pip install requests pymupdf pillow openai
Examples:
  python3 scripts/process_external_albums.py --source manchester --mode download --pages 2-4
  python3 scripts/process_external_albums.py --source rsl-v1 --mode ocr --pages 3-5 --translate
  python3 scripts/process_external_albums.py --source all --mode publish --dry-run
Images/drafts stay under work/external_albums/ and do not overwrite existing manual reviews.
"""
import argparse
import base64
import io
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "work" / "external_albums"
OVERLAY = ROOT / "data" / "rsl_manchester_ocr_drafts.js"
SOURCES = {
    "rsl-v1": (47, "Ф.274 №54.1", "https://upload.wikimedia.org/wikipedia/commons/e/ed/RSL01013071618_%E7%99%BE%E8%8B%97%E5%9C%96_%E6%B8%85%E7%B9%AA%E6%9C%AC_%E4%B8%8A%E5%86%8A.pdf"),
    "rsl-v2": (46, "Ф.274 №54.2", "https://upload.wikimedia.org/wikipedia/commons/1/1c/RSL01013071654_%E7%99%BE%E8%8B%97%E5%9C%96_%E6%B8%85%E7%B9%AA%E6%9C%AC_%E4%B8%8B%E5%86%8A.pdf"),
    "manchester": (202, "Chinese Crawford 398", "https://image.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398-000-{page:05d}.jp2")
}
PROMPT = """Examine exactly ONE Qing Chinese Miao album scan. Return a single JSON object:
{"kind":"text|illustration|mixed|non_text|uncertain",
"title":"","chinese":"","uncertainty":"","text_side":"left|right|full|none|uncertain"}
If an illustration has no writing, give empty Chinese; do not manufacture OCR.
For inscriptions, read traditional Chinese vertical columns top-to-bottom, right-to-left;
retain original historical wording, use □ for doubtful characters and describe uncertainty.
For a cover, binding, blank or decorative image use non_text with empty Chinese.
If the scan cannot be read reliably, use uncertain with empty Chinese.
Do not borrow readings from other copies; do not guess ethnic group names.
Do not conflate a scanned leaf with a whole painted plate. No prose outside JSON."""
TRANSLATE = """Translate the following provisional transcription into English faithfully.
Keep uncertainty marker □ as [illegible]. Treat historical ethnic descriptions as
claims made by the historical author. Do not fill missing words or reorder source text.
Return only the provisional English translation.

"""

def pages(spec, limit):
    if spec == "all":
        return list(range(1,limit+1))
    numbers = set()
    for part in spec.split(","):
        if "-" in part:
            a,b = map(int,part.split("-",1))
            if a > b:
                raise ValueError("Reversed range")
            numbers.update(range(a,b+1))
        else:
            numbers.add(int(part))
    if not numbers or min(numbers) < 1 or max(numbers) > limit:
        raise ValueError("Scan index out of range")
    return sorted(numbers)

def record_id(source,n):
    if source == "manchester":
        return "manchester-c398-p%03d" % n
    return "rsl-f274-%s-p%03d" % ("v1" if source=="rsl-v1" else "v2",n)

def scan_file(source,n,width,session):
    folder = WORK/source/"scans"
    folder.mkdir(parents=True,exist_ok=True)
    path = folder/("page_%04d.jpg"%n)
    if path.exists() and path.stat().st_size > 1500:
        return path
    if source=="manchester":
        url = SOURCES[source][2].format(page=n)+"/full/%d,/0/default.jpg"%width
        r=session.get(url,timeout=(20,120))
        r.raise_for_status()
        if not r.headers.get("content-type","").lower().startswith("image/"):
            raise ValueError("IIIF endpoint returned no image")
        path.write_bytes(r.content)
        return path
    import fitz
    from PIL import Image
    pdf = WORK/source/"source.pdf"
    if not pdf.exists() or pdf.stat().st_size < 100_000:
        pdf.parent.mkdir(parents=True,exist_ok=True)
        tmp=pdf.with_suffix(".partial")
        with session.get(SOURCES[source][2],stream=True,timeout=(30,180)) as r:
            r.raise_for_status()
            with tmp.open("wb") as f:
                for chunk in r.iter_content(chunk_size=2*1024*1024):
                    if chunk:f.write(chunk)
        if tmp.stat().st_size < 100_000:
            raise ValueError("PDF response unexpectedly small")
        tmp.replace(pdf)
    doc=fitz.open(pdf)
    try:
        if len(doc)!=SOURCES[source][0]:
            raise ValueError("PDF source page count changed; stop and inspect")
        page=doc[n-1]
        scale=width/page.rect.width
        pix=page.get_pixmap(matrix=fitz.Matrix(scale,scale),alpha=False)
        img=Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        img.save(path,format="JPEG",quality=90)
    finally:
        doc.close()
    return path

def model_call(client,name,prompt,jpg=None):
    parts=[{"type":"input_text","text":prompt}]
    if jpg is not None:
        data=base64.b64encode(jpg.read_bytes()).decode("ascii")
        parts.append({"type":"input_image","image_url":"data:image/jpeg;base64,"+data,"detail":"high"})
    result=client.responses.create(model=name,input=[{"role":"user","content":parts}])
    return (result.output_text or "").strip()

def parse_json(body):
    body=body.strip().strip(chr(96))
    if body.lower().startswith("json"):
        body=body[4:].strip()
    try:obj=json.loads(body)
    except json.JSONDecodeError:
        a,b=body.find("{"),body.rfind("}")
        if a<0 or b<a:raise ValueError("No JSON OCR object returned")
        obj=json.loads(body[a:b+1])
    if not isinstance(obj,dict):raise ValueError("Invalid OCR response")
    kind=obj.get("kind")
    if kind not in {"text","illustration","mixed","non_text","uncertain"}:
        kind="uncertain"
    chinese=str(obj.get("chinese") or "").strip()
    if kind in {"illustration","non_text","uncertain"}:chinese=""
    if kind in {"text","mixed"} and not chinese:kind="uncertain"
    return {
        "kind":kind,"chinese":chinese,
        "title":str(obj.get("title") or "").strip(),
        "uncertainty":str(obj.get("uncertainty") or "").strip()
    }

def collect_candidates(sources):
    overlays={}
    for source in sources:
        for path in sorted((WORK/source/"ocr").glob("page_*.json")):
            obj=json.loads(path.read_text(encoding="utf-8"))
            rid=obj.get("record_id")
            if not rid or rid != record_id(source,obj["page"]):
                raise ValueError("Record identity mismatch: "+str(path))
            kind=obj["kind"]
            zh=obj.get("chinese","").strip()
            en=obj.get("english","").strip()
            if kind=="uncertain":
                print("Uncertain; left as scan-only:",rid)
                continue
            note=("OpenAI-generated preliminary scan reading, NOT human-verified. "+
                  SOURCES[source][1]+" scan "+str(obj["page"])+". "+
                  "疑字："+obj.get("uncertainty","")+"。請核對原掃描。")
            if kind in {"illustration","non_text"}:
                entry={"page_kind":kind,"status":"image_only" if kind=="illustration" else "non_text",
                       "ocr_raw":"","transcription":"","translation":"",
                       "translation_status":"not_applicable","notes":note}
            else:
                entry={"page_kind":"caption" if kind=="text" else "caption_and_illustration",
                       "status":"image_checked_draft","ocr_raw":zh,"transcription":zh,
                       "translation":en,"translation_status":"ai_draft" if en else "not_started",
                       "notes":note}
                if obj.get("title"):entry["title"]=obj["title"]
            if rid in overlays:raise ValueError("Duplicate OCR candidate: "+rid)
            overlays[rid]=entry
    return overlays

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--source",choices=[*SOURCES,"all"],required=True)
    p.add_argument("--mode",choices=["download","ocr","publish"],required=True)
    p.add_argument("--pages",default="1-2")
    p.add_argument("--width",type=int,default=3000)
    p.add_argument("--model",default="gpt-4.1")
    p.add_argument("--max-pages",type=int,default=0)
    p.add_argument("--translate",action="store_true")
    p.add_argument("--replace",action="store_true",help="Explicitly regenerate existing AI draft")
    p.add_argument("--dry-run",action="store_true")
    args=p.parse_args()
    if args.width<600 or args.width>6000:p.error("Image width must be 600..6000")
    sources=list(SOURCES) if args.source=="all" else [args.source]
    if args.mode=="publish":
        overlays=collect_candidates(sources)
        print("AI provisional overlays:",len(overlays))
        if args.dry_run:return
        if OVERLAY.exists() and OVERLAY.stat().st_size>100 and not args.replace:
            raise FileExistsError("Back up and use --replace to overwrite existing AI candidates")
        content=("// AI-generated unverified drafts; do NOT overwrite manually reviewed OCR.\n"
                 "window.MIAO_RSL_MANCHESTER_OCR_DRAFTS = "+
                 json.dumps(overlays,ensure_ascii=False,indent=2)+";\n")
        OVERLAY.write_text(content,encoding="utf-8")
        print("Wrote",OVERLAY)
        return
    import requests
    sess=requests.Session()
    sess.headers["User-Agent"]="MiaoAlbumsAcademicResearch/0.2"
    client=None
    if args.mode=="ocr":
        if not os.environ.get("OPENAI_API_KEY"):
            p.error("OPENAI_API_KEY must be set for API OCR (never commit it)")
        from openai import OpenAI
        client=OpenAI()
    for source in sources:
        batch=pages(args.pages,SOURCES[source][0])
        if args.max_pages:batch=batch[:args.max_pages]
        for n in batch:
            dest=WORK/source/"ocr"/("page_%04d.json"%n)
            if args.mode=="ocr" and dest.exists() and not args.replace:
                print("Keep existing candidate:",dest)
                continue
            scan=scan_file(source,n,args.width,sess)
            print("SCAN",source,n,scan)
            if client is None:continue
            data=parse_json(model_call(client,args.model,PROMPT,scan))
            data["english"]=(model_call(client,args.model,TRANSLATE+data["chinese"])
                             if args.translate and data["chinese"] else "")
            data.update(record_id=record_id(source,n),source=source,page=n,
                        status="ai_unverified",model=args.model)
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
            print("OCR candidate:",dest,"characters:",len(data["chinese"]))
if __name__=="__main__":
    try:main()
    except Exception as e:
        print("ERROR:",e,file=sys.stderr)
        sys.exit(1)

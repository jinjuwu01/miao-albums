#!/usr/bin/env python3
"""Fetch limited source scans for visual transcription. No OCR fabrication.
Russian State Library images are Commons public-domain PDF thumbnails.
Manchester source images remain low-resolution review previews; read rights notice.
"""
import io, time, json
from pathlib import Path
from PIL import Image
import requests
root=Path(__file__).resolve().parents[1]
out=root/"images"/"external_pilot";out.mkdir(exist_ok=True,parents=True)
session=requests.Session();session.headers["User-Agent"]="MiaoAlbumsResearch/0.3 (https://github.com/jinjuwu01/miao-albums)"
specs=[
 ("rsl_v1",[],"RSL01013071618_百苗圖_清繪本_上冊.pdf","e/ed"),
 ("rsl_v2",[],"RSL01013071654_百苗圖_清繪本_下冊.pdf","1/1c")
]
inventory=[]
for prefix,pages,filename,hashdir in specs:
 for page in pages:
  dest=out/f"{prefix}_p{page:03d}.jpg"
  if dest.exists() and dest.stat().st_size>1000:
   image=Image.open(dest)
  else:
   url=f"https://thumb.wikimedia.org/wikipedia/commons/thumb/{hashdir}/{filename}/page{page}-1280px-{filename}.jpg"
   r=session.get(url,timeout=(20,100));r.raise_for_status()
   if not r.headers.get("content-type","").startswith("image/"): raise ValueError("Nonimage "+url)
   image=Image.open(io.BytesIO(r.content)).convert("RGB")
   image.save(dest,"JPEG",quality=87,optimize=True)
  # Crop both original halves without assuming every scan contains text.
  # Store for examination only. Do not add these crops to an OCR record until visually checked.
  mid=image.width//2
  for side,box in [("left",(0,0,min(image.width,mid+12),image.height)),("right",(max(0,mid-12),0,image.width,image.height))]:
   target=out/f"{prefix}_p{page:03d}_{side}.jpg"
   if not target.exists():image.crop(box).save(target,"JPEG",quality=88,optimize=True)
  inventory.append({"prefix":prefix,"page":page,"preview":str(dest.relative_to(root)),"downloaded":True})
  print("SCAN",prefix,page,flush=True)
  time.sleep(.35)
# Manchester preview images are for on-screen manuscript inspection, not public re-use approval.
for page in range(45,75):
 dest=out/f"manchester_p{page:03d}.jpg"
 if not dest.exists():
  url=f"https://image.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398-000-{page:05d}.jp2/full/1280,/0/default.jpg"
  r=session.get(url,timeout=(20,100));r.raise_for_status()
  if not r.headers.get("content-type","").startswith("image/"):raise ValueError("Manchester returned nonimage")
  image=Image.open(io.BytesIO(r.content)).convert("RGB")
  image.save(dest,"JPEG",quality=78,optimize=True)
 inventory.append({"prefix":"manchester","page":page,"preview":str(dest.relative_to(root)),"downloaded":True})
 print("MANCHESTER",page,flush=True);time.sleep(.3)
(root/"data"/"external_source_inventory_manchester_45_74.json").write_text(json.dumps({"schema":"unreviewed-source-images-v1","records":inventory},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

#!/usr/bin/env python3
"""Small source-faithful OCR quality pilot. Never writes into live transcription layer."""
from __future__ import annotations
import io, json, re, subprocess, time
from pathlib import Path
import requests
from PIL import Image, ImageOps, ImageEnhance
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data'/'rsl_manchester_machine_pilot.json'
IMAGES=ROOT/'images'/'external_pilot'
IMAGES.mkdir(parents=True,exist_ok=True)
SAMPLES=[2,3,4,5,6,7]
base='https://image.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398-000-{p:05d}.jp2/full/1600,/0/default.jpg'
s=requests.Session();s.headers['User-Agent']='MiaoAlbumsDigitalArchiveResearch/1.0'
rows=[]
for p in SAMPLES:
  url=base.format(p=p)
  row={'record_id':f'manchester-c398-p{p:03d}','source_url':url,'source':'John Rylands Library Chinese Crawford 398','page':p,'status':'machine_unverified','ocr_engine':'tesseract 5 HanT_vert','ocr_raw':'','confidence_mean':None}
  try:
    r=s.get(url,timeout=70);r.raise_for_status()
    if not r.headers.get('content-type','').startswith('image/'):raise RuntimeError('Not an image: '+r.headers.get('content-type',''))
    im=Image.open(io.BytesIO(r.content)).convert('RGB')
    preview=IMAGES/(f'manchester_p{p:03d}.jpg')
    im.save(preview,'JPEG',quality=72,optimize=True)
    gray=ImageEnhance.Contrast(ImageOps.grayscale(im)).enhance(1.5)
    input_img=IMAGES/(f'manchester_p{p:03d}_ocr.png')
    gray.save(input_img)
    # PSM 5: vertical columns; all results are candidates, never reviewed readings.
    o=subprocess.run(['tesseract',str(input_img),'stdout','-l','HanT_vert','--psm','5'],capture_output=True,text=True,timeout=100)
    row['ocr_raw']=o.stdout.strip()
    row['error']=o.stderr[:400] if o.returncode else None
    # OCR gibberish can resemble text: never promote machine-only results automatically.
    row['han_chars']=len(re.findall(r'[\u3400-\u9fff]',row['ocr_raw']))
    row['scan_image_path']=str(preview.relative_to(ROOT))
  except Exception as e:
    row['error']=type(e).__name__+': '+str(e)
  rows.append(row)
  print(p,row.get('han_chars',0),row.get('error'),flush=True)
  time.sleep(.5)
OUT.write_text(json.dumps({'collection':'manchester','method':'machine_only_not_verified','pages':rows},ensure_ascii=False,indent=2),encoding='utf-8')
print('WROTE',OUT,flush=True)

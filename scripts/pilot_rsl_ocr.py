#!/usr/bin/env python3
"""Probe Russian State Library public-domain Commons PDF page thumbnails for OCR."""
import io, json, re, subprocess, time
from pathlib import Path
import requests
from PIL import Image,ImageEnhance,ImageOps
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data'/'rsl_machine_pilot.json'
IMAGES=ROOT/'images'/'external_pilot'
IMAGES.mkdir(parents=True,exist_ok=True)
fn='RSL01013071618_百苗圖_清繪本_上冊.pdf'
folder='e/ed'
urlbase='https://thumb.wikimedia.org/wikipedia/commons/thumb/'+folder+'/'+fn
pages=[2,3,4,5,6,7,8,9]
sess=requests.Session(); sess.headers['User-Agent']='MiaoAlbumsResearch/0.2 (contact through GitHub project)'
items=[]
for p in pages:
  url=urlbase+'/page%d-1280px-%s.jpg'%(p,fn)
  row={'record_id':f'rsl-f274-v1-p{p:03d}','page':p,'source_url':url,'source':'RSL Ф.274 №54.1','status':'machine_unverified','ocr_raw':''}
  try:
    r=sess.get(url,timeout=(20,120));r.raise_for_status()
    if not r.headers.get('content-type','').startswith('image/'):raise ValueError('No image returned: '+r.headers.get('content-type',''))
    im=Image.open(io.BytesIO(r.content)).convert('RGB')
    preview=IMAGES/(f'rsl_v1_p{p:03d}.jpg');im.save(preview,'JPEG',quality=74,optimize=True)
    row['image_path']=str(preview.relative_to(ROOT))
    gray=ImageEnhance.Contrast(ImageOps.grayscale(im)).enhance(1.6)
    work=IMAGES/(f'rsl_v1_p{p:03d}_gray.png')
    gray.save(work)
    o=subprocess.run(['tesseract',str(work),'stdout','-l','HanT','--psm','5'],capture_output=True,text=True,timeout=120)
    if o.returncode:raise RuntimeError(o.stderr[:600])
    row['ocr_raw']=o.stdout.strip()
    row['han_chars']=len(re.findall(r'[\u3400-\u9fff]',row['ocr_raw']))
  except Exception as e:
    row['error']=type(e).__name__+': '+str(e)
  items.append(row)
  print(p,row.get('han_chars',0),row.get('error'),flush=True)
  time.sleep(1)
OUT.write_text(json.dumps({'source':'rsl-v1','method':'unverified machine OCR only','pages':items},ensure_ascii=False,indent=2),encoding='utf-8')
print('WROTE',OUT)

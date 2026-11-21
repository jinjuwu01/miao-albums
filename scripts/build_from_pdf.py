#!/usr/bin/env python3
"""Generate the illustrated record catalogue from one source scan.
Requires pymupdf, pillow and optionally tesseract (chi_tra_vert).
OCR is raw and unverified, never a scholarly transcription.
"""
import os, json, re, subprocess, concurrent.futures, sys
from pathlib import Path
import fitz
from PIL import Image,ImageEnhance,ImageOps
ROOT=Path(__file__).resolve().parents[1]
PDF=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/mnt/data/苗族生活图.40幅.清代彩绘.pdf')
# Image text-region bounding boxes, estimated from scan, reference frame: 512x512.
# These are editorial aids, not coordinates from an OCR engine.
BOXES={
 1:(75,88,152,242), 2:(80,131,145,423), 3:(398,90,451,330), 4:(425,110,482,335),
 5:(397,107,455,354), 6:(294,80,485,187), 7:(317,89,438,215), 8:(212,90,343,205),
 9:(403,103,463,410), 10:(156,90,260,234),11:(309,89,466,245),12:(136,86,257,244),
 13:(183,88,288,235),14:(158,77,260,209),15:(304,91,435,214),16:(396,88,460,225),
 17:(92,86,282,212),18:(90,88,182,254),19:(309,88,463,232),20:(291,85,414,222),
 21:(351,90,467,228),22:(257,79,457,166),23:(19,111,103,432),24:(324,87,431,228),
 25:(207,83,333,193),26:(134,88,265,205),27:(16,79,98,433),28:(177,88,312,211),
 29:(398,88,468,346),30:(164,87,345,193),31:(328,88,468,202),32:(132,85,273,183),
 33:(164,85,325,224),34:(91,90,179,211),35:(93,86,229,220),36:(47,104,126,425),
 37:(26,105,101,426),38:(120,90,217,251),39:(15,75,83,442),40:(384,89,493,210),
}
# Descriptive *image observations*, not a claimed reading of the accompanying text.
VISUAL=[
 ['織布','紡織','人物'],['舞蹈','人物'],['背負','行旅'],['服飾','人物'],['衝突','人物'],
 ['兵器','群像'],['背簍','行旅'],['兵器','人物'],['家庭','孩童'],['家庭','孩童'],
 ['供品','儀式'],['供品','孩童'],['飲食','人物'],['兵器','人物'],['紡織','紡車'],
 ['馬','牛','運輸'],['行旅','貨物'],['傘','服飾'],['牛','飲食'],['行旅','工具'],
 ['背簍','行旅'],['服飾','人物'],['樂器','人物'],['家庭','人物'],['貨物','販售'],
 ['衝突','人物'],['農作物','背負'],['食物','人物'],['農具','孩童'],['節慶','裝飾'],
 ['儀式','兵器'],['行旅','農具'],['兵器','人物'],['衝突','人物'],['背負','人物'],
 ['捕撈','網具'],['家庭','人物'],['舂米','食物'],['舞蹈','服飾'],['牛','人物']
]
CURATED={1:{
 'title':'羅漢苗', 'title_en':'Luohan Miao (historical label)',
 'transcription':'羅漢苗在黎平府屬，男女衣青短披風。習俗鄙陋，婚姻先野合而後行聘。未室者插羽於首，女髻已戴梳。巧能織錦，出入必佩刀弩，性獷悍，喜爭鬥。',
 'translation':'The “Luohan Miao” are found within the jurisdiction of Liping Prefecture. Men and women wear blue clothing and short capes. The text characterizes their customs as “crude”: it says that couples first form unions before conducting the formal betrothal rites. Those not yet married wear feathers in their hair, while women wear combs in their coiffures. They are skilled at weaving brocade. The account says they carry knives and crossbows when going out, and characterizes them as fierce and prone to fighting.',
 'status':'editorial_draft',
 'notes':'逐字人工试校本；标点为今人所加。原文含「鄙陋」「獷悍」等带有评价性的历史描述；译文保留其归属，不应当作对社群的客观判断。部分字形及语义仍需据原图复核。',
 'tags':['羅漢苗','黎平府','婚姻','服飾','織錦','刀弩','習俗']
}}

def ocr_single(rec):
 i,path=rec
 try:
  p=subprocess.run(['tesseract',str(path),'stdout','-l','chi_tra_vert','--psm','5'], capture_output=True,text=True,timeout=18,env={**os.environ,'OMP_THREAD_LIMIT':'1'})
  raw=p.stdout
  lines=[]
  for ln in raw.splitlines():
   t=ln.strip()
   if t and re.search('[\u3400-\u9fff]',t): lines.append(t)
  return i,'\n'.join(lines)
 except Exception as e: return i,''

def main():
 d=fitz.open(PDF)
 assert len(d)>=44
 cropfiles=[]
 print(f'Source: {len(d)} pages',flush=True)
 for i in range(1,41):
  src=d[i+3] # illustration 1 = PDF page 5 (0-based index 4)
  pix=src.get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
  im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
  if not (ROOT/f'images/{i:03d}.webp').exists(): im.save(ROOT/f'images/{i:03d}.webp','WEBP',quality=85,method=2)
  if not (ROOT/f'images/thumb-{i:03d}.webp').exists():
   th=im.copy();th.thumbnail((460,560));th.save(ROOT/f'images/thumb-{i:03d}.webp','WEBP',quality=75,method=2)
  a,b,c,e=BOXES[i]
  box=(max(0,int(a*im.width/512)),max(0,int(b*im.height/512)),min(im.width,int(c*im.width/512)), min(im.height,int(e*im.height/512)))
  crop=im.crop(box)
  if not (ROOT/f'images/text-{i:03d}.webp').exists(): crop.save(ROOT/f'images/text-{i:03d}.webp','WEBP',quality=88,method=2)
  # Mild contrast boost aids some scans; avoid destructive threshold on faded ink.
  ocr=ImageEnhance.Contrast(crop).enhance(1.4)
  ocr.thumbnail((1200,1400))
  ocr.save(ROOT/f'images/_ocr_{i:03d}.png')
  cropfiles.append((i,ROOT/f'images/_ocr_{i:03d}.png'))
 print('Assets extracted; generating raw OCR for all 40 captions...',flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
  output=dict(pool.map(ocr_single,cropfiles))
 for _,f in cropfiles: f.unlink(missing_ok=True)
 recs=[]
 for i in range(1,41):
  curated=CURATED.get(i,{})
  recs.append({
    'id':f'miao-{i:03d}', 'folio':i,'pdf_page':i+4,
    'title':curated.get('title',f'第{i:02d}幅'),
    'title_en':curated.get('title_en',f'Plate {i:02d}'),
    'image':f'images/{i:03d}.webp','thumb':f'images/thumb-{i:03d}.webp',
    'text_image':f'images/text-{i:03d}.webp',
    'ocr_raw':output.get(i,''),'transcription':curated.get('transcription',''),
    'translation':curated.get('translation',''),
    'status':curated.get('status','ocr_unverified'),
    'notes':curated.get('notes','未人工校订。OCR 为自动识别的原始输出，可能含大量误字、错序与遗漏，不宜直接引用。'),
    'tags':curated.get('tags',[]), 'visual_tags':VISUAL[i-1],
  })
 (ROOT/'data/records.json').write_text(json.dumps(recs,ensure_ascii=False,indent=2),encoding='utf-8')
 (ROOT/'data/records.js').write_text('window.MIAO_RECORDS = '+json.dumps(recs,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print('Complete. Records',len(recs),'OCR records with non-empty text',sum(bool(r['ocr_raw']) for r in recs),flush=True)
 print('raw OCR lengths:',[(r['folio'],len(r['ocr_raw'])) for r in recs],flush=True)

if __name__=='__main__':main()

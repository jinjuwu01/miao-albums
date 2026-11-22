#!/usr/bin/env python3
"""Split image-left / caption-right Russian Miao album spreads for review."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
folder=root/"images"/"external_pilot"
for p in range(5,10):
    source=folder/("rsl_v1_p%03d.jpg"%p)
    if not source.exists():
        raise FileNotFoundError(source)
    im=Image.open(source).convert("RGB")
    mid=im.width//2
    # Preserve a narrow visual overlap around center gutter to avoid clipping
    left=im.crop((0,0,min(im.width,mid+10),im.height))
    right=im.crop((max(0,mid-10),0,im.width,im.height))
    for suffix,part in [("artwork",left),("text",right)]:
        outfile=folder/("rsl_v1_p%03d_%s.jpg"%(p,suffix))
        part.save(outfile,"JPEG",quality=88,optimize=True)
        print(outfile,part.size)

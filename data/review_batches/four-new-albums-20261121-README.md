# 四册苗图：第一轮图文整理交接 / Four Miao Albums, First Pass

Source PDFs supplied on 2026-11-21. The batch is source-aware and **not a scholarly transcription**.

| Source | PDF pages | Paired plates | Structure |
| --- | ---: | ---: | --- |
| 《進貢苗蠻圖》（陳枚畫） | 79 | 68 | Caption at left and painting at right; sectional breaks and blank leaves |
| 《黔省諸苗全圖》（上下冊） | 76 | 68 | Painting at left and caption at right; two volumes |
| 《黔苗圖說》（57幅、附解說本） | 118 | 57 | Artwork leaves paired with the following textual leaves |
| 《黔苗圖說》（木孔恭摹繪本） | 80 | 37 | Artwork leaves paired with the following textual leaves |

Total: **353 scanned pages, 230 plate-level pairs**. The page correspondence and non-text-page list are in [four-new-albums-20261121-page-map.json](./four-new-albums-20261121-page-map.json).

## Editorial status
High-resolution crops and original-scan previews were generated from the user-supplied PDFs. Two local Tesseract OCR candidates were made for the textual portions; they are highly unreliable on some Qing handwriting. Partial visual-reading excerpts exist for only four captions, and no full 230-caption scholarly collation has been completed. An empty transcription is intentional, not evidence of a textless source. Do not silently copy readings from another album.

## Website handoff
**This commit does not publish the 230 new image records on GitHub Pages.** The binary scans and OCR comparison bundles were produced separately and must be copied into the clone before website inclusion; displaying broken image links would be misleading. The tested offline batch includes four ZIP archives named `jingong_highres_ocr_first_pass.zip`, `qiansheng_highres_ocr_first_pass.zip`, `qianmiao57_highres_ocr_first_pass.zip` and `mukong_highres_ocr_first_pass.zip`.

After obtaining these four files, from the repository root run:

```bash
python3 scripts/import_four_albums_20261121.py /path/to/four_zip_folder
python3 -m http.server 8000
```

Review the previews and metadata at `http://localhost:8000` before committing generated `data/four_albums_20261121.js/json` and `images/four_albums_20261121/`. The import script does not alter earlier records or automatically push commits.

Original PDFs are the authority; WebP/JPEG derivatives are previews and study crops.

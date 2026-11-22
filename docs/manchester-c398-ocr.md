# 曼徹斯特藏本 OCR · Chinese Crawford 398

## Current status (2026-11-22)

The site indexes 202 official IIIF canvases, including covers, paintings, inscriptions, and binding details. 35 Manchester records currently have provisional Chinese readings: two preface pages and 33 caption pages. Most readings are excerpts, not certified full OCR.

The manuscript belongs to the University of Manchester Library. Original scans: https://www.digitalcollections.manchester.ac.uk/view/PR-CHCR-00398

The viewer shows visually checked pairs where documented; its additional sequential even/odd pairings are **unverified adjacency candidates**, not confirmed captions. The collection title "82" does not guarantee every indexed odd canvas has a caption. Original Russian State Library or other versions must never be pasted over this manuscript's transcription.

## Download and transcribe on a network-enabled machine

From the repository root:

    python3 scripts/process_manchester_c398.py --mode download --pages candidate
    python3 -m pip install openai
    export OPENAI_API_KEY="YOUR_API_KEY"
    python3 scripts/process_manchester_c398.py --mode ocr --pages candidate
    python3 scripts/process_manchester_c398.py --mode publish

This is a resumable research workflow. The "candidate" queue comprises the two already known preface pages and possible odd-numbered caption leaves in both volumes. Each image is **classified before transcription**, and paintings/blank leaves produce no body text.

Work files appear in manchester_c398_work/scans/ and manchester_c398_work/ocr/. Publication writes ONLY data/manchester_ocr_candidates.js. Existing 35 draft entries take priority, so no pre-existing transcription is overwritten. The site marks new OCR as provisional AI readings; doubtful glyphs appear as □.

For a small batch (and to inspect quality):

    python3 scripts/process_manchester_c398.py --mode download --pages 75,77,79,105,107
    python3 scripts/process_manchester_c398.py --mode ocr --pages 75,77,79,105,107
    python3 scripts/process_manchester_c398.py --mode publish

Before citing any passage, compare the output to the **same Manchester scan**, verify the vertical reading order, resolve uncertain characters, and check the translation. Do not call the output a complete human-reviewed edition.

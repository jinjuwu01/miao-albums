# 曼徹斯特藏本 OCR · Chinese Crawford 398

## Current status (2026-11-22)

The site indexes 202 official IIIF canvases. On 2026-11-22 the user provided 92 high-resolution candidate text-page images. Of these, 86 contain Chinese text (2 prefaces, 2 scenic descriptions and 82 ethnographic captions), 5 are blank and 1 is a seal leaf. There are 86 provisional searchable Chinese readings: 35 original draft records and 51 new source-specific records. As of this second pass, 45 leaves have undergone right-to-left column review against the uploaded scan, with updated provisional English translations and the previous text preserved in `prior_transcription_20261122`. Another 41 leaves retain their earlier first-pass full/near-full drafts. No page is currently tagged excerpt-only, **but the 86 full/near-full entries remain unverified**. Dense canvases 15, 127, 137 and 177 have source-wide readings with substantial unresolved paleographic details. None is a certified scholarly transcription. All 86 English fields have now been revised as full source-ordered renderings of the extant provisional Chinese OCR; original English summaries are preserved in `prior_english_summary_20261122`. Both Chinese and English remain unverified.

The manuscript belongs to the University of Manchester Library. Original scans: https://www.digitalcollections.manchester.ac.uk/view/PR-CHCR-00398

The viewer shows visually checked pairs where documented; its additional sequential even/odd pairings are **unverified adjacency candidates**, not confirmed captions. The collection title "82" does not guarantee every indexed odd canvas has a caption. Original Russian State Library or other versions must never be pasted over this manuscript's transcription.

## Download and transcribe on a network-enabled machine

From the repository root:

    python3 scripts/process_manchester_c398.py --mode download --pages text
    python3 -m pip install openai
    export OPENAI_API_KEY="YOUR_API_KEY"
    python3 scripts/process_manchester_c398.py --mode ocr --pages candidate
    python3 scripts/process_manchester_c398.py --mode publish

This is a resumable research workflow. The "text" download queue comprises 92 possible preface/caption canvases: 2 preface pages, 44 odd-page candidates in vol. I, and 46 in vol. II. The uploaded images confirm five blank pages and one seal leaf. The `candidate` API OCR queue still enumerates 57 originally missing caption candidates; it is not the current list of untranscribed pages. The `publish` command skips all records already present in either existing draft dataset and appends only genuinely new pages, preserving the 51 new source-specific records. Each image is **classified before transcription**, and paintings/blank leaves produce no body text.

Work files appear in manchester_c398_work/scans/ and manchester_c398_work/ocr/. Publication merges into ONLY data/manchester_ocr_candidates.js. Both the original 35 and the 51 candidate overlay entries take priority, so no previously transcribed page is overwritten. The site marks new OCR as provisional AI readings; doubtful glyphs appear as □.

For a small batch (and to inspect quality):

    python3 scripts/process_manchester_c398.py --mode download --pages 75,77,79,105,107
    python3 scripts/process_manchester_c398.py --mode ocr --pages 75,77,79,105,107
    python3 scripts/process_manchester_c398.py --mode publish

Before citing any passage, compare the output to the **same Manchester scan**, verify the vertical reading order, resolve uncertain characters, and check the translation. Do not call the output a complete human-reviewed edition.

For leaf-level second-pass progress, including the many uncertain readings still awaiting paleographic verification, see `docs/manchester-c398-review-progress.md`.

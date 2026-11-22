/* Validate source-ordinal indexing and nonfabrication of external manuscript records.
   Usage: node scripts/validate_external_albums.cjs
   No network requests and no source scans required. */
const fs=require("node:fs");
const vm=require("node:vm");
function read(path){return fs.readFileSync(path,"utf8");}
const ctx={window:{}};
vm.runInNewContext(read("data/rsl_manchester_scans.js"),ctx);
const a=ctx.window.MIAO_RSL_MANCHESTER_SCANS;
function ok(test,message){if(!test)throw Error(message);}
ok(Array.isArray(a),"source index is not an array");
ok(a.length===295,"expected 295 scan records, got "+a.length);
ok(a.filter(x=>x.collection_id==="rsl-f274-54").length===93,"RSL totals are wrong");
ok(a.filter(x=>x.collection_id==="manchester-c398").length===202,"Manchester canvas count is wrong");
ok(new Set(a.map(x=>x.id)).size===a.length,"duplicate stable record IDs");
ok(a.every(x=>x.image&&x.thumb&&x.source_url&&x.copy_id&&x.shelfmark),"missing provenance/images");
ok(a.every(x=>!x.ocr_raw&&!x.transcription&&!x.translation),"scan index must not pretend to have OCR");
ok(a.filter(x=>x.page_kind==="non_text").length===16,
   "expected 14 Manchester cover/binding scans and 2 RSL front covers");
const rsl=a.filter(x=>x.collection_id==="rsl-f274-54");
ok(rsl.filter(x=>x.id.includes("-v1-")).length===47,"Russian volume 1 count");
ok(rsl.filter(x=>x.id.includes("-v2-")).length===46,"Russian volume 2 count");
const man=a.filter(x=>x.collection_id==="manchester-c398");
ok(man[0].source_canvas.endsWith("/1"),"missing first IIIF canvas");
ok(man[201].source_canvas.endsWith("/202"),"missing last IIIF canvas");
const home=read("index.html"),review=read("review.html"),app=read("assets/app.js");
ok(home.includes("data/rsl_manchester_scans.js"),"main website missing source index");
ok(review.includes("data/rsl_manchester_scans.js"),"review tool missing source index");
ok(app.includes("RSL_MANCHESTER_SCANS"),"search app missing source index");
ok(app.includes("RSL_MANCHESTER_OCR_DRAFTS"),"separate AI candidate overlay missing");
ok(!home.includes('data/rsl_manchester_ocr_drafts.js') ||
   home.indexOf('data/rsl_manchester_scans.js')<home.indexOf('data/rsl_manchester_ocr_drafts.js'),
   "OCR overlay must load after scan sources");
console.log("OK: 295 externally served scans, 93 RSL PDF + 202 Manchester IIIF; zero fabricated OCR records");

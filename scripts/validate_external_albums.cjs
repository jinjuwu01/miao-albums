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
ok(a.filter(x=>x.page_kind==="non_text").length===27,
   "expected 16 Manchester binding images, 4 confirmed blank Manchester leaves, and 7 RSL covers/blank scans");
const rsl=a.filter(x=>x.collection_id==="rsl-f274-54");
ok(rsl.filter(x=>x.id.includes("-v1-")).length===47,"Russian volume 1 count");
ok(rsl.filter(x=>x.id.includes("-v2-")).length===46,"Russian volume 2 count");
const man=a.filter(x=>x.collection_id==="manchester-c398");
ok(man[0].source_canvas.endsWith("/1"),"missing first IIIF canvas");
ok(man[201].source_canvas.endsWith("/202"),"missing last IIIF canvas");
// Separate AI visual-reading layer must never masquerade as corrected OCR or create
// transcripts for illustrations, blanks, covers or other non-text scans.
vm.runInNewContext(read("data/rsl_manchester_ocr_drafts.js"),ctx);
const drafts=ctx.window.MIAO_RSL_MANCHESTER_OCR_DRAFTS;
const entries=Object.entries(drafts);
const byId=new Map(a.map(x=>[x.id,x]));
ok(entries.length>=63,"expected at least 63 Chinese/English draft records");
for(const [id,item] of entries){
  const source=byId.get(id);
  ok(source,"draft has no physical copy scan: "+id);
  ok(["caption","preface"].includes(source.page_kind),"draft incorrectly applied to a painting or blank: "+id);
  ok(item.transcription&&item.translation,"Chinese/English text missing for "+id);
  ok(item.status!=="human_reviewed","AI draft must not claim to be human-reviewed: "+id);
}
const inspectedRsl=a.filter(x=>x.collection_id==="rsl-f274-54"&&x.page_kind==="caption");
ok(inspectedRsl.length===54,"expected 54 inspected two-page Russian spreads");
for(const r of inspectedRsl){
  ok(r.artwork_image&&r.caption_image,"two distinct crop references missing for "+r.id);
  ok(fs.existsSync(r.artwork_image)&&fs.existsSync(r.caption_image),"crop missing on disk: "+r.id);
}
const manText=a.filter(x=>x.collection_id==="manchester-c398"&&x.page_kind==="caption");
const manPaint=a.filter(x=>x.collection_id==="manchester-c398"&&x.page_kind==="illustration");
ok(manText.length===8,"expected eight image-checked Manchester description leaves");
ok(manPaint.length===9,"expected nine image-checked Manchester illustration leaves");
for(const x of manText){
  ok(x.paired_image&&x.paired_pdf_page===x.scan_index-1,"caption paired with wrong Manchester painting: "+x.id);
}
for(const x of manPaint){
  ok(x.paired_image&&x.paired_pdf_page===x.scan_index+1,"painting paired with wrong Manchester caption: "+x.id);
}
const home=read("index.html"),review=read("review.html"),app=read("assets/app.js");
ok(home.includes("data/rsl_manchester_scans.js"),"main website missing source index");
ok(review.includes("data/rsl_manchester_scans.js"),"review tool missing source index");
ok(app.includes("RSL_MANCHESTER_SCANS"),"search app missing source index");
ok(app.includes("RSL_MANCHESTER_OCR_DRAFTS"),"separate AI candidate overlay missing");
ok(!home.includes('data/rsl_manchester_ocr_drafts.js') ||
   home.indexOf('data/rsl_manchester_scans.js')<home.indexOf('data/rsl_manchester_ocr_drafts.js'),
   "OCR overlay must load after scan sources");
console.log("OK: 295 indexed scans; 54 RSL painting/caption crops; "+entries.length+" draft readings, all source-linked; no painted/blank-page OCR");

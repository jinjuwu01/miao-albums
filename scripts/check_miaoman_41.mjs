import assert from 'node:assert/strict';
import fs from 'node:fs';

const marker='window.MIAOMAN_41_DRAFTS = ';
const source=fs.readFileSync('data/miaoman_41_drafts.js','utf8');
const start=source.indexOf(marker);
assert(start!==-1,'MIAOMAN_41_DRAFTS global must exist');
const drafts=JSON.parse(source.slice(start+marker.length).trim().replace(/;\s*$/,''));
const imported=JSON.parse(fs.readFileSync('data/imported_ocr.json','utf8')).filter(r=>r.collection_id==='e4a7e4a3b955');
const pageId=p=>'ocr-e4a7e4a3b955-p'+String(p).padStart(4,'0');
const scan=p=>'images/collections/e4a7e4a3b955/page_'+String(p).padStart(4,'0')+'.webp';

assert.equal(imported.length,43,'Source PDF has 43 pages');
assert.equal(Object.keys(drafts).length,43,'43 page entries including cover/preface');
assert.equal(drafts[pageId(1)].status,'non_text','Page 1 is a cover');
assert.equal(drafts[pageId(2)].status,'preface_pending','Page 2 is a separate unverified preface');
let checked=0,ordered=0;
for(let p=1;p<=43;p++){
 const rec=imported.find(r=>r.id===pageId(p));
 const draft=drafts[pageId(p)];
 assert(rec&&draft,'Missing source page '+p);
 assert.equal(rec.image,scan(p),'Wrong image source for page '+p);
 assert(fs.existsSync(scan(p)),'Missing original scanned page '+p);
 assert(!Object.hasOwn(draft,'ocr_raw'),'Never replace raw OCR');
 assert(!Object.hasOwn(draft,'image'),'Never replace scan with another page');
 if(p>=3){
   assert.equal(draft.folio,p-2,'Incorrect plate number at page '+p);
   assert.equal(draft.page_total,41,'Plate count must be 41');
   assert.equal(draft.page_kind,'caption_and_illustration','Pictures and captions must stay on same page');
   assert(draft.transcription.length>=9,'Caption missing: '+p);
   if(draft.status==='image_checked_draft')checked++;
   else if(draft.status==='ocr_reordered_draft')ordered++;
   else assert.fail('Incorrect draft status on page '+p);
 }
}
assert.equal(checked,41);
assert.equal(ordered,0);
const index=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('assets/app.js','utf8');
assert(index.includes('<script src="data/miaoman_41_drafts.js"></script>'),'Draft missing from HTML');
assert(app.includes('...(MIAOMAN_41_DRAFTS[r.id] || {})'),'Drafts not merged into records');
assert(app.includes("r.status==='preface_pending'"),'Preface not labeled');
assert(app.includes("'preface'].includes(r.page_kind)"),'Preface raw OCR must not be indexed as verified text');
console.log('Miao Man album 41 validation passed: all 43 original scans, 41 correct plate links, 41 image drafts, 0 unverified OCR-only drafts.');

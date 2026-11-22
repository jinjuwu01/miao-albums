import assert from 'node:assert/strict';
import fs from 'node:fs';

function loadOverlay(file, varName) {
  const data = fs.readFileSync(file, 'utf8');
  const marker = 'window.' + varName + ' = ';
  const offset = data.indexOf(marker);
  assert(offset >= 0, 'Missing overlay variable '+varName);
  return JSON.parse(data.slice(offset + marker.length).trim().replace(/;\s*$/,''));
}
const id = n => 'ocr-06b056128ca2-p' + String(n).padStart(4,'0');
const scan = n => 'images/collections/06b056128ca2/page_'+String(n).padStart(4,'0')+'.webp';

const raw = JSON.parse(fs.readFileSync('data/imported_ocr.json','utf8'))
  .filter(r => r.collection_id === '06b056128ca2');
const over = loadOverlay('data/miaoman_48_drafts.js','MIAOMAN_48_DRAFTS');
assert.equal(raw.length,49,'Original scanned-book record count');
assert.equal(Object.keys(over).length,49,'A safe overlay for each scanned page');
assert.equal(over[id(1)].status,'non_text','Cover must not be represented as a historical caption');
let reviewed=0,reordered=0;
for (let page=1;page<=49;page++) {
  const rec=raw.find(r=>r.id===id(page));
  assert(rec,'Missing original metadata for PDF page '+page);
  assert.equal(rec.image,scan(page),'Original image page mismatched: '+page);
  assert(fs.existsSync(scan(page)),'Missing original scan '+page);
  const ov=over[id(page)];
  assert(ov,'Missing draft/cover mapping '+page);
  assert(!Object.hasOwn(ov,'ocr_raw'),'Raw OCR must not be rewritten');
  assert(!Object.hasOwn(ov,'image'),'Never replace a page scan with a neighboring page');
  if(page!==1){
    assert(ov.transcription.length>15,'Suspiciously short caption page '+page);
    assert.equal(ov.source_pdf_page,page,'Wrong source page for caption '+page);
    assert(['image_checked_draft','ocr_reordered_draft'].includes(ov.status),'Unrecognized draft status: '+page);
    if(ov.status==='image_checked_draft') reviewed++;else reordered++;
  }
}
assert.equal(reviewed+reordered,48,'All 48 plates must have text drafts');
const app=fs.readFileSync('assets/app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('<script src="data/miaoman_48_drafts.js"></script>'),'Missing script tag');
assert(app.includes('...(MIAOMAN_48_DRAFTS[r.id] || {})'),'Overlay not applied');
console.log('Miao Man Tuce validation passed: 49 source images, 48 captions, '+reviewed+' visually reviewed, '+reordered+' OCR-reordered drafts, all original OCR preserved.');

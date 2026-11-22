import fs from 'node:fs';
import assert from 'node:assert/strict';

function readOverlay(path, variable) {
  const source = fs.readFileSync(path, 'utf8');
  const marker = 'window.' + variable + ' = ';
  const start = source.indexOf(marker);
  assert(start !== -1, path + ': missing variable assignment');
  return JSON.parse(source.slice(start + marker.length).trim().replace(/;\s*$/, ''));
}
const id = page => 'ocr-ddaac6c2e519-p' + String(page).padStart(4, '0');
const scan = page => 'images/collections/ddaac6c2e519/page_' + String(page).padStart(4, '0') + '.webp';

const raw = JSON.parse(fs.readFileSync('data/imported_ocr.json', 'utf8'));
const original = raw.filter(record => record.collection_id === 'ddaac6c2e519');
const fixes = readOverlay('data/dian_page_fixes.js', 'MIAO_DIAN_PAGE_FIXES');
const drafts = readOverlay('data/dian_36_drafts.js', 'MIAO_DIAN_36_DRAFTS');
const textPages = [...Array.from({length: 18}, (_, i) => 7 + i * 2), ...Array.from({length: 18}, (_, i) => 51 + i * 2)];

assert.equal(original.length, 90, 'Original PDF should have 90 independent source page records');
assert.equal(Object.keys(fixes).length, 90, 'Every source page needs a page-type classification');
assert.equal(Object.keys(drafts).length, 36, 'Keep all 36 previously image-reviewed draft captions');
for (let page = 1; page <= 90; page++) {
  assert(original.some(record => record.id === id(page)), 'Missing source record for page ' + page);
  assert(fs.existsSync(scan(page)), 'Original source scan missing for page ' + page);
}
for (const page of textPages) {
  const text = fixes[id(page)];
  const picture = fixes[id(page - 1)];
  assert(text && picture, 'Missing page pair ' + page);
  assert.equal(text.page_kind, 'caption');
  assert.equal(picture.page_kind, 'illustration');
  assert.equal(text.image, scan(page), 'Caption page has been replaced with a painting: p.' + page);
  assert.equal(picture.image, scan(page - 1), 'Picture page has been replaced with text: p.' + (page - 1));
  assert.equal(text.paired_image, scan(page - 1));
  assert.equal(picture.paired_image, scan(page));
  assert.equal(text.paired_record_id, id(page - 1));
  assert.equal(picture.paired_record_id, id(page));
  assert.equal(picture.transcription, '', 'Picture page must not have invented caption text');
  assert(fs.existsSync(picture.paired_image));
}
assert.equal(fixes[id(43)].page_kind, 'colophon', 'Keep the illustrated-book colophon visible');
const index = fs.readFileSync('index.html','utf8');
const app = fs.readFileSync('assets/app.js','utf8');
assert(index.includes('data/dian_page_fixes.js'), 'Page corrections must be loaded');
assert(app.includes('...(DIAN_PAGE_FIXES[r.id] || {})'), 'Page corrections must be applied after text drafts');
console.log('Dian Miao Tushuo checks passed: 90 original scans, 36 image/text pairs, 1 colophon, no OCR on image-only pages.');

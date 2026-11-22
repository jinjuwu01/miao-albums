// Wellcome Chinese Collection 99 (MS Chinese 99), 52 digitised scans.
// The Wellcome catalogue has no descriptive title; "百苗圖" is a working series attribution.
// Source: https://wellcomecollection.org/works/f8b2bkkd
// Licence shown by Wellcome: Public Domain Mark.
// IIIF sequence observed in the Wellcome item viewer; page numbering requires image-level verification.
// DO NOT fabricate OCR or translations for scans that have not been inspected.
(() => {
  const count = 52;
  const source = '百苗圖（Wellcome Chinese Collection 99，無題本）';
  const collection = 'b14870435_chinese_99';
  const pageImage = (page, width) => {
    const filename = collection + '_' + String(page).padStart(4, '0') + '.jp2';
    return 'https://iiif.wellcomecollection.org/image/' + filename + '/full/' + width + ',/0/default.jpg';
  };
  window.MIAO_WELLCOME_MS99_SCANS = Array.from({length: count}, (_, index) => {
    const page = index + 1;
    const isCover = page === 1; // viewer labels the first scan "Front Cover"
    return {
      id: 'wellcome-ms99-p' + String(page).padStart(4, '0'),
      collection_id: 'wellcome-ms-chinese-99',
      folio: page,
      pdf_page: page, // The existing reader's page-number key; this is a scan, not a PDF.
      page_total: count,
      source_kind: 'iiif',
      source_title: source,
      source_file: 'MS Chinese 99 · Wellcome Collection',
      source_url: 'https://wellcomecollection.org/works/f8b2bkkd',
      source_rights: 'Public Domain Mark',
      image_service_id: collection + '_' + String(page).padStart(4, '0') + '.jp2',
      title: isCover ? '封面掃描' : '掃描第 ' + String(page).padStart(2, '0') + ' 頁（待校讀）',
      title_en: isCover ? 'Cover scan' : 'Scan ' + String(page).padStart(2, '0') + ' · Awaiting examination',
      image: pageImage(page, 1600),
      thumb: pageImage(page, 400),
      text_image: pageImage(page, 1600),
      high_res_image: pageImage(page, 3000),
      ocr_raw: '',
      transcription: '',
      translation: '',
      translation_status: 'not_started',
      status: isCover ? 'non_text' : 'scan_only',
      page_kind: isCover ? 'non_text' : 'scan_only',
      notes: isCover
        ? 'Wellcome Collection, MS Chinese 99。館藏著錄無正式書名；「百苗圖」僅作系列歸類。Public Domain Mark。第 1 頁為封面掃描，不進行 OCR。'
        : 'Wellcome Collection, MS Chinese 99（Public Domain Mark）。本條為按 IIIF 掃描序號編目的原頁影像，尚未逐頁確認彩繪與題記分布；OCR 與英譯未開始，請勿將空白欄當作無文字。掃描頁碼不是 PDF 頁碼。',
      tags: [],
      visual_tags: []
    };
  });
})();

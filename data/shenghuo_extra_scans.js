// Source-PDF leaves omitted from the original 40-plate catalogue.
// The scans already exist in images/collections/0aa54e2d1b74/.
// These entries restore page visibility only. No OCR or text is invented.
window.MIAO_SHENGHUO_EXTRA_SCANS = [1, 2, 3, 4, 45, 46, 47].map(pdfPage => {
  const number = String(pdfPage).padStart(4, '0');
  const image = 'images/collections/0aa54e2d1b74/page_' + number + '.webp';
  return {
    id: 'miao-extra-p' + number,
    folio: pdfPage,
    pdf_page: pdfPage,
    page_total: 47,
    source_title: '苗族生活图',
    source_file: '苗族生活图.40幅.清代彩绘.pdf',
    collection_id: '0aa54e2d1b74',
    title: '原 PDF 第 ' + pdfPage + ' 页',
    title_en: 'Original PDF scan, page ' + pdfPage,
    image,
    thumb: 'images/collections/0aa54e2d1b74/thumb_' + number + '.webp',
    text_image: image,
    ocr_raw: '',
    transcription: '',
    translation: '',
    status: 'scan_only',
    page_kind: 'scan_only',
    notes: '原始 PDF 共 47 页；第 5–44 页为原先编目的 40 幅彩绘。本页是恢复的原始扫描页，未判断是否为空白，未进行 OCR 或文字校读。 / Restored original scan; its textual contents have not been classified or transcribed.',
    tags: [],
    visual_tags: []
  };
});

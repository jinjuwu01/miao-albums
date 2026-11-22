// Wellcome Collection MS Chinese 99 (Wellcome Chinese Collection 99).
// Source https://wellcomecollection.org/works/f8b2bkkd ; Public Domain Mark.
// Classification from visual inspection of all 52 user-supplied 3000px scans, 2026-11-22.
// 29 mixed spreads: caption on LEFT, painting on RIGHT. Others are blank/cover/backing/calibration.
// The separate OCR overlay contains only readings actually checked against images.
(() => {
  const mixed = [5,6,9,10,11,12,13,14,15,16,17,18,19,20,23,24,25,26,29,30,33,34,35,36,37,40,43,46,47];
  const spread = new Set(mixed);
  const source = '百苗圖系列（Wellcome MS Chinese 99，無題本）';
  const collection = 'b14870435_chinese_99';
  const knownTitles = {5:'倮猓',6:'黑倮猓',9:'白倮猓',10:'馬鐙龍家苗',11:'蔡家苗',12:'補籠苗',13:'宋家苗',14:'白苗',15:'紅苗',16:'狆家苗',17:'龍家苗',18:'青苗',19:'峒人',20:'蠻人（待核）',23:'土人',24:'黑苗',25:'犵狫',26:'打牙犵狫',29:'棘人（待核）',30:'九股苗',33:'𦍕獷苗',34:'天苗',35:'六額子',36:'猺苗',37:'平伐苗',40:'花苗',43:'羅漢苗',46:'猺人',47:'狄𦍕狑狪猺獞（首字待核）'};
  const iiif = (page,region,width) =>
    'https://iiif.wellcomecollection.org/image/'+collection+'_'+String(page).padStart(4,'0')+
    '.jp2/'+region+'/'+width+',/0/default.jpg';
  let plate=0;
  window.MIAO_WELLCOME_MS99_SCANS = Array.from({length:52},(_,i)=>{
    const page=i+1;
    const hasCaption=spread.has(page);
    const folio=hasCaption?++plate:page;
    const name=knownTitles[page] || (hasCaption?'圖說第 '+String(folio).padStart(2,'0')+' 幅（待校讀）':page===1?'封面掃描':page===52?'色卡與標尺':'非正文掃描第 '+String(page).padStart(2,'0')+' 頁');
    const image=iiif(page,'full',1600);
    const artwork=hasCaption?iiif(page,'pct:50,0,50,100',1350):null;
    const caption=hasCaption?iiif(page,'pct:0,0,50,100',1350):null;
    return {
      id:'wellcome-ms99-p'+String(page).padStart(4,'0'),
      collection_id:'wellcome-ms-chinese-99',
      folio,
      pdf_page:page, // Source's digitized scan ordinal; not a PDF-page claim.
      page_total:52,
      plate_total:29,
      source_kind:'iiif',
      source_title:source,
      source_file:'Wellcome Chinese Collection 99 · MS Chinese 99',
      source_url:'https://wellcomecollection.org/works/f8b2bkkd',
      source_rights:'Public Domain Mark',
      title:name,
      title_en:hasCaption?'Plate '+String(folio).padStart(2,'0')+' · Chinese heading pending verification':page===1?'Cover scan':page===52?'Color card / scale':'Non-text scan '+String(page).padStart(2,'0'),
      image,
      thumb:artwork||iiif(page,'full',400),
      text_image:caption||image,
      paired_image:artwork,
      artwork_image:artwork,
      caption_image:caption,
      high_res_image:iiif(page,'full',3000),
      ocr_raw:'',
      transcription:'',
      translation:'',
      translation_status:hasCaption?'not_started':'not_applicable',
      status:hasCaption?'caption_pending':'non_text',
      page_kind:hasCaption?'caption':'non_text',
      notes:hasCaption?
        '原始 3000px 扫描已检查：本页左半为竖排中文题记，右半为彩绘；图文分开提供。文字 OCR 与英译未校读完成。IIIF 图像出自 Wellcome Collection（Public Domain Mark）。扫描页 '+page+'，图说第 '+folio+' 幅。':
        '原始 3000px 扫描已检查：本页为封面、空白／衬页、背面或拍摄辅助页，没有需要进行图说 OCR 的文字。保留原扫描次序。Wellcome Collection（Public Domain Mark）。',
      tags:[],
      visual_tags:[]
    };
  });
  // Do not merge identical-looking blank leaves, and never mistake photo calibration for a plate.
})();

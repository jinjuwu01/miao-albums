/* Two physical copies, digitized at their holding institutions.
   Russian State Library Ф.274 №54.1 and №54.2: Commons 47 + 46 PDF page images.
   Manchester Chinese Crawford 398: 202 IIIF canvases (2 vols, covers/edges included).
   Catalogue verified 2026-11-22, but full leaf-by-leaf transcription NOT performed.
   No human-reviewed text, no guessed ethnic headings, no fabricated translations.
   Remote previews are live institutional/Commons images; no PDF bytes are hosted here.
 */
(() => {
  const records = [];
  const RSL = [
    {
      volume:1, total:47, number:"01013071618", hash:"e/ed", shelf:"Ф.274 №54.1",
      file:"RSL01013071618_百苗圖_清繪本_上冊.pdf"
    },
    {
      volume:2, total:46, number:"01013071654", hash:"1/1c", shelf:"Ф.274 №54.2",
      file:"RSL01013071654_百苗圖_清繪本_下冊.pdf"
    }
  ];
  for (const vol of RSL) {
    const file = encodeURIComponent(vol.file).replace(/%2F/g,"/");
    const pdf = "https://commons.wikimedia.org/wiki/File:" + file;
    const preview = (page,width) => "https://upload.wikimedia.org/wikipedia/commons/thumb/" +
      vol.hash + "/" + file + "/page" + page + "-" + width + "px-" + file + ".jpg";
    for (let page=1;page<=vol.total;page++) {
      const id="rsl-f274-v"+vol.volume+"-p"+String(page).padStart(3,"0");
      const isCover=page===1;
      records.push({
        id, collection_id:"rsl-f274-54", copy_id:"rsl-f274-54",
        work_id:"work-guizhou-82", source_kind:"pdf",
        source_title:"百苗圖（擬題，俄羅斯國立圖書館藏，"+(vol.volume===1?"上":"下")+"冊）",
        source_file:vol.file, source_url:pdf, source_rights:"Public Domain Mark · Wikimedia Commons",
        volume:vol.volume===1?"上冊 / Volume I":"下冊 / Volume II", shelfmark:vol.shelf,
        folio:page, pdf_page:page, page_total:vol.total, plate_total:vol.total,
        source_pdf_page:page, page_kind:isCover?"non_text":"scan_only",
        image:preview(page,960), thumb:preview(page,500), high_res_image:preview(page,1280),
        text_image:preview(page,1280), paired_image:null,
        title:isCover?"封面（原冊書衣）":"第"+page+"頁掃描（待逐葉核讀）",
        title_en:isCover?"Original cover":"PDF page "+page+" · leaf content awaiting verification",
        ocr_raw:"", transcription:"", translation:"",
        translation_status:isCover?"not_applicable":"not_started",
        status:isCover?"non_text":"scan_only",
        notes:isCover?
          "俄羅斯國立圖書館手稿部，"+vol.shelf+"。此頁為原冊書衣；保留原掃描，不進行題記 OCR。原始 PDF 可以在 Wikimedia Commons 查閱。":
          "俄羅斯國立圖書館手稿部，"+vol.shelf+"。本條僅對應 PDF 第"+page+"頁，圖文分割、族稱、題記、英譯均未逐葉核定。網頁預覽由 Wikimedia Commons PDF 縮圖服務動態提供；如縮圖載入失敗，請使用原館 PDF。不得將此頁視作已校讀的圖說。",
        tags:[],visual_tags:[],ocr_engine:null,scan_index:page
      });
    }
  }
  // Published Manchester Presentation API 2 manifest: exactly 202 canvases.
  // The sequential IIIF image resource IDs are explicitly present as ...-000-00001.jp2 through ...-000-00202.jp2.
  // Vol I: 1 front cover, 2..95 leaves, 96 back cover, 97..100 edges, 101..102 cover details.
  // Vol II: 103 front cover, 104..195 leaves, 196 back cover, 197..200 edges, 201..202 cover details.
  const manImage = (n,width) => "https://image.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398-000-"+
    String(n).padStart(5,"0")+".jp2/full/"+width+",/0/default.jpg";
  for(let n=1;n<=202;n++) {
    const vol=n<=102?1:2;
    const isLeaf = (n>=2&&n<=95)||(n>=104&&n<=195);
    const leaf = vol===1?n-1:n-103;
    const cover = n===1||n===103;
    const back = n===96||n===196;
    const edge = (n>=97&&n<=100)||(n>=197&&n<=200);
    const name = cover?"封面 / Front cover":back?"封底 / Back cover":edge?"裝幀側邊 / Binding edge":isLeaf?"館方原葉第"+leaf+"號 / Holding leaf "+leaf:"裝幀細節 / Cover detail";
    records.push({
      id:"manchester-c398-p"+String(n).padStart(3,"0"),
      collection_id:"manchester-c398", copy_id:"rylands-crawford398",
      work_id:"work-guizhou-82", source_kind:"iiif",
      source_title:"貴州全省捌拾貳種苗圖（曼徹斯特藏本）",
      source_file:"Chinese Crawford 398 · Volume "+vol,
      source_url:"https://www.digitalcollections.manchester.ac.uk/view/PR-CHCR-00398/"+n,
      source_manifest:"https://www.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398",
      source_rights:"Zooming image © University of Manchester Library, all rights reserved; downloadable images CC BY-NC 4.0",
      shelfmark:"Chinese Crawford 398",volume:vol===1?"上冊 / Volume I":"下冊 / Volume II",
      folio:isLeaf?leaf:n, pdf_page:n, page_total:202, plate_total:isLeaf?(vol===1?94:92):202,
      source_canvas:"https://www.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398/canvas/"+n,
      scan_index:n, page_kind:isLeaf?"scan_only":"non_text",
      image:manImage(n,1000), thumb:manImage(n,320), high_res_image:manImage(n,2000),
      text_image:manImage(n,2000), paired_image:null,
      title:isLeaf?"上、下冊原葉第"+leaf+"號（待校讀）":name,
      title_en:isLeaf?"Volume "+vol+" · source leaf "+leaf+" (unverified)":name,
      ocr_raw:"", transcription:"", translation:"",
      translation_status:isLeaf?"not_started":"not_applicable",
      status:isLeaf?"scan_only":"non_text",
      notes:isLeaf?
       "曼徹斯特大學約翰·萊蘭茲圖書館，Chinese Crawford 398，官方 IIIF Canvas "+n+"，"+(vol===1?"上":"下")+"冊第"+leaf+"葉。圖文性質、題記文字與彩繪分割尚未逐張人工核對。此影像為館方遠端提供；放大影像及下載圖像適用不同的使用條款。":
       "曼徹斯特大學約翰·萊蘭茲圖書館，Chinese Crawford 398，官方 IIIF Canvas "+n+"，"+name+"。非正文頁照原序保留，不進行圖說 OCR。",
      tags:[],visual_tags:[],ocr_engine:null
    });
  }
  window.MIAO_RSL_MANCHESTER_SCANS = records;
})();

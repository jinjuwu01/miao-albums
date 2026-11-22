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
    const preview = (page,width) => "https://thumb.wikimedia.org/wikipedia/commons/thumb/" +
      vol.hash + "/" + file + "/page" + page + "-" + width + "px-" + file + ".jpg";
    for (let page=1;page<=vol.total;page++) {
      const id="rsl-f274-v"+vol.volume+"-p"+String(page).padStart(3,"0");
      // Historical headings are edition-specific, transcribed from scan images.
      // Do not copy the wording of a different Miao album recension.
      const verifiedV1 = {5:"黑猓羅",6:"羅鬼女官",7:"白猓羅",8:"宋家苗",9:"蔡家苗",10:"卡尤仲家",11:"補籠仲家",12:"青仲家",13:"曾竹籠家",14:"狗耳龍家",15:"馬蹬龍家",16:"大頭龍家",17:"花苗",18:"紅苗",19:"白苗",20:"青苗",21:"黑苗",22:"東苗",23:"西苗",24:"夯苗",25:"獠苗",26:"打牙苗",27:"剪髮犵狫",28:"豬屎犵狫",29:"紅犵狫",30:"花犵狫",31:"水犵狫",32:"銅圈犵狫",33:"披袍犵狫",34:"林犵苗"};
      const verifiedV2 = {4:"谷蒲苗",5:"陽洞羅漢苗",6:"克孟牯羊苗",7:"洞苗",8:"箐苗",9:"伶家苗（題字待核）",10:"狪家苗",11:"種林家苗（題字待核）",12:"額子（題字待核）",13:"白額子",14:"舟家蠻",15:"九名九姓苗",16:"齊頭苗（題字待核）",17:"洞夷苗（題字待核）",18:"八寨黑苗",19:"清江黑苗",20:"樓居黑苗",21:"黑山苗",22:"黑生苗",23:"高坡苗",24:"平伐苗",25:"黑仲家",26:"清江仲家",27:"里民子"};
      const plateName = vol.volume===1 ? verifiedV1[page] : verifiedV2[page];
      const cropBase = "images/external_pilot/rsl_v"+vol.volume+"_p"+String(page).padStart(3,"0");
      const artCrop = cropBase + (vol.volume===1 && page<=9 ? "_artwork.jpg" : "_left.jpg");
      const txtCrop = cropBase + (vol.volume===1 && page<=9 ? "_text.jpg" : "_right.jpg");
      const isCover=page===1;
      const isNonText = (vol.volume===1 && page>=2 && page<=4)||(vol.volume===2 && (page===2||page===3));
      const plateIndex=vol.volume===1?page-4:page+38;
      records.push({
        id, collection_id:"rsl-f274-54", copy_id:"rsl-f274-54",
        work_id:"work-guizhou-82", source_kind:"pdf",
        source_title:"百苗圖（擬題，俄羅斯國立圖書館藏，"+(vol.volume===1?"上":"下")+"冊）",
        source_file:vol.file, source_url:pdf, source_rights:"Public Domain Mark · Wikimedia Commons",
        volume:vol.volume===1?"上冊 / Volume I":"下冊 / Volume II", shelfmark:vol.shelf,
        folio:plateName?plateIndex:page, pdf_page:page, page_total:vol.total, plate_total:null,
        source_pdf_page:page, page_kind:(isCover||isNonText)?"non_text":plateName?"caption":"scan_only",
        image:preview(page,960), thumb:plateName?artCrop:preview(page,500), high_res_image:preview(page,1280),
        text_image:plateName?txtCrop:preview(page,1280), paired_image:plateName?artCrop:null,
        artwork_image:plateName?artCrop:null, caption_image:plateName?txtCrop:null,
        spread_layout:plateName?"artwork_left_caption_right":null,
        spread_image_layout:plateName?"artwork_left_caption_right":null,
        title:plateName?plateName:(isCover?"封面（原冊書衣）":isNonText?"封面、裝幀或空白襯頁":"第"+page+"頁掃描（待逐葉核讀）"),
        title_en:plateName?"Plate "+plateIndex+" · "+plateName+" (historical label)":(isCover?"Original cover":isNonText?"Blank/cover/endpaper":"PDF page "+page+" · leaf content awaiting verification"),
        ocr_raw:"", transcription:"", translation:"",
        translation_status:(isCover||isNonText)?"not_applicable":"not_started",
        status:(isCover||isNonText)?"non_text":plateName?"caption_pending":"scan_only",
        notes:isNonText?
          "已檢查原始 PDF 掃描：本頁是非正文、裝幀或空白襯頁，不做中文 OCR。":
          plateName?
          "已檢查原始影像：本頁左半為彩繪、右半為手寫竪排題記；分別保存裁圖，原掃描不被替換。來源俄羅斯國立圖書館，"+vol.shelf+"。頁碼按 Commons PDF 計，族稱和文字仍需核讀。":
          isCover?
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
    // Image-verified from the institution's actual canvas scans (2026-11-22).
    const confirmedBlank = n>=2&&n<=5;
    const confirmedPreface = n===6||n===7;
    const checkedPainting = n>=8&&n<=24&&n%2===0;
    const checkedText = n>=9&&n<=23&&n%2===1;
    // The physical object alternates a painting leaf with its description:
    // painting n (even) => inscription n+1; inscription n (odd) => painting n-1.
    const relatedCanvas = checkedPainting?n+1:checkedText?n-1:null;
    const verifiedTitles = {9:"觀音寺圖說",11:"猓羅圖說",13:"蔡家苗",15:"白猓羅",17:"宋家苗",19:"曾竹龍家",21:"青仲家",23:"補籠仲家"};
    const verifiedTitle = verifiedTitles[n]||null;
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
      folio:n, pdf_page:n, page_total:202, plate_total:null,
      source_canvas:"https://www.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398/canvas/"+n,
      scan_index:n, page_kind:confirmedBlank?"non_text":confirmedPreface?"preface":checkedPainting?"illustration":checkedText?"caption":isLeaf?"scan_only":"non_text",
      image:manImage(n,1000), thumb:manImage(n,320), high_res_image:manImage(n,2000),
      text_image:manImage(n,2000), paired_image:relatedCanvas?manImage(relatedCanvas,1600):null,
      paired_pdf_page:relatedCanvas||null,
      title:verifiedTitle|| (confirmedPreface?"《蠻獠圖說》總序（續頁，待逐字校讀）":confirmedBlank?"空白襯頁（無需 OCR）":checkedPainting?"圖說配圖（無正文 OCR）":isLeaf?(vol===1?"上冊":"下冊")+"原葉第"+leaf+"號（待校讀）":name),
      title_en:checkedText?(verifiedTitle+" (historical caption)"):confirmedPreface?"General preface to Manliao tushuo (image-checked; transcription pending)":confirmedBlank?"Blank endpaper; no OCR needed":checkedPainting?"Painting (no OCR required)":isLeaf?"Volume "+vol+" · source leaf "+leaf+" (unverified)":name,
      ocr_raw:"", transcription:"", translation:"",
      translation_status:isLeaf?"not_started":"not_applicable",
      status:confirmedBlank?"non_text":confirmedPreface?"preface_pending":checkedPainting?"image_only":checkedText?"caption_pending":isLeaf?"scan_only":"non_text",
      notes:checkedPainting?
       "已核查館方畫幅：此頁為純彩繪，沒有可識讀的題記，因此不執行 OCR。相鄰的下一幅文字頁（IIIF Canvas "+relatedCanvas+"）是其配對圖說。":
       checkedText?
       "已核查館方原圖：此頁為竪排文字，對應前一幅彩繪（IIIF Canvas "+relatedCanvas+"）。只記錄曼徹斯特藏本原文，不用俄藏或其他抄本覆蓋。":
       confirmedBlank?
       "已逐張核查館方影像：本張為空白襯頁，沒有可辨認的中文題記。不進行 OCR。":
       confirmedPreface?
       "已逐張核查館方影像：本張為《蠻獠圖說》總序正文，屬手寫竪排文字；需按右至左列序逐字校讀，並獨立製作英譯。":
       isLeaf?
       "曼徹斯特大學約翰·萊蘭茲圖書館，Chinese Crawford 398，官方 IIIF Canvas "+n+"，"+(vol===1?"上":"下")+"冊第"+leaf+"葉。圖文性質、題記文字與彩繪分割尚未逐張人工核對。此影像為館方遠端提供；放大影像及下載圖像適用不同的使用條款。":
       "曼徹斯特大學約翰·萊蘭茲圖書館，Chinese Crawford 398，官方 IIIF Canvas "+n+"，"+name+"。非正文頁照原序保留，不進行圖說 OCR。",
      tags:[],visual_tags:[],ocr_engine:null
    });
  }
  window.MIAO_RSL_MANCHESTER_SCANS = records;
})();

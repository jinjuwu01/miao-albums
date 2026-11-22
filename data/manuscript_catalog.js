/* Curated manuscript-copy catalogue: works and physical copies are deliberately separate.
   Source links checked 2026-11-22. Do not create OCR/page records from bibliography alone.
   'digitized' means an online facsimile is linked; not that its images are hosted here.
   IDs are stable for future scan imports and provenance tracking. */
window.MIAO_MANUSCRIPT_CATALOG = {
  schema: "miao-manuscript-catalog-v1",
  updated: "2026-11-22",
  works: [
    {id:"work-kemeng-guyang", title:"克孟牯羊苗圖", title_en:"Kemeng Guyang Miao Album", type:"independent"},
    {id:"work-guizhou-82", title:"貴州八十二種苗圖系統", title_en:"Guizhou eighty-two-type album tradition", type:"provisional-family"},
    {id:"work-miaozhong", title:"苗種圖說", title_en:"Descriptions of Miao Groups", type:"independent"},
    {id:"work-wellcome103", title:"Wellcome Chinese Collection 103（正式題名待核）", title_en:"Wellcome MS Chinese 103 (title unverified)", type:"unidentified"},
    {id:"work-manliao", title:"蠻獠圖說", title_en:"Manliao Illustrations and Descriptions", type:"independent"},
    {id:"work-yunnan-sanyi", title:"雲南三迤百蠻圖", title_en:"Illustrations of the Peoples of Yunnan", type:"independent"},
    {id:"work-chenhao", title:"陳浩苗圖系統（待版本比對）", title_en:"Chen Hao Miao album tradition (unverified relationship)", type:"provisional-family"},
    {id:"work-leiden", title:"萊頓藏雲南苗圖（暫稱）", title_en:"Leiden Yunnan Miao albums (working title)", type:"unidentified"},
    {id:"work-qiansheng-gezhong", title:"黔省各種苗圖", title_en:"Various Miao of Guizhou", type:"independent"},
    {id:"work-bl-miaotu", title:"苗圖", title_en:"Miao Album", type:"independent"}
  ],
  copies: [
    {
      id:"loc-kemeng-2014514309", work_id:"work-kemeng-guyang", title:"克孟牯羊苗圖", title_en:"Kemeng Guyang Miao Album",
      institution:"美國國會圖書館", institution_en:"Library of Congress", shelfmark:"LCCN 2014514309",
      place:"貴州", region:"guizhou", access:"digitized", priority:1, relation:"new-copy",
      url:"https://www.loc.gov/resource/lcnclscd.2014514309.1A001/?st=gallery",
      catalog_url:"https://www.loc.gov/item/2014514309/",
      note:"獨立的線上彩繪圖冊；須逐葉核對題記、圖文配對與頁碼，方可進入 OCR records。",
      note_en:"Independent digitized painted album; captions, pairing and pagination require leaf-level review before OCR import.",
      source:"Library of Congress digital record and collection essay", imported_pages:0
    },
    {
      id:"rylands-crawford398", work_id:"work-guizhou-82", title:"貴州全省捌拾貳種苗圖", title_en:"Guizhou quan sheng bashier zhong Miao tu",
      institution:"曼徹斯特大學約翰·萊蘭茲圖書館", institution_en:"John Rylands Library, University of Manchester", shelfmark:"Chinese Crawford 398",
      place:"貴州", region:"guizhou", access:"digitized", priority:1, relation:"related-unverified",
      url:"https://www.digitalcollections.manchester.ac.uk/view/PR-CHCR-00398",
      manifest:"https://www.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398",
      note:"兩冊，清代十八世紀本；館方 IIIF 包含逐葉影像。與本站已有的其他八十二種系統抄本，關係尚待逐幅比對。曼徹斯特圖像權利須遵循館方聲明。",
      note_en:"Two-volume eighteenth-century copy with a published IIIF manifest. Relationship to other eighty-two-type manuscripts remains uncollated. Check Manchester's image-use terms.",
      source:"University of Manchester IIIF manifest, Chinese Crawford 398", imported_pages:202, ocr_pages:0, import_scope:"scan_index_only"
    },
    {
      id:"cdf-miaozhong", work_id:"work-miaozhong", title:"苗種圖說", title_en:"Miaozhong tushuo",
      institution:"法蘭西學院", institution_en:"Collège de France", shelfmark:"館藏號待核 / Shelfmark to verify",
      place:"貴州及周邊（待核）", region:"guizhou", access:"review", priority:2, relation:"new-copy",
      url:"https://salamandre.college-de-france.fr/archives-en-ligne/ead.html?c=FR075CDF_00IHEC0001_de-50&id=FR075CDF_00IHEC0001&qid=eas1583381804306",
      note:"Salamandre 列有「Miaozhong tushuo - 苗種圖說」數字館藏；圖幅數量、可下載格式、正式館藏號仍需核實。",
      note_en:"Salamandre lists this illustrated work; image count, download options and shelfmark still require verification.",
      source:"Collège de France Salamandre digitized-collections index", imported_pages:0
    },
    {
      id:"wellcome-ms103", work_id:"work-wellcome103", title:"Wellcome Chinese Collection 103", title_en:"Wellcome Chinese Collection 103",
      institution:"威康收藏館", institution_en:"Wellcome Collection", shelfmark:"MS Chinese 103",
      place:"雲南（館藏內容待核）", region:"yunnan", access:"digitized", priority:2, relation:"new-copy",
      url:"https://wellcomecollection.org/works/urdkgabj",
      note:"館方記載 1,037 張影像、公版標記；「雲南營制苗蠻圖冊」是第三方提出的識別，尚未獲館方正式書目確認。未核明圖文性質前不做 OCR。",
      note_en:"1,037 online images, Public Domain Mark. The suggested Yunnan title comes from a third-party identification, not the official catalogue; verify before OCR.",
      source:"Wellcome Collection MS Chinese 103 catalogue", imported_pages:0
    },
    {
      id:"bodleian-manliao-c15", work_id:"work-manliao", title:"蠻獠圖說", title_en:"Manliao tushuo",
      institution:"牛津大學博德利圖書館", institution_en:"Bodleian Libraries, Oxford", shelfmark:"MS.Chin.c.15 (to verify)",
      place:"西南地區", region:"guizhou", access:"review", priority:2, relation:"related-unverified",
      url:"https://digital.bodleian.ox.ac.uk/objects/087038a5-c4d0-4813-99b8-c9296109d3d6/",
      note:"數字物件連結及手稿對應尚待二次確認；可能與其他蠻苗／苗蠻圖說抄本相關，但目前不視作同一冊。",
      note_en:"Object URL and shelfmark association need independent verification; do not merge with other similarly titled albums.",
      source:"Bodleian object link; shelfmark association pending verification", imported_pages:0
    },
    {
      id:"bodleian-yunnan-c37", work_id:"work-yunnan-sanyi", title:"雲南三迤百蠻圖", title_en:"Yunnan sanyi baiman tu",
      institution:"牛津大學博德利圖書館", institution_en:"Bodleian Libraries, Oxford", shelfmark:"MS.Chin.c.37 (to verify)",
      place:"雲南", region:"yunnan", access:"review", priority:2, relation:"related-unverified",
      url:"https://digital.bodleian.ox.ac.uk/objects/fa83b7ac-821f-4824-84dc-d1a18d5d99a8/",
      note:"學術文獻著錄四卷及與伯麟圖說的關係；數字物件與館藏號對應尚待核實，不能把相似版本合併。",
      note_en:"Described in scholarship as a four-juan Yunnan work. Verify the digital object and manuscript before edition-level comparison.",
      source:"Published scholarly descriptions and provisional Bodleian object link", imported_pages:0
    },
    {
      id:"rsl-f274-54", work_id:"work-guizhou-82", title:"百苗圖（俄羅斯國立圖書館藏本，擬題）", title_en:"Bai Miao tu (Russian State Library copy; supplied title)",
      institution:"俄羅斯國立圖書館", institution_en:"Russian State Library", shelfmark:"Ф.274 №54.1–54.2",
      place:"貴州", region:"guizhou", access:"digitized", priority:1, relation:"related-unverified",
      url:"https://commons.wikimedia.org/wiki/File:RSL01013071618_%E7%99%BE%E8%8B%97%E5%9C%96_%E6%B8%85%E7%B9%AA%E6%9C%AC_%E4%B8%8A%E5%86%8A.pdf",
      additional_links:[{label:"下冊 PDF / Volume II",url:"https://commons.wikimedia.org/wiki/File:RSL01013071654_%E7%99%BE%E8%8B%97%E5%9C%96_%E6%B8%85%E7%B9%AA%E6%9C%AC_%E4%B8%8B%E5%86%8A.pdf"}],
      note:"兩冊各 41 條圖說；Commons 上冊 47 頁、下冊 46 頁。以俄羅斯國立圖書館實際書號為版本識別；切勿以「百苗圖」擬題當作原題。",
      note_en:"Two volumes of 41 entries each; Wikimedia Commons PDF scans have 47 and 46 pages. Bai Miao tu is a supplied title, not the manuscript's original title.",
      source:"Wikimedia Commons files citing Russian State Library catalogue and Shuge scans", imported_pages:93, ocr_pages:0, import_scope:"scan_index_only"
    },
    {
      id:"waseda-ni16-02436", work_id:"work-chenhao", title:"苗族習俗圖説", title_en:"Miaozu xisu tushuo",
      institution:"早稻田大學圖書館", institution_en:"Waseda University Library", shelfmark:"ニ16 02436",
      place:"貴州及周邊（待核）", region:"guizhou", access:"digitized", priority:3, relation:"possible-duplicate",
      url:"https://commons.wikimedia.org/wiki/File:WUL-ni16_02436_%E8%8B%97%E6%97%8F%E7%BF%92%E4%BF%97%E5%9C%96%E8%AA%AC.pdf",
      note:"著錄陳浩撰。本站已有《蠻苗圖說》（陳浩）；需先核圖序、題記和頁數，判斷是否同一傳本的別題，避免重複。",
      note_en:"Attributed to Chen Hao; compare sequence and text with the existing Chen Hao album before deciding whether it is a duplicate.",
      source:"Waseda University Library scan mirrored on Wikimedia Commons", imported_pages:0
    },
    {
      id:"leiden-yunnan", work_id:"work-leiden", title:"萊頓藏雲南苗圖（兩冊，暫稱）", title_en:"Leiden Yunnan Miao albums (two volumes; working title)",
      institution:"萊頓大學圖書館", institution_en:"Leiden University Libraries", shelfmark:"請向館方核對 / To verify",
      place:"雲南", region:"yunnan", access:"catalog", priority:3, relation:"new-copy",
      url:"https://www.leidenspecialcollectionsblog.nl/articles/portraying-ethnic-groups-in-yunnan-a-miao-album-with-painted-maps",
      note:"館方文章介紹兩冊及彩繪地圖；未核實是否提供可下載的完整逐頁掃描，暫只做書目線索。",
      note_en:"Institutional article describes two albums with painted maps; a full downloadable facsimile has not been verified.",
      source:"Leiden University Libraries Special Collections Blog", imported_pages:0
    },
    {
      id:"bl-or2232", work_id:"work-qiansheng-gezhong", title:"黔省各種苗圖", title_en:"Qian sheng ge zhong Miao tu",
      institution:"大英圖書館", institution_en:"British Library", shelfmark:"Or 2232",
      place:"貴州", region:"guizhou", access:"catalog", priority:3, relation:"related-unverified",
      url:"https://searcharchives.bl.uk/?f%5Bproject_collections_ssim%5D%5B%5D=Chinese+Manuscripts&per_page=100",
      note:"有書目線索；尚未確認可公開取得完整影像。與本站《黔省諸苗全圖》的版本關係待核。",
      note_en:"Bibliographic lead only; no complete online facsimile confirmed. Relationship to other Guizhou albums uncollated.",
      source:"British Library Chinese manuscripts catalogue", imported_pages:0
    },
    {
      id:"bl-or4153", work_id:"work-bl-miaotu", title:"苗圖", title_en:"Miao tu",
      institution:"大英圖書館", institution_en:"British Library", shelfmark:"Or 4153",
      place:"貴州及周邊（待核）", region:"guizhou", access:"catalog", priority:3, relation:"new-copy",
      url:"https://searcharchives.bl.uk/catalog/032-003616295",
      note:"正式館藏線索；未確認完整數字掃描，因此不建立虛構的頁面影像或 OCR。",
      note_en:"Catalogue lead only; complete digital scans are not confirmed, so no page images or OCR have been invented.",
      source:"British Library archive catalogue", imported_pages:0
    }
  ]
};
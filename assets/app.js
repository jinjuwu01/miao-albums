(() => {
  'use strict';
  const LEGACY_PLATES = Array.isArray(window.MIAO_RECORDS) ? window.MIAO_RECORDS : [];
  const SHENGHUO_EXTRA_SCANS = Array.isArray(window.MIAO_SHENGHUO_EXTRA_SCANS) ? window.MIAO_SHENGHUO_EXTRA_SCANS : [];
  // Original 40 plates (PDF pages 5–44), followed by supplemental scans for pages 45–47 only.
  const LEGACY = [...LEGACY_PLATES, ...SHENGHUO_EXTRA_SCANS.filter(r => r.pdf_page > 44)];
  const IMPORTED = Array.isArray(window.MIAO_IMPORTED_RECORDS) ? window.MIAO_IMPORTED_RECORDS : [];
  const IMAGE_DRAFTS = window.MIAO_VISUAL_DRAFTS && typeof window.MIAO_VISUAL_DRAFTS === 'object' ? window.MIAO_VISUAL_DRAFTS : {};
  const COLUMN_REVIEWS = window.MIAO_COLUMN_REVIEWS && typeof window.MIAO_COLUMN_REVIEWS === 'object' ? window.MIAO_COLUMN_REVIEWS : {};
  const SHENGHUO_40_DRAFTS = window.MIAO_SHENGHUO_40_DRAFTS && typeof window.MIAO_SHENGHUO_40_DRAFTS === 'object' ? window.MIAO_SHENGHUO_40_DRAFTS : {};
  const ENGLISH_DRAFTS = window.MIAO_ENGLISH_DRAFTS && typeof window.MIAO_ENGLISH_DRAFTS === 'object' ? window.MIAO_ENGLISH_DRAFTS : {};
  const BOLIN_108_DRAFTS = window.MIAO_BOLIN_108_DRAFTS && typeof window.MIAO_BOLIN_108_DRAFTS === 'object' ? window.MIAO_BOLIN_108_DRAFTS : {};
  const DIAN_36_DRAFTS = window.MIAO_DIAN_36_DRAFTS && typeof window.MIAO_DIAN_36_DRAFTS === 'object' ? window.MIAO_DIAN_36_DRAFTS : {};
  const MIAOFAN_36_DRAFTS = window.MIAO_MIAOFAN_36_DRAFTS && typeof window.MIAO_MIAOFAN_36_DRAFTS === 'object' ? window.MIAO_MIAOFAN_36_DRAFTS : {};
  const DIAN_PAGE_FIXES = window.MIAO_DIAN_PAGE_FIXES && typeof window.MIAO_DIAN_PAGE_FIXES === 'object' ? window.MIAO_DIAN_PAGE_FIXES : {};
  const MIAOMAN_48_DRAFTS = window.MIAOMAN_48_DRAFTS && typeof window.MIAOMAN_48_DRAFTS === 'object' ? window.MIAOMAN_48_DRAFTS : {};
  const MIAOMAN_41_DRAFTS = window.MIAOMAN_41_DRAFTS && typeof window.MIAOMAN_41_DRAFTS === 'object' ? window.MIAOMAN_41_DRAFTS : {};
  const MIAOMAN_82_DRAFTS = window.MIAOMAN_82_DRAFTS && typeof window.MIAOMAN_82_DRAFTS === 'object' ? window.MIAOMAN_82_DRAFTS : {};
  const MIAOMAN_41FRAMES_DRAFTS = window.MIAOMAN_41FRAMES_DRAFTS && typeof window.MIAOMAN_41FRAMES_DRAFTS === 'object' ? window.MIAOMAN_41FRAMES_DRAFTS : {};
  const MIAOMAN_54_PLATES = Array.isArray(window.MIAOMAN_54_PLATES) ? window.MIAOMAN_54_PLATES : [];
  const MIAOMAN_54_FRONT = window.MIAOMAN_54_FRONT && typeof window.MIAOMAN_54_FRONT === 'object' ? window.MIAOMAN_54_FRONT : {};
  const MIAOMAN_42_DRAFTS = window.MIAOMAN_42_DRAFTS && typeof window.MIAOMAN_42_DRAFTS === 'object' ? window.MIAOMAN_42_DRAFTS : {};
  const MIAOMAN_SINGLE_82_DRAFTS = window.MIAOMAN_SINGLE_82_DRAFTS && typeof window.MIAOMAN_SINGLE_82_DRAFTS === 'object' ? window.MIAOMAN_SINGLE_82_DRAFTS : {};
  const MANMIAO_CHENHAO_80_DRAFTS = window.MANMIAO_CHENHAO_80_DRAFTS && typeof window.MANMIAO_CHENHAO_80_DRAFTS === 'object' ? window.MANMIAO_CHENHAO_80_DRAFTS : {};
  const GUIZHOU_QUANSHENG_20_DRAFTS = window.GUIZHOU_QUANSHENG_20_DRAFTS && typeof window.GUIZHOU_QUANSHENG_20_DRAFTS === 'object' ? window.GUIZHOU_QUANSHENG_20_DRAFTS : {};
  // One visible record per source-PDF leaf. Keep later image-checked plate records
  // instead of the earlier unverified OCR rows for exactly the same scanned leaf.
  // Do NOT merge distinct manuscripts or different scanned leaves with similar text.
  const JINGONG_PLATES = Array.isArray(window.MIAO_JINGONG_68_DRAFTS) ? window.MIAO_JINGONG_68_DRAFTS : [];
  const QIANSHENG_PLATES = Array.isArray(window.MIAO_QIANSHENG_68_DRAFTS) ? window.MIAO_QIANSHENG_68_DRAFTS : [];
  const REPLACEMENTS = [
    ...LEGACY.map(r => ({collection:'0aa54e2d1b74', page:r.pdf_page, preferred:r.id})),
    ...JINGONG_PLATES.map(r => ({collection:'090f21b2429e', page:r.pdf_page, preferred:r.id})),
    ...QIANSHENG_PLATES.map(r => ({collection:'a730d8585776', page:r.pdf_page, preferred:r.id}))
  ];
  const REPLACEMENT_BY_LEAF = new Map(REPLACEMENTS.map(r => [r.collection+':'+r.page, r.preferred]));
  const IMPORTED_UNIQUE = IMPORTED.filter(r => !REPLACEMENT_BY_LEAF.has(r.collection_id+':'+r.pdf_page));
  // Keep any earlier browser-only edits on hidden OCR rows accessible on the preferred record.
  const OLD_EDIT_ID_BY_PREFERRED = new Map(IMPORTED.filter(r => REPLACEMENT_BY_LEAF.has(r.collection_id+':'+r.pdf_page))
    .map(r => [REPLACEMENT_BY_LEAF.get(r.collection_id+':'+r.pdf_page), r.id]));
  const IMPORTED_DISPLAY = IMPORTED_UNIQUE.flatMap(r=>(r.collection_id==='9e2b3d98dc2e'&&r.pdf_page>=3&&r.pdf_page<=29&&MIAOMAN_54_PLATES.length===54)?MIAOMAN_54_PLATES.filter(p=>p.pdf_page===r.pdf_page):[r]);
  const BASE_RAW = [...LEGACY, ...IMPORTED_DISPLAY, ...JINGONG_PLATES, ...QIANSHENG_PLATES].map((r, i) => ({...r, ...(IMAGE_DRAFTS[r.id] || {}), ...(COLUMN_REVIEWS[r.id] || {}), ...(SHENGHUO_40_DRAFTS[r.id] || {}), ...(BOLIN_108_DRAFTS[r.id] || {}), ...(DIAN_36_DRAFTS[r.id] || {}), ...(MIAOFAN_36_DRAFTS[r.id] || {}), ...(DIAN_PAGE_FIXES[r.id] || {}), ...(MIAOMAN_48_DRAFTS[r.id] || {}), ...(MIAOMAN_41_DRAFTS[r.id] || {}), ...(MIAOMAN_82_DRAFTS[r.id] || {}), ...(MIAOMAN_41FRAMES_DRAFTS[r.id] || {}), ...(MIAOMAN_54_FRONT[r.id] || {}), ...(MIAOMAN_42_DRAFTS[r.id] || {}), ...(MIAOMAN_SINGLE_82_DRAFTS[r.id] || {}), ...(MANMIAO_CHENHAO_80_DRAFTS[r.id] || {}), ...(GUIZHOU_QUANSHENG_20_DRAFTS[r.id] || {}), ...(ENGLISH_DRAFTS[r.id] || {}), source_title:r.source_file==='进贡苗蛮图.清.陈枚画.清绘本.pdf'?'進貢苗蠻圖（陳枚畫）':r.source_file==='黔省诸苗全图.上下册.清绘本.pdf'?'黔省諸苗全圖（上下冊）':(r.source_title || '苗族生活图'), sort_index:i}));
  // The imported OCR and later image-checked plates come from the same 79-page PDF.
  // Present them under one album and in source-PDF order, keeping 68 preferred
  // image-checked pages and 11 additional original OCR pages. Do not discard scans.
  const JINGONG_TITLE = '進貢苗蠻圖（陳枚畫）';
  const JINGONG_RECORDS = BASE_RAW.filter(r => r.source_title === JINGONG_TITLE).sort((a,b) => a.pdf_page - b.pdf_page);
  let jingongInserted = false;
  const BASE_JINGONG = BASE_RAW.flatMap(r => {
    if (r.source_title !== JINGONG_TITLE) return [r];
    if (jingongInserted) return [];
    jingongInserted = true;
    return JINGONG_RECORDS;
  }).map((r,i) => ({...r,sort_index:i}));
  // Keep the corrected 68 plates and the 8 additional OCR-only leaves from
  // the same 76-page Qingsheng source together as one album, in PDF order.
  const QIANSHENG_TITLE = '黔省諸苗全圖（上下冊）';
  const QIANSHENG_RECORDS = BASE_JINGONG.filter(r => r.source_title === QIANSHENG_TITLE).sort((a,b) => a.pdf_page - b.pdf_page);
  let qianshengInserted = false;
  const BASE = BASE_JINGONG.flatMap(r => {
    if (r.source_title !== QIANSHENG_TITLE) return [r];
    if (qianshengInserted) return [];
    qianshengInserted = true;
    return QIANSHENG_RECORDS;
  }).map((r,i) => ({...r,sort_index:i}));
  const byId = id => document.getElementById(id);
  const dom = {list:byId('result-list'),reader:byId('reader-content'),search:byId('search-input'),count:byId('result-count'),summary:byId('search-summary'),filter:byId('status-filter'),sort:byId('sort-order'),album:byId('album-filter')};
  let selected = BASE.some(r=>r.id===decodeURIComponent(location.hash.slice(1))) ? decodeURIComponent(location.hash.slice(1)) : (BASE[0]?.id || '');
  let results = [], mode=BASE.find(r=>r.id===selected)?.plate_half?'half':'full', zoom=1, dx=0, dy=0, isEditing=false;
  const EDIT_KEY='miao_albums_edits_v1';
  const readEdits = () => { try {const data=JSON.parse(localStorage.getItem(EDIT_KEY)||'{}');return data&&typeof data==='object'?data:{};}catch(e){return {};} };
  let edits=readEdits();
  const record = obj => {
    const saved = edits[obj.id] || edits[OLD_EDIT_ID_BY_PREFERRED.get(obj.id)] || null;
    return {...obj,...(saved||{}),status:saved?'local_edit':obj.status};
  };
  const esc = s => String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  // A deliberately limited offline conversion map; not a general-purpose OpenCC implementation.
  const PAIRS='織织 錦锦 羅罗 漢汉 屬属 風风 習习 禮礼 婚婚 姻姻 來来 髮发 髻髻 爭争 鬥斗 體体 服服 飾饰 刀刀 弩弩 與与 進进 歲岁 獞獞 祭祭 舞舞 踏踏 採采 會会 買买 賣卖 圖图 內内 處处 降降 較较 類类 籃篮 編编 鐵铁 銅铜 紅红 書书 語语 風风 衣衣 藥药 畫画 著着 農农 絲丝 綢绸 結结 嬰婴 獷犷 悍悍 紡纺 紗纱 綿绵 婦妇 野野 斗斗 藏藏 關关 談谈 飲饮 漁渔 馬马 職职 眾众 對对 製制 照照 華华 兒儿 牽牵 器器 舊旧 變变 各各 言言 歸归 雲云 廣广 州州 黎黎 平平 蠟蜡 染染 盤盘 節节 慶庆 騎骑 牛牛 笙笙 樂乐 嫁嫁 娶娶 窟窟 掃扫 經经 發发 經经 承承 識识 較较 實实 錄录 檔档 誌志 傳传 戰战 證证 講讲 煙烟 槍枪 鋤锄 裝装 盜盗 機机 養养 銀银 頭头 梳梳 佩佩 短短 長长 戴戴 室室 門门 將将 邊边 義义 鄉乡 俗俗 聘聘';
  const conv = {};
  PAIRS.split(/\s+/).forEach(x=>{if([...x].length===2)conv[[...x][0]]=[...x][1];});
  const norm = s => [...String(s??'').normalize('NFKC').toLowerCase()].map(ch=>conv[ch]||ch).join('').replace(/[\s\p{P}\p{S}]+/gu,' ' ).trim();
  const searchable = r => norm([r.source_title,r.source_file,r.title,r.title_en,r.transcription,r.translation,(['illustration','non_text','colophon','preface'].includes(r.page_kind)||r.review_batch==='miaoman48-2026-11-source-aware-v1'?'':r.ocr_raw),r.notes,...(r.tags||[]),...(r.visual_tags||[])].join(' '));
  const match = (r,query) => {
    if (!query.trim()) return true;
    const corpus=searchable(r);
    const compactCorpus=corpus.replace(/\s+/g,'');
    return query.split('|').some(group => {
      const tokens = group.match(/-?"[^"]+"|-?\S+/g)||[];
      return tokens.length>0 && tokens.every(raw=>{
        const negative=raw.startsWith('-');
        const clean=norm(raw.replace(/^-/, '').replace(/^"|"$/g,''));
        if(!clean)return true;
        const hit=corpus.includes(clean) || (/[\u3400-\u9fff]/u.test(clean) && compactCorpus.includes(clean.replace(/\s+/g,'')));
        return negative?!hit:hit;
      });
    });
  };
  function getResults(){
    const q=dom.search.value;
    const state=dom.filter.value;
    return BASE.map(record).filter(r => {
      if(dom.album.value!=='all' && r.source_title!==dom.album.value)return false;
       if(state==='ocr_unverified' && r.status!=='ocr_unverified')return false;
      if(state==='editorial_draft' && !['editorial_draft','image_checked_draft','ocr_reordered_draft','human_reviewed','local_edit'].includes(r.status))return false;
      return match(r,q);
    }).sort((a,b)=>dom.sort.value==='desc'?b.sort_index-a.sort_index:a.sort_index-b.sort_index);
  }
  function highlight(input, query){
    const first=query.trim().split(/[\s|]+/).map(s=>s.replace(/^-/,''))[0];
    if(!first || first.length>45)return esc(input);
    const idx=String(input).toLowerCase().indexOf(first.toLowerCase());
    if(idx<0)return esc(input);
    return `${esc(input.slice(0,idx))}<mark>${esc(input.slice(idx,idx+first.length))}</mark>${esc(input.slice(idx+first.length))}`;
  }
  function statusLabel(r){return r.status==='scan_only'?'原 PDF 扫描页 / Original scan':r.status==='image_only'?'彩绘页 · 题记另页 / Illustration':r.status==='non_text'?'非图说正文 / Front matter':r.status==='colophon_pending'?'题跋待校 / Colophon pending':r.status==='preface_pending'?'序文待校 / Preface awaiting review':r.status==='human_reviewed'?'人工逐列校读 / Human-reviewed':r.status==='local_edit'?'本机校订 / Local edit':r.status==='image_checked_draft'?'AI 图像校读草稿 / AI image-checked draft':r.status==='ocr_reordered_draft'?'OCR 竖排整理稿（待核图） / Ordered OCR draft':r.status==='editorial_draft'?'人工试校 / Editorial draft':'机器待校 / Unverified OCR';}
  function showResults(){
    results=getResults();
    dom.count.textContent=`${results.length} 条 / records`;
    dom.summary.textContent=(dom.search.value.trim()?`关键词 / Query: ${dom.search.value.trim()}`:'跨图册目录 / All albums')+(results.length>250?' · 显示前 250 条 / Showing first 250':'');
    if(!results.length){dom.list.innerHTML='<div class="no-results">没有匹配记录。 / No matching pages.<br>请尝试其他关键词。 / Try another query.</div>';dom.reader.innerHTML='<div class="empty-state">暂无匹配记录。 / No results.</div>';return;}
    if(!results.some(r=>r.id===selected)){selected=results[0].id;mode=results[0].plate_half?'half':'full';}
    dom.list.innerHTML=results.slice(0,250).map(r=>{
      const txt=r.transcription||(r.page_kind==='scan_only'?'原 PDF 扫描已恢复；未进行 OCR / Original scan restored, not transcribed':(['illustration','non_text','colophon','preface'].includes(r.page_kind)?(r.page_kind==='illustration'?'彩绘页；文字题记见相邻扫描页':r.page_kind==='colophon'?'本页含題跋文字，待逐字校讀':r.page_kind==='preface'?'本页为序文，尚待逐字校读':'非正文页，不适用 OCR'):r.ocr_raw))||(r.visual_tags||[]).join(' · ');
      return `<button class="result-item ${r.id===selected?'selected':''}" type="button" data-record="${esc(r.id)}" aria-current="${r.id===selected?'true':'false'}"><span class="result-thumb ${r.plate_half?`half-${r.plate_half}`:''} ${r.spread_layout==='caption_left_artwork_right'?'spread-right':''}"><img src="${esc(r.thumb || r.image)}" alt="${esc(r.source_title)} · 第${r.pdf_page}页 / Page ${r.pdf_page} thumbnail" loading="lazy"></span><span class="result-item-body"><span class="item-top"><strong>${esc(r.title)}</strong><span>${String(r.folio).padStart(2,'0')}/${r.plate_total||r.page_total||40}</span></span><small>${esc(r.source_title)} · PDF 第 ${r.pdf_page} 页 / Page ${r.pdf_page}</small><p>${highlight(txt.slice(0,100),dom.search.value)}</p><span class="dot-status">${statusLabel(r)}</span></span></button>`;
    }).join('');
    dom.list.querySelectorAll('[data-record]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.record)));
    renderReader();
  }
  function select(id){selected=id;mode=BASE.find(r=>r.id===id)?.plate_half?'half':'full';zoom=1;dx=0;dy=0;isEditing=false;history.replaceState(null,'',`#${id}`);showResults();
    if(window.innerWidth<760)byId('reader-panel').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderReader(){
    const r=results.find(x=>x.id===selected);if(!r)return;
    const idx=results.findIndex(x=>x.id===selected);
    const caption=r.transcription || (['illustration','non_text','colophon','preface','scan_only'].includes(r.page_kind)?'':r.ocr_raw) || '';
    const emptyCaption=r.page_kind==='scan_only'?'原 PDF 扫描页已恢复。尚未判断本页是否含文字，不生成 OCR 草稿。 / Original PDF scan restored; no transcription was added.':r.page_kind==='illustration'?`本页是彩绘画页。请查看 PDF 第 ${r.paired_pdf_page} 页的文字题记。 / Illustration: see the paired transcription page.`:r.page_kind==='colophon'?'此页有文字题跋，尚待逐字核读。请直接查看原始扫描。 / Colophon awaiting transcription.':r.page_kind==='preface'?'此页为原册序文，尚待逐字校读。请直接查看原始扫描。 / Preface awaiting visual transcription.':r.page_kind==='non_text'?'本页不是图说正文，不进行强制 OCR。 / No caption transcription is expected for this leaf.':'本页未检出文字，请核对扫描件。 / No text detected; consult the image.';
    const translation=r.translation||'';
    const isOriginal=['editorial_draft','image_checked_draft','ocr_reordered_draft','human_reviewed','local_edit'].includes(r.status);
    dom.reader.innerHTML=`
      <div class="reader-head"><div><div class="record-kicker">${esc(r.source_title)} · PDF 第 ${r.pdf_page} 页 / Page ${r.pdf_page}${r.page_total?' / '+r.page_total:''}${r.picture_pdf_page?' · 配圖第 '+r.picture_pdf_page+' 頁 / Picture p.'+r.picture_pdf_page:''}${r.paired_pdf_page?' · '+(r.page_kind==='caption'?'配图':'对应题记')+' PDF 第 '+r.paired_pdf_page+' 页':''}</div><h3>${esc(r.title)}</h3><p>${esc(r.title_en)} · 扫描页 / Scanned page</p></div><div class="head-actions"><button class="nav-btn" id="prev-record" ${idx===0?'disabled':''} title="上一条 / Previous record">←</button><button class="nav-btn" id="next-record" ${idx===results.length-1?'disabled':''} title="下一条 / Next record">→</button></div></div>
      <div class="status-bar"><span class="status-label ${r.status==='ocr_unverified'?'ocr':''}">${statusLabel(r)}</span><span>文字状态 / Text status: ${statusLabel(r)}</span></div>
      <div class="reader-grid"><div class="scan-pane"><div class="pane-title">原始图像 <small>ORIGINAL SCAN</small></div><div class="image-stage" id="image-stage"><div id="plate-frame" class="plate-frame ${r.plate_half?'side-'+r.plate_half:''} ${r.plate_half&&mode==='half'?'plate-half':''} ${r.spread_layout==='caption_left_artwork_right'?(mode==='caption-half'?'plate-half side-L chenhao-half':mode==='artwork-half'?'plate-half side-R chenhao-half':''):''}"><img id="scan-image" src="${esc(mode==='full'?r.image:r.text_image)}" alt="第 ${r.pdf_page} 页 / Page ${r.pdf_page} ${mode==='paired'?'相关扫描 / paired scan':mode==='full'?'扫描预览 / scan':'题记裁图 / caption crop'}" draggable="false"></div></div><div class="image-toolbar"><div><button type="button" class="${mode==='full'?'active':''}" id="show-full">整页 / Full page</button>${r.spread_layout==='caption_left_artwork_right'?`<button type="button" class="${mode==='caption-half'?'active':''}" id="show-caption-half">题记 / Text</button><button type="button" class="${mode==='artwork-half'?'active':''}" id="show-artwork-half">彩绘 / Painting</button>`:''}${r.plate_half?`<button type="button" class="${mode==='half'?'active':''}" id="show-half">单幅 / Half plate</button>`:''}<button type="button" class="${mode==='crop'?'active':''}" id="show-crop" ${r.text_image && r.text_image!==r.image?'':'disabled title="暂无独立题记裁图 / No caption crop available"'}>题记放大 / Crop</button>${r.paired_image?`<button type="button" id="show-paired" class="${mode==='paired'?'active':''}">${r.page_kind==='caption'?'配套彩绘 / Painting':'对应题记 / Caption'}</button>`:''}</div><div><button id="zoom-out" type="button" aria-label="缩小图像">−</button><span id="zoom-indicator" style="font-size:10px;min-width:28px;text-align:center">1×</span><button id="zoom-in" type="button" aria-label="放大图像">＋</button><a href="${esc(r.image)}" target="_blank" rel="noopener noreferrer">查看原图 / View image ↗</a></div></div><p class="source-note">来源 / Source: ${esc(r.source_title)} · PDF 第 ${r.pdf_page} 页 / Page ${r.pdf_page}。网页仅提供图像预览；引证前请核对原件。 / Web preview only; verify against the original scan before citing.</p></div>
      <div class="text-pane"><div class="pane-title">题记与翻译 <small>PARALLEL READING</small></div><article class="text-card"><div class="text-card-head"><strong>${r.status==='human_reviewed'?'人工逐列校读稿':r.status==='image_checked_draft'?'AI 图像校读草稿':r.status==='ocr_reordered_draft'?'OCR 竖排整理稿（待逐字核图）':isOriginal?'中文试校稿':'机器 OCR 初稿'} <span>${r.status==='human_reviewed'?'Human-reviewed transcription':r.status==='image_checked_draft'?'Image-checked draft':r.status==='ocr_reordered_draft'?'Ordered OCR; not yet image-verified':isOriginal?'Editorial transcription':'Unverified OCR'}</span></strong><span>${statusLabel(r)}</span></div><div class="text-card-body chinese">${caption?highlight(caption,dom.search.value):'<span class="text-placeholder">'+esc(emptyCaption)+'</span>'}</div></article>
      <article class="text-card"><div class="text-card-head"><strong>${r.translation_status==='ai_draft'?'AI 英译草稿':'AI 英译'} <span>English translation</span></strong><span>${translation?'试译 / Draft only':'无译文 / Not available'}</span></div><div class="text-card-body english">${translation?highlight(translation,dom.search.value):'<span class="text-placeholder">本页尚无英文译文；须先核对 OCR，避免错误翻译。 / No English translation yet. OCR must be checked against the scan before translation.</span>'}</div></article>
      <details class="ocr-details"><summary>${r.ocr_raw_scope==='both_halves_merged'?'原始 OCR（左右两幅合并） · Merged-spread OCR ▾':(['illustration','non_text'].includes(r.page_kind)?'机器误检记录（不作为正文） · OCR noise, not source text ▾':'机器 OCR 原文（未校） · Unverified raw OCR ▾')}</summary><p>${esc(r.ocr_raw||(r.page_kind==='scan_only'?'本页未进行 OCR。 / OCR not performed for this page.':'无可用 OCR 文字。 / No OCR text available.'))}</p><small>OCR 可能误字、漏字、错序；不可直接引用。 / OCR may contain errors and scrambled column order; do not cite without verification.</small></details>
      <div class="reader-notice"><strong>版本说明 / Editorial status:</strong> ${esc(r.notes)}<p class="note-en" lang="en">Machine-generated text requires checking against the original image; notes may be available in Chinese only.</p></div></div></div>
      <div class="reader-bottom"><p>画面标签 / Visual tags (provisional): ${esc((r.visual_tags||[]).join(' · ')||'未编目 / Uncatalogued')}</p><a class="quiet-button" href="review.html?id=${encodeURIComponent(r.id)}">逐列 OCR 校读 / Column review ↗</a><button class="quiet-button" id="edit-open" type="button">✎ ${isEditing?'关闭编辑 / Close editor':'校订文字 / Edit text'}</button></div><div id="editor-mount"></div>`;
    byId('prev-record').addEventListener('click',()=>idx>0&&select(results[idx-1].id));
    byId('next-record').addEventListener('click',()=>idx<results.length-1&&select(results[idx+1].id));
    byId('show-full').addEventListener('click',()=>changeMode('full',r));
    if(byId('show-caption-half'))byId('show-caption-half').addEventListener('click',()=>changeMode('caption-half',r));
    if(byId('show-artwork-half'))byId('show-artwork-half').addEventListener('click',()=>changeMode('artwork-half',r));
    if(byId('show-half'))byId('show-half').addEventListener('click',()=>changeMode('half',r));
    byId('show-crop').addEventListener('click',()=>changeMode('crop',r));
    if(byId('show-paired'))byId('show-paired').addEventListener('click',()=>changeMode('paired',r));
    byId('zoom-out').addEventListener('click',()=>setZoom(zoom-0.4));
    byId('zoom-in').addEventListener('click',()=>setZoom(zoom+0.4));
    byId('edit-open').addEventListener('click',()=>{isEditing=!isEditing;renderEditor(r);byId('edit-open').textContent=isEditing?'关闭编辑 / Close editor':'✎ 校订文字 / Edit text';});
    renderEditor(r);
    attachPan();
    applyZoom();
  }
  function changeMode(m,r){mode=m;zoom=1;dx=0;dy=0;byId('scan-image').src=m==='paired'&&r.paired_image?r.paired_image:m==='crop'?r.text_image:r.image;const frame=byId('plate-frame');frame.className='plate-frame'+(r.plate_half?' side-'+r.plate_half:'')+(m==='half'&&r.plate_half?' plate-half':'')+(r.spread_layout==='caption_left_artwork_right'&&(m==='caption-half'||m==='artwork-half')?' plate-half chenhao-half '+(m==='caption-half'?'side-L':'side-R'):'');byId('show-full').classList.toggle('active',m==='full');if(byId('show-half'))byId('show-half').classList.toggle('active',m==='half');if(byId('show-caption-half'))byId('show-caption-half').classList.toggle('active',m==='caption-half');if(byId('show-artwork-half'))byId('show-artwork-half').classList.toggle('active',m==='artwork-half');byId('show-crop').classList.toggle('active',m==='crop');if(byId('show-paired'))byId('show-paired').classList.toggle('active',m==='paired');applyZoom();}
  function setZoom(z){zoom=Math.min(4,Math.max(1,z));if(zoom===1){dx=0;dy=0;}applyZoom();}
  function applyZoom(){const img=byId('scan-image'),stage=byId('image-stage');if(!img)return;img.style.transform=`translate(${dx}px,${dy}px) scale(${zoom})`;stage.classList.toggle('is-zoomed',zoom>1);byId('zoom-indicator').textContent=`${zoom.toFixed(1)}×`;}
  function attachPan(){const el=byId('image-stage');let drag=null;el.addEventListener('pointerdown',e=>{if(zoom<=1)return;drag={x:e.clientX-dx,y:e.clientY-dy};el.setPointerCapture(e.pointerId);el.classList.add('is-dragging');});el.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-drag.x;dy=e.clientY-drag.y;applyZoom();});['pointerup','pointercancel','lostpointercapture'].forEach(evt=>el.addEventListener(evt,()=>{drag=null;el.classList.remove('is-dragging');}));el.addEventListener('dblclick',()=>setZoom(zoom===1?2:1));}
  function renderEditor(r){const mount=byId('editor-mount');if(!mount)return;if(!isEditing){mount.innerHTML='';return;}
    mount.innerHTML=`<form class="editor" id="local-editor"><strong>仅本机保存 / Local corrections</strong><p style="font-size:11px;color:#81786a">本工具不更改原始 OCR，也不会同步 GitHub。请核对原图并导出校订备份。 / Changes are local only. Check against the scan and export a backup.</p><label for="edit-zh">中文校订 / Chinese transcription</label><textarea id="edit-zh">${esc(r.transcription)}</textarea><label for="edit-en">英文翻译 / English translation</label><textarea id="edit-en">${esc(r.translation)}</textarea><label for="edit-notes">校勘说明及疑字 / Editorial notes &amp; uncertainties</label><textarea id="edit-notes">${esc(r.notes)}</textarea><div class="editor-actions"><button type="submit" class="primary-small">保存 / Save locally</button><button type="button" id="edit-cancel" class="quiet-button">取消 / Cancel</button></div></form>`;
    byId('local-editor').addEventListener('submit',e=>{e.preventDefault();edits[r.id]={transcription:byId('edit-zh').value,translation:byId('edit-en').value,notes:byId('edit-notes').value};try{localStorage.setItem(EDIT_KEY,JSON.stringify(edits));}catch(e){alert('浏览器无法保存校订，请导出备份。 / Could not save locally; export your edits.');}isEditing=false;showResults();});
    byId('edit-cancel').addEventListener('click',()=>{isEditing=false;renderEditor(r);byId('edit-open').textContent='✎ 校订文字 / Edit text';});
  }
  function download(name,data,mime){const blob=new Blob([data],{type:mime});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);}
  function csv(s){return '"'+String(s??'').replace(/"/g,'""')+'"';}
  byId('export-button').addEventListener('click',()=>{const columns=['source_title','source_file','folio','pdf_page','page_total','title','status','transcription','translation','ocr_raw','tags','image'];const rows=[columns.map(csv).join(','),...results.map(r=>columns.map(key=>csv(key==='tags'?r.tags.join('; '):r[key])).join(','))];download('miao-albums-search-results.csv','\ufeff'+rows.join('\r\n'),'text/csv;charset=utf-8');});
  byId('download-edits').addEventListener('click',()=>download('miao-albums-local-corrections.json',JSON.stringify({edition:'miao-albums-beta-0.1',exported:new Date().toISOString(),edits},null,2),'application/json'));
  const albums=[...new Set(BASE.map(r=>r.source_title))];
  for (const title of albums) { const option=document.createElement('option'); option.value=title; option.textContent=title; dom.album.appendChild(option); }
  if(byId('total-records')) byId('total-records').textContent=String(BASE.length);
  if(byId('total-ocr')) byId('total-ocr').textContent=String(BASE.filter(r=>Boolean(r.ocr_raw)&&!['illustration','non_text','preface'].includes(r.page_kind)).length);
  if(byId('edited-records')) byId('edited-records').textContent=String(new Set(BASE.filter(r=>['editorial_draft','image_checked_draft','ocr_reordered_draft','human_reviewed'].includes(r.status)).map(r=>(r.source_title==='苗族生活图.40幅.清代彩绘'?'苗族生活图':r.source_title)+'#'+r.pdf_page)).size).padStart(2,'0');
  byId('search-button').addEventListener('click',showResults);
  dom.search.addEventListener('input',showResults);
  dom.filter.addEventListener('change',showResults);
  dom.album.addEventListener('change',showResults);
  dom.sort.addEventListener('change',showResults);
  document.querySelectorAll('.chip').forEach(el=>el.addEventListener('click',()=>{dom.search.value=el.dataset.query;showResults();dom.search.focus();}));
  document.addEventListener('keydown',e=>{const tag=(e.target.tagName||'').toLowerCase();if((e.key==='/'&&!['input','textarea'].includes(tag))){e.preventDefault();dom.search.focus();}if(['input','textarea','select'].includes(tag))return;const idx=results.findIndex(r=>r.id===selected);if(e.key==='ArrowRight'&&idx<results.length-1)select(results[idx+1].id);if(e.key==='ArrowLeft'&&idx>0)select(results[idx-1].id);});
  window.addEventListener('hashchange',()=>{if(BASE.some(r=>'#'+r.id===location.hash)){selected=location.hash.slice(1);showResults();}});
  showResults();
})();

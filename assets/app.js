(() => {
  'use strict';
  const LEGACY = Array.isArray(window.MIAO_RECORDS) ? window.MIAO_RECORDS : [];
  const IMPORTED = Array.isArray(window.MIAO_IMPORTED_RECORDS) ? window.MIAO_IMPORTED_RECORDS : [];
  const BASE = [...LEGACY, ...IMPORTED].map((r, i) => ({...r, source_title:r.source_title || '苗族生活图', sort_index:i}));
  const byId = id => document.getElementById(id);
  const dom = {list:byId('result-list'),reader:byId('reader-content'),search:byId('search-input'),count:byId('result-count'),summary:byId('search-summary'),filter:byId('status-filter'),sort:byId('sort-order'),album:byId('album-filter')};
  let selected = BASE.some(r=>r.id===decodeURIComponent(location.hash.slice(1))) ? decodeURIComponent(location.hash.slice(1)) : (BASE[0]?.id || '');
  let results = [], mode='full', zoom=1, dx=0, dy=0, isEditing=false;
  const EDIT_KEY='miao_albums_edits_v1';
  const readEdits = () => { try {const data=JSON.parse(localStorage.getItem(EDIT_KEY)||'{}');return data&&typeof data==='object'?data:{};}catch(e){return {};} };
  let edits=readEdits();
  const record = obj => ({...obj,...(edits[obj.id]||{}),status:edits[obj.id]?'local_edit':obj.status});
  const esc = s => String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  // A deliberately limited offline conversion map; not a general-purpose OpenCC implementation.
  const PAIRS='織织 錦锦 羅罗 漢汉 屬属 風风 習习 禮礼 婚婚 姻姻 來来 髮发 髻髻 爭争 鬥斗 體体 服服 飾饰 刀刀 弩弩 與与 進进 歲岁 獞獞 祭祭 舞舞 踏踏 採采 會会 買买 賣卖 圖图 內内 處处 降降 較较 類类 籃篮 編编 鐵铁 銅铜 紅红 書书 語语 風风 衣衣 藥药 畫画 著着 農农 絲丝 綢绸 結结 嬰婴 獷犷 悍悍 紡纺 紗纱 綿绵 婦妇 野野 斗斗 藏藏 關关 談谈 飲饮 漁渔 馬马 職职 眾众 對对 製制 照照 華华 兒儿 牽牵 器器 舊旧 變变 各各 言言 歸归 雲云 廣广 州州 黎黎 平平 蠟蜡 染染 盤盘 節节 慶庆 騎骑 牛牛 笙笙 樂乐 嫁嫁 娶娶 窟窟 掃扫 經经 發发 經经 承承 識识 較较 實实 錄录 檔档 誌志 傳传 戰战 證证 講讲 煙烟 槍枪 鋤锄 裝装 盜盗 機机 養养 銀银 頭头 梳梳 佩佩 短短 長长 戴戴 室室 門门 將将 邊边 義义 鄉乡 俗俗 聘聘';
  const conv = {};
  PAIRS.split(/\s+/).forEach(x=>{if([...x].length===2)conv[[...x][0]]=[...x][1];});
  const norm = s => [...String(s??'').normalize('NFKC').toLowerCase()].map(ch=>conv[ch]||ch).join('').replace(/[\s\p{P}\p{S}]+/gu,' ' ).trim();
  const searchable = r => norm([r.source_title,r.source_file,r.title,r.title_en,r.transcription,r.translation,r.ocr_raw,r.notes,...(r.tags||[]),...(r.visual_tags||[])].join(' '));
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
      if(state==='editorial_draft' && !['editorial_draft','local_edit'].includes(r.status))return false;
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
  function statusLabel(r){return r.status==='local_edit'?'本机校订':r.status==='editorial_draft'?'人工试校 / AI 英译':'OCR 待校';}
  function showResults(){
    results=getResults();
    dom.count.textContent=`${results.length} 幅`;
    dom.summary.textContent=(dom.search.value.trim()?`关键词：${dom.search.value.trim()}`:'显示跨图册目录')+(results.length>250?' · 当前显示前 250 条，请缩小检索范围':'');
    if(!results.length){dom.list.innerHTML='<div class="no-results">没有匹配的画幅。<br>可以改用其他字词或清除过滤条件。</div>';dom.reader.innerHTML='<div class="empty-state">暂无匹配记录。</div>';return;}
    if(!results.some(r=>r.id===selected))selected=results[0].id;
    dom.list.innerHTML=results.slice(0,250).map(r=>{
      const txt=r.transcription||r.ocr_raw||r.visual_tags.join(' · ');
      return `<button class="result-item ${r.id===selected?'selected':''}" type="button" data-record="${esc(r.id)}" aria-current="${r.id===selected?'true':'false'}"><img src="${esc(r.thumb || r.image)}" alt="第${r.folio}幅彩绘缩略图" loading="lazy"><span class="result-item-body"><span class="item-top"><strong>${esc(r.title)}</strong><span>${String(r.folio).padStart(2,'0')}/${r.page_total||40}</span></span><small>${esc(r.source_title)} · PDF 第 ${r.pdf_page} 页</small><p>${highlight(txt.slice(0,100),dom.search.value)}</p><span class="dot-status">${statusLabel(r)}</span></span></button>`;
    }).join('');
    dom.list.querySelectorAll('[data-record]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.record)));
    renderReader();
  }
  function select(id){selected=id;mode='full';zoom=1;dx=0;dy=0;isEditing=false;history.replaceState(null,'',`#${id}`);showResults();
    if(window.innerWidth<760)byId('reader-panel').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderReader(){
    const r=results.find(x=>x.id===selected);if(!r)return;
    const idx=results.findIndex(x=>x.id===selected);
    const caption=r.transcription || r.ocr_raw || '';
    const translation=r.translation||'';
    const isOriginal=['editorial_draft','local_edit'].includes(r.status);
    dom.reader.innerHTML=`
      <div class="reader-head"><div><div class="record-kicker">${esc(r.source_title)} · PDF PAGE ${r.pdf_page}${r.page_total?' / '+r.page_total:''}</div><h3>${esc(r.title)}</h3><p>${esc(r.title_en)} · 清代彩绘题记</p></div><div class="head-actions"><button class="nav-btn" id="prev-record" ${idx===0?'disabled':''} title="上一幅">←</button><button class="nav-btn" id="next-record" ${idx===results.length-1?'disabled':''} title="下一幅">→</button></div></div>
      <div class="status-bar"><span class="status-label ${r.status==='ocr_unverified'?'ocr':''}">${statusLabel(r)}</span><span>文字状态：${isOriginal?'有独立校订试稿':'仅保留未经核对的 OCR 输出'}</span></div>
      <div class="reader-grid"><div class="scan-pane"><div class="pane-title">原始图像 <small>ORIGINAL SCAN</small></div><div class="image-stage" id="image-stage"><img id="scan-image" src="${esc(mode==='full'?r.image:r.text_image)}" alt="第 ${r.folio} 幅${mode==='full'?'原始彩绘':'题记局部'}" draggable="false"></div><div class="image-toolbar"><div><button type="button" class="${mode==='full'?'active':''}" id="show-full">整幅画</button><button type="button" class="${mode==='crop'?'active':''}" id="show-crop" ${r.text_image && r.text_image!==r.image?'':'disabled title="本页暂无独立题记裁图"'}>题记放大</button></div><div><button id="zoom-out" type="button" aria-label="缩小图像">−</button><span id="zoom-indicator" style="font-size:10px;min-width:28px;text-align:center">1×</span><button id="zoom-in" type="button" aria-label="放大图像">＋</button><a href="${esc(r.image)}" target="_blank" rel="noopener noreferrer">原图 ↗</a></div></div><p class="source-note">来源：${esc(r.source_title)} · PDF 第 ${r.pdf_page} 页。可放大网页预览图；最终引证请核对原始扫描件。</p></div>
      <div class="text-pane"><div class="pane-title">题记与翻译 <small>PARALLEL READING</small></div><article class="text-card"><div class="text-card-head"><strong>${isOriginal?'中文转录':'机器 OCR 初稿'} <span>${isOriginal?'Chinese transcription':'Unverified OCR'}</span></strong><span>${isOriginal?'人工试校草稿':'未校订'}</span></div><div class="text-card-body chinese">${caption?highlight(caption,dom.search.value):'<span class="text-placeholder">本页未检出文字或 OCR 结果为空，请核对左侧扫描件。</span>'}</div></article>
      <article class="text-card"><div class="text-card-head"><strong>AI 英译 <span>English translation</span></strong><span>${translation?'试译 / 仅供参考':'尚未生成'}</span></div><div class="text-card-body english">${translation?highlight(translation,dom.search.value):'<span class="text-placeholder">本幅尚无英文译文。为避免从错误识别文本生成流畅但不真实的翻译，须先校订中文，再进行英译。</span>'}</div></article>
      <details class="ocr-details"><summary>机器 OCR 原始输出（未经校验） · Raw OCR ▾</summary><p>${esc(r.ocr_raw||'本幅未获得有效的 OCR 文字。')}</p><small>OCR 输出可能漏字、误字、列序错乱；不得直接引用。</small></details>
      <div class="reader-notice"><strong>版本说明：</strong> ${esc(r.notes)}</div></div></div>
      <div class="reader-bottom"><p>画面标签（未考证）：${esc((r.visual_tags||[]).join(' · ')||'未编目')}</p><button class="quiet-button" id="edit-open" type="button">✎ ${isEditing?'关闭编辑':'校订文字'}</button></div><div id="editor-mount"></div>`;
    byId('prev-record').addEventListener('click',()=>idx>0&&select(results[idx-1].id));
    byId('next-record').addEventListener('click',()=>idx<results.length-1&&select(results[idx+1].id));
    byId('show-full').addEventListener('click',()=>changeMode('full',r));
    byId('show-crop').addEventListener('click',()=>changeMode('crop',r));
    byId('zoom-out').addEventListener('click',()=>setZoom(zoom-0.4));
    byId('zoom-in').addEventListener('click',()=>setZoom(zoom+0.4));
    byId('edit-open').addEventListener('click',()=>{isEditing=!isEditing;renderEditor(r);byId('edit-open').textContent=isEditing?'关闭编辑':'✎ 校订文字';});
    renderEditor(r);
    attachPan();
    applyZoom();
  }
  function changeMode(m,r){mode=m;zoom=1;dx=0;dy=0;byId('scan-image').src=m==='full'?r.image:r.text_image;byId('show-full').classList.toggle('active',m==='full');byId('show-crop').classList.toggle('active',m==='crop');applyZoom();}
  function setZoom(z){zoom=Math.min(4,Math.max(1,z));if(zoom===1){dx=0;dy=0;}applyZoom();}
  function applyZoom(){const img=byId('scan-image'),stage=byId('image-stage');if(!img)return;img.style.transform=`translate(${dx}px,${dy}px) scale(${zoom})`;stage.classList.toggle('is-zoomed',zoom>1);byId('zoom-indicator').textContent=`${zoom.toFixed(1)}×`;}
  function attachPan(){const el=byId('image-stage');let drag=null;el.addEventListener('pointerdown',e=>{if(zoom<=1)return;drag={x:e.clientX-dx,y:e.clientY-dy};el.setPointerCapture(e.pointerId);el.classList.add('is-dragging');});el.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-drag.x;dy=e.clientY-drag.y;applyZoom();});['pointerup','pointercancel','lostpointercapture'].forEach(evt=>el.addEventListener(evt,()=>{drag=null;el.classList.remove('is-dragging');}));el.addEventListener('dblclick',()=>setZoom(zoom===1?2:1));}
  function renderEditor(r){const mount=byId('editor-mount');if(!mount)return;if(!isEditing){mount.innerHTML='';return;}
    mount.innerHTML=`<form class="editor" id="local-editor"><strong>仅本机保存 · Local corrections</strong><p style="font-size:11px;color:#81786a">本工具不改动原始 OCR，也不会向 GitHub 提交。请输入经原图核对的文字，并自行导出校订文件。</p><label for="edit-zh">中文校订</label><textarea id="edit-zh">${esc(r.transcription)}</textarea><label for="edit-en">英文翻译</label><textarea id="edit-en">${esc(r.translation)}</textarea><label for="edit-notes">校勘说明及疑字</label><textarea id="edit-notes">${esc(r.notes)}</textarea><div class="editor-actions"><button type="submit" class="primary-small">保存在本机</button><button type="button" id="edit-cancel" class="quiet-button">取消</button></div></form>`;
    byId('local-editor').addEventListener('submit',e=>{e.preventDefault();edits[r.id]={transcription:byId('edit-zh').value,translation:byId('edit-en').value,notes:byId('edit-notes').value};try{localStorage.setItem(EDIT_KEY,JSON.stringify(edits));}catch(e){alert('浏览器无法保存本地校订。请使用导出功能备份。');}isEditing=false;showResults();});
    byId('edit-cancel').addEventListener('click',()=>{isEditing=false;renderEditor(r);byId('edit-open').textContent='✎ 校订文字';});
  }
  function download(name,data,mime){const blob=new Blob([data],{type:mime});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);}
  function csv(s){return '"'+String(s??'').replace(/"/g,'""')+'"';}
  byId('export-button').addEventListener('click',()=>{const columns=['source_title','source_file','folio','pdf_page','page_total','title','status','transcription','translation','ocr_raw','tags','image'];const rows=[columns.map(csv).join(','),...results.map(r=>columns.map(key=>csv(key==='tags'?r.tags.join('; '):r[key])).join(','))];download('miao-albums-search-results.csv','\ufeff'+rows.join('\r\n'),'text/csv;charset=utf-8');});
  byId('download-edits').addEventListener('click',()=>download('miao-albums-local-corrections.json',JSON.stringify({edition:'miao-albums-beta-0.1',exported:new Date().toISOString(),edits},null,2),'application/json'));
  const albums=[...new Set(BASE.map(r=>r.source_title))];
  for (const title of albums) { const option=document.createElement('option'); option.value=title; option.textContent=title; dom.album.appendChild(option); }
  if(byId('total-records')) byId('total-records').textContent=String(BASE.length);
  if(byId('total-ocr')) byId('total-ocr').textContent=String(BASE.filter(r=>Boolean(r.ocr_raw)).length);
  if(byId('edited-records')) byId('edited-records').textContent=String(BASE.filter(r=>r.status==='editorial_draft').length).padStart(2,'0');
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

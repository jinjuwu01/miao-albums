(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const IMPORTED = [...(Array.isArray(window.MIAO_IMPORTED_RECORDS) ? window.MIAO_IMPORTED_RECORDS : []), ...(Array.isArray(window.MIAO_JINGONG_68_DRAFTS) ? window.MIAO_JINGONG_68_DRAFTS : []), ...(Array.isArray(window.MIAO_QIANSHENG_68_DRAFTS) ? window.MIAO_QIANSHENG_68_DRAFTS : [])];
  const PLATES54 = Array.isArray(window.MIAOMAN_54_PLATES) ? window.MIAOMAN_54_PLATES : [];
  const DRAFTS42 = window.MIAOMAN_42_DRAFTS && typeof window.MIAOMAN_42_DRAFTS==='object' ? window.MIAOMAN_42_DRAFTS : {};
  const SINGLE82 = window.MIAOMAN_SINGLE_82_DRAFTS && typeof window.MIAOMAN_SINGLE_82_DRAFTS==='object' ? window.MIAOMAN_SINGLE_82_DRAFTS : {};
  const CHENHAO80 = window.MANMIAO_CHENHAO_80_DRAFTS && typeof window.MANMIAO_CHENHAO_80_DRAFTS==='object' ? window.MANMIAO_CHENHAO_80_DRAFTS : {};
  const GUIZHOU20 = window.GUIZHOU_QUANSHENG_20_DRAFTS && typeof window.GUIZHOU_QUANSHENG_20_DRAFTS==='object' ? window.GUIZHOU_QUANSHENG_20_DRAFTS : {};
  const BASE = [
    ...(Array.isArray(window.MIAO_RECORDS) ? window.MIAO_RECORDS : []),
    ...IMPORTED.flatMap(r=>(r.collection_id==='9e2b3d98dc2e'&&r.pdf_page>=3&&r.pdf_page<=29&&PLATES54.length===54)?PLATES54.filter(p=>p.pdf_page===r.pdf_page):[r])
  ].map(r=>({...r,...(DRAFTS42[r.id]||{}),...(SINGLE82[r.id]||{}),...(CHENHAO80[r.id]||{}),...(GUIZHOU20[r.id]||{}),source_title:r.source_file==='进贡苗蛮图.清.陈枚画.清绘本.pdf'?'進貢苗蠻圖（陳枚畫）':r.source_file==='黔省诸苗全图.上下册.清绘本.pdf'?'黔省諸苗全圖（上下冊）':r.source_title}));
  const DRAFTS = window.MIAO_VISUAL_DRAFTS || {};
  const KEY = "miao_column_reviews_v1";
  const SCHEMA = "miao-column-review-v1";
  const el = {
    page:$("page-select"), image:$("page-image"), board:$("image-board"),
    overlay:$("boxes-overlay"), list:$("columns"), title:$("column-title"),
    form:$("column-editor"), empty:$("empty-editor"),
    crop:$("column-crop"), msg:$("message"), count:$("columns-count"),
    raw:$("raw-ocr"), combined:$("combined-text"), coverage:$("coverage"),
    width:$("ocr-width"), height:$("ocr-height")
  };
  const fields = {
    paddle:$("field-paddle"), alternative:$("field-alternative"),
    reviewed:$("field-reviewed"), notes:$("field-notes"), status:$("field-status")
  };
  let storage = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) storage = parsed;
  } catch (_) { /* use in-memory state */ }
  let selectedRecord = null, pageData = null, activeId = null;
  let localUrl = null, drawing = null, currentImageReady = false, unsaved = false;

  const clamp = (v,lo,hi) => Math.min(hi,Math.max(lo,v));
  const notify = (s, bad=false) => { el.msg.textContent=s; el.msg.style.color=bad?"#a3382a":"#35665c"; };
  const clean = value => String(value ?? "");
  const makeId = () => "col-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,9);
  const currentColumns = () => pageData?.columns || [];
  const activeColumn = () => currentColumns().find(c => c.id===activeId);
  const imageDimensions = () => ({width:el.image.naturalWidth || 0,height:el.image.naturalHeight || 0});
  const copyObject = x => JSON.parse(JSON.stringify(x));

  function save() {
    if (!selectedRecord || !pageData) return;
    pageData.updated_at=new Date().toISOString();
    storage[selectedRecord.id]=copyObject(pageData);
    unsaved=false;
    try {
      localStorage.setItem(KEY,JSON.stringify(storage));
      $("save-state").textContent="已保存于本机 / Saved locally";
    } catch (e) {
      unsaved=true;
      $("save-state").textContent="本机保存失败，请导出 / Export required";
      notify("浏览器空间不足或禁止本地保存；请立即导出 JSON。",true);
    }
  }
  function normalColumn(raw) {
    let box=Array.isArray(raw.box)?raw.box:raw.bbox;
    if (!Array.isArray(box)||box.length!==4) box=[.4,.12,.1,.73];
    box=box.map(Number);
    if (box.some(v=>!Number.isFinite(v))) box=[.4,.12,.1,.73];
    const x=clamp(box[0],0,.999),y=clamp(box[1],0,.999);
    const w=clamp(box[2],.005,1-x),h=clamp(box[3],.005,1-y);
    return {
      id:clean(raw.id)||makeId(),box:[x,y,w,h],
      paddle:clean(raw.paddle ?? raw.ocr ?? raw.candidate_a),
      alternative:clean(raw.alternative ?? raw.candidate_b),
      reviewed:clean(raw.reviewed ?? raw.transcription),
      notes:clean(raw.notes),
      status:["unverified","ai_draft","human_reviewed"].includes(raw.status)?raw.status:"unverified"
    };
  }
  function newPage(record) {
    const s=storage[record.id];
    if (s && Array.isArray(s.columns)) {
      return {...s,record_id:record.id,source_title:record.source_title||"苗族生活图",
        pdf_page:record.pdf_page,columns:s.columns.map(normalColumn)};
    }
    return {schema:SCHEMA,record_id:record.id,
      source_title:record.source_title||"苗族生活图",source_file:record.source_file||null,
      pdf_page:record.pdf_page,updated_at:null,columns:[]};
  }
  function setPage(id) {
    captureFields();
    if (selectedRecord && pageData) save();
    if (localUrl) { URL.revokeObjectURL(localUrl);localUrl=null; }
    selectedRecord=BASE.find(r=>r.id===id)||BASE[0];
    if (!selectedRecord) return;
    el.page.value=selectedRecord.id;
    pageData=newPage(selectedRecord);
    activeId=currentColumns()[0]?.id||null;
    el.raw.textContent=selectedRecord.ocr_raw||"本页没有原始 OCR 文本。";
    $("existing-draft").textContent=DRAFTS[selectedRecord.id]?.transcription||selectedRecord.transcription||"本页尚无已有校读稿。";
    currentImageReady=false;
    el.image.src=selectedRecord.image;
    $("image-resolution").textContent="载入图像中…";
    history.replaceState(null,"","?id="+encodeURIComponent(id));
    render();
    notify("当前： "+(selectedRecord.source_title||"苗族生活图")+" · PDF 第 "+selectedRecord.pdf_page+" 页。");
  }
  function relPointer(e) {
    const r=el.overlay.getBoundingClientRect();
    return [clamp((e.clientX-r.left)/r.width,0,1),clamp((e.clientY-r.top)/r.height,0,1)];
  }
  function drawOverlay() {
    el.overlay.replaceChildren();
    for (let i=0;i<currentColumns().length;i++) {
      const col=currentColumns()[i], b=col.box;
      const box=document.createElement("div");
      box.className="column-box"+(col.id===activeId?" active":"");
      box.style.left=(b[0]*100)+"%";box.style.top=(b[1]*100)+"%";
      box.style.width=(b[2]*100)+"%";box.style.height=(b[3]*100)+"%";
      box.dataset.columnId=col.id;
      const label=document.createElement("span");
      label.textContent="列 "+(i+1);
      box.appendChild(label);
      el.overlay.appendChild(box);
    }
  }
  function drawTemporary(b) {
    let node=el.overlay.querySelector(".draw-box");
    if (!node) {node=document.createElement("div");node.className="draw-box";el.overlay.appendChild(node);}
    node.style.left=(b[0]*100)+"%";node.style.top=(b[1]*100)+"%";
    node.style.width=(b[2]*100)+"%";node.style.height=(b[3]*100)+"%";
  }
  function createColumn(box) {
    captureFields();
    const col=normalColumn({box});
    currentColumns().push(col);
    currentColumns().sort((a,b)=>(b.box[0]+b.box[2]/2)-(a.box[0]+a.box[2]/2));
    activeId=col.id;save();render();
    notify("已增加文字列；请核实裁图范围并填写候选文字。");
  }
  function renderList() {
    el.list.replaceChildren();
    currentColumns().forEach((col,i)=>{
      const button=document.createElement("button");
      button.type="button";
      button.className=col.id===activeId?"active":"";
      button.textContent="列 "+(i+1)+
        (col.status==="human_reviewed"?" ✓":col.status==="ai_draft"?" · AI":" · 待校");
      button.addEventListener("click",()=>selectColumn(col.id));
      el.list.appendChild(button);
    });
    if (!currentColumns().length) {
      const span=document.createElement("span");
      span.className="hint";
      span.textContent="尚未框选文字列 / No columns yet";
      el.list.appendChild(span);
    }
    el.count.textContent=currentColumns().length+" 列 / columns";
  }
  function captureFields() {
    const c=activeColumn();
    if (!c || el.form.hidden) return;
    for (const [key,field] of Object.entries(fields)) c[key]=field.value;
  }
  function selectColumn(id) {
    captureFields();save();
    activeId=id;render();
  }
  function paintCrop() {
    const c=activeColumn(), canvas=el.crop, context=canvas.getContext("2d");
    if (!c || !currentImageReady) {
      canvas.width=1;canvas.height=1;context.clearRect(0,0,1,1);return;
    }
    const iw=el.image.naturalWidth, ih=el.image.naturalHeight, b=c.box;
    const sx=Math.floor(b[0]*iw),sy=Math.floor(b[1]*ih);
    const sw=Math.max(1,Math.min(iw-sx,Math.ceil(b[2]*iw)));
    const sh=Math.max(1,Math.min(ih-sy,Math.ceil(b[3]*ih)));
    const factor=Math.min(1,950/Math.max(sw,sh));
    canvas.width=Math.max(1,Math.round(sw*factor));
    canvas.height=Math.max(1,Math.round(sh*factor));
    context.clearRect(0,0,canvas.width,canvas.height);
    try { context.drawImage(el.image,sx,sy,sw,sh,0,0,canvas.width,canvas.height); }
    catch (e) { notify("裁剪失败，请尝试打开本地高清图片。",true); }
  }
  function fullText() {
    return currentColumns().map(c=>c.reviewed.trim()).filter(Boolean).join("\n");
  }
  function renderSummary() {
    const cols=currentColumns(), verified=cols.filter(c=>c.status==="human_reviewed").length;
    const ai=cols.filter(c=>c.status==="ai_draft").length;
    const entered=cols.filter(c=>c.reviewed.trim()).length;
    el.combined.textContent=fullText()||"尚无逐列校读文字 / No reviewed text yet.";
    el.coverage.textContent="人工核对 "+verified+"/"+cols.length+" 列 · AI 草稿 "+ai+" 列 · 已录入文字 "+entered+" 列";
  }
  function renderEditor() {
    const col=activeColumn();
    el.form.hidden=!col;el.empty.hidden=!!col;
    if (!col) return;
    const i=currentColumns().findIndex(c=>c.id===col.id);
    el.title.textContent="第 "+(i+1)+" 列 / Column "+(i+1);
    for (const [key,field] of Object.entries(fields)) field.value=col[key];
    for (let k=0;k<4;k++) $("box-"+["x","y","w","h"][k]).value=(col.box[k]*100).toFixed(2);
    $("move-left").disabled=i<=0;
    $("move-right").disabled=i===currentColumns().length-1;
    paintCrop();
  }
  function render() {
    drawOverlay();renderList();renderEditor();renderSummary();
  }
  el.overlay.addEventListener("pointerdown",e=>{
    if (!currentImageReady || e.button!==0) return;
    const box=e.target.closest(".column-box");
    if (box) {e.preventDefault();selectColumn(box.dataset.columnId);return;}
    e.preventDefault();
    drawing={start:relPointer(e),current:relPointer(e),pointerId:e.pointerId};
    el.overlay.setPointerCapture(e.pointerId);
  });
  el.overlay.addEventListener("pointermove",e=>{
    if (!drawing || e.pointerId!==drawing.pointerId) return;
    drawing.current=relPointer(e);
    const [x1,y1]=drawing.start,[x2,y2]=drawing.current;
    drawTemporary([Math.min(x1,x2),Math.min(y1,y2),Math.abs(x1-x2),Math.abs(y1-y2)]);
  });
  function finishDraw(e) {
    if (!drawing || e.pointerId!==drawing.pointerId) return;
    const [x1,y1]=drawing.start,[x2,y2]=relPointer(e);
    drawing=null;
    if (Math.abs(x2-x1)>.01 && Math.abs(y2-y1)>.01)
      createColumn([Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1)]);
    else render();
  }
  el.overlay.addEventListener("pointerup",finishDraw);
  el.overlay.addEventListener("pointercancel",()=>{drawing=null;render();});
  el.image.addEventListener("load",()=>{
    currentImageReady=true;
    const s=imageDimensions();
    $("image-resolution").textContent=s.width+" × "+s.height+" px"+(localUrl?" · 本地高清图":" · 网页预览");
    render();
  });
  el.image.addEventListener("error",()=>{currentImageReady=false;notify("这页图像未能加载。",true);});
  $("highres").addEventListener("change",e=>{
    const f=e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {notify("请选择图像文件。",true);return;}
    if (localUrl) URL.revokeObjectURL(localUrl);
    localUrl=URL.createObjectURL(f);
    currentImageReady=false;el.image.src=localUrl;
    notify("已打开本地图像（只在当前页面有效，不上传服务器）。请确认图像与当前 PDF 页一致。");
    e.target.value="";
  });
  $("sort-columns").addEventListener("click",()=>{
    captureFields();
    currentColumns().sort((a,b)=>(b.box[0]+b.box[2]/2)-(a.box[0]+a.box[2]/2));
    save();render();
  });
  $("add-column").addEventListener("click",()=>createColumn([.44,.12,.11,.72]));
  for (let k=0;k<4;k++) {
    const field=$("box-"+["x","y","w","h"][k]);
    field.addEventListener("change",()=>{
      const col=activeColumn();if(!col)return;
      const v=Number(field.value)/100;
      if(!Number.isFinite(v))return;
      const b=col.box.slice();b[k]=v;
      col.box=normalColumn({box:b}).box;
      save();render();
    });
  }
  for (const [key,field] of Object.entries(fields)) {
    field.addEventListener("input",()=>{const c=activeColumn();if (!c)return;c[key]=field.value;save();renderSummary();if(key==="status")renderList();});
    if (key==="status")field.addEventListener("change",()=>{const c=activeColumn();if(!c)return;c.status=field.value;save();renderList();renderSummary();});
  }
  el.form.addEventListener("submit",e=>{e.preventDefault();captureFields();save();render();notify("本列内容已在浏览器中保存。请定期导出 JSON。");});
  function moveColumn(delta) {
    captureFields();const cols=currentColumns(),i=cols.findIndex(c=>c.id===activeId),to=i+delta;
    if (i<0 || to<0 || to>=cols.length) return;
    [cols[i],cols[to]]=[cols[to],cols[i]];
    save();render();
  }
  $("move-left").addEventListener("click",()=>moveColumn(-1));
  $("move-right").addEventListener("click",()=>moveColumn(1));
  $("remove-column").addEventListener("click",()=>{
    const c=activeColumn();if(!c)return;
    if (!confirm("确认删除这一列及其校读文字？请先导出备份。"))return;
    const i=currentColumns().findIndex(x=>x.id===c.id);
    currentColumns().splice(i,1);
    activeId=currentColumns()[Math.min(i,currentColumns().length-1)]?.id||null;
    save();render();
  });
  $("copy-paddle").addEventListener("click",()=>{
    if (!activeColumn())return;
    if (fields.reviewed.value.trim()&&!confirm("用候选 A 覆盖当前校读文字？"))return;
    fields.reviewed.value=fields.paddle.value;
    captureFields();save();renderSummary();
  });
  function download(name,blob) {
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  function jsonDownload(name,data) {
    download(name,new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"}));
  }
  function exportPage() {
    captureFields();save();
    return {...copyObject(pageData),schema:SCHEMA,
      image_dimensions:imageDimensions(),
      raw_ocr_preserved:true,editorial_note:"Draft corrections; no automated verification or publication."};
  }
  $("export-page").addEventListener("click",()=>{
    jsonDownload("miao-review-"+selectedRecord.id+".json",exportPage());
    notify("已导出本页列框、候选及校读文字。原始 OCR 未更改。");
  });
  $("export-all").addEventListener("click",()=>{
    captureFields();save();
    jsonDownload("miao-review-all-pages.json",{schema:SCHEMA,exported_at:new Date().toISOString(),
      pages:storage,raw_ocr_preserved:true});
  });
  $("download-crop").addEventListener("click",()=>{
    if (!activeColumn()||!currentImageReady)return;
    const b=activeColumn().box,iw=el.image.naturalWidth,ih=el.image.naturalHeight;
    const sx=Math.floor(b[0]*iw),sy=Math.floor(b[1]*ih);
    const sw=Math.min(iw-sx,Math.max(1,Math.ceil(b[2]*iw)));
    const sh=Math.min(ih-sy,Math.max(1,Math.ceil(b[3]*ih)));
    const canvas=document.createElement("canvas");
    canvas.width=sw;canvas.height=sh;
    canvas.getContext("2d").drawImage(el.image,sx,sy,sw,sh,0,0,sw,sh);
    try {canvas.toBlob(blob=>{
      if(blob)download("miao-"+selectedRecord.id+"-"+activeId+".png",blob);
      else notify("导出裁图失败。",true);
    },"image/png");}
    catch(e){notify("导出裁图失败；请使用本地高清图片。",true);}
  });
  $("copy-combined").addEventListener("click",async()=>{
    const s=fullText();if(!s){notify("当前没有可复制的校读文字。",true);return;}
    try {await navigator.clipboard.writeText(s);notify("已复制逐列汇总文字。");}
    catch(e){notify("浏览器未授权复制。可选中文字后手动复制。",true);}
  });

  // PaddleOCR PP-OCRv5/6 JSON: rec_texts + rec_boxes or rec_polys; images must align.
  function findRecognition(data,depth=0) {
    if (!data || depth>5)return null;
    if (Array.isArray(data.rec_texts) && (Array.isArray(data.rec_boxes)||Array.isArray(data.rec_polys)))
      return data;
    if (Array.isArray(data)) {
      for(const v of data){const r=findRecognition(v,depth+1);if(r)return r;}
    } else if(typeof data==="object") {
      for(const key of ["res","result","ocr_result","ocr_res","data","results","page_result"]) {
        if(data[key]){const r=findRecognition(data[key],depth+1);if(r)return r;}
      }
    }
    return null;
  }
  function boundingBox(input) {
    if (!Array.isArray(input))return null;
    if (input.length===4&&input.every(Number.isFinite)) {
      const [x1,y1,x2,y2]=input;return [Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2)];
    }
    if (input.length>=3&&input.every(p=>Array.isArray(p)&&p.length>=2)) {
      const xs=input.map(p=>Number(p[0])),ys=input.map(p=>Number(p[1]));
      if (xs.concat(ys).every(Number.isFinite))
        return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
    }
    return null;
  }
  function importPaddle(parsed) {
    const r=findRecognition(parsed);
    if (!r)throw new Error("JSON 内未找到 rec_texts 与 rec_boxes/rec_polys。");
    const boxes=r.rec_boxes||r.rec_polys;
    const pieces=r.rec_texts.map((txt,i)=>({text:clean(txt),box:boundingBox(boxes[i])}))
      .filter(p=>p.box&&p.text.trim());
    if(!pieces.length)throw new Error("没有可识别的文本与坐标。");
    const shape=r.image_shape||r.input_img_shape||r.img_shape||parsed.image_shape||parsed.input_img_shape||[];
    const iw=Number(el.width.value)||Number(r.image_width||r.width||parsed.image_width||parsed.width)||
      (Array.isArray(shape)?Number(shape[1]):0)||el.image.naturalWidth;
    const ih=Number(el.height.value)||Number(r.image_height||r.height||parsed.image_height||parsed.height)||
      (Array.isArray(shape)?Number(shape[0]):0)||el.image.naturalHeight;
    if(!(iw>0 && ih>0))throw new Error("无法确定 OCR 原图尺寸；请填写宽高像素。");
    if(pieces.some(p=>p.box[0]<0||p.box[1]<0||p.box[2]>iw*1.02||p.box[3]>ih*1.02))
      throw new Error("OCR 坐标超出图像尺寸。请填写 OCR 原图的真实宽高。");
    const normalized=pieces.map(p=>({text:p.text,
      x:(p.box[0]+p.box[2])/2/iw,
      y:(p.box[1]+p.box[3])/2/ih,
      box:[p.box[0]/iw,p.box[1]/ih,(p.box[2]-p.box[0])/iw,(p.box[3]-p.box[1])/ih]}));
    const widths=normalized.map(p=>p.box[2]).sort((a,b)=>a-b);
    const med=widths[Math.floor(widths.length/2)]||.015;
    const threshold=clamp(med*1.2,.012,.055);
    const groups=[];
    for (const part of [...normalized].sort((a,b)=>b.x-a.x)) {
      let best=null,distance=Infinity;
      for(const group of groups) {
        const delta=Math.abs(group.center-part.x);
        if(delta<distance&&delta<threshold){best=group;distance=delta;}
      }
      if(!best){best={center:part.x,segments:[]};groups.push(best);}
      best.segments.push(part);
      best.center=best.segments.reduce((s,p)=>s+p.x,0)/best.segments.length;
    }
    const columns=groups.map(g=>{
      const arr=g.segments.sort((a,b)=>a.y-b.y);
      const minx=Math.min(...arr.map(p=>p.box[0])),miny=Math.min(...arr.map(p=>p.box[1]));
      const maxx=Math.max(...arr.map(p=>p.box[0]+p.box[2]));
      const maxy=Math.max(...arr.map(p=>p.box[1]+p.box[3]));
      const paddingX=.003,paddingY=.003;
      return normalColumn({box:[clamp(minx-paddingX,0,1),clamp(miny-paddingY,0,1),
        Math.min(1-minx+paddingX,maxx-minx+2*paddingX),
        Math.min(1-miny+paddingY,maxy-miny+2*paddingY)],
        paddle:arr.map(p=>p.text).join("")});
    }).sort((a,b)=>(b.box[0]+b.box[2]/2)-(a.box[0]+a.box[2]/2));
    if (!columns.length)throw new Error("未能分组任何文字列。");
    if(currentColumns().length && !confirm("导入将替换当前页的全部列框和校读结果。已导出备份吗？"))
      return;
    pageData.columns=columns;
    activeId=columns[0].id;save();render();
    notify("已导入 "+pieces.length+" 个 OCR 文本框，初步聚为 "+columns.length+" 列。请逐列检查框选与阅读顺序；自动分组不代表识别正确。");
  }
  function importReview(parsed) {
    let review=parsed;
    if(parsed.pages && typeof parsed.pages==="object") {
      review=parsed.pages[selectedRecord.id];
      if(!review)throw new Error("备份文件中没有当前页 "+selectedRecord.id+" 的校读记录。");
    }
    if(!Array.isArray(review.columns))throw new Error("未找到 columns 数组。");
    if(review.record_id && review.record_id!==selectedRecord.id)
      throw new Error("该校读文件属于 "+review.record_id+"，当前是 "+selectedRecord.id+"，请先切换页面。");
    if(currentColumns().length && !confirm("用导入的版本替换当前页的全部列框和校读结果？"))
      return;
    pageData={...newPage(selectedRecord),columns:review.columns.map(normalColumn)};
    activeId=currentColumns()[0]?.id||null;
    save();render();
    notify("已导入 "+currentColumns().length+" 列校读记录；请按原图复查。");
  }
  $("import-json").addEventListener("change",async e=>{
    const f=e.target.files?.[0];if(!f)return;
    try {
      const parsed=JSON.parse(await f.text());
      if(parsed.schema===SCHEMA || Array.isArray(parsed.columns) || parsed.pages)importReview(parsed);
      else importPaddle(parsed);
    }catch(err){notify("导入失败："+err.message,true);}
    finally{e.target.value="";}
  });

  for(const record of BASE) {
    const o=document.createElement("option");o.value=record.id;
    o.textContent=(record.source_title||"苗族生活图")+" · PDF "+record.pdf_page+" · "+record.title;
    el.page.appendChild(o);
  }
  el.page.addEventListener("change",()=>setPage(el.page.value));
  const requested=new URLSearchParams(location.search).get("id");
  setPage(BASE.some(r=>r.id===requested)?requested:BASE[0]?.id);
  window.addEventListener("beforeunload",e=>{
    if(unsaved){e.preventDefault();e.returnValue="校读内容未能写入本地存储，请先导出备份。";}
  });
})();

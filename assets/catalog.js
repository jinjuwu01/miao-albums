(() => {
  "use strict";
  const db = window.MIAO_MANUSCRIPT_CATALOG;
  const root = document.getElementById("catalog-grid");
  if (!db || !root) return;
  const works = new Map(db.works.map(w => [w.id, w]));
  const search = document.getElementById("catalog-search");
  const access = document.getElementById("catalog-access");
  const region = document.getElementById("catalog-region");
  const count = document.getElementById("catalog-count");
  const details = document.getElementById("catalog-detail");
  const total = document.getElementById("catalog-total");
  const digital = document.getElementById("catalog-digitized");
  total.textContent = db.copies.length;
  digital.textContent = db.copies.filter(x => x.access === "digitized").length;

  const badge = {
    digitized:["線上影像 / Online facsimile", "digital"],
    review:["影像或書目待核 / Verification needed", "review"],
    catalog:["書目線索 / Catalogue lead", "catalog"]
  };
  const relation = {
    "new-copy":"獨立待錄館藏 / Distinct holding",
    "related-unverified":"與既有傳本關係待核 / Recension uncollated",
    "possible-duplicate":"可能重複，先校版本 / Possible duplicate"
  };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const validURL = u => { try {const v = new URL(u);return ["https:","http:"].includes(v.protocol) ? v.href : "#";} catch {return "#";} };
  const labels = a => badge[a] || badge.catalog;

  function visible() {
    const q = search.value.trim().toLocaleLowerCase();
    const choices = db.copies.filter(x =>
      (access.value === "all" || access.value === x.access)
      && (region.value === "all" || region.value === x.region)
      && (!q || [x.title,x.title_en,x.institution,x.institution_en,x.shelfmark,works.get(x.work_id)?.title, x.note].join(" ").toLocaleLowerCase().includes(q))
    ).sort((a,b) => a.priority-b.priority || a.title.localeCompare(b.title,"zh-Hant"));
    count.textContent = choices.length + " 種館藏版本 / copies";
    root.innerHTML = choices.map(x => `
      <article class="copy-card${location.hash === "#"+x.id ? " active" : ""}" id="card-${esc(x.id)}">
        <div class="copy-overline"><span class="copy-access ${labels(x.access)[1]}">${labels(x.access)[0]}</span><span class="copy-id">${esc(x.shelfmark)}</span></div>
        <h3>${esc(x.title)}</h3><p class="copy-title-en" lang="en">${esc(x.title_en)}</p>
        <p class="copy-institution">${esc(x.institution)} <span lang="en">/ ${esc(x.institution_en)}</span></p>
        <p class="copy-meta">${esc(relation[x.relation] || "")}</p>
        <button type="button" class="copy-open" data-copy="${esc(x.id)}">查看馆藏详情 / View copy <span aria-hidden="true">↗</span></button>
      </article>`).join("");
    root.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", () => show(button.dataset.copy)));
  }
  function links(x) {
    const extra = (x.additional_links || []).map(item => `<a href="${esc(validURL(item.url))}" target="_blank" rel="noopener noreferrer">${esc(item.label)} ↗</a>`).join("");
    const more = x.catalog_url ? `<a href="${esc(validURL(x.catalog_url))}" target="_blank" rel="noopener noreferrer">馆藏书目 / Catalogue ↗</a>` : "";
    return `<div class="source-links"><a href="${esc(validURL(x.url))}" target="_blank" rel="noopener noreferrer">打开馆方或影像来源 / Open source ↗</a>${more}${extra}</div>`;
  }
  function show(id) {
    const x = db.copies.find(c => c.id === id); if (!x) return;
    const w = works.get(x.work_id) || {};
    location.hash = x.id;
    details.hidden = false;
    details.innerHTML = `
      <div class="detail-top"><span class="copy-access ${labels(x.access)[1]}">${labels(x.access)[0]}</span><button id="close-copy" type="button">关闭 / Close ×</button></div>
      <p class="detail-eyebrow">MANUSCRIPT COPY / 館藏版本 · ${esc(x.shelfmark)}</p>
      <h2>${esc(x.title)}</h2><p class="detail-en" lang="en">${esc(x.title_en)}</p>
      <div class="detail-meta"><div><small>藏所 / Institution</small><strong>${esc(x.institution)}</strong><span>${esc(x.institution_en)}</span></div>
      <div><small>作品或傳本系統 / Work or family</small><strong>${esc(w.title)}</strong><span>${esc(w.title_en)}</span></div></div>
      <p class="detail-note">${esc(x.note)}</p><p class="detail-translation" lang="en">${esc(x.note_en)}</p>
      ${links(x)}
      <div class="source-citation"><strong>來源與版本標識 / Citation & provenance</strong><p>${esc(x.source)} · ${esc(x.shelfmark)} · Copy ID: <code>${esc(x.id)}</code></p><p>本站新收錄的是<strong>館藏版本目錄</strong>，不是已完成的逐頁 OCR；本條尚未匯入任何新的 OCR 文字或高清頁面。<span lang="en">Catalogue metadata only; no page-level transcription or locally hosted scan has been imported for this copy.</span></p></div>
      ${x.manifest ? `<div class="iiif-area"><button id="load-iiif" type="button" class="iiif-button">展開館方 IIIF 逐頁影像 / Browse IIIF leaves</button><p class="iiif-terms">遠端影像來自原館，可能受使用條款限制。圖像僅供瀏覽，請勿直接當作校訂文字。<span lang="en">Remotely served imagery; check institutional terms before reuse.</span></p><div id="iiif-results" aria-live="polite"></div></div>` : ""}
      `;
    details.querySelector("#close-copy").addEventListener("click", () => { details.hidden = true; history.replaceState(null,"",location.pathname+location.search); document.querySelectorAll(".copy-card").forEach(e=>e.classList.remove("active")); });
    const loadButton = details.querySelector("#load-iiif");
    if (loadButton) loadButton.addEventListener("click", () => loadIIIF(x));
    root.querySelectorAll(".copy-card").forEach(e=>e.classList.toggle("active",e.id==="card-"+id));
    details.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function getImg(canvas) {
    const r = canvas?.images?.[0]?.resource || canvas?.items?.[0]?.items?.[0]?.body || {};
    const service = Array.isArray(r.service) ? r.service[0] : r.service;
    const base = service?.["@id"] || service?.id;
    const img = base ? base.replace(/\/$/,"") + "/full/360,/0/default.jpg" : (r["@id"] || r.id);
    return img && /^https:\/\//.test(img) ? img : "";
  }
  async function loadIIIF(x) {
    const button = details.querySelector("#load-iiif"), stage = details.querySelector("#iiif-results");
    button.disabled = true; button.textContent = "正在讀取館方 IIIF / Loading IIIF…";
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      let response;
      try { response = await fetch(x.manifest, {signal:ctrl.signal, mode:"cors"}); }
      finally { clearTimeout(timer); }
      if (!response.ok) throw new Error("HTTP " + response.status);
      const manifest = await response.json();
      const canvases = manifest.sequences?.[0]?.canvases || manifest.items || [];
      if (!canvases.length) throw new Error("Manifest has no canvases");
      let offset = 0;
      function draw() {
        const end = Math.min(offset+24,canvases.length);
        const cards = canvases.slice(offset,end).map((c,i) => {
          const img = getImg(c);
          const label = typeof c.label === "string" ? c.label : (c.label?.en?.[0] || c.label?.none?.[0] || "");
          const href = img ? img.replace("/full/360,/0/default.jpg", "/full/1600,/0/default.jpg") : x.url;
          return `<a class="leaf-tile" href="${esc(validURL(href))}" target="_blank" rel="noopener noreferrer">
            ${img ? `<img loading="lazy" src="${esc(img)}" alt="${esc("Scan " + (offset+i+1))}">` : '<span class="leaf-no-image">IIIF</span>'}
            <span>${esc(label || "第 "+(offset+i+1)+" 頁 / Leaf "+(offset+i+1))}</span></a>`;
        }).join("");
        stage.innerHTML = `<p class="leaf-status">館方清單 ${canvases.length} 頁 / ${canvases.length} canvases · ${offset+1}–${end}</p>
          <div class="leaf-grid">${cards}</div><div class="leaf-controls">
          <button id="iiif-prev" type="button" ${offset===0?"disabled":""}>← 上一組 / Previous</button>
          <button id="iiif-next" type="button" ${end>=canvases.length?"disabled":""}>下一組 / Next →</button>
          </div><p class="leaf-disclaimer">葉序依據原館 IIIF；這些畫面尚未經過本站圖文分割和 OCR 核對。</p>`;
        stage.querySelector("#iiif-prev").addEventListener("click",()=>{offset-=24;draw();});
        stage.querySelector("#iiif-next").addEventListener("click",()=>{offset+=24;draw();});
      }
      draw();
      button.textContent = "重新讀取 IIIF / Reload";
      button.disabled = false;
    } catch(e) {
      button.disabled = false; button.textContent = "重試 IIIF / Retry";
      stage.innerHTML = `<p class="iiif-error">目前無法在本站直接讀取館方的 IIIF（可能是網路或跨站限制）。請使用上方「打開館方」連結瀏覽原件。<span lang="en">Remote IIIF loading is unavailable here; use the source link above.</span></p>`;
    }
  }
  [search,access,region].forEach(e=>e.addEventListener(e===search?"input":"change",visible));
  visible();
  const initial = decodeURIComponent(location.hash.slice(1));
  if (initial && db.copies.some(c=>c.id===initial)) show(initial);
})();

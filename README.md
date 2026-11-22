# 苗图数字档案 · Miao Albums Digital Archive


## 俄藏《百苗圖》與曼徹斯特《貴州全省捌拾貳種苗圖》頁面索引（2026-11-22）

**目前已完成的部分**：原網站首頁及 [逐列 OCR 復核](review.html) 直接接入兩套館藏的原始掃描索引：

- [俄藏上冊，Ф.274 №54.1](https://jinjuwu01.github.io/miao-albums/index.html#rsl-f274-v1-p010)：Wikimedia Commons 原始 PDF 共 47 掃描頁，本站按其原始頁序列出。
- [俄藏下冊，Ф.274 №54.2](https://jinjuwu01.github.io/miao-albums/index.html#rsl-f274-v2-p004)：原始 PDF 共 46 掃描頁；不與上冊或其他同名傳本合併。
- [曼徹斯特 Chinese Crawford 398](https://jinjuwu01.github.io/miao-albums/index.html#manchester-c398-p009)：官方 IIIF **202 canvases**（卷一 1–102、卷二 103–202）。**其中 186 張為兩冊的葉片影像序列（上冊 94、下冊 92）；另有 16 張封面、封底、書口或其他裝幀照片**。此數字是影像序列，**不是** 186 幅已校正畫作的主張。
- 合計新增 **295 條可逐頁瀏覽的原始掃描記錄**。每條有穩定 ID、`copy_id`、`work_id`、原館藏號、原頁碼、遠端影像與來源連結。俄藏 PDF 的 Commons 頁面縮圖有可能受遠端轉碼／載入限制；若無法顯示，可在詳細頁使用原件 PDF 來源連結，切勿用其他版本畫作替代。
- 已逐張核圖：俄藏上冊 PDF 第 1–4 頁為書衣、封面或襯頁；第 5–18 頁共 14 幅為左圖、右側題記的對開圖說。俄藏下冊第 1–3 頁屬非正文，第 4–10 頁共 7 幅為左彩繪、右題記。上述 21 幅均分離了原圖與題記裁圖。曼徹斯特 Canvas 2–5 為空白襯頁、6–7 為總序，Canvas 8/10/12 為無字彩繪，Canvas 9/11 為對應正文；其餘未核圖葉片仍標記 `scan_only`。
- **文字狀態：共 22 條中文 AI 圖像視讀／英文試譯草稿，其中 15 條為本輪新增；10 條只完成可辨認的部分節選。人工正式核校定稿仍為 0。** 已有資料包含俄藏上冊第 5–17 頁中多個圖說、下冊第 4/5/6/8/10 頁，以及曼徹斯特 Canvas 6/7/9/11。未完成的文字不視作已譯全文。Tesseract 機器 OCR 對手寫書法產生嚴重亂碼，測試結果獨立保存，沒有直接寫入正文。索引：[data/rsl_manchester_scans.js](data/rsl_manchester_scans.js)；中英試讀：[data/rsl_manchester_ocr_drafts.js](data/rsl_manchester_ocr_drafts.js)。

### 中文 OCR／英譯的下一個可執行工作流

為避免先前出現的「彩繪頁被硬 OCR」和「文字被錯誤合併」的情況，新增了 [scripts/process_external_albums.py](scripts/process_external_albums.py)。腳本需要在**有網路、能下載原館掃描**的電腦上執行。Python 程式可先只下載指定掃描頁，再使用使用者自己的 OpenAI API 金鑰產生明確標記為 **AI 未校稿** 的 OCR／英譯候選。模型不會把它們自動宣告為人工校訂完成。

```bash
python3 -m pip install requests pymupdf pillow openai

# 先只下載兩套原件各 3 頁作圖文結構測試
python3 scripts/process_external_albums.py --source rsl-v1 --mode download --pages 2-4
python3 scripts/process_external_albums.py --source manchester --mode download --pages 2-4

# 有 API_KEY 後再小範圍視讀、試譯（會產生 API 費用）
export OPENAI_API_KEY="在本機環境安全設置，不要提交至 GitHub"
python3 scripts/process_external_albums.py --source rsl-v1 --mode ocr --pages 2-4 --translate
python3 scripts/process_external_albums.py --source manchester --mode ocr --pages 2-4 --translate

# 確認草稿後彙集所有來源；先 dry-run 再寫入，不能覆寫人工作品
python3 scripts/process_external_albums.py --source all --mode publish --dry-run
python3 scripts/process_external_albums.py --source all --mode publish
```

草稿輸出在被 `.gitignore` 排除的 `work/external_albums/`，尚未經人工目視核對之前請勿以正式轉錄引用。正式試讀稿層是獨立的 `data/rsl_manchester_ocr_drafts.js`（已有 22 條 AI 試讀草稿，尚未人工校訂）。**此批腳本已加入代碼倉庫，但未在此工作環境實際執行下載或 OpenAI OCR。** 下一步必須驗證逐頁影像可用性，確認圖文是否對開、記錄題記的實際版面，然後逐幅校讀轉錄、譯文、疑字與不同傳本差異。

---

## 新增：館藏版本與作品層級目錄（2026-11-22）

- 公開頁面：[館藏版本 / Manuscript Copies](https://jinjuwu01.github.io/miao-albums/collections.html)，與原本 [OCR 檢索](https://jinjuwu01.github.io/miao-albums/index.html#explore) 分開。
- `data/manuscript_catalog.js` 以兩層結構著錄：`works[]` 是作品或暫定傳本系統；`copies[]` 是具體館藏版本（藏所、書號、來源 URL、狀態、是否疑似同本）。相同圖冊標題**不等於**同一本手稿，也不在未經逐幅校勘之前強制合併。
- 目前 11 條新增館藏線索，其中 5 條有可直接開啟的數位掃描來源（Library of Congress、Manchester、Wellcome 103、Russian State Library 兩冊、Waseda）。部分館藏雖有數位物件 URL，但尚未能核實完整圖片與權利，標記為 `review`；尚無完整影像者標記為 `catalog`。
- Manchester Chinese Crawford 398：已核實官方 [IIIF v2 Manifest](https://www.digitalcollections.manchester.ac.uk/iiif/PR-CHCR-00398)。在館藏詳細頁按「展開 IIIF 逐頁影像」，瀏覽器會在使用者點擊後載入遠端清單，按每 24 頁展示縮圖；若館方限制跨來源請直接在原站查看。遠端縮圖的授權依曼徹斯特館方規定（IIIF 註明圖片與可下載材料的權利不同）。
- 「Wellcome MS Chinese 103」館方目前標為 `Wellcome Chinese Collection 103`，沒有確認「雲南營制苗蠻圖冊」的正式館藏題名；後者是第三方識別，暫不能以此代替館藏書目。
- 俄罗斯国家图书馆《百苗圖》是**拟题**，以書號 Ф.274 №54.1–54.2 作為版本鍵；掃描分別在 Commons 上下冊。早稻田《苗族習俗圖説》與已有陳浩相關圖冊疑似相關，須先對勘去重。
- **初期的館藏目錄只收錄書目線索；此後獨立新增了兩套館藏的掃描索引與 22 條註記校勘狀態的中文試讀／英譯草稿。** 原有人工校勘資料沒有被覆寫，首頁的頁面和 OCR 統計由現有記錄動態產生。

### 下一步匯入規則 / Rules for importing scanned leaves

1. 為實際取得的每幅掃描建立 `copy_id` + `scan_index`，保存原館 IIIF canvas/原始 PDF 頁號和圖文位置；同一物理頁不得多次匯入。
2. 題記、彩繪、封面、空白與文書附錄分別標明 `page_kind`；無字畫幅不進 OCR。僅有書目或猜測頁數，不得發表為完整圖冊已處理。
3. 保存作品家族關聯（`work_id`），但未核定同本之前禁止刪除或合併不同館藏的頁面。比對至少核對圖序、族稱、題記異文和頁幅。
4. 下載、轉碼和轉載影像前逐一確認圖像來源的授權條款；有的館藏只允許引用或在原站瀏覽。
5. 對 OCR 草稿、AI 圖像視讀、逐列人工複核、英文翻譯各記獨立狀態；不得以新書目條目增加首頁 OCR 記錄數。

---


## Wellcome Collection 99 · 無題《百苗圖》系列本（2026-11-22）

- 原件：[Wellcome Collection, MS Chinese 99](https://wellcomecollection.org/works/f8b2bkkd)，公版標記 Public Domain Mark。「百苗圖」是本站的系列工作名稱，不代表原件書名。
- 已核查使用者上傳的 **52 張 3000px 掃描**：其中 **29 頁為左側竪排題記、右側彩繪的對開圖文頁**；其餘 23 張是封面、空白、襯頁或色卡等非正文頁。全套頁面保留，不刪除或合併非正文影像。
- [圖冊獨立數據檔](data/wellcome_ms99_scans.js)：52 條原始掃描記錄；29 幅圖文頁可單獨放大題記或顯示彩繪。網站圖像通過 Wellcome IIIF 遠程展示；未把高清 JPG 全部存入 GitHub。
- [AI 高解析度視讀及英譯草稿](data/wellcome_ms99_ocr_drafts.js)：**29 個圖文對開頁均有中文 AI 視讀及英文試譯**，但這不是人工校勘完成版。其中第 33 掃描頁已經透過重新放大原始圖像，補完行政沿革初稿，並與《皇清職貢圖》卷八平行記載比對題名為『𦍕獷苗』；全冊仍有疑字與校勘說明，並非人工校訂定本。不可把機器初讀誤稱為已校訂文本。
- [API OCR 候選層](data/wellcome_ms99_api_ocr_candidates.js)：與上述 AI 圖像視讀的文字分開存儲。API 工作流不會覆寫已視讀的 29 份草稿。
- [第 47 掃描頁](https://jinjuwu01.github.io/miao-albums/index.html#wellcome-ms99-p0047) 六種歷史族稱已依原圖重新補全為『狄𦍕狑狪猺獞』（首字異體待核）；先前四字試讀作廢。比較《皇清職貢圖》卷八之『𤝎𦍕狑狪猺獞』，不以異本抄本代替本頁。
- 新增關鍵物產記錄：[第 15 掃描頁（紅苗）](https://jinjuwu01.github.io/miao-albums/index.html#wellcome-ms99-p0015) 記『土產硃砂、黑芝麻、水銀』；[第 33 掃描頁（題名待核）](https://jinjuwu01.github.io/miao-albums/index.html#wellcome-ms99-p0033) 記『石阡產硃砂、水銀』。後者已完成一輪全文視讀，但仍非人工校訂定本，引用前須看原圖。
- 最重要的個別條目之一：[第 36 掃描頁（猺苗）](https://jinjuwu01.github.io/miao-albums/index.html#wellcome-ms99-p0036)，末尾記錄『土產硃砂、雄磺』；仍須以原圖及相關版本複核。
- [逐列 OCR 復核工具](review.html) 可以選擇 Wellcome 原頁；非文字掃描不需要 OCR。

本機下載全冊原始圖片：

```bash
python3 -m pip install requests openai
python3 scripts/process_wellcome_ms99.py --mode download --pages 1-52 --width 3000
```

如需利用 OpenAI API 產生新的 OCR+英譯候選（按 API 使用量計費），先在本機安全設置 `OPENAI_API_KEY`，再小規模測試：

```bash
python3 scripts/process_wellcome_ms99.py --mode ocr --pages 5-6 --publish
```

這條命令把獨立 OCR 候選保存至 `data/wellcome_ms99_api_ocr_candidates.js`，不覆寫 `data/wellcome_ms99_ocr_drafts.js`，也不會自動提交 GitHub。上站前請人工檢查原文分列、古字、版面和英譯。現有 29 頁草稿均未進行獨立學者核校。

---

清代《苗族生活图》研究用试验性数据库。**这不是已完成的学术校勘版。**


## 逐列 OCR 复核（2026-11）

访问 **[逐列 OCR 复核](https://jinjuwu01.github.io/miao-albums/review.html)**，或从数据库首页导航栏、单页详情中的「逐列 OCR 校读」进入。

这个工具在 GitHub Pages 浏览器端运行，不会连接云端 OCR API，也不会把你的本地高清图上传到网站服务器。它用于**核对 OCR，不是自动生成准确转录**。

### 逐页复核操作

1. 在下拉框中选择与手头原始图片一致的来源及 PDF 页码。数据库原有 40 幅记录和 PaddleOCR 批量导入记录是两套 ID；**尽量选最后要发布的那条记录**，不要混淆重叠页面。
2. 网站会显示原页预览。推荐点击「打开本地高清页图」，选择 PDF 导出的同一整页高清 PNG/JPEG。**如果高清图的裁剪范围与网站整页图不同，之前绘制的框可能会错位**。
3. 直接在画面上拖出文字列框（建议一列一框）；也可点击「导入 OCR / 校读 JSON」读取原来的 `page_0005.json` 等 PaddleOCR JSON。支持 `rec_texts` 配合 `rec_boxes` 或 `rec_polys`。**自动归列只是候选**，需要检查是否漏列、跨列、排序颠倒，尤其在多段混排页面。
4. 对每列分别记录 PaddleOCR 文本（候选 A）、第二识别模型文本（候选 B，可手动粘贴）、逐字核对文本及校勘说明。无法确定的字建议用 `□` 标识。坐标 X/Y/W/H 可以手动调整；使用「从右至左排序」，然后核实实际列序。
5. 状态按实际情况从「机器待校」→「AI 辅助草稿」→「人工已核对」更新。**AI 辅助草稿不得标为人工核对。** 自动保存只在当前浏览器中生效。
6. 点击「导出本页 JSON」或者「备份全部页」，妥善保管导出结果。删除浏览器站点数据、换电脑或开启无痕模式可能丢失本地修改。导入可能替换当前页已有列数据，事先备份。

### 批量识别结果准备

- 原始批量 OCR 文件保存在你本地的 `~/miao-ocr/results_batch/`，不需要上传到 GitHub。
- 若 OCR JSON 里的文本框坐标基于另一种图像分辨率，先在复核页面输入**当时 OCR 所用图片的宽、高（像素）**，再导入。工具不保证自动推断坐标尺寸。
- `rec_boxes`/`rec_polys` 一般是 OCR 检测框，而不是严格的「一列」坐标；浏览器用横向聚类进行初分组，应该人工修正漏列、重复列或错归类。
- 第二模型须另行运行；复核页面**不调用第二个 OCR 模型**，只提供逐列对照录入和比较。

### 把人工校核结果同步到网站

只有全部列标为 `human_reviewed` 且校读文本非空的页面，才能通过发布脚本导入正式文字栏：

```bash
cd ~/miao-albums
python3 scripts/publish_column_reviews.py ~/Downloads/miao-review-miao-001.json --dry-run
python3 scripts/publish_column_reviews.py ~/Downloads/miao-review-miao-001.json
```

若用的是所有页面的备份文件，可将路径换成 `~/Downloads/miao-review-all-pages.json`。已发布过的同一记录需要明确传入 `--replace` 才会更新。

脚本仅修改 `data/column_reviews.js`，不会覆盖原始 OCR、原始记录文件或 AI 草稿。完成后通过 GitHub Desktop 将 `data/column_reviews.js` 提交并推送。网站通过该文件优先显示已人工逐列校读的转录。如果仅有几列完成，暂时保留在复核工具中，不会发布为完整转录。

> **注意**：这里的「人工已核对」是研究者在工具内做出的状态标记，系统不会自动证明字符正确或证实原件版本。若存在整幅漏检的文字列，即使已录入的列全标记已核对，仍可能不完整；发布前务必与原图逐列清点。

---

## 将 PaddleOCR 结果导入网站（多图册）

本项目新增了 scripts/import_paddle_ocr.py，负责把本地的 PaddleOCR 批量结果导入网页。现有 40 幅经整理的记录保持不变；新图册每页拥有自己的来源、页码、OCR 文本和网页预览图。网站会同时搜索两类记录。

**Mac 操作（进入之前安装成功的 Python 虚拟环境）：**

1. 用 GitHub Desktop 克隆 jinjuwu01/miao-albums 到 ~/miao-albums，或使用 git clone。
2. 确保原始 PDF 仍在 ~/miao-ocr/images/，已完成的 OCR 输出仍在 ~/miao-ocr/results_batch/。
3. 在 Terminal 执行：

    cd ~/miao-albums
    source ~/miao-ocr/.venv/bin/activate
    python scripts/import_paddle_ocr.py --site-root . --max-pages 10

   确认页面图像/文字对应正确之后，导入所有已完成页面：

    python scripts/import_paddle_ocr.py --site-root .

   如 OCR 或 PDF 使用了自定义路径，可通过 --ocr-root 和 --pdf-root 指定。

4. 本地预览：

    python -m http.server 8000

   打开 http://localhost:8000/，核对图册下拉菜单、来源页码、图像和 OCR 初稿。
5. 通过 GitHub Desktop 提交并推送修改：data/imported_ocr.js、data/imported_ocr.json、images/collections/ 文件夹。原 PDF、results_batch 原始 JSON 和暂存文件**不用上传**。GitHub Pages 将自动重新部署。

导入程序可重复运行，使用稳定的 PDF 来源路径+页码生成记录 ID，不会重复添加同一页面。人工校订文字会尽可能保留在 data/imported_ocr.json；若校订只存在浏览器 localStorage，必须另外导出和合并，不能视为已同步。不要运行旧的 build_from_pdf.py 覆盖已校订的 legacy records。

**注意：** 这里的“数据库”是 GitHub Pages 上的静态 JSON/JavaScript 全文索引，不是提供用户账号或服务器写入功能的 SQL 数据库。新 OCR 文字未经人工校对，暂未校正繁体竖排阅读顺序；图册标题最初来自 PDF 文件名，学术目录与馆藏信息仍需补充。每页 WebP 是网页预览图，不代替原始高清 PDF。

**容量限制：** GitHub Pages 发布站点不得超过 1 GB，官方文档 https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits 。若扩展至数千页并接近限制，应使用外部对象存储或 IIIF 图像服务，同时在仓库中保留轻量的 OCR 索引。

---

## 目前的数据

- 原 PDF 为 **47 页**；第 **5–44 页**包括 **40 幅**彩绘。
- `images/NNN.webp` 为相应画幅的扫描页；`thumb-*.webp` 为缩略图；`text-*.webp` 为题记局部图。
- 40 幅都有 **未校对的 OCR** 输出，可能存在大量误识、漏识和阅读顺序错误。
- **只有第 1 幅**有中文转录和英文翻译试稿；不应将其视为校定版本。
- 搜索范围还包括根据画面添加的主题标签；主题标签**不是题记原文**。
- 浏览器中修改的文字只保存在用户本地，用户可导出校订 JSON，不会同步到 GitHub。

## 公开发布：GitHub Pages

**推荐：使用脚本，自动创建公开仓库 + 上传图片 + 配置 Pages。**

1. 下载并解压完整网站 ZIP（不要只复制 `index.html`）。
2. 在 macOS 上安装 [GitHub CLI](https://cli.github.com/)（若用 Homebrew：`brew install gh`）。
3. 打开“终端”，进入解压后的 `miao-albums-database` 文件夹，运行：

   ```bash
   bash publish-to-github.sh
   ```

   脚本会要求你用 `jinjuwu01` 登录 GitHub，创建**公开**的 `jinjuwu01/miao-albums` 仓库，上传文件并启用 GitHub Pages。仓库已经存在时不会重复创建。
4. 查看仓库的 `Actions` 页面，确认 `Publish Miao Albums database` 运行成功。网站地址为：

   `https://jinjuwu01.github.io/miao-albums/`

   上述地址是部署成功后的**预期地址**，在验证其可访问之前，不是已上线的声明。

**不用命令行也可以：**到 [GitHub 新建仓库页面](https://github.com/new)，创建公开 `miao-albums` 仓库；将**本文件夹内的所有文件（非 ZIP）**提交到仓库根目录；然后在 Settings → Pages 选择 **GitHub Actions**。仓库的 `.github/workflows/pages.yml` 会自动发布网站。GitHub 网页上传大量图片时可能需要分批上传。

## 线下预览

解压 ZIP 后可以直接打开 `index.html`；也可以在文件夹中运行：

```bash
python3 -m http.server 8000
```

并访问 `http://localhost:8000/`。所有图像、JS 与 CSS 都打包在内，无需外部 API 或服务端。

## 文献来源与使用提示

源文件是用户提供的 `苗族生活图.40幅.清代彩绘.pdf`。目前尚不能确立该扫描件的原藏机构、馆藏号、制作人、准确年代和复制/传播许可。**公开发布之前请确认其图像使用权。** 清代画作与现代扫描件的相关权利可能有所区别。

建议暂时使用以下信息内部定位：「《苗族生活图》（上传 PDF 暂定题名），第 N 幅，PDF 第 N+4 页；藏所及版本待核」。不得将未经校订的 OCR、AI 译稿或图像标签作为可靠的一手材料直接引用。

## 数据与源码

- `data/records.json`：学术记录数据（供后续编辑）；`data/records.js`：浏览器端数据。
- `scripts/build_from_pdf.py`：图像抽取 + OCR 批处理脚本，需 `PyMuPDF`、`Pillow` 及可选的 `tesseract`（`chi_tra_vert`）。**重跑脚本可能覆盖记录**，请先备份。
- `assets/`：检索、对照阅读和浏览器本地校订。
- `.github/workflows/pages.yml`：自动部署工作流。
- `publish-to-github.sh`：使用 GitHub CLI 自动创建仓库、上传与配置公开网站的本地脚本。

后续研究版应补充：完整的人工逐字校对、标点分层、英译、学术出处、授权信息、地名/族称索引与版本修订记录。

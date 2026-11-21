# 苗图数字档案 · Miao Albums Digital Archive

清代《苗族生活图》研究用试验性数据库。**这不是已完成的学术校勘版。**

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

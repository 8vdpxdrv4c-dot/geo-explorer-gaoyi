# 地理之间 · 高中地理探索学习站

基于高中地理必修第一册、第二册教材的静态学习网站，包含主题课程、教材阅读、全文搜索、收藏、学习进度和原书对照。

## 项目目录

- `site/`：完整网站源文件，包括 HTML、CSS、JavaScript、教材内容数据及图片。
- `build/`：教材提取脚本、发布与提交辅助脚本、设计和发布记录、改版前备份及发布归档。
- `sites/geography-explorer/`：Sites 发布项目，包含 `.openai/hosting.json` 和 `dist/` 静态文件。
- 根目录两册 PDF：原始教材资料。

## 本地预览

在仓库根目录运行：

```sh
python -m http.server 4173 --directory site
```

然后访问 <http://localhost:4173>。网站不需要安装前端依赖，收藏与进度保存在当前浏览器中。

## 构建与发布资料

`build/extract.py` 使用 PyMuPDF 从原始教材提取正文和页面图片。现有辅助脚本保留了制作时的 Windows 路径与账号配置，换机器运行前需核对这些配置。教材数据和图片已经包含在仓库中，普通预览无需重新提取。

Sites 发布配置位于 `sites/geography-explorer/.openai/hosting.json`，在线站点为 <https://geo-explorer-gaoyi-20261012.maklove120092.chatgpt.site>。

本仓库保留完整项目目录；Git 内部元数据不作为项目文件提交。

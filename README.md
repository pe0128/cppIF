# C++ 笔记

[在线笔记](https://pe0128.github.io/cppIF/) 的根地址显示 C++98 笔记，各标准版本通过同级导航访问。

版本笔记位于 `docs/versions`，分类笔记位于 `docs/guide`。基础内容来源为 [cppInterviewFundamentals.md](./cppInterviewFundamentals.md)，后续版本内容来源为 [cppNewFeature.md](./cppNewFeature.md)。

本地使用 Node.js 22 或更高版本，部署使用 Node.js 24。

```sh
npm ci
npm run docs:dev
```

生产构建与预览

```sh
npm run docs:build
npm run docs:check
npm run docs:preview
```

预览时打开终端地址下的 `/cppIF/`。Windows PowerShell 若限制运行 npm.ps1，可以使用 `npm.cmd` 执行相同命令。

侧栏配置位于 `docs/.vitepress/topics.json`。`docs/versions/cpp98.md` 通过 VitePress rewrites 映射到根路径，不使用展示型首页。

代码使用 Tab 缩进，`.editorconfig` 固定这一约定；YAML 和 Markdown 中的 YAML frontmatter 按语法要求使用空格。提交源码、配置和依赖锁文件，不提交 node_modules、构建产物或缓存。

自动部署由 `.github/workflows/deploy.yml` 完成。推送 main 后安装锁定依赖、构建、检查并发布 `docs/.vitepress/dist`。仓库 Pages 的 Source 使用 GitHub Actions，站点 base 为 `/cppIF/`。

# C++ 面试基础

将 [原始笔记](./cppInterviewFundamentals.md) 的 162 个条目整理为 18 个主题，用 VitePress 构建中文静态文档站。

- [主题总纲](./docs/overview.md)：按大点概括，每章再细分小点。
- [原文条目索引](./docs/source-map.md)：逐项对应全部原始条目。
- [站点地址](https://pe0128.github.io/cppIF/)：GitHub Pages 部署地址。

本地使用 Node.js 22 或更高版本（部署使用 Node.js 24）：

```sh
npm ci
npm run docs:dev
```

生产构建与预览：

```sh
npm run docs:build
npm run docs:preview
```

预览时打开终端地址下的 `/cppIF/`。Windows PowerShell 若限制运行 npm.ps1，可以使用 `npm.cmd` 执行相同命令。

文档位于 `docs/guide/`，侧栏配置位于 `docs/.vitepress/topics.json`。新增或调整章节时同步更新总纲及原文索引。原始笔记保留作为对照，整理版补充了若干适用条件并修正了示例中的明显问题。

代码使用 Tab 缩进，`.editorconfig` 固定这一约定；YAML 和 Markdown 中的 YAML frontmatter 按语法要求使用空格。提交源码、配置和依赖锁文件，不提交 node_modules、构建产物或缓存。

自动部署由 `.github/workflows/deploy.yml` 完成：推送 main 后安装锁定依赖、构建并发布 `docs/.vitepress/dist`。首次部署需在仓库 Settings → Pages 将 Source 设为 GitHub Actions。配置依据 [VitePress 部署文档](https://vitepress.dev/guide/deploy)，站点 base 为 `/cppIF/`。

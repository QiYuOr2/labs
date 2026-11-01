# labs

一些随手写的代码。Node 项目收成 pnpm workspace，统一用 [Vite+](https://viteplus.dev) 安装依赖、检查、开发和构建。

## 环境

Vite+ 1.4 需要 Node.js `^22.18.0 || ^24.11.0 || >=26.0.0`。包管理器锁在 `pnpm@10.34.9`，通过 `vp` 调用，不要在子包里单独装依赖。

```shell
vp install
vp check
vp run -r build
```

## 目录

- `apps/table-subject`：Vue 表格练习
- `apps/ds-translate-raycast`：Raycast 翻译扩展，开发命令仍走 Raycast CLI
- `userscripts/bili-comment-hide`、`userscripts/mock`：用 Vite 构建的油猴脚本
- `userscripts/*.js`：不经过构建的单文件油猴脚本
- `packages/shared`：共用的 Vue / DOM 工具，`vp pack` 出包
- `packages/hw`、`packages/spider`、`packages/scripts`：Node 小工具
- `go/agent`、`preview/`、`snippets/`、`prompts/`：不是 Node 包

## 常用命令

```shell
vp -C apps/table-subject dev
vp -C userscripts/mock dev
vp -C userscripts/bili-comment-hide dev
vp run @labs/shared#build
vp -C apps/ds-translate-raycast run dev
vp -C packages/spider run haiyuangabiou
```

在仓库根目录直接执行 `vp dev` / `vp build` 时，Vite+ 会让你选具体的包。

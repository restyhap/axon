# 项目依赖及官网信息汇总

本文档汇总了本项目（Axon）所使用的主要依赖库及其官方网站/文档地址，方便开发查阅。

## 1. 前端核心 (Frontend Core)

| 依赖名称 | 说明 | 官网/文档 |
| :--- | :--- | :--- |
| **React** | 用于构建用户界面的 JavaScript 库 | [react.dev](https://react.dev) |
| **Vite** | 下一代前端构建工具 | [vitejs.dev](https://vitejs.dev) |
| **TypeScript** | JavaScript 的超集，提供静态类型检查 | [typescriptlang.org](https://www.typescriptlang.org) |
| **React Router** | React 路由库 | [reactrouter.com](https://reactrouter.com) |

## 2. UI & 样式 (UI & Styling)

| 依赖名称 | 说明 | 官网/文档 |
| :--- | :--- | :--- |
| **Tailwind CSS** | 实用优先的 CSS 框架 (本项目使用 v4) | [tailwindcss.com](https://tailwindcss.com) |
| **Radix UI** | 无样式、可访问的 UI 组件基元 | [radix-ui.com](https://www.radix-ui.com) |
| **shadcn/ui** | 基于 Radix UI 和 Tailwind CSS 的组件集合 | [ui.shadcn.com](https://ui.shadcn.com) |
| **Framer Motion** | React 动画库 | [framer.com/motion](https://www.framer.com/motion/) |
| **Lucide React** | 漂亮的 SVG 图标库 | [lucide.dev](https://lucide.dev) |
| **tw-animate-css** | Tailwind CSS v4 动画工具类 (tailwindcss-animate 的替代品) | [GitHub](https://github.com/Wombosvideo/tw-animate-css) |
| **clsx** | 构建类名字符串的工具 | [GitHub](https://github.com/lukeed/clsx) |
| **tailwind-merge** |以此合并 Tailwind CSS 类，解决冲突 | [GitHub](https://github.com/dcastil/tailwind-merge) |
| **class-variance-authority** | 创建变量组件样式的库 (CVA) | [cva.style](https://cva.style) |

## 3. 状态管理 & 数据获取 (State Management & Data Fetching)

| 依赖名称 | 说明 | 官网/文档 |
| :--- | :--- | :--- |
| **Zustand** | 轻量级、快速的 React 状态管理库 | [docs.pmnd.rs/zustand](https://docs.pmnd.rs/zustand) |
| **TanStack Query** | React 强大的异步状态管理 (React Query) | [tanstack.com/query](https://tanstack.com/query) |

## 4. 编辑器 & 可视化 (Editor & Visualization)

| 依赖名称 | 说明 | 官网/文档 |
| :--- | :--- | :--- |
| **Tiptap** | 基于 ProseMirror 的无头富文本编辑器框架 | [tiptap.dev](https://tiptap.dev) |
| **@xyflow/react** | 基于节点的 UI 库 (原 React Flow) | [reactflow.dev](https://reactflow.dev) |
| **Markmap** | Markdown 思维导图可视化 | [markmap.js.org](https://markmap.js.org) |
| **Reveal.js** | HTML 演示文稿框架 | [revealjs.com](https://revealjs.com) |
| **Unified / Remark / Rehype** | 文本处理、Markdown 解析与转换生态系统 | [unifiedjs.com](https://unifiedjs.com) |
| **Lowlight** | 基于 highlight.js 的虚拟语法高亮库 | [GitHub](https://github.com/wooorm/lowlight) |
| **html2canvas** | 将 DOM 节点截图为 Canvas | [html2canvas.hertzen.com](https://html2canvas.hertzen.com) |

## 5. 表单 & 校验 (Forms & Validation)

| 依赖名称 | 说明 | 官网/文档 |
| :--- | :--- | :--- |
| **React Hook Form** | 高性能、灵活的表单验证库 | [react-hook-form.com](https://react-hook-form.com) |
| **Zod** | TypeScript 优先的模式声明和验证库 | [zod.dev](https://zod.dev) |

## 6. Tauri & 系统集成 (Tauri & System)

| 依赖名称 | 说明 | 官网/文档 |
| :--- | :--- | :--- |
| **Tauri** | 构建跨平台桌面应用的框架 | [tauri.app](https://tauri.app) |
| **@tauri-apps/plugin-fs** | Tauri 文件系统插件 | [Tauri Plugins](https://v2.tauri.app/reference/plugin/fs/) |
| **@tauri-apps/plugin-dialog** | Tauri 原生对话框插件 | [Tauri Plugins](https://v2.tauri.app/reference/plugin/dialog/) |
| **@tauri-apps/plugin-store** | Tauri 持久化存储插件 | [Tauri Plugins](https://v2.tauri.app/reference/plugin/store/) |
| **@tauri-apps/plugin-opener** | Tauri 打开外部链接/文件插件 | [Tauri Plugins](https://v2.tauri.app/reference/plugin/opener/) |

## 7. 后端 (Rust)

| 依赖名称 | 说明 | 官网/文档 |
| :--- | :--- | :--- |
| **Serde** | Rust 序列化和反序列化框架 | [serde.rs](https://serde.rs) |
| **Serde JSON** | JSON 处理 | [docs.rs/serde_json](https://docs.rs/serde_json) |

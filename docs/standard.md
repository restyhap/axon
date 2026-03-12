# Tailwind v4 页面级 & 组件级标准化规范（Standard）

> 目标 / Goal：让团队任何成员在新增页面或组件时，只需复制模板即可完成一致、可维护、可审计的实现；禁止随意新增一次性样式，所有视觉差异必须通过预设 design token 与标准原子类实现。

---

## 0. 适用范围 / Scope

- 技术栈 / Stack：React + TypeScript + TailwindCSS v4（本仓库已集成）
- 视口 / Viewports：Desktop（1920×1080、1366×768）与 Mobile（375×812）均需无横向滚动条
- 目标 / Targets：
  - Lighthouse：Mobile ≥ 90，Desktop ≥ 95
  - 布局：三种视口下无横向滚动条，布局错位像素差 ≤ 1px
  - A11y：对比度与焦点可见性满足 WCAG AA（文本 ≥4.5:1；控件/状态 ≥3:1）

---

## 1) 页面级规范 / Page-level Standards

### 1.1 语义结构模板（head / main / footer）/ Semantic Templates

#### A) `<head>` 模板（HTML）/ `<head>` Template (HTML)

`<head>` 不使用 Tailwind 类（Tailwind 是运行时 DOM 的样式系统），因此这里提供的是“语义与性能”标准模板。

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="Axon" />
  <title>Axon</title>

  <!-- 关键：避免阻塞渲染的资源；字体用系统栈优先（降低 CLS 与网络依赖） -->
</head>
```

#### B) `<main>` 模板（HTML 片段 + 逐行注释 Tailwind 类）/ `<main>` Template (HTML snippet + Tailwind annotated)

```html
<main
  class="
    mx-auto               <!-- 容器水平居中 / center horizontally -->
    w-full                <!-- 宽度占满可用空间 / full width -->
    max-w-screen-2xl      <!-- 最大容器宽度 token：2xl 对齐 / max container width -->
    px-4                  <!-- 基础内边距：4（=16px）/ base padding -->
    py-8                  <!-- 基础纵向内边距：8（=32px）/ base vertical padding -->
    sm:px-6               <!-- ≥sm：横向内边距提升到 24px / padding increases on sm -->
    lg:px-8               <!-- ≥lg：横向内边距提升到 32px / padding increases on lg -->
  "
>
  <div
    class="
      grid                 <!-- 使用 CSS Grid / grid layout -->
      grid-cols-1           <!-- 默认单列 / 1 column by default -->
      gap-6                <!-- 槽距 token：6（=24px）/ gutter -->
      lg:grid-cols-12      <!-- ≥lg：切到 12 列栅格 / 12-column grid on lg -->
    "
  >
    <section
      class="
        lg:col-span-8       <!-- 主内容占 8 列 / main content spans 8 -->
        space-y-6           <!-- 纵向间距 token：6 / vertical rhythm -->
      "
    >
      <h1 class="text-2xl font-semibold tracking-tight">
        <!-- text-2xl：标题字号 token；font-semibold：标题字重；tracking-tight：标题字距 -->
        页面标题
      </h1>
      <p class="text-sm text-muted-foreground">
        <!-- text-sm：正文基础字号 token；text-muted-foreground：语义色 token -->
        说明文本
      </p>
    </section>

    <aside
      class="
        lg:col-span-4       <!-- 侧栏占 4 列 / sidebar spans 4 -->
        space-y-4
      "
    >
      <!-- Sidebar content -->
    </aside>
  </div>
</main>
```

**断点策略 / Breakpoint strategy**

- 默认移动端优先（默认 1 列），到 `lg` 才进入“桌面工作区” 12 列布局；
- `sm/md` 主要用于增大容器 padding 与微调排版；
- `xl/2xl` 主要用于扩大容器与增加留白，不改变信息架构（避免频繁 reflow）。

#### C) `<footer>` 模板（HTML 片段 + 逐行注释 Tailwind 类）/ `<footer>` Template

```html
<footer class="border-t bg-background">
  <!-- border-t：顶部边界；bg-background：语义背景色（随 dark 自动切换） -->
  <div
    class="
      mx-auto
      max-w-screen-2xl
      px-4
      py-6
      text-sm
      text-muted-foreground
      sm:flex
      sm:items-center
      sm:justify-between
      sm:px-6
      lg:px-8
    "
  >
    <div class="min-w-0">
      <!-- min-w-0：避免 flex 子元素撑出横向滚动 -->
      © 2026 Axon
    </div>
    <div class="mt-2 flex items-center gap-2 sm:mt-0">
      <!-- gap-2：组件间距 token -->
      <a class="underline underline-offset-4 hover:text-foreground" href="#">
        Link
      </a>
    </div>
  </div>
</footer>
```

---

### 1.2 统一断点映射表（sm/md/lg/xl/2xl）与 token / Breakpoints & Tokens

#### A) 断点 / Breakpoints（Tailwind 默认）

| Key | min-width | 用途（CN） | Usage (EN) |
|---|---:|---|---|
| sm | 640px | 增大边距、轻微排版优化 | increase padding, small typography tweaks |
| md | 768px | 信息密度微调、表单布局调整 | density tuning, form layout |
| lg | 1024px | 进入桌面 12 栅格；左右栏布局成立 | switch to desktop 12-col grid |
| xl | 1280px | 增加留白与多列内容展示 | more whitespace, richer layouts |
| 2xl | 1536px | 容器上限；大屏不无限拉伸 | cap container width |

#### B) 容器宽度与内边距 / Container width & padding (tokens)

| Token | Tailwind 实现 | 说明（CN） | Notes (EN) |
|---|---|---|---|
| Container Max | `max-w-screen-2xl` | 容器最大宽度，避免 1920 上过宽 | prevents overly wide content |
| Page Padding X | `px-4 sm:px-6 lg:px-8` | 16px / 24px / 32px | standard responsive padding |

#### C) 栅格槽距（gutter）/ Grid gutter (tokens)

| Token | Tailwind 实现 | 说明（CN） |
|---|---|---|
| Gutter (default) | `gap-4` / `gap-6` | 16px / 24px（按页面密度选择） |
| Gutter (responsive) | `gap-4 md:gap-5 xl:gap-6` | 16 / 20 / 24px 的渐进节奏 |

#### D) 排版字号与行高 token / Typography tokens

> 约束：所有页面与组件只能使用下表中的字号层级，禁止 `text-[13px]` 等任意值。

| Semantic | Tailwind | Line-height | 用途（CN） |
|---|---|---:|---|
| Title | `text-2xl font-semibold tracking-tight` | 默认 | 页面/模块主标题 |
| Subtitle | `text-lg font-semibold` | 默认 | 分组标题 |
| Body | `text-sm leading-6` | 1.5 | 正文、表单、列表 |
| Helper | `text-sm text-muted-foreground` | 1.5 | 说明、次要信息 |
| Caption | `text-xs text-muted-foreground` | 默认 | 注释、标签 |

---

### 1.3 页面级 token 使用约束 / Token Usage Constraints

#### A) 色彩 / Color

**允许（Only allowed semantic tokens）**

- 背景：`bg-background` `bg-card` `bg-popover` `bg-muted` `bg-accent`
- 文本：`text-foreground` `text-muted-foreground` `text-card-foreground` `text-popover-foreground`
- 边框/分割线：`border` `border-b` `border-t` + `border-border`（由全局 token 注入）
- 主色/危险色：`bg-primary` `text-primary-foreground` `bg-destructive` 等语义类

**禁止（Forbidden）**

- 业务代码中使用调色板色值：如 `bg-red-500` / `text-slate-700` 等
- 任意值颜色：如 `bg-[#123456]`、`text-[rgb(...)]`

#### B) 圆角 / Radius

**允许**：`rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-2xl` `rounded-full`

**禁止**：`rounded-[10px]` 等任意值

#### C) 阴影 / Shadow

**允许**：`shadow-sm` `shadow` `shadow-md`（优先 `shadow-sm`）

**禁止**：`shadow-[...]` 任意值

#### D) 间距 / Spacing

**允许**：使用 Tailwind spacing scale（`p-4`、`gap-2`、`space-y-6` 等）

**禁止**：`p-[13px]`、`mt-[7px]` 任意值；禁止 `style={{ margin... }}` 内联样式

---

### 1.4 Axon 页面与模块布局（基于界面设计稿）/ Axon page & module layouts

#### A) 文档/脑图视图（MainLayout）

- 骨架：`CompoundMainLayout`（header + resizable left/right）
- 顶栏：`CompoundTitleBar`（title/actions/tabs 插槽）
- 左侧：`CompoundNavigationPanel`（文档：目录+预览；脑图：画布）
- 右侧：`CompoundEditorPanel`（Tiptap 编辑器常驻）
- 响应式策略：
  - ≥lg（1024+）：左右分栏默认 50/50，可拖拽调整
  - <lg：建议左侧折叠为抽屉/覆盖层（避免横向滚动），右侧编辑器保持主视图

#### B) 演示视图（ShowcaseLayout）

- 骨架：`CompoundShowcaseLayout`（标题栏精简 + 主区域全屏）
- Tabs：默认隐藏（避免干扰演示），保留视图切换 actions 以便退出演示

---

## 2) 组件级规范 / Component-level Standards

### 2.1 组件分类体系（基础/复合/业务）/ Component taxonomy

| 类别 | 目录 | 命名前缀 | 职责（CN） | Responsibility (EN) |
|---|---|---|---|---|
| 基础 Base | `src/components/base` | `Base*` | 最小可复用 UI 单元（Button/Input/Card） | smallest reusable UI units |
| 复合 Compound | `src/components/compound` | `Compound*` | 组合基础组件形成布局块（Navbar/Footer/Layout） | composed layout blocks |
| 业务 Biz | `src/components/biz` | `Biz*` | 绑定业务状态与领域逻辑，复用 base/compound | domain logic + state |

---

### 2.1.1 项目所需 UI 组件清单（来自 01/02 文档）/ Required UI components list

下表综合自：

- [01-需求分析.md](file:///Users/resty/02-workspace/05-tauri/axon/docs/01-需求分析.md)（三视图、编辑器常驻、知识库规划）
- [02-界面设计.md](file:///Users/resty/02-workspace/05-tauri/axon/docs/02-界面设计.md)（MainLayout/ShowcaseLayout/TitleBar/TabGroup 等）
- [02-前端页面设计规划.md](file:///Users/resty/02-workspace/05-tauri/axon/docs/02-前端页面设计规划.md)（断点、栅格、token 与无障碍要求）

#### A) 原子级（Base）/ Atomic (Base)

| 组件 | 文件 | Props（核心字段） | 状态 | 状态管理职责 | A11y 要求 |
|---|---|---|---|---|---|
| BaseButton | `BaseButton.tsx` | `variant` `size` `disabled` `onClick` | default/hover/focus/disabled/dark | 无（纯展示） | `button` 语义；`:focus-visible`；disabled 可达 |
| BaseInput | `BaseInput.tsx` | 原生 `input` props | default/hover/focus/disabled/invalid/dark | 无（纯展示） | `aria-invalid` 错误态；label/aria-label；键盘焦点可见 |
| BaseCard / BaseCardBody | `BaseCard.tsx` | `className` `children` | default/dark | 无（纯展示） | 仅容器；内容语义由内部元素决定 |
| BaseDivider（规划） | - | `orientation` | - | 无 | 作为分隔线时需保证对比度 |
| BaseSpinner（规划） | - | `size` `label` | loading | 无 | `role="status"` + 文本替代 |

#### B) 复合级（Compound）/ Composite (Compound)

| 组件 | 文件 | Props（核心字段） | 状态 | 状态管理职责 | A11y 要求 |
|---|---|---|---|---|---|
| CompoundNavbar | `CompoundNavbar.tsx` | `brand` `left` `right` | default/dark | 无（插槽承载） | `header` 语义；可聚焦元素顺序合理 |
| CompoundFooter | `CompoundFooter.tsx` | `left` `right` | default/dark | 无 | `footer` 语义；链接需可键盘访问 |
| CompoundMainLayout | `MainLayout.tsx` | `leftPanel` `rightPanel` | default/dark | 无（布局骨架） | resizable handle 可键盘操作需后续补充；当前至少保证焦点不丢失 |
| CompoundTitleBar | `CompoundTitleBar.tsx` | `title` `actions` `tabs` | default/dark | 无（由上层注入） | 标题可截断；按钮可键盘触达 |
| CompoundTabGroup | `CompoundTabGroup.tsx` | `tabs` `activeId` `onSelect` `onClose` | default/hover/focus/disabled/dark | 无（受控） | `role="tablist"`/`tab"`；后续补键盘左右切换（APG） |
| CompoundNavigationPanel | `CompoundNavigationPanel.tsx` | `children` `className` | default/dark | 无 | 作为 `section` 容器；内部内容负责语义 |
| CompoundEditorPanel | `CompoundEditorPanel.tsx` | `children` `className` | default/dark | 无 | 作为 `section` 容器；内部内容负责语义 |
| CompoundShowcaseLayout | `CompoundShowcaseLayout.tsx` | `title` `actions` `children` | default/dark | 无 | `main` 区域可滚动；焦点不丢失 |
| CompoundResizableDivider（规划） | - | `id` `ariaLabel` | hover/focus | 无 | 手柄需有可见焦点与可读 label |

#### C) 业务级（Biz）/ Business (Biz)

| 组件 | 文件 | Props（核心字段） | 状态 | 状态管理职责 | A11y 要求 |
|---|---|---|---|---|---|
| BizDocumentToolbar | `BizDocumentToolbar.tsx` | -（读取 store） | active/hover/focus/disabled/dark | 读取/写入 `viewMode`（Zustand） | Buttons 需有清晰文案；焦点可见 |
| BizTabGroup（规划） | - | - | - | 管理打开文档、dirty 状态、溢出菜单 | ARIA tabs + 关闭按钮 aria-label |

说明 / Notes：

- “规划（planned）”项来自界面设计文档的组件树，但当前仓库未实现具体业务逻辑；先在组件库阶段明确接口与 A11y 约束，后续再接入真实逻辑。

#### Props TypeScript 接口模板 / Props template

```ts
export interface BaseXxxProps {
  className?: string
}
```

约束 / Constraints：

- 组件必须暴露 `className?: string`（允许外部扩展，但必须遵守 token 规则）
- 禁止在组件内部引入任意值原子类（`[...]`）与内联 `style`

---

### 2.2 最小可复用单元 Tailwind 模板（含 hover/focus/disabled/dark）+ Storybook CSF3

#### A) Base Button（模板）/ Template: Base Button

```tsx
<button
  className="
    inline-flex items-center justify-center gap-2
    rounded-md text-sm font-medium
    bg-primary text-primary-foreground
    hover:bg-primary/90
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
    focus-visible:ring-offset-2 focus-visible:ring-offset-background
    disabled:pointer-events-none disabled:opacity-50
  "
>
  Button
</button>
```

#### B) Base Input（模板）/ Template: Base Input

```tsx
<input
  className="
    h-9 w-full rounded-md border border-input
    bg-background px-3 py-1 text-sm shadow-sm
    placeholder:text-muted-foreground
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
    focus-visible:ring-offset-2 focus-visible:ring-offset-background
    disabled:cursor-not-allowed disabled:opacity-50
  "
/>
```

#### C) Storybook CSF 3（含 play “单测用例”）/ Storybook CSF3 with play test

```ts
import type { Meta, StoryObj } from "@storybook/react"
import { within, userEvent, expect } from "@storybook/test"
import { BaseButton } from "./BaseButton"

const meta: Meta<typeof BaseButton> = { title: "base/BaseButton", component: BaseButton }
export default meta

type Story = StoryObj<typeof BaseButton>

export const Primary: Story = {
  args: { children: "Button", variant: "primary" },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button", { name: "Button" })
    await userEvent.tab()
    await expect(button).toHaveFocus()
  },
}
```

---

### 2.3 组件强制约束（间距/图标/文案/加载/错误态）+ JSDoc 顶部标注

所有组件文件顶部必须包含 JSDoc，并遵循以下 tag 规范（供 ESLint/CLI 做静态校验）。

```ts
/**
 * @tw-component base|compound|biz
 * @tw-name BaseButton
 * @tw-states default hover focus-visible disabled dark
 * @tw-spacing internal px-3 py-2 (md) | px-4 py-2 (lg)
 * @tw-icon-size 16 20
 * @tw-text-max-chars 24
 */
```

强制约束（可审计）：

- 组件内部间距只能使用 spacing scale（例如 `gap-2`、`p-4`），禁止任意值
- 图标尺寸必须在固定集合中（例如 16/20/24）
- 文案长度：按钮/标签类建议 ≤ 24 字符；输入类建议 ≤ 120 字符（超出必须提供省略或换行策略）
- 必须定义并可见：hover / focus-visible / disabled；dark 依赖语义 token 自动生效（必要时可补充 `dark:`）

---

## 3) 交付物与验证标准 / Deliverables & Verification

### 3.1 文档 / Docs

- 本文件：`docs/standard.md`（中英双语）

### 3.2 ESLint 规则文件 / ESLint config

- `.eslintrc-tailwind-standard.js`：对违反 token 使用、断点、命名前缀、任意值、内联 style 的代码报错

运行 / Run：

```bash
npm run lint
```

### 3.2.1 Chromatic 视觉回归 / Chromatic visual regression

本仓库提供 Chromatic CLI 脚本（需要项目 token 才能上传并做比对）。

- 运行：`CHROMATIC_PROJECT_TOKEN=xxx npm run chromatic`
- 建议：在 CI 中配置，未批准的 UI 变更禁止合并

### 3.3 CLI 扫描脚本 / CLI verifier

- `scripts/verify-tailwind-standards.js`：扫描 `/src` 下 `*.tsx` 与 `*.vue`

运行 / Run：

```bash
npm run verify:tw
```

### 3.4 活文档示例页面 / Living documentation page

- 文件：`/demo/standard-showcase.tsx`
- 路由（HashRouter）：`#/demo/standard-showcase`

---

## 4) 质量门禁 / Quality Gates

### 4.1 Lighthouse

建议在 CI 中对 Demo 页面与关键页面做 Lighthouse 审计（Mobile ≥ 90 / Desktop ≥ 95）。

### 4.2 布局与横向滚动条

三种视口（1920×1080、1366×768、375×812）必须无横向滚动条；建议用 Playwright 校验 `document.documentElement.scrollWidth <= clientWidth`。

### 4.3 组件单测与视觉回归

- Storybook CSF3 的 `play` 用例用于交互回归
- Chromatic 可用于视觉差异比对（需要团队在 CI 中接入并设定“未批准变更禁止合并”）

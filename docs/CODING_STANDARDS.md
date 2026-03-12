# Axon 项目编码规范

## 1. 依赖库使用标准

### 1.1 图标系统

**强制要求：必须使用 `lucide-react` 图标库**

```typescript
// ✅ 正确：使用 lucide-react
import { FileText, Brain, Presentation, Save, FolderOpen } from "lucide-react";

// ❌ 错误：使用 emoji
const viewLabels = {
  editor: "📝 编辑",  // 禁止
  mindmap: "🧠 脑图",  // 禁止
  presentation: "🎬 演示", // 禁止
};
```

**图标使用规范：**
- 所有图标必须从 `lucide-react` 导入
- 图标大小使用 `size` 属性控制，推荐值：16, 20, 24
- 图标颜色使用 `className` 的 Tailwind 类名控制
- 图标组件命名：`Icon{功能名}` 或直接使用 lucide 导出的组件名

**实现范例：**
```typescript
// 图标组件封装（可选）
import { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const Icon = ({ icon: Icon, size = 16, className, onClick }: IconProps) => {
  return (
    <Icon
      size={size}
      className={className}
      onClick={onClick}
    />
  );
};

// 使用示例
import { FileText, Brain, Presentation, Save, FolderOpen } from "lucide-react";

<Icon icon={FileText} size={20} className="text-muted-foreground" />
<Icon icon={Brain} size={20} className="text-muted-foreground" />
<Icon icon={Presentation} size={20} className="text-muted-foreground" />
<Icon icon={Save} size={20} className="text-muted-foreground" />
<Icon icon={FolderOpen} size={20} className="text-muted-foreground" />
```

### 1.2 UI 组件库

**强制要求：优先使用 `shadcn/ui` 组件**

- 按钮组件：使用 shadcn 的 Button 组件
- 对话框：使用 shadcn 的 Dialog 组件
- 下拉菜单：使用 shadcn 的 DropdownMenu 组件
- 标签页：使用 shadcn 的 Tabs 组件
- 表单：使用 shadcn 的 Form 组件
- 输入框：使用 shadcn 的 Input 组件

### 1.3 状态管理

**强制要求：使用 `zustand` 进行状态管理**

```typescript
// ✅ 正确：使用 zustand
import { create } from 'zustand';

interface DocumentStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  viewMode: 'editor',
  setViewMode: (mode) => set({ viewMode: mode }),
}));

// ❌ 错误：使用 React Context 或 Redux
const DocumentContext = createContext<DocumentContextValue>(null);
```

### 1.4 样式系统

**强制要求：使用 `tailwindcss` + `clsx` + `tailwind-merge`**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 使用示例
<button className={cn("base-class", isActive && "active-class", "hover-class")} />
```

### 1.5 动画系统

**强制要求：使用 `framer-motion`**

```typescript
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  {/* 内容 */}
</motion.div>
```

## 2. 代码组织结构

### 2.1 目录结构

```
src/
├── components/          # 通用组件（使用 shadcn/ui）
│   ├── ui/            # shadcn UI 组件
│   └── features/       # 业务组件
├── features/           # 功能模块
│   ├── editor/        # 编辑器功能
│   ├── mindmap/       # 思维导图功能
│   └── presentation/  # 演示功能
├── hooks/             # 自定义 Hooks
├── stores/            # Zustand 状态管理
├── lib/              # 工具函数
└── types/            # TypeScript 类型定义
```

### 2.2 文件命名规范

**组件文件：**
- PascalCase：`Button.tsx`, `Dialog.tsx`, `EditorView.tsx`
- 导出默认组件：`export default function ComponentName() {}`

**Hook 文件：**
- camelCase：`useFile.ts`, `useDocument.ts`
- 必须以 `use` 开头

**Store 文件：**
- camelCase：`document.ts`, `user.ts`
- 使用 `use{StoreName}Store` 作为 Hook 名称

**类型文件：**
- camelCase：`index.ts`, `document.ts`

### 2.3 导入顺序

```typescript
// 1. React 相关
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

// 3. 项目内部导入（使用别名）
import { useDocumentStore } from '@/stores/document';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

## 3. 组件实现规范

### 3.1 组件结构模板

```typescript
import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface ComponentProps {
  // 属性定义
}

export const ComponentName: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  className,
}) => {
  return (
    <div className={cn("base-classes", className)}>
      {/* 组件内容 */}
    </div>
  );
};

export default ComponentName;
```

### 3.2 Props 定义规范

```typescript
// ✅ 正确：使用 interface 定义 Props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {};

// ❌ 错误：使用 type 定义 Props
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  // ...
};
```

### 3.3 事件处理规范

```typescript
// ✅ 正确：使用明确的函数名
const handleSave = async () => {
  await saveFile();
};

const handleViewChange = (mode: ViewMode) => {
  setViewMode(mode);
};

// ❌ 错误：使用内联函数
<button onClick={() => setViewMode('editor')} />
<button onClick={async () => await saveFile()} />
```

## 4. 类型定义规范

### 4.1 类型导出

```typescript
// types/index.ts
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ViewMode = 'editor' | 'mindmap' | 'presentation';

export interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
}
```

### 4.2 泛型使用

```typescript
// ✅ 正确：使用泛型
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

export const List = <T,>({ items, renderItem }: ListProps<T>) => {};

// ❌ 错误：使用 any
interface ListProps {
  items: any[];
}
```

## 5. 状态管理规范

### 5.1 Store 定义模板

```typescript
import { create } from 'zustand';

interface DocumentStore {
  // 状态
  viewMode: ViewMode;
  filePath: string | null;
  isDirty: boolean;

  // 操作
  setViewMode: (mode: ViewMode) => void;
  setFilePath: (path: string | null) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  // 初始状态
  viewMode: 'editor',
  filePath: null,
  isDirty: false,

  // 操作实现
  setViewMode: (mode) => set({ viewMode: mode }),
  setFilePath: (path) => set({ filePath: path }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  reset: () => set({
    viewMode: 'editor',
    filePath: null,
    isDirty: false,
  }),
}));
```

### 5.2 Store 使用规范

```typescript
// ✅ 正确：解构需要的属性
function Component() {
  const { viewMode, setViewMode } = useDocumentStore();
  return <div>{/* ... */}</div>;
}

// ❌ 错误：获取整个 store
function Component() {
  const store = useDocumentStore();
  return <div>{store.viewMode}</div>;
}
```

## 6. 具体功能模块实现范例

### 6.1 图标系统完整实现

**文件：`src/components/ui/icon.tsx`**

```typescript
import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ icon: Icon, size = 16, className, onClick }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          className
        )}
        onClick={onClick}
      >
        <Icon size={size} />
      </div>
    );
  }
);

Icon.displayName = "Icon";

export default Icon;
```

**使用示例：**

```typescript
// App.tsx
import { FileText, Brain, Presentation, Save, FolderOpen } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

function App() {
  const { viewMode, setViewMode } = useDocumentStore();

  const viewIcons = {
    editor: FileText,
    mindmap: Brain,
    presentation: Presentation,
  };

  return (
    <nav className="flex gap-1">
      {(Object.keys(viewIcons) as ViewMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={cn(
            "rounded-md px-3 py-1 text-xs transition-colors",
            viewMode === mode
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Icon icon={viewIcons[mode]} size={16} />
          <span className="ml-1">{mode === 'editor' ? '编辑' : mode === 'mindmap' ? '脑图' : '演示'}</span>
        </button>
      ))}
    </nav>
  );
}
```

### 6.2 按钮组件实现

**文件：`src/components/ui/button.tsx`**

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    leftIcon, 
    rightIcon, 
    isLoading,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };
    
    const sizeClasses = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
```

### 6.3 编辑器功能模块

**文件：`src/features/editor/index.tsx`**

```typescript
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentStore } from '@/stores/document';

export default function EditorView() {
  const { filePath, isDirty } = useDocumentStore();
  const { saveFile } = useFile();

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 border-b p-2">
        <Button 
          variant="ghost" 
          size="sm"
          leftIcon={<Save size={16} />}
          onClick={saveFile}
        >
          保存
        </Button>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 overflow-auto p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
}
```

## 7. 代码质量检查清单

### 7.1 提交前检查

- [ ] 所有图标都使用 `lucide-react`，没有 emoji
- [ ] 所有 UI 组件都使用 `shadcn/ui` 组件
- [ ] 所有状态管理都使用 `zustand`
- [ ] 所有样式都使用 `tailwindcss` + `clsx` + `tailwind-merge`
- [ ] 所有类型都正确定义，没有 `any` 类型
- [ ] 所有函数都有明确的命名和类型
- [ ] 所有事件处理都使用独立的函数
- [ ] 所有导入都按照规范顺序排列

### 7.2 代码审查要点

- **图标使用**：检查是否使用了 emoji，应替换为 lucide-react 图标
- **组件复用**：检查是否有重复的组件实现，应使用 shadcn/ui 组件
- **类型安全**：检查是否有 `any` 类型，应定义明确的接口
- **性能优化**：检查是否有不必要的重渲染，应使用 `useMemo` 或 `useCallback`
- **可访问性**：检查是否有 `aria-label` 属性
- **错误处理**：检查是否有 try-catch 块处理异步错误

## 8. 禁止事项

### 8.1 禁止使用的模式

```typescript
// ❌ 禁止：使用 emoji 作为图标
const icon = "📝";

// ❌ 禁止：使用内联样式
<div style={{ color: 'red' }} />

// ❌ 禁止：使用 any 类型
const data: any = {};

// ❌ 禁止：使用 React Context（除非必要）
const Context = createContext(null);

// ❌ 禁止：直接修改 DOM
document.getElementById('app').innerHTML = '';

// ❌ 禁止：使用 console.log（生产环境）
console.log(data);
```

### 8.2 必须使用的模式

```typescript
// ✅ 必须：使用 lucide-react 图标
import { FileText } from 'lucide-react';

// ✅ 必须：使用 zustand 状态管理
import { create } from 'zustand';

// ✅ 必须：使用 tailwindcss 样式
<div className="flex items-center" />

// ✅ 必须：使用 TypeScript 类型
interface Props {
  name: string;
}
```

## 9. 常见问题解决方案

### 9.1 图标不显示问题

**问题**：使用 emoji 导致图标在不同系统显示不一致

**解决方案**：
```typescript
// ❌ 错误
<span>📝 编辑</span>

// ✅ 正确
<Icon icon={FileText} size={16} />
<span className="ml-1">编辑</span>
```

### 9.2 样式冲突问题

**问题**：多个 className 合并导致样式覆盖

**解决方案**：
```typescript
import { cn } from '@/lib/utils';

// ✅ 正确：使用 cn 函数合并
<button className={cn("base-class", isActive && "active-class")} />

// ❌ 错误：直接拼接字符串
<button className={`base-class ${isActive ? "active-class" : ""}`} />
```

### 9.3 类型错误问题

**问题**：使用 any 类型导致类型检查失效

**解决方案**：
```typescript
// ❌ 错误
const data: any = {};

// ✅ 正确
interface DataType {
  id: string;
  name: string;
}
const data: DataType = {};
```

## 10. 参考资源

- [Lucide React 文档](https://lucide.dev/)
- [Shadcn UI 文档](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [Tauri API 文档](https://tauri.app/)
- [TypeScript 文档](https://www.typescriptlang.org/)

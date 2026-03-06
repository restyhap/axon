import { create } from "zustand";

export type ViewMode = "editor" | "mindmap" | "presentation";

interface DocumentState {
  /** 当前 Markdown 内容 */
  content: string;
  /** 当前文件路径 */
  filePath: string | null;
  /** 当前视图模式 */
  viewMode: ViewMode;
  /** 文档是否已修改 */
  isDirty: boolean;

  setContent: (content: string) => void;
  setFilePath: (path: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setDirty: (dirty: boolean) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  content: "",
  filePath: null,
  viewMode: "editor",
  isDirty: false,

  setContent: (content) => set({ content, isDirty: true }),
  setFilePath: (filePath) => set({ filePath }),
  setViewMode: (viewMode) => set({ viewMode }),
  setDirty: (isDirty) => set({ isDirty }),
}));


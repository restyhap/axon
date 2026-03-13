/**
 * 文档状态管理 Store
 * 使用 Zustand 管理文档内容、文件路径和视图模式等状态
 */
import { create } from "zustand";

/** 视图模式类型 */
export type ViewMode = "editor" | "mindmap" | "presentation";

/** 文档状态接口 */
interface DocumentState {
  /** 当前 Markdown 内容 */
  content: string;
  /** 当前文件路径 */
  filePath: string | null;
  /** 当前视图模式 */
  viewMode: ViewMode;
  /** 文档是否已修改 */
  isDirty: boolean;

  /** 设置文档内容 */
  setContent: (content: string) => void;
  /** 设置文件路径 */
  setFilePath: (path: string | null) => void;
  /** 设置视图模式 */
  setViewMode: (mode: ViewMode) => void;
  /** 设置修改状态 */
  setDirty: (dirty: boolean) => void;
}

/** 文档状态 Store */
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


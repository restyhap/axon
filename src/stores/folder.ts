/**
 * 文件夹状态管理 Store
 * 管理目录栏的文件夹列表、当前选中的文件夹、以及文件夹内的 .md 文件列表
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 文件夹信息 */
export interface FolderItem {
  /** 文件夹绝对路径 */
  path: string;
  /** 显示名称（path 的最后一段） */
  name: string;
}

/** 文档文件信息 */
export interface FileItem {
  /** 文件绝对路径 */
  path: string;
  /** 文件名（含扩展名） */
  name: string;
}

interface FolderState {
  /** 已添加的文件夹列表 */
  folders: FolderItem[];
  /** 当前选中的文件夹路径 */
  activeFolderPath: string | null;
  /** 当前文件夹下的文件列表（由外部读取后写入） */
  files: FileItem[];

  addFolder: (folder: FolderItem) => void;
  removeFolder: (path: string) => void;
  setActiveFolder: (path: string | null) => void;
  setFiles: (files: FileItem[]) => void;
}

export const useFolderStore = create<FolderState>()(
  persist(
    (set) => ({
      folders: [],
      activeFolderPath: null,
      files: [],

      addFolder: (folder) =>
        set((state) => {
          // 防止重复添加
          if (state.folders.find((f) => f.path === folder.path)) return state;
          return { folders: [...state.folders, folder] };
        }),

      removeFolder: (path) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.path !== path),
          activeFolderPath:
            state.activeFolderPath === path ? null : state.activeFolderPath,
          files: state.activeFolderPath === path ? [] : state.files,
        })),

      setActiveFolder: (path) => set({ activeFolderPath: path, files: [] }),

      setFiles: (files) => set({ files }),
    }),
    {
      name: 'folder-storage',
      partialize: (state) => ({
        folders: state.folders,
        activeFolderPath: state.activeFolderPath,
      }),
    }
  )
);

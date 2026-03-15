/**
 * 可调整布局状态管理 Store
 * 管理各个布局面板的宽度比例，支持同步模式和持久化存储
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 布局标识符 */
export type LayoutId = 'app' | 'document' | 'presentation' | 'editor' | 'mindmap';

/** 布局尺寸配置 */
interface LayoutSizes {
  /** 左侧面板宽度百分比 */
  leftSize: number;
  /** 右侧面板宽度百分比 */
  rightSize: number;
}

/** 可调整布局状态接口 */
interface ResizableState {
  /** 各布局的尺寸配置 */
  layouts: Record<LayoutId, LayoutSizes>;
  /** 是否同步所有布局的尺寸 */
  isSync: boolean;
  
  /** 设置指定布局的尺寸 */
  setLayoutSizes: (id: LayoutId, sizes: LayoutSizes) => void;
  /** 获取指定布局的尺寸 */
  getLayoutSizes: (id: LayoutId) => LayoutSizes;
  /** 切换同步模式 */
  toggleSync: () => void;
  /** 设置同步模式 */
  setSync: (sync: boolean) => void;
}

/** 默认布局尺寸配置 */
const DEFAULT_LAYOUTS: Record<LayoutId, LayoutSizes> = {
  app: {
    leftSize: 20,
    rightSize: 80,
  },
  document: {
    leftSize: 20,
    rightSize: 80,
  },
  presentation: {
    leftSize: 20,
    rightSize: 80,
  },
  editor: {
    leftSize: 50,
    rightSize: 50,
  },
  mindmap: {
    leftSize: 35,
    rightSize: 65,
  },
};

/**
 * 可调整布局 Store
 * 使用 persist 中间件实现状态持久化
 */
export const useResizableStore = create<ResizableState>()(
  persist(
    (set, get) => ({
      layouts: DEFAULT_LAYOUTS,
      isSync: true,

      setLayoutSizes: (id, sizes) =>
        set((state) => {
          if (state.isSync) {
            // 编辑器布局不参与同步，保持独立
            if (id === 'editor') {
              return {
                layouts: {
                  ...state.layouts,
                  [id]: sizes,
                },
              };
            }
            return {
              layouts: {
                app: sizes,
                document: sizes,
                presentation: sizes,
                mindmap: sizes,
                editor: state.layouts.editor, // 保持编辑器布局不变
              },
            };
          }
          return {
            layouts: {
              ...state.layouts,
              [id]: sizes,
            },
          };
        }),

      getLayoutSizes: (id) => {
        const state = get();
        return state.layouts[id] || DEFAULT_LAYOUTS[id];
      },

      toggleSync: () =>
        set((state) => ({
          isSync: !state.isSync,
        })),

      setSync: (sync: boolean) =>
        set({
          isSync: sync,
        }),
    }),
    {
      name: 'resizable-layout-storage',
      partialize: (state) => ({
        layouts: state.layouts,
        isSync: state.isSync,
      }),
    }
  )
);
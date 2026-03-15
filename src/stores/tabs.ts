/**
 * 标签页状态管理 Store
 * 管理编辑区多标签页的打开、切换、关闭等操作
 */
import { create } from 'zustand';

/** 单个标签页基础数据 */
export interface TabData {
  /** 唯一标识（文件路径或临时 id） */
  id: string;
  /** 显示标题 */
  title: string;
  /** 文件路径，未保存时为 null */
  filePath: string | null;
}

/** 单个标签页数据 */
export interface Tab extends TabData {
  /** 是否已修改（显示小圆点） */
  isDirty: boolean;
  /** 是否为临时预览标签（单击打开，可被替换） */
  isPreview: boolean;
}

/** 标签页 Store 状态接口 */
interface TabsState {
  /** 所有标签页列表 */
  tabs: Tab[];
  /** 当前激活的标签 id */
  activeTabId: string | null;

  /** 打开或激活一个标签 */
  openTab: (tab: TabData) => void;
  /** 打开或激活一个临时预览标签（可被替换） */
  openPreviewTab: (tab: TabData) => void;
  /** 关闭指定标签 */
  closeTab: (id: string) => void;
  /** 激活指定标签 */
  activateTab: (id: string) => void;
  /** 移动标签顺序 */
  moveTab: (sourceId: string, targetId: string, position: 'before' | 'after') => void;
  /** 按给定顺序重排标签 */
  reorderTabs: (orderedIds: string[]) => void;
  /** 标记标签为已修改 */
  markDirty: (id: string, dirty: boolean) => void;
  /** 更新标签标题（保存后同步文件名） */
  updateTabTitle: (id: string, title: string, filePath?: string) => void;
}

let tabCounter = 1;

/** 生成唯一的临时标签 id */
function newTabId() {
  return `tab-${Date.now()}-${tabCounter++}`;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [
    // 默认打开一个"未命名"标签，方便初次体验
    { id: 'tab-default', title: '未命名', filePath: null, isDirty: false, isPreview: true },
  ],
  activeTabId: 'tab-default',

  openTab: (tabData) => {
    const { tabs } = get();
    // 如果同路径已经打开，直接激活
    if (tabData.filePath) {
      const existing = tabs.find((t) => t.filePath === tabData.filePath);
      if (existing) {
        if (existing.isPreview) {
          set({
            tabs: tabs.map((t) => (t.id === existing.id ? { ...t, isPreview: false } : t)),
            activeTabId: existing.id,
          });
          return;
        }
        set({ activeTabId: existing.id });
        return;
      }
    }
    const id = tabData.id || newTabId();
    const newTab: Tab = { ...tabData, id, isDirty: false, isPreview: false };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    }));
  },

  openPreviewTab: (tabData) => {
    const { tabs } = get();

    if (tabData.filePath) {
      const existing = tabs.find((t) => t.filePath === tabData.filePath);
      if (existing) {
        set({ activeTabId: existing.id });
        return;
      }
    }

    const previewIdx = tabs.findIndex((t) => t.isPreview);
    if (previewIdx >= 0) {
      const keepId = tabs[previewIdx].id;
      if (tabs[previewIdx].isDirty) {
        const convertedTabs = tabs.map((t, idx) =>
          idx === previewIdx ? { ...t, isPreview: false } : t
        );
        const id = tabData.id || newTabId();
        const newTab: Tab = { ...tabData, id, isDirty: false, isPreview: true };
        set({
          tabs: [...convertedTabs, newTab],
          activeTabId: id,
        });
        return;
      }
      const replaced: Tab = { ...tabData, id: keepId, isDirty: false, isPreview: true };
      set({
        tabs: tabs.map((t, idx) => (idx === previewIdx ? replaced : t)),
        activeTabId: keepId,
      });
      return;
    }

    const id = tabData.id || newTabId();
    const newTab: Tab = { ...tabData, id, isDirty: false, isPreview: true };
    set({
      tabs: [...tabs, newTab],
      activeTabId: id,
    });
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const nextTabs = tabs.filter((t) => t.id !== id);
    let nextActiveId = activeTabId;
    if (activeTabId === id) {
      // 优先激活右边，没有则激活左边
      const nextTab = nextTabs[idx] ?? nextTabs[idx - 1] ?? null;
      nextActiveId = nextTab?.id ?? null;
    }
    set({ tabs: nextTabs, activeTabId: nextActiveId });
  },

  activateTab: (id) => {
    set({ activeTabId: id });
  },

  moveTab: (sourceId, targetId, position) => {
    const { tabs } = get();
    if (sourceId === targetId) return;

    const fromIdx = tabs.findIndex((t) => t.id === sourceId);
    const toIdxRaw = tabs.findIndex((t) => t.id === targetId);
    if (fromIdx === -1 || toIdxRaw === -1) return;

    const next = [...tabs];
    const [moved] = next.splice(fromIdx, 1);

    let toIdx = toIdxRaw;
    if (fromIdx < toIdx) toIdx -= 1;
    if (position === 'after') toIdx += 1;
    toIdx = Math.max(0, Math.min(toIdx, next.length));

    next.splice(toIdx, 0, moved);
    set({ tabs: next });
  },

  reorderTabs: (orderedIds) => {
    const { tabs } = get();
    if (orderedIds.length !== tabs.length) return;
    const map = new Map(tabs.map((t) => [t.id, t] as const));
    const next: Tab[] = [];
    for (const id of orderedIds) {
      const tab = map.get(id);
      if (!tab) return;
      next.push(tab);
    }
    set({ tabs: next });
  },

  markDirty: (id, dirty) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, isDirty: dirty } : t)),
    }));
  },

  updateTabTitle: (id, title, filePath) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, title, ...(filePath !== undefined ? { filePath } : {}) } : t
      ),
    }));
  },
}));

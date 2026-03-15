/**
 * 文档树状态管理 Store
 * 管理文档树结构，支持递归遍历文件夹及其子文件夹
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 树节点类型 */
export type TreeNodeType = 'folder' | 'file';

/** 树节点接口 */
export interface TreeNode {
  /** 唯一标识（路径） */
  id: string;
  /** 显示名称 */
  name: string;
  /** 节点类型 */
  type: TreeNodeType;
  /** 文件路径（仅文件节点有） */
  path?: string;
  /** 子节点（仅文件夹节点有） */
  children?: TreeNode[];
  /** 是否展开（仅文件夹节点有效） */
  expanded?: boolean;
  /** 层级深度 */
  depth: number;
}

/** 文档树状态接口 */
interface DocumentTreeState {
  /** 根节点列表（每个根节点对应一个添加的文件夹） */
  rootNodes: TreeNode[];
  /** 当前选中的节点 ID */
  selectedNodeId: string | null;
  /** 当前选中的目录路径（用于宽屏模式下显示文件列表） */
  selectedDirectoryPath: string | null;
  /** 展开状态映射（路径 -> 是否展开） */
  expandedMap: Record<string, boolean>;
  /** 是否正在加载 */
  isLoading: boolean;

  /** 设置根节点 */
  setRootNodes: (nodes: TreeNode[]) => void;
  /** 选中节点 */
  selectNode: (nodeId: string | null) => void;
  /** 选中目录 */
  selectDirectory: (path: string | null) => void;
  /** 切换展开状态 */
  toggleExpand: (nodeId: string) => void;
  /** 设置展开状态 */
  setExpanded: (nodeId: string, expanded: boolean) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 展开所有父节点 */
  expandParents: (nodeId: string) => void;
  /** 清空树 */
  clearTree: () => void;
}

export const useDocumentTreeStore = create<DocumentTreeState>()(
  persist(
    (set, get) => ({
      rootNodes: [],
      selectedNodeId: null,
      selectedDirectoryPath: null,
      expandedMap: {},
      isLoading: false,

      setRootNodes: (nodes) => set({ rootNodes: nodes }),

      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

      selectDirectory: (path) => set({ selectedDirectoryPath: path }),

      toggleExpand: (nodeId) =>
        set((state) => ({
          expandedMap: {
            ...state.expandedMap,
            [nodeId]: !state.expandedMap[nodeId],
          },
        })),

      setExpanded: (nodeId, expanded) =>
        set((state) => ({
          expandedMap: {
            ...state.expandedMap,
            [nodeId]: expanded,
          },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      expandParents: (nodeId) => {
        const { rootNodes, expandedMap } = get();
        const parentIds = findParentIds(rootNodes, nodeId);
        const newExpandedMap = { ...expandedMap };
        parentIds.forEach((id) => {
          newExpandedMap[id] = true;
        });
        set({ expandedMap: newExpandedMap });
      },

      clearTree: () =>
        set({
          rootNodes: [],
          selectedNodeId: null,
          selectedDirectoryPath: null,
          expandedMap: {},
        }),
    }),
    {
      name: 'document-tree-storage',
      partialize: (state) => ({
        expandedMap: state.expandedMap,
        selectedNodeId: state.selectedNodeId,
        selectedDirectoryPath: state.selectedDirectoryPath,
      }),
    }
  )
);

/** 查找节点的所有父节点 ID */
function findParentIds(
  nodes: TreeNode[],
  targetId: string,
  parentIds: string[] = []
): string[] {
  for (const node of nodes) {
    if (node.id === targetId) {
      return parentIds;
    }
    if (node.children && node.children.length > 0) {
      const result = findParentIds(node.children, targetId, [...parentIds, node.id]);
      if (result.length > 0 || node.children.some((c) => c.id === targetId)) {
        return result;
      }
    }
  }
  return [];
}

/** 在树中查找节点 */
export function findNodeInTree(nodes: TreeNode[], nodeId: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNodeInTree(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

/** 获取目录下的所有文件节点 */
export function getFilesInDirectory(node: TreeNode): TreeNode[] {
  if (node.type === 'file') return [];
  const files: TreeNode[] = [];
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'file') {
        files.push(child);
      }
    }
  }
  return files;
}

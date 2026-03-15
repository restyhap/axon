/**
 * 文档树构建 Hook
 * 递归遍历文件夹，生成文档树结构
 */
import { useEffect, useCallback, useRef } from 'react';
import { readDir } from '@tauri-apps/plugin-fs';
import { useDocumentTreeStore, TreeNode } from '@/stores/documentTree';
import { useFolderStore } from '@/stores/folder';

const SUPPORTED_TEXT_EXTENSIONS = new Set([
  'md',
  'markdown',
  'mdx',
  'txt',
  'log',
  'json',
  'yaml',
  'yml',
  'toml',
  'ini',
  'conf',
  'csv',
  'ts',
  'tsx',
  'js',
  'jsx',
  'py',
  'java',
  'kt',
  'rs',
  'go',
  'c',
  'h',
  'cpp',
  'hpp',
  'html',
  'css',
  'scss',
  'less',
  'xml',
  'sql',
  'sh',
  'bat',
  'ps1',
  'gitignore',
  'env',
  'editorconfig',
]);

function getLowerExtension(fileName: string): string | null {
  const idx = fileName.lastIndexOf('.');
  if (idx <= 0) return null;
  const ext = fileName.slice(idx + 1).trim().toLowerCase();
  if (!ext) return null;
  return ext;
}

function isSupportedTextFile(fileName: string): boolean {
  const ext = getLowerExtension(fileName);
  if (!ext) return false;
  return SUPPORTED_TEXT_EXTENSIONS.has(ext);
}

/** 排序函数：文件夹优先，然后按名称排序 */
function sortNodes(a: TreeNode, b: TreeNode): number {
  if (a.type === 'folder' && b.type === 'file') return -1;
  if (a.type === 'file' && b.type === 'folder') return 1;
  return a.name.localeCompare(b.name, 'zh-CN');
}

/** 递归读取目录结构 */
async function readDirectoryRecursive(
  dirPath: string,
  parentDepth: number = 0,
  expandedMap: Record<string, boolean> = {}
): Promise<TreeNode[]> {
  try {
    const entries = await readDir(dirPath);
    const nodes: TreeNode[] = [];
    // 当前层级深度 = 父深度 + 1
    const currentDepth = parentDepth + 1;

    console.log(`[DEBUG] 读取目录: ${dirPath}, 条目数: ${entries.length}`);

    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry.name}`;

      if (entry.isDirectory) {
        console.log(`[DEBUG] 发现文件夹: ${entry.name}`);
        const children = await readDirectoryRecursive(fullPath, currentDepth, expandedMap);
        // 默认展开所有文件夹（除非用户手动折叠）
        const isExpanded = expandedMap[fullPath] ?? true;
        nodes.push({
          id: fullPath,
          name: entry.name,
          type: 'folder',
          children,
          expanded: isExpanded,
          depth: currentDepth,
        });
      } else if (entry.isFile) {
        console.log(`[DEBUG] 发现文件: ${entry.name}, isFile: ${entry.isFile}`);
        if (isSupportedTextFile(entry.name)) {
          console.log(`[DEBUG] ✓ 匹配到文档文件: ${entry.name}`);
          nodes.push({
            id: fullPath,
            name: entry.name,
            type: 'file',
            path: fullPath,
            depth: currentDepth,
          });
        } else {
          console.log(`[DEBUG] ✗ 非文档文件: ${entry.name}`);
        }
      }
    }

    console.log(`[DEBUG] 目录 ${dirPath} 处理完成, 节点数: ${nodes.length}`);
    return nodes.sort(sortNodes);
  } catch (error) {
    console.error(`Failed to read directory: ${dirPath}`, error);
    return [];
  }
}

/** 从根文件夹构建文档树 */
export function useBuildDocumentTree() {
  const { folders } = useFolderStore();
  const { setRootNodes, setLoading, expandedMap, setExpanded } = useDocumentTreeStore();
  const isBuilding = useRef(false);

  const buildTree = useCallback(async () => {
    if (isBuilding.current || folders.length === 0) return;

    isBuilding.current = true;
    setLoading(true);

    try {
      const rootNodes: TreeNode[] = [];

      for (const folder of folders) {
        const children = await readDirectoryRecursive(folder.path, 0, expandedMap);
        const isExpanded = expandedMap[folder.path] ?? true; // 默认展开根文件夹
        rootNodes.push({
          id: folder.path,
          name: folder.name,
          type: 'folder',
          children,
          expanded: isExpanded,
          depth: 0,
        });
        // 确保 expandedMap 中有根文件夹的展开状态
        if (expandedMap[folder.path] === undefined) {
          setExpanded(folder.path, true);
        }
      }

      setRootNodes(rootNodes);
    } finally {
      setLoading(false);
      isBuilding.current = false;
    }
  }, [folders, setRootNodes, setLoading, expandedMap, setExpanded]);

  return { buildTree };
}

/** 监听文件夹变化，自动重建文档树 */
export function useDocumentTree() {
  const { folders } = useFolderStore();
  const { setRootNodes, setLoading, expandedMap, setExpanded } = useDocumentTreeStore();
  const isBuilding = useRef(false);

  useEffect(() => {
    if (folders.length === 0) {
      setRootNodes([]);
      return;
    }

    const buildTree = async () => {
      if (isBuilding.current) return;
      isBuilding.current = true;
      setLoading(true);

      try {
        const rootNodes: TreeNode[] = [];

        for (const folder of folders) {
          const children = await readDirectoryRecursive(folder.path, 0, expandedMap);
          const isExpanded = expandedMap[folder.path] ?? true; // 默认展开根文件夹
          rootNodes.push({
            id: folder.path,
            name: folder.name,
            type: 'folder',
            children,
            expanded: isExpanded,
            depth: 0,
          });
          // 确保 expandedMap 中有根文件夹的展开状态
          if (expandedMap[folder.path] === undefined) {
            setExpanded(folder.path, true);
          }
        }

        setRootNodes(rootNodes);
      } finally {
        setLoading(false);
        isBuilding.current = false;
      }
    };

    buildTree();
  }, [folders, setRootNodes, setLoading, expandedMap, setExpanded]);
}

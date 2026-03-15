/**
 * useFolderTree Hook
 * 递归扫描已添加文件夹，构建目录树 Markdown 字符串（用于 markmap 渲染）
 * 文件夹 → 标题节点（# / ## / ###...），文件 → 同级列表项
 * 同时维护一个 fileMap：节点标签 → 文件绝对路径，供点击跳转使用
 */
import { useState, useEffect, useCallback } from 'react';
import { readDir } from '@tauri-apps/plugin-fs';
import { useFolderStore } from '@/stores/folder';

export interface FileNodeInfo {
  /** 文件名（不含扩展名） */
  name: string;
  /** 文件绝对路径 */
  path: string;
}

interface UseFolderTreeResult {
  /** 生成的 markmap Markdown 字符串 */
  markdown: string;
  /** 节点标签 → 文件信息 映射（用于点击事件） */
  fileMap: Map<string, FileNodeInfo>;
  /** 正在加载 */
  isLoading: boolean;
  /** 手动刷新 */
  refresh: () => void;
}

/** DirEntry 类型（@tauri-apps/plugin-fs） */
interface DirEntry {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
}

/** 递归扫描目录，返回 { markdown行, fileMap条目 } */
async function scanDir(
  dirPath: string,
  depth: number,
  fileMap: Map<string, FileNodeInfo>
): Promise<string[]> {
  let entries: DirEntry[];
  try {
    entries = await readDir(dirPath);
  } catch {
    return [];
  }

  // 排序：目录优先，再按名称
  const sorted = [...entries].sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });

  const lines: string[] = [];
  const indent = '  '.repeat(depth);

  for (const entry of sorted) {
    if (entry.name.startsWith('.')) continue; // 跳过隐藏文件/目录

    if (entry.isDirectory) {
      // 文件夹用列表项表示（markmap 会自动识别层级）
      lines.push(`${indent}- **${entry.name}**`);
      const subPath = `${dirPath}/${entry.name}`;
      const subLines = await scanDir(subPath, depth + 1, fileMap);
      lines.push(...subLines);
    } else if (
      entry.isFile &&
      (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))
    ) {
      const displayName = entry.name.replace(/\.(md|markdown)$/, '');
      const filePath = `${dirPath}/${entry.name}`;
      // 用唯一 key 存储，以防不同路径的文件同名
      // key 格式：显示名|文件路径（markmap 里只能用显示名点击，用 displayName 即可）
      fileMap.set(displayName, { name: displayName, path: filePath });
      lines.push(`${indent}- ${displayName}`);
    }
  }

  return lines;
}

export function useFolderTree(): UseFolderTreeResult {
  const { folders } = useFolderStore();
  const [markdown, setMarkdown] = useState<string>('');
  const [fileMap, setFileMap] = useState<Map<string, FileNodeInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (folders.length === 0) {
      setMarkdown('');
      setFileMap(new Map());
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const build = async () => {
      const newFileMap = new Map<string, FileNodeInfo>();
      const allLines: string[] = [];

      for (const folder of folders) {
        // 每个根文件夹作为一级标题
        allLines.push(`# ${folder.name}`);
        const subLines = await scanDir(folder.path, 0, newFileMap);
        allLines.push(...subLines);
      }

      if (!cancelled) {
        setMarkdown(allLines.join('\n'));
        setFileMap(newFileMap);
        setIsLoading(false);
      }
    };

    build();
    return () => {
      cancelled = true;
    };
  }, [folders, tick]);

  return { markdown, fileMap, isLoading, refresh };
}

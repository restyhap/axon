/**
 * 目录树视图组件
 * 显示完整的文档树结构，支持展开/折叠目录
 * 用于宽屏模式（≥400px）的左侧面板
 */
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, FolderX, ChevronRight, ChevronDown, Folder, RefreshCw } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folder';
import { useDocumentTreeStore, TreeNode } from '@/stores/documentTree';
import { useDocumentTree, useBuildDocumentTree } from '../hooks/useDocumentTree';
import { Button } from '@/components/ui/button';

interface FolderTreePanelProps {
  showHeader?: boolean;
}

export const FolderTreePanel: React.FC<FolderTreePanelProps> = ({ showHeader = true }) => {
  const { t } = useTranslation();
  const { folders, addFolder, removeFolder } = useFolderStore();
  const {
    rootNodes,
    selectedDirectoryPath,
    expandedMap,
    isLoading,
    selectNode,
    selectDirectory,
    toggleExpand,
  } = useDocumentTreeStore();

  const { buildTree } = useBuildDocumentTree();
  useDocumentTree();

  const handleAddFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (!selected || typeof selected !== 'string') return;
    const name = selected.split('/').pop() || selected.split('\\').pop() || selected;
    addFolder({ path: selected, name });
  }, [addFolder]);

  const handleRemoveFolder = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      removeFolder(path);
    },
    [removeFolder]
  );

  const handleRefresh = useCallback(() => {
    buildTree();
  }, [buildTree]);

  const handleNodeClick = useCallback(
    (node: TreeNode) => {
      if (node.type === 'folder') {
        selectDirectory(node.id);
        toggleExpand(node.id);
      } else {
        selectNode(node.id);
      }
    },
    [selectNode, selectDirectory, toggleExpand]
  );

  // 宽屏模式下只渲染文件夹节点
  const renderFolderNode = useCallback(
    (node: TreeNode, parentDepth: number = -1): React.ReactNode => {
      // 只渲染文件夹节点
      if (node.type !== 'folder') return null;

      const isExpanded = expandedMap[node.id] ?? false;
      const isSelected = selectedDirectoryPath === node.id;
      // 使用 parentDepth 计算缩进，确保第一级子目录正确缩进
      const effectiveDepth = parentDepth >= 0 ? parentDepth + 1 : node.depth;
      const paddingLeft = 12 + effectiveDepth * 16;

      return (
        <div key={node.id}>
          <div
            onClick={() => handleNodeClick(node)}
            className={cn(
              'group flex items-center gap-1.5 h-7 cursor-pointer select-none transition-colors',
              isSelected
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/80 hover:bg-accent hover:text-foreground'
            )}
            style={{ paddingLeft }}
          >
            <span className="w-4 h-4 flex items-center justify-center shrink-0">
              {isExpanded ? (
                <ChevronDown size={12} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={12} className="text-muted-foreground" />
              )}
            </span>
            <Folder
              size={13}
              className={cn('shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
            />
            <span className="flex-1 text-xs truncate">{node.name}</span>
          </div>

          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderFolderNode(child, effectiveDepth))}
            </div>
          )}
        </div>
      );
    },
    [expandedMap, selectedDirectoryPath, handleNodeClick]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {showHeader && (
        <div className="h-8 flex items-center justify-between px-3 shrink-0 border-b">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FolderOpen size={12} className="opacity-70" />
            <span>{t('editor.directory')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleRefresh}
              title={t('editor.refresh')}
              className="opacity-60 hover:opacity-100"
              disabled={isLoading}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleAddFolder}
              title={t('editor.addFolder')}
              className="opacity-60 hover:opacity-100"
            >
              <FolderOpen size={13} />
            </Button>
          </div>
        </div>
      )}

      <div className={cn('flex-1 overflow-y-auto py-1', !showHeader && 'pt-2')}>
        {folders.length === 0 ? (
          <div
            className="h-full flex flex-col items-center justify-center gap-2 cursor-pointer text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors px-3"
            onClick={handleAddFolder}
          >
            <FolderOpen size={22} />
            <span className="text-xs text-center">{t('editor.addFolderHint')}</span>
          </div>
        ) : (
          rootNodes.map((rootNode) => (
            <div key={rootNode.id} className="relative group">
              {renderFolderNode(rootNode)}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => handleRemoveFolder(e, rootNode.id)}
                title={t('editor.removeFolder')}
                className="absolute right-2 top-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-destructive shrink-0"
              >
                <FolderX size={12} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FolderTreePanel;

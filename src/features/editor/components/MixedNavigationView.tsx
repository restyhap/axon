/**
 * 混合导航视图组件
 * 显示完整的文档树（目录+文档混合），支持展开/折叠
 * 用于窄屏模式（<400px）
 */
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, FolderX, ChevronRight, ChevronDown, Folder, FileText, RefreshCw } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folder';
import { useDocumentTreeStore, TreeNode } from '@/stores/documentTree';
import { useDocumentTree, useBuildDocumentTree } from '../hooks/useDocumentTree';
import { useTabsStore } from '@/stores/tabs';
import { useDocumentStore } from '@/stores/document';
import { Button } from '@/components/ui/button';

const MixedNavigationView: React.FC = () => {
  const { t } = useTranslation();
  const { folders, addFolder, removeFolder } = useFolderStore();
  const {
    rootNodes,
    expandedMap,
    isLoading,
    selectNode,
    toggleExpand,
  } = useDocumentTreeStore();
  const { tabs, activeTabId, openTab, openPreviewTab, activateTab } = useTabsStore();
  const { setContent, setFilePath } = useDocumentStore();
  const clickTimerRef = useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    };
  }, []);

  const { buildTree } = useBuildDocumentTree();
  useDocumentTree();

  const activeFilePath = tabs.find((tab) => tab.id === activeTabId)?.filePath ?? null;

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

  const handleOpenFile = useCallback(
    async (node: TreeNode, mode: 'preview' | 'permanent') => {
      if (node.type !== 'file' || !node.path) return;

      const existing = tabs.find((t) => t.filePath === node.path);
      if (existing) {
        if (mode === 'permanent') {
          openTab({ id: '', title: node.name, filePath: node.path });
        } else {
          activateTab(existing.id);
        }
        selectNode(node.id);
        return;
      }

      try {
        const content = await readTextFile(node.path);
        if (mode === 'preview') openPreviewTab({ id: '', title: node.name, filePath: node.path });
        else openTab({ id: '', title: node.name, filePath: node.path });
        setContent(content);
        setFilePath(node.path);
      } catch {
        // 读取失败不做处理
      }
      selectNode(node.id);
    },
    [activateTab, openPreviewTab, openTab, selectNode, setContent, setFilePath, tabs]
  );

  const handleNodeClick = useCallback(
    async (node: TreeNode) => {
      if (node.type === 'folder') {
        toggleExpand(node.id);
      } else if (node.path) {
        if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
        clickTimerRef.current = window.setTimeout(() => {
          handleOpenFile(node, 'preview');
        }, 220);
      }
    },
    [handleOpenFile, toggleExpand]
  );

  const handleNodeDoubleClick = useCallback(
    async (node: TreeNode) => {
      if (node.type !== 'file') return;
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      await handleOpenFile(node, 'permanent');
    },
    [handleOpenFile]
  );

  const renderTreeNode = useCallback(
    (node: TreeNode, isRoot: boolean = false, parentDepth: number = -1): React.ReactNode => {
      const isExpanded = expandedMap[node.id] ?? false;
      const isSelected = node.type === 'file' && node.path === activeFilePath;
      // 使用 parentDepth 计算缩进，确保第一级子目录正确缩进
      const effectiveDepth = parentDepth >= 0 ? parentDepth + 1 : node.depth;
      const paddingLeft = 12 + effectiveDepth * 16;

      return (
        <div key={node.id} className="relative group">
          <div
            onClick={() => handleNodeClick(node)}
            onDoubleClick={() => handleNodeDoubleClick(node)}
            className={cn(
              'flex items-center gap-1.5 h-7 cursor-pointer select-none transition-colors',
              isSelected
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/80 hover:bg-accent hover:text-foreground'
            )}
            style={{ paddingLeft }}
          >
            {node.type === 'folder' ? (
              <>
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
              </>
            ) : (
              <>
                <span className="w-4 h-4 shrink-0" />
                <FileText
                  size={13}
                  className={cn('shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
                />
              </>
            )}
            <span className="flex-1 text-xs truncate">{node.name}</span>
            
            {isRoot && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => handleRemoveFolder(e, node.id)}
                title={t('editor.removeFolder')}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-destructive shrink-0 mr-1"
              >
                <FolderX size={12} />
              </Button>
            )}
          </div>

          {node.type === 'folder' && isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderTreeNode(child, false, effectiveDepth))}
            </div>
          )}
        </div>
      );
    },
    [expandedMap, activeFilePath, handleNodeClick, handleRemoveFolder, t]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 标题栏 */}
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

      {/* 文档树 */}
      <div className="flex-1 overflow-y-auto py-1">
        {folders.length === 0 ? (
          <div
            className="h-full flex flex-col items-center justify-center gap-2 cursor-pointer text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors px-3"
            onClick={handleAddFolder}
          >
            <FolderOpen size={22} />
            <span className="text-xs text-center">{t('editor.addFolderHint')}</span>
          </div>
        ) : (
          (() => {
            console.log('[DEBUG MixedNavigationView] rootNodes:', rootNodes);
            return rootNodes.map((rootNode) => renderTreeNode(rootNode, true));
          })()
        )}
      </div>
    </div>
  );
};

export default MixedNavigationView;

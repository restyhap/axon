/**
 * 文档列表视图组件
 * 显示选中目录下的所有文档文件
 * 用于宽屏模式（≥400px）的右侧面板
 */
import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, FileX } from 'lucide-react';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { cn } from '@/lib/utils';
import { useTabsStore } from '@/stores/tabs';
import { useDocumentStore } from '@/stores/document';
import { useDocumentTreeStore, TreeNode, findNodeInTree } from '@/stores/documentTree';

interface FileListPanelProps {
  showHeader?: boolean;
}

export const FileListPanel: React.FC<FileListPanelProps> = ({ showHeader = true }) => {
  const { t } = useTranslation();
  const { tabs, activeTabId, openTab, openPreviewTab, activateTab } = useTabsStore();
  const { setContent, setFilePath } = useDocumentStore();
  const { rootNodes, selectedDirectoryPath, selectNode } = useDocumentTreeStore();
  const clickTimerRef = useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    };
  }, []);

  const activeFilePath = tabs.find((tab) => tab.id === activeTabId)?.filePath ?? null;

  const filesInDirectory = useMemo(() => {
    if (!selectedDirectoryPath) return [];
    
    const directoryNode = findNodeInTree(rootNodes, selectedDirectoryPath);
    if (!directoryNode || directoryNode.type !== 'folder' || !directoryNode.children) {
      return [];
    }
    
    return directoryNode.children.filter((child) => child.type === 'file');
  }, [rootNodes, selectedDirectoryPath]);

  const directoryName = useMemo(() => {
    if (!selectedDirectoryPath) return null;
    const node = findNodeInTree(rootNodes, selectedDirectoryPath);
    return node?.name ?? null;
  }, [rootNodes, selectedDirectoryPath]);

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
        return;
      }

      try {
        const content = await readTextFile(node.path);
        if (mode === 'preview') openPreviewTab({ id: '', title: node.name, filePath: node.path });
        else openTab({ id: '', title: node.name, filePath: node.path });
        setContent(content);
        setFilePath(node.path);
        selectNode(node.id);
      } catch {
        // 读取失败不做处理
      }
    },
    [tabs, activateTab, openPreviewTab, openTab, setContent, setFilePath, selectNode]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {showHeader && (
        <div className="h-8 flex items-center px-3 gap-1.5 shrink-0 border-b">
          <FileText size={12} className="text-muted-foreground opacity-70 shrink-0" />
          <span className="text-xs font-medium text-muted-foreground truncate">
            {directoryName || t('editor.document')}
          </span>
        </div>
      )}

      <div className={cn('flex-1 overflow-y-auto py-1', !showHeader && 'pt-2')}>
        {!selectedDirectoryPath ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground/40">{t('editor.selectFolderFirst')}</span>
          </div>
        ) : filesInDirectory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
            <FileX size={22} />
            <span className="text-xs">{t('editor.noFiles')}</span>
          </div>
        ) : (
          filesInDirectory.map((file) => {
            const isActive = file.path === activeFilePath;
            return (
              <div
                key={file.id}
                onClick={() => {
                  if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
                  clickTimerRef.current = window.setTimeout(() => {
                    handleOpenFile(file, 'preview');
                  }, 220);
                }}
                onDoubleClick={() => {
                  if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
                  clickTimerRef.current = null;
                  handleOpenFile(file, 'permanent');
                }}
                className={cn(
                  'flex items-center gap-2 h-7 px-3 cursor-pointer select-none transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                )}
                title={file.path}
              >
                <FileText
                  size={12}
                  className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
                />
                <span className="text-xs truncate">{file.name}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FileListPanel;

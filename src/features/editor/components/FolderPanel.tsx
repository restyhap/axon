/**
 * 目录栏组件
 * 显示已添加的文件夹列表，点击切换当前目录，支持添加/移除文件夹
 */
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, FolderPlus, FolderX, ChevronRight } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folder';
import { Button } from '@/components/ui/button';

interface FolderPanelProps {
  showHeader?: boolean;
}

export const FolderPanel: React.FC<FolderPanelProps> = ({ showHeader = true }) => {
  const { t } = useTranslation();
  const { folders, activeFolderPath, addFolder, removeFolder, setActiveFolder } =
    useFolderStore();

  const handleAddFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (!selected || typeof selected !== 'string') return;
    const name = selected.split('/').pop() || selected.split('\\').pop() || selected;
    addFolder({ path: selected, name });
    setActiveFolder(selected);
  }, [addFolder, setActiveFolder]);

  const handleRemoveFolder = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      removeFolder(path);
    },
    [removeFolder]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 标题栏 */}
      {showHeader && (
        <div className="h-8 flex items-center justify-between px-3 shrink-0 border-b">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FolderOpen size={12} className="opacity-70" />
            <span>{t('editor.directory')}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleAddFolder}
            title={t('editor.addFolder')}
            className="opacity-60 hover:opacity-100"
          >
            <FolderPlus size={13} />
          </Button>
        </div>
      )}

      {/* 文件夹列表 */}
      <div className={cn("flex-1 overflow-y-auto py-1", !showHeader && "pt-2")}>
        {folders.length === 0 ? (
          <div
            className="h-full flex flex-col items-center justify-center gap-2 cursor-pointer text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors px-3"
            onClick={handleAddFolder}
          >
            <FolderPlus size={22} />
            <span className="text-xs text-center">{t('editor.addFolderHint')}</span>
          </div>
        ) : (
          folders.map((folder) => {
            const isActive = folder.path === activeFolderPath;
            return (
              <div
                key={folder.path}
                onClick={() => setActiveFolder(folder.path)}
                className={cn(
                  'group flex items-center gap-2 h-7 px-3 cursor-pointer select-none transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                )}
                title={folder.path}
              >
                <ChevronRight
                  size={12}
                  className={cn('shrink-0 transition-transform opacity-50', isActive && 'opacity-100')}
                />
                <FolderOpen
                  size={13}
                  className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
                />
                <span className="flex-1 text-xs truncate">{folder.name}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => handleRemoveFolder(e, folder.path)}
                  title={t('editor.removeFolder')}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-destructive shrink-0"
                >
                  <FolderX size={12} />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FolderPanel;

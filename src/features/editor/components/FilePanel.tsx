/**
 * 文档栏组件
 * 显示当前选中文件夹下的文档文件列表
 * 点击文件在 TabBar 中打开，读取文件内容
 */
import React, { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, FileX } from 'lucide-react';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folder';
import { useTabsStore } from '@/stores/tabs';
import { useDocumentStore } from '@/stores/document';

interface FilePanelProps {
  showHeader?: boolean;
}

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

export const FilePanel: React.FC<FilePanelProps> = ({ showHeader = true }) => {
  const { t } = useTranslation();
  const { activeFolderPath, files, setFiles } = useFolderStore();
  const { tabs, activeTabId, openTab, openPreviewTab, activateTab } = useTabsStore();
  const { setContent, setFilePath } = useDocumentStore();
  const clickTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    };
  }, []);

  // 当前激活的文件路径
  const activeFilePath = tabs.find((tab) => tab.id === activeTabId)?.filePath ?? null;

  // 读取当前目录下的文档文件
  useEffect(() => {
    if (!activeFolderPath) {
      setFiles([]);
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const entries = await readDir(activeFolderPath);
        if (cancelled) return;
        const docFiles = entries
          .filter(
            (e) =>
              e.isFile &&
              isSupportedTextFile(e.name)
          )
          .map((e) => ({
            path: `${activeFolderPath}/${e.name}`,
            name: e.name,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setFiles(docFiles);
      } catch {
        if (!cancelled) setFiles([]);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [activeFolderPath, setFiles]);

  const handleOpenFile = useCallback(
    async (filePath: string, fileName: string, mode: 'preview' | 'permanent') => {
      // 如果 tab 已经存在，直接激活
      const existing = tabs.find((t) => t.filePath === filePath);
      if (existing) {
        if (mode === 'permanent') {
          openTab({ id: '', title: fileName, filePath });
        } else {
          activateTab(existing.id);
        }
        return;
      }
      try {
        const content = await readTextFile(filePath);
        if (mode === 'preview') openPreviewTab({ id: '', title: fileName, filePath });
        else openTab({ id: '', title: fileName, filePath });
        // 再更新编辑器内容
        setContent(content);
        setFilePath(filePath);
      } catch {
        // 读取失败不做处理
      }
    },
    [tabs, activateTab, openPreviewTab, openTab, setContent, setFilePath]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 标题栏 */}
      {showHeader && (
        <div className="h-8 flex items-center px-3 gap-1.5 shrink-0 border-b">
          <FileText size={12} className="text-muted-foreground opacity-70 shrink-0" />
          <span className="text-xs font-medium text-muted-foreground truncate">
            {activeFolderPath
              ? (activeFolderPath.split('/').pop() || activeFolderPath)
              : t('editor.document')}
          </span>
        </div>
      )}

      {/* 文件列表 */}
      <div className={cn("flex-1 overflow-y-auto py-1", !showHeader && "pt-2")}>
        {!activeFolderPath ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground/40">{t('editor.selectFolderFirst')}</span>
          </div>
        ) : files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
            <FileX size={22} />
            <span className="text-xs">{t('editor.noFiles')}</span>
          </div>
        ) : (
          files.map((file) => {
            const isActive = file.path === activeFilePath;
            return (
              <div
                key={file.path}
                onClick={() => {
                  if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
                  clickTimerRef.current = window.setTimeout(() => {
                    handleOpenFile(file.path, file.name, 'preview');
                  }, 220);
                }}
                onDoubleClick={() => {
                  if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
                  clickTimerRef.current = null;
                  handleOpenFile(file.path, file.name, 'permanent');
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

export default FilePanel;

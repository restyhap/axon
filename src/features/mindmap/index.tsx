/**
 * 脑图视图组件（左侧导航区）
 *
 * 新设计：展示整个知识库的文件夹树结构
 * - 根文件夹 → 一级标题（# FolderName）
 * - 子文件夹 → 脑图子节点（加粗列表项，markmap 自动分层）
 * - .md 文件 → 叶子节点（同级列表项）
 * - 点击文件节点 → 在右侧编辑区打开文档（联动 TabBar）
 * - 无文件夹时显示引导提示
 */
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, FolderOpen, RefreshCw } from 'lucide-react';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { useFolderTree } from './hooks/useFolderTree';
import { useMarkmap } from './hooks/useMarkmap';
import { MindmapToolbar } from './components/MindmapToolbar';
import { useTabsStore } from '@/stores/tabs';
import { useDocumentStore } from '@/stores/document';
import { useFolderStore } from '@/stores/folder';
import { Button } from '@/components/ui/button';
import { open } from '@tauri-apps/plugin-dialog';

const MindmapView: React.FC = () => {
  const { t } = useTranslation();
  const { tabs, openTab, activateTab } = useTabsStore();
  const { setContent, setFilePath } = useDocumentStore();
  const { addFolder, setActiveFolder } = useFolderStore();

  // 从文件夹树 hook 获取 Markdown 和文件映射
  const { markdown, fileMap, isLoading, refresh } = useFolderTree();

  // 节点点击处理
  const handleNodeClick = useCallback(
    async (label: string) => {
      // 去掉 Markdown 加粗标记（文件夹名可能被渲染为 **name**）
      const cleanLabel = label.replace(/\*\*/g, '').trim();
      const fileInfo = fileMap.get(cleanLabel);
      if (!fileInfo) return; // 点击的是文件夹节点，不处理

      const { name, path: filePath } = fileInfo;

      // 如果 tab 已经存在，直接激活
      const existing = tabs.find((t) => t.filePath === filePath);
      if (existing) {
        activateTab(existing.id);
        return;
      }

      try {
        const content = await readTextFile(filePath);
        openTab({ id: '', title: name, filePath });
        setContent(content);
        setFilePath(filePath);
      } catch {
        // 读取失败不做处理
      }
    },
    [fileMap, tabs, activateTab, openTab, setContent, setFilePath]
  );

  const { svgRef, handleFit, handleZoomIn, handleZoomOut } = useMarkmap({
    content: markdown,
    onNodeClick: handleNodeClick,
  });

  // 添加文件夹（引导用）
  const handleAddFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (!selected || typeof selected !== 'string') return;
    const name = selected.split('/').pop() || selected.split('\\').pop() || selected;
    addFolder({ path: selected, name });
    setActiveFolder(selected);
  }, [addFolder, setActiveFolder]);

  // 空状态：没有任何文件夹
  if (!isLoading && !markdown) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground/40 cursor-pointer hover:text-muted-foreground/70 transition-colors"
        onClick={handleAddFolder}
      >
        <FolderOpen size={32} className="opacity-50" />
        <div className="text-center">
          <p className="text-sm font-medium">{t('mindmap.empty')}</p>
          <p className="text-xs mt-1 opacity-70">{t('mindmap.addFolderHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* 加载遮罩 */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* 脑图 SVG 画布 */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />

      {/* 浮动工具栏（右下角） */}
      <MindmapToolbar
        onFit={handleFit}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* 刷新按钮（左下角） */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={refresh}
          title={t('mindmap.refresh')}
          className="opacity-40 hover:opacity-90 bg-background/80 border rounded-md"
        >
          <RefreshCw size={12} />
        </Button>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/40 select-none pointer-events-none">
          <GitBranch size={10} className="opacity-60" />
          <span>{t('mindmap.clickFileHint')}</span>
        </div>
      </div>
    </div>
  );
};

export default MindmapView;

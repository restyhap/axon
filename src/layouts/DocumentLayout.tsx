/**
 * 文档布局组件
 * 布局说明：
 * - 左侧：标题栏（含视图切换）+ 导航区（根据 viewMode 渲染编辑器导航/脑图）
 * - 右侧：空白标题栏对齐区 + 标签栏 + 知识库编辑器（固定）
 * 支持拖动调整左右面板宽度，并持久化保存布局配置
 */
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useResizableStore } from '@/stores/resizable';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { TabBar } from '@/components/layout/TabBar';
import { usePanelWidth } from '@/hooks/use-panel-width';
import { useDocumentStore } from '@/stores/document';
import EditorView from '@/features/editor';
import MindmapView from '@/features/mindmap';
import { MarkdownEditor } from '@/features/editor/components/MarkdownEditor';
import Rail, { RailItemType } from '@/components/layout/Rail';
import { NotebookPanel, SearchPanel, StarPanel, RecentPanel, GraphPanel } from '@/components/layout/RailPanel';

/** 文档布局组件 */
const DocumentLayout: React.FC = () => {
  const { getLayoutSizes, setLayoutSizes } = useResizableStore();
  const savedSizes = getLayoutSizes('document');
  const { panelWidth: leftPanelWidth, panelRef: leftPanelRef } = usePanelWidth();

  const { viewMode } = useDocumentStore();
  const [activeRailItem, setActiveRailItem] = useState<RailItemType | null>(null);

  const titlebarSpacer = (
    <div
      data-tauri-drag-region
      className="shrink-0"
      style={{ height: 'env(titlebar-area-height, 0px)' }}
    />
  );

  const handleLayoutChange = useCallback(
    (layout: { [id: string]: number }) => {
      let nextLeftPercent = layout['left'] ?? 20;
      if (nextLeftPercent > 50) nextLeftPercent = 50;
      const rightSize = 100 - nextLeftPercent;
      setLayoutSizes('document', { leftSize: nextLeftPercent, rightSize });
    },
    [setLayoutSizes]
  );

  const handleRailItemClick = useCallback((item: RailItemType) => {
    setActiveRailItem((prev) => (prev === item ? null : item));
  }, []);

  const handleClosePanel = useCallback(() => {
    setActiveRailItem(null);
  }, []);

  const showRail = viewMode === 'editor';

  const renderRailPanel = () => {
    if (!activeRailItem) return null;
    
    switch (activeRailItem) {
      case 'notebook':
        return <NotebookPanel onClose={handleClosePanel} />;
      case 'search':
        return <SearchPanel onClose={handleClosePanel} />;
      case 'star':
        return <StarPanel onClose={handleClosePanel} />;
      case 'recent':
        return <RecentPanel onClose={handleClosePanel} />;
      case 'graph':
        return <GraphPanel onClose={handleClosePanel} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* 主内容区 - 可拖动布局 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup
          orientation="horizontal"
          defaultLayout={{ left: savedSizes.leftSize, right: savedSizes.rightSize }}
          onLayoutChange={handleLayoutChange}
        >
          {/* ── 左侧面板 ── */}
          <ResizablePanel
            id="left"
            minSize={240}
            maxSize="50%"
          >
            <div ref={leftPanelRef} className="h-full w-full flex flex-col min-h-0 border-r">
              {titlebarSpacer}
              {/* 左上：标题栏（含视图切换按钮） */}
              <HeaderBar panelWidth={leftPanelWidth} showViewSwitcher={true} variant="document" />
              {/* 左下：导航区 —— 根据 viewMode 渲染编辑器或脑图 */}
              <div className="flex-1 min-h-0 overflow-hidden flex">
                {showRail && <Rail onItemClick={handleRailItemClick} />}
                <AnimatePresence mode="wait">
                  {activeRailItem && (
                    <motion.div
                      key={activeRailItem}
                      className="h-full"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        duration: 0.3
                      }}
                    >
                      <motion.div 
                        className="w-[240px] h-full border-r"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                          delay: 0.1,
                          duration: 0.2
                        }}
                      >
                        {renderRailPanel()}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex-1 min-h-0 overflow-hidden">
                  {viewMode === 'mindmap' ? <MindmapView /> : <EditorView />}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── 右侧面板 ── */}
          <ResizablePanel id="right" minSize="50%">
            <div className="h-full w-full flex flex-col min-h-0">
              {titlebarSpacer}
              {/* 标签栏 */}
              <TabBar />
              {/* 右下：知识库编辑器（固定，不随视图切换） */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <MarkdownEditor />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default DocumentLayout;

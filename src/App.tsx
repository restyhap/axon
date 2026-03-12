import React, { useCallback } from 'react';
import { useDocumentStore, type ViewMode } from '@/stores/document';
import EditorView from '@/features/editor';
import MindmapView from '@/features/mindmap';
import PresentationView from '@/features/presentation';
import { FileText, Brain, Presentation, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewConfig {
  icon: React.ElementType;
  label: string;
}

const viewConfigs: Record<ViewMode, ViewConfig> = {
  editor: {
    icon: FileText,
    label: '编辑',
  },
  mindmap: {
    icon: Brain,
    label: '脑图',
  },
  presentation: {
    icon: Presentation,
    label: '演示',
  },
};

function App() {
  const { viewMode, setViewMode, filePath, isDirty } = useDocumentStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setIsMobileMenuOpen(false);
  }, [setViewMode]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* 顶部工具栏 */}
      <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b px-4 bg-background/90 backdrop-blur-sm">
        {/* 左侧：应用标题 */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold">Axon</h1>
          <span className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
            {filePath ? filePath.split('/').pop() : '未命名'}
            {isDirty && ' •'}
          </span>
        </div>

        {/* 中间：视图切换（桌面端） */}
        <nav className="hidden md:flex gap-1">
          {(Object.keys(viewConfigs) as ViewMode[]).map((mode) => {
            const config = viewConfigs[mode];
            return (
              <button
                key={mode}
                onClick={() => handleViewChange(mode)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs transition-colors flex items-center gap-1',
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <config.icon size={14} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 移动端菜单按钮 */}
        <button
          className="md:hidden rounded-md p-1 text-muted-foreground hover:bg-accent"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b bg-background py-2">
          <div className="flex flex-col gap-1 px-4">
            {/* 视图切换（移动端） */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-1">视图</h3>
              <div className="flex flex-col gap-1">
                {(Object.keys(viewConfigs) as ViewMode[]).map((mode) => {
                  const config = viewConfigs[mode];
                  return (
                    <button
                      key={mode}
                      onClick={() => handleViewChange(mode)}
                      className={cn(
                        'rounded-md px-3 py-2 text-sm transition-colors flex items-center gap-2',
                        viewMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent'
                      )}
                    >
                      <config.icon size={16} />
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full">
          {viewMode === 'editor' && <EditorView />}
          {viewMode === 'mindmap' && <MindmapView />}
          {viewMode === 'presentation' && <PresentationView />}
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="border-t bg-background/90 backdrop-blur-sm py-1 px-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>视图: {viewConfigs[viewMode].label}</span>
            {filePath && <span>文件: {filePath.split('/').pop()}</span>}
          </div>
          <div className="flex items-center gap-4">
            <span>{isDirty ? '未保存' : '已保存'}</span>
            <span>Axon v0.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
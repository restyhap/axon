/**
 * 编辑器视图组件（左侧导航区）
 * 
 * 支持两种模式：
 * 1. 分割模式（宽度 ≥ 400px）：左侧显示目录树，右侧显示选中目录下的文档列表
 * 2. 混合模式（宽度 < 400px）：显示目录和文档的混合树形视图
 */
import React, { useState, useEffect, useRef } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useResizableStore } from '@/stores/resizable';
import { FolderTreePanel } from './components/FolderTreePanel';
import { FileListPanel } from './components/FileListPanel';
import MixedNavigationView from './components/MixedNavigationView';

interface EditorViewProps {
  /** 自动切换模式的宽度阈值（默认 400px） */
  autoSwitchThreshold?: number;
}

const EditorView: React.FC<EditorViewProps> = ({ autoSwitchThreshold = 400 }) => {
  const { setLayoutSizes } = useResizableStore();
  
  const [isNarrowMode, setIsNarrowMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoSwitchThreshold) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setIsNarrowMode(width < autoSwitchThreshold);
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [autoSwitchThreshold]);

  const handleLayoutChange = (layout: { [id: string]: number }) => {
    const leftPercent = layout['folder'] ?? 50;
    setLayoutSizes('editor', { leftSize: leftPercent, rightSize: 100 - leftPercent });
  };

  // 窄屏模式：混合视图
  if (isNarrowMode) {
    return (
      <div ref={containerRef} className="h-full w-full overflow-hidden">
        <MixedNavigationView />
      </div>
    );
  }

  // 宽屏模式：分割视图
  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        defaultLayout={{ folder: 50, file: 50 }}
        onLayoutChange={handleLayoutChange}
      >
        {/* 左：目录树 */}
        <ResizablePanel id="folder" minSize={120} maxSize="70%">
          <FolderTreePanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* 右：文档列表 */}
        <ResizablePanel id="file" minSize={120}>
          <FileListPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default EditorView;

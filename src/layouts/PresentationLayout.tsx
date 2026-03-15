/**
 * 演示布局组件
 * 提供全屏演示模式布局，顶部可拖动调整与文档布局同步
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useResizableStore } from '@/stores/resizable';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { usePanelWidth } from '@/hooks/use-panel-width';

/** 演示布局组件 */
const PresentationLayout: React.FC = () => {
  const { getLayoutSizes, setLayoutSizes } = useResizableStore();
  const savedSizes = getLayoutSizes('document');
  const { panelWidth: leftPanelWidth, panelRef: leftPanelRef } = usePanelWidth();
  const { panelWidth: containerWidth, panelRef: containerRef } = usePanelWidth();
  const leftMinSize = containerWidth > 0 && containerWidth * 0.5 < 240 ? '50%' : 240;
  
  // 控制分割线显示状态
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleLayoutChange = useCallback(
    (layout: { [id: string]: number }) => {
      let nextLeftPercent = layout['left'] ?? savedSizes.leftSize;

      if (containerWidth > 0) {
        const maxLeftPx = containerWidth * 0.5;
        const minLeftPx = Math.min(240, maxLeftPx);
        const nextLeftPx = (nextLeftPercent / 100) * containerWidth;
        const clampedLeftPx = Math.min(maxLeftPx, Math.max(minLeftPx, nextLeftPx));
        nextLeftPercent = (clampedLeftPx / containerWidth) * 100;
      }

      if (nextLeftPercent > 50) nextLeftPercent = 50;
      const rightSize = 100 - nextLeftPercent;
      // 更新 document 的宽度，保持一致
      setLayoutSizes('document', { leftSize: nextLeftPercent, rightSize });
    },
    [savedSizes, setLayoutSizes, containerWidth]
  );

  useEffect(() => {
    if (containerWidth <= 0) return;

    const maxLeftPx = containerWidth * 0.5;
    const minLeftPx = Math.min(240, maxLeftPx);
    const savedLeftPx = (savedSizes.leftSize / 100) * containerWidth;
    const clampedLeftPx = Math.min(maxLeftPx, Math.max(minLeftPx, savedLeftPx));
    const nextLeftPercent = (clampedLeftPx / containerWidth) * 100;
    const nextRightPercent = 100 - nextLeftPercent;

    if (
      Math.abs(nextLeftPercent - savedSizes.leftSize) > 0.05 ||
      Math.abs(nextRightPercent - savedSizes.rightSize) > 0.05
    ) {
      setLayoutSizes('document', { leftSize: nextLeftPercent, rightSize: nextRightPercent });
    }
  }, [containerWidth, savedSizes.leftSize, savedSizes.rightSize, setLayoutSizes]);

  return (
    <div className="relative h-full w-screen bg-background">
      {/* 顶部可拖动区域 - 只有标题栏高度 */}
      <div className="absolute top-0 left-0 right-0 z-50 h-8 overflow-visible">
        <div ref={containerRef} className="h-full">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full"
            defaultLayout={{ left: savedSizes.leftSize, right: savedSizes.rightSize }}
            onLayoutChange={handleLayoutChange}
          >
            {/* 左侧：标题栏 - 演示模式 */}
            <ResizablePanel
              id="left"
              minSize={leftMinSize}
              maxSize="50%"
              className="h-full overflow-visible"
            >
              <div ref={leftPanelRef} className="h-full overflow-visible">
                <HeaderBar panelWidth={leftPanelWidth} showViewSwitcher={true} variant="presentation" />
              </div>
            </ResizablePanel>

            {/* 自定义分割线 - 仅在 hover 和拖拽时显示 */}
            <div
              className="relative flex w-1 items-center justify-center cursor-col-resize"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <ResizableHandle
                withHandle
                className={`h-8 transition-opacity duration-150 ${
                  isHovering || isResizing ? 'opacity-100' : 'opacity-0'
                }`}
                onDragging={(isDragging) => setIsResizing(isDragging)}
              />
            </div>

            {/* 右侧：空白（与左侧对齐） */}
            <ResizablePanel id="right" minSize="50%" className="h-full">
              <div className="h-full bg-background" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* 全屏演示内容区域 */}
      <div className="h-full w-full pt-8">
        <Outlet />
      </div>
    </div>
  );
};

export default PresentationLayout;

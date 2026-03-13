/**
 * 文档布局组件
 * 提供左侧导航区和右侧编辑区的可调整布局
 * 支持拖动调整面板宽度，并持久化保存布局配置
 */
import React, { useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useResizableStore } from '@/stores/resizable';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { usePanelWidth } from '@/hooks/use-panel-width';
import { useTranslation } from 'react-i18next';

/** 文档布局组件 */
const DocumentLayout: React.FC = () => {
  const { t } = useTranslation();
  const { getLayoutSizes, setLayoutSizes } = useResizableStore();
  const savedSizes = getLayoutSizes('document');
  const { panelWidth: leftPanelWidth, panelRef: leftPanelRef } = usePanelWidth();
  const { panelWidth: containerWidth, panelRef: containerRef } = usePanelWidth();
  const leftMinSize = containerWidth > 0 && containerWidth * 0.5 < 240 ? '50%' : 240;

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
    <div className="flex flex-col h-screen bg-background">
      {/* 中间操作区 - 可拖动布局 */}
      <div ref={containerRef} className="flex-1">
        <ResizablePanelGroup
          orientation="horizontal"
          defaultLayout={{ left: savedSizes.leftSize, right: savedSizes.rightSize }}
          onLayoutChange={handleLayoutChange}
        >
          {/* 左侧操作区 */}
          <ResizablePanel
            id="left"
            minSize={leftMinSize}
            maxSize="50%"
          >
            <div ref={leftPanelRef} className="h-full w-full flex flex-col border-r">
              {/* 左上：标题栏 - 文档模式 */}
              <HeaderBar panelWidth={leftPanelWidth} showViewSwitcher={true} variant="document" />
              {/* 左下：导航区 */}
              <div className="flex-1 p-4">
                <p className="text-muted-foreground">{t('layout.navigation')}</p>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="w-1 bg-border"
          />

          {/* 右侧操作区 */}
          <ResizablePanel id="right" minSize="50%">
            <div className="h-full w-full flex flex-col">
              {/* 右上：空白标题栏（与左侧对齐） */}
              <div data-tauri-drag-region className="h-8 bg-background shadow-[inset_0_-1px_0_0_var(--border)]" />
              {/* 右下：文档编辑区 */}
              <div className="flex-1">
                <Outlet />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* 底部区域 */}
      <div className="h-8 bg-background border-t flex items-center justify-between px-4 text-xs text-muted-foreground">
        <span>{t('layout.footer')}</span>
      </div>
    </div>
  );
};

export default DocumentLayout;

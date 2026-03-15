/**
 * 脑图工具栏组件
 * 提供：适应视图、放大、缩小 操作按钮
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MindmapToolbarProps {
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ToolBtn: React.FC<{
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      'inline-flex items-center justify-center size-7 rounded-md transition-colors shrink-0',
      'text-muted-foreground hover:bg-accent hover:text-foreground'
    )}
  >
    {children}
  </button>
);

export const MindmapToolbar: React.FC<MindmapToolbarProps> = ({
  onFit,
  onZoomIn,
  onZoomOut,
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 p-1 rounded-lg border bg-background/90 backdrop-blur-sm shadow-md">
      <ToolBtn onClick={onZoomOut} title={t('mindmap.zoomOut')}>
        <ZoomOut size={14} />
      </ToolBtn>
      <ToolBtn onClick={onFit} title={t('mindmap.fit')}>
        <Maximize2 size={13} />
      </ToolBtn>
      <ToolBtn onClick={onZoomIn} title={t('mindmap.zoomIn')}>
        <ZoomIn size={14} />
      </ToolBtn>
    </div>
  );
};

export default MindmapToolbar;

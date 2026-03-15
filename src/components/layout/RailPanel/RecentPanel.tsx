/**
 * 最近面板组件
 */
import React from 'react';
import { X } from 'lucide-react';

interface RecentPanelProps {
  onClose?: () => void;
}

export const RecentPanel: React.FC<RecentPanelProps> = ({ onClose }) => {
  return (
    <div className="h-full w-full bg-background flex flex-col">
      <div className="h-8 flex items-center justify-between px-3 border-b">
        <span className="text-sm font-medium">最近面板</span>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center size-5 rounded-sm transition-colors text-muted-foreground/70 hover:bg-destructive/15 hover:text-destructive"
            aria-label="关闭面板"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        最近内容区域
      </div>
    </div>
  );
};

export default RecentPanel;

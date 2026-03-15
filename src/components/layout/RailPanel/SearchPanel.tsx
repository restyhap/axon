/**
 * 搜索面板组件
 */
import React from 'react';
import { X } from 'lucide-react';

interface SearchPanelProps {
  onClose?: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onClose }) => {
  return (
    <div className="h-full w-full bg-background flex flex-col">
      <div className="h-8 flex items-center justify-between px-3 border-b">
        <span className="text-sm font-medium">搜索面板</span>
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
        搜索内容区域
      </div>
    </div>
  );
};

export default SearchPanel;

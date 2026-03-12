import React, { useState } from 'react';
import { TabItem } from './TabItem';

interface TabGroupItem {
  id: string;
  label: string;
  isActive: boolean;
}

interface TabGroupProps {
  items: TabGroupItem[];
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  className?: string;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  items,
  onSelectTab,
  onCloseTab,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState<TabGroupItem[]>([]);
  const [hiddenItems, setHiddenItems] = useState<TabGroupItem[]>([]);

  React.useEffect(() => {
    // 简单逻辑：显示前3个标签，其余放入下拉菜单
    if (items.length > 3) {
      setVisibleItems(items.slice(0, 3));
      setHiddenItems(items.slice(3));
    } else {
      setVisibleItems(items);
      setHiddenItems([]);
    }
  }, [items]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {visibleItems.map((item) => (
        <TabItem
          key={item.id}
          label={item.label}
          isActive={item.isActive}
          onClose={() => onCloseTab(item.id)}
          onSelect={() => onSelectTab(item.id)}
        />
      ))}
      
      {hiddenItems.length > 0 && (
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="px-3 py-2 rounded-md bg-bg-tertiary border border-border text-text-secondary hover:bg-bg"
          >
            ⋯
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-bg-secondary border border-border rounded-md shadow-lg z-10">
              <div className="py-1">
                {hiddenItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-bg-tertiary rounded"
                  >
                    <span 
                      className={item.isActive ? 'font-medium text-text' : 'text-text'}
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {item.label}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(item.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-4 h-4 flex items-center justify-center rounded hover:bg-bg"
                    >
                      <span className="text-xs text-text-muted">×</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

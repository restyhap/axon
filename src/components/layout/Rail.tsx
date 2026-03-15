/**
 * Rail 导航栏组件
 * 显示在最左侧的垂直导航栏，提供快速访问功能
 * 只在 Editor 模式下显示
 */
import React from 'react';
import { Notebook, Search, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type RailItemType = 'notebook' | 'search' | 'star' | 'recent' | 'graph';

interface RailItem {
  id: RailItemType;
  icon: React.ReactNode;
  label: string;
}

interface RailProps {
  onItemClick?: (item: RailItemType) => void;
}

const railItems: RailItem[] = [
  { id: 'notebook', icon: <Notebook size={16} />, label: '笔记本' },
  { id: 'search', icon: <Search size={16} />, label: '搜索' },
  { id: 'star', icon: <Star size={16} />, label: '收藏' },
  { id: 'recent', icon: <Clock size={16} />, label: '最近' },
  // { id: 'graph', icon: <Network size={16} />, label: '图谱' },
];

export const Rail: React.FC<RailProps> = ({ onItemClick }) => {
  return (
    <div className="flex flex-col h-full w-[46px] bg-muted/30 border-r shrink-0 py-2.5 px-[7px] gap-2.5">
      {railItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="icon"
          onClick={() => onItemClick?.(item.id)}
          title={item.label}
          className="rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {item.icon}
        </Button>
      ))}
    </div>
  );
};

export default Rail;

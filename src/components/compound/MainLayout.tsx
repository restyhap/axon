import React from 'react';
import { Button } from '../base/Button';
import { TabGroup } from '../base/TabGroup';
import { ResizableDivider } from '../base/ResizableDivider';

interface Tab {
  id: string;
  label: string;
  isActive: boolean;
}

interface MainLayoutProps {
  activeView: 'document' | 'mindmap';
  onViewChange: (view: 'document' | 'mindmap') => void;
  tabs: Tab[];
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeView,
  onViewChange,
  tabs,
  onSelectTab,
  onCloseTab,
  children
}) => {
  return (
    <div className="flex flex-col h-screen">
      {/* TitleBar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h1 className="text-lg font-bold text-text">Axon</h1>
        <div className="flex gap-2">
          <Button
            variant={activeView === 'document' ? 'active' : 'inactive'}
            onClick={() => onViewChange('document')}
          >
            文档
          </Button>
          <Button
            variant={activeView === 'mindmap' ? 'active' : 'inactive'}
            onClick={() => onViewChange('mindmap')}
          >
            脑图
          </Button>
          <Button
            variant="inactive"
            onClick={() => {}}
          >
            演示
          </Button>
        </div>
        <ResizableDivider orientation="vertical" />
        <div className="flex items-center">
          <TabGroup
            items={tabs}
            onSelectTab={onSelectTab}
            onCloseTab={onCloseTab}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

/**
 * 测试分隔条拖拽功能的组件
 */
const TestDragComponent: React.FC = () => {
  const handleLayoutChange = (layout: { [id: string]: number }) => {
    console.log('Layout changed:', layout);
  };

  return (
    <div className="h-64 w-full border">
      <h3 className="text-sm font-medium px-4 py-2 border-b">测试分隔条拖拽</h3>
      <ResizablePanelGroup
        orientation="horizontal"
        defaultLayout={{ left: 30, right: 70 }}
        onLayoutChange={handleLayoutChange}
        className="h-48"
      >
        <ResizablePanel id="left" minSize={100} defaultSize={30}>
          <div className="h-full bg-blue-50 p-4">
            <p>左侧面板</p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel id="right" minSize={100} defaultSize={70}>
          <div className="h-full bg-green-50 p-4">
            <p>右侧面板</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default TestDragComponent;
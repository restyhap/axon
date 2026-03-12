import React from 'react';
import { Button } from '../base/Button';

interface ShowcaseLayoutProps {
  children: React.ReactNode;
}

export const ShowcaseLayout: React.FC<ShowcaseLayoutProps> = ({
  children
}) => {
  return (
    <div className="flex flex-col h-screen">
      {/* TitleBar (精简版) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h1 className="text-lg font-bold text-text">Axon</h1>
        <div className="flex gap-2">
          <Button
            variant="inactive"
            onClick={() => {}}
          >
            文档
          </Button>
          <Button
            variant="inactive"
            onClick={() => {}}
          >
            脑图
          </Button>
          <Button
            variant="active"
            onClick={() => {}}
          >
            演示
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

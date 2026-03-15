import React from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

/**
 * 应用根布局
 * 使用系统标题栏透明样式，背景色与主题同步
 */
const AppLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
      <div className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;

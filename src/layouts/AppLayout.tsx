import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * 应用根布局
 * 使用系统标题栏透明样式，背景色与主题同步
 */
const AppLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background shadow-[inset_0_-1px_0_0_var(--border)] ">
      <Outlet />
    </div>
  );
};

export default AppLayout;

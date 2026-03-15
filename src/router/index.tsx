/**
 * 路由配置文件
 * 定义应用的路由结构和导航规则
 *
 * 布局说明：
 * - /document : 文档模式，左侧根据 viewMode store 切换编辑器/脑图，右侧固定知识库
 * - /presentation : 演示模式，独立全屏布局
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import DocumentLayout from '@/layouts/DocumentLayout';
import PresentationLayout from '@/layouts/PresentationLayout';
import PresentationView from '@/features/presentation';
import SettingsView from '@/features/settings';
import TestDragComponent from '@/components/TestDragComponent';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/document" replace />,
      },
      {
        // 文档模式：editor / mindmap 视图由 DocumentLayout 内部通过 viewMode store 控制
        path: 'document',
        element: <DocumentLayout />,
      },
      {
        path: 'settings',
        element: <SettingsView />,
      },
      {
        // 演示模式：独立全屏布局
        path: 'presentation',
        element: <PresentationLayout />,
        children: [
          {
            index: true,
            element: <PresentationView />,
          },
        ],
      },
      {
        // 测试分隔条拖拽功能
        path: 'test-drag',
        element: <TestDragComponent />,
      },
    ],
  },
]);

export default router;

/**
 * 路由配置文件
 * 定义应用的路由结构和导航规则
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import DocumentLayout from '@/layouts/DocumentLayout';
import PresentationLayout from '@/layouts/PresentationLayout';
import EditorView from '@/features/editor';
import MindmapView from '@/features/mindmap';
import PresentationView from '@/features/presentation';

/**
 * 应用路由配置
 * - / : 根路径，重定向到文档编辑器
 * - /document : 文档模式，包含编辑器和脑图视图
 * - /presentation : 演示模式
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/document/editor" replace />,
      },
      {
        path: 'document',
        element: <DocumentLayout />,
        children: [
          {
            path: 'editor',
            element: <EditorView />,
          },
          {
            path: 'mindmap',
            element: <MindmapView />,
          },
        ],
      },
      {
        path: 'presentation',
        element: <PresentationLayout />,
        children: [
          {
            index: true,
            element: <PresentationView />,
          },
        ],
      },
    ],
  },
]);

export default router;

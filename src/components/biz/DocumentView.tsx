import React from 'react';
import { ResizableDivider } from '../base/ResizableDivider';

interface DocumentViewProps {
  className?: string;
}

export const DocumentView: React.FC<DocumentViewProps> = ({
  className = ''
}) => {
  return (
    <div className={`flex h-full ${className}`}>
      {/* 左侧导航面板 */}
      <div className="flex w-140">
        {/* 目录栏 */}
        <div className="w-50 bg-bg-secondary border-r border-border p-4">
          <h3 className="text-xs font-semibold text-text-secondary mb-4">目录</h3>
          <ul className="space-y-2">
            <li className="text-sm font-medium text-accent">● 一、项目概述</li>
            <li className="text-sm text-text">  二、技术架构</li>
            <li className="text-sm text-text">  三、功能需求</li>
            <li className="text-sm text-text">  四、非功能性需求</li>
            <li className="text-sm text-text">  五、数据模型</li>
          </ul>
        </div>
        
        {/* 文档预览 */}
        <div className="flex-1 bg-bg-tertiary p-6">
          <h1 className="text-xl font-bold text-text mb-4">项目需求分析</h1>
          <h2 className="text-lg font-semibold text-text mb-2">一、项目概述</h2>
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Axon 是一款基于 Tauri v2 + React 19 构建的跨平台个人代码知识库桌面应用。
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            它提供「一份 Markdown，多种视图」的文档处理体验，并通过 MCP 协议将个人知识库暴露给外部 AI 工具。
          </p>
        </div>
      </div>
      
      {/* 可拖拽分隔线 */}
      <ResizableDivider orientation="vertical" />
      
      {/* 右侧编辑器面板 */}
      <div className="flex-1 bg-bg p-6 flex flex-col gap-4">
        {/* 编辑器工具栏 */}
        <div className="flex items-center gap-4 bg-bg-secondary p-2 rounded-md">
          <button className="font-bold text-text-secondary">B</button>
          <button className="italic text-text-secondary">I</button>
          <button className="text-xs text-text-secondary">{'</>'}</button>
          <button className="text-sm text-text-secondary">🔗</button>
        </div>
        
        {/* 编辑区域 */}
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold text-text"># 项目需求分析</h1>
          <h2 className="text-xl font-semibold text-text">## 一、项目概述</h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Axon 是一款基于 Tauri v2 + React 19 构建的<strong>跨平台个人代码知识库桌面应用</strong>。它提供「一份 Markdown，多种视图」的文档处理体验...
          </p>
          {/* 光标 */}
          <div className="w-0.5 h-5 bg-accent inline-block animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

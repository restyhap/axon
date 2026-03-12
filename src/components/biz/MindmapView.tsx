import React from 'react';
import { ResizableDivider } from '../base/ResizableDivider';

interface MindmapViewProps {
  className?: string;
}

export const MindmapView: React.FC<MindmapViewProps> = ({
  className = ''
}) => {
  return (
    <div className={`flex h-full ${className}`}>
      {/* 左侧思维导图面板 */}
      <div className="w-160 bg-bg-secondary flex flex-col items-center justify-center">
        <div className="text-xs text-text-muted mb-4">Markmap / ReactFlow Canvas</div>
        
        {/* 中心节点 */}
        <div className="w-36 h-12 bg-mindmap-node-bg border-2 border-accent rounded-full flex items-center justify-center mb-8">
          <span className="text-sm font-semibold text-accent">Axon 项目</span>
        </div>
        
        {/* 分支节点组 */}
        <div className="flex flex-col gap-6">
          <div className="w-24 h-8 bg-bg border border-border rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-text">技术架构</span>
          </div>
          <div className="w-24 h-8 bg-bg border border-border rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-text">功能需求</span>
          </div>
          <div className="w-24 h-8 bg-bg border border-border rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-text">数据模型</span>
          </div>
        </div>
      </div>
      
      {/* 可拖拽分隔线 */}
      <ResizableDivider orientation="vertical" />
      
      {/* 右侧编辑器面板 */}
      <div className="flex-1 bg-bg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-text"># 项目需求分析</h1>
        <h2 className="text-xl font-semibold text-text">## 一、项目概述</h2>
        <p className="text-base text-text-secondary leading-relaxed">
          Axon 是一款基于 Tauri v2 + React 19 构建的<strong>跨平台个人代码知识库桌面应用</strong>...
        </p>
      </div>
    </div>
  );
};

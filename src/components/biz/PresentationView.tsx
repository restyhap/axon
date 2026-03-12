import React from 'react';

interface PresentationViewProps {
  className?: string;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  className = ''
}) => {
  return (
    <div className={`h-full ${className}`}>
      {/* 演示文稿内容 */}
      <div className="h-full flex flex-col items-center justify-center bg-bg">
        <div className="w-4/5 max-w-4xl bg-bg-tertiary p-12 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-text text-center mb-8">项目需求分析</h1>
          <h2 className="text-2xl font-semibold text-text mb-6">一、项目概述</h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Axon 是一款基于 Tauri v2 + React 19 构建的跨平台个人代码知识库桌面应用。
          </p>
          <p className="text-lg text-text-secondary leading-relaxed mt-4">
            它提供「一份 Markdown，多种视图」的文档处理体验，并通过 MCP 协议将个人知识库暴露给外部 AI 工具。
          </p>
        </div>
      </div>
    </div>
  );
};

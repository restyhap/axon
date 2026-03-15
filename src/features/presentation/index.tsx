/**
 * 演示文稿视图组件
 *
 * 布局：
 *   左侧：幻灯片导航侧栏（SlidePanel）
 *   右侧：reveal.js 渲染区域
 *
 * 数据来源：
 *   - 读取 activeTab 对应的 .md 文件
 *   - isDirty 时优先使用 document store 内存内容（与编辑器实时同步）
 *   - 用 `---` 分水平页，`--` 分垂直页
 *
 * 工具栏（右下角浮动）：
 *   上一张 / 下一张 / 全屏
 */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { readTextFile } from '@tauri-apps/plugin-fs';
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Presentation,
} from 'lucide-react';
import { useTabsStore } from '@/stores/tabs';
import { useDocumentStore } from '@/stores/document';
import { useReveal } from './hooks/useReveal';
import { cn } from '@/lib/utils';

// ── reveal.js CSS ──────────────────────────────────────────
// 需要在全局 CSS 中引入，这里通过动态 import 按需加载
import 'reveal.js/dist/reveal.css';
import './custom-reveal-theme.css';

// ── 工具栏按钮 ─────────────────────────────────────────────
const ToolBtn: React.FC<{
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={cn(
      'inline-flex items-center justify-center size-8 rounded-md transition-colors shrink-0',
      'text-white/70 hover:bg-white/10 hover:text-white',
      disabled && 'opacity-30 cursor-not-allowed'
    )}
  >
    {children}
  </button>
);

// ── 主组件 ────────────────────────────────────────────────
const PresentationView: React.FC = () => {
  const { t } = useTranslation();
  const { tabs, activeTabId } = useTabsStore();
  const { content: storeContent, isDirty } = useDocumentStore();

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 切换 tab 时读取文件内容
  useEffect(() => {
    if (!activeTab?.filePath) {
      setFileContent('');
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    readTextFile(activeTab.filePath)
      .then((text) => { if (!cancelled) setFileContent(text); })
      .catch(() => { if (!cancelled) setFileContent(''); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTabId, activeTab?.filePath]);

  // 内容优先级：isDirty 时用 store 内存内容，否则用磁盘文件内容
  const content = isDirty && storeContent ? storeContent : fileContent;

  const {
    containerRef,
    slides,
    currentH,
    currentV,
    prev,
    next,
    toggleFullscreen,
    isFullscreen,
  } = useReveal({ content });

  // 空状态
  if (!activeTab) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
        <Presentation size={36} className="opacity-40" />
        <div className="text-center">
          <p className="text-sm font-medium">{t('presentation.empty')}</p>
          <p className="text-xs mt-1 opacity-70">{t('presentation.emptyHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      {/* ── 演示区域 ── */}
      <div className="h-full relative overflow-hidden bg-background">
        {/* 加载遮罩 */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
            <div className="size-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </div>
        )}

        {/* reveal.js 容器 */}
        <div
          ref={containerRef}
          className="reveal w-full h-full"
        >
          <div className="slides" />
        </div>

        {/* 浮动控制栏（右下角） */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 p-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
          <ToolBtn onClick={prev} title={t('presentation.prev')}>
            <ChevronLeft size={16} />
          </ToolBtn>
          <ToolBtn onClick={next} title={t('presentation.next')}>
            <ChevronRight size={16} />
          </ToolBtn>
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <ToolBtn onClick={toggleFullscreen} title={isFullscreen ? t('presentation.exitFullscreen') : t('presentation.fullscreen')}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </ToolBtn>
        </div>

        {/* 幻灯片计数（左下角） */}
        <div className="absolute bottom-4 left-4 z-10 text-[11px] text-white/30 select-none pointer-events-none tabular-nums">
          {slides.length > 0
            ? `${slides.findIndex((s) => s.h === currentH && s.v === currentV) + 1} / ${slides.length}`
            : null}
        </div>
      </div>
    </div>
  );
};

export default PresentationView;

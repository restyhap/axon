/**
 * 幻灯片导航侧栏
 * 显示所有幻灯片的标题列表，点击跳转，高亮当前幻灯片
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Presentation, GalleryVerticalEnd } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideInfo {
  h: number;
  v: number;
  title: string;
}

interface SlidePanelProps {
  slides: SlideInfo[];
  currentH: number;
  currentV: number;
  onGoTo: (h: number, v: number) => void;
  /** 当前文件标题 */
  fileTitle?: string;
}

export const SlidePanel: React.FC<SlidePanelProps> = ({
  slides,
  currentH,
  currentV,
  onGoTo,
  fileTitle,
}) => {
  const { t } = useTranslation();

  // 统计总幻灯片数
  const totalSlides = slides.length;
  // 当前第几张（从1开始）
  const currentIndex = slides.findIndex((s) => s.h === currentH && s.v === currentV);
  const currentNumber = currentIndex + 1;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 标题栏 */}
      <div className="h-8 flex items-center gap-1.5 px-3 shrink-0 border-b">
        <GalleryVerticalEnd size={12} className="text-muted-foreground opacity-70 shrink-0" />
        <span className="text-xs font-medium text-muted-foreground truncate flex-1">
          {fileTitle || t('presentation.slides')}
        </span>
        {totalSlides > 0 && (
          <span className="text-[10px] text-muted-foreground/50 shrink-0 tabular-nums">
            {currentNumber}/{totalSlides}
          </span>
        )}
      </div>

      {/* 幻灯片列表 */}
      <div className="flex-1 overflow-y-auto py-1">
        {slides.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
            <Presentation size={22} />
            <span className="text-xs">{t('presentation.noSlides')}</span>
          </div>
        ) : (
          slides.map((slide, idx) => {
            const isActive = slide.h === currentH && slide.v === currentV;
            const isVertical = slide.v > 0;
            return (
              <div
                key={`${slide.h}-${slide.v}`}
                onClick={() => onGoTo(slide.h, slide.v)}
                className={cn(
                  'flex items-center gap-2 h-7 cursor-pointer select-none transition-colors',
                  isVertical ? 'pl-7 pr-3' : 'px-3',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                )}
                title={slide.title}
              >
                {/* 序号 */}
                <span
                  className={cn(
                    'text-[10px] tabular-nums shrink-0 w-5 text-right',
                    isActive ? 'text-primary/70' : 'text-muted-foreground/40'
                  )}
                >
                  {idx + 1}
                </span>
                {/* 垂直分页标记 */}
                {isVertical && (
                  <span className="size-1 rounded-full bg-current opacity-30 shrink-0" />
                )}
                {/* 标题 */}
                <span className="text-xs truncate flex-1">{slide.title}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SlidePanel;

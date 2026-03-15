/**
 * useReveal Hook
 * 封装 reveal.js 实例的创建、内容更新、导航逻辑
 * 将 Markdown 文本（--- 分页）转换为 reveal.js 幻灯片
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import Reveal from 'reveal.js';

interface SlideInfo {
  /** 幻灯片水平索引 */
  h: number;
  /** 幻灯片垂直索引 */
  v: number;
  /** 幻灯片标题（第一行 # 标题，或首行文字） */
  title: string;
}

interface UseRevealOptions {
  /** Markdown 内容 */
  content: string;
  /** 幻灯片切换回调 */
  onSlideChange?: (h: number, v: number) => void;
}

interface UseRevealResult {
  /** 挂载 reveal 容器的 div ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 所有幻灯片信息列表 */
  slides: SlideInfo[];
  /** 当前幻灯片索引 */
  currentH: number;
  currentV: number;
  /** 跳转到指定幻灯片 */
  goTo: (h: number, v: number) => void;
  /** 上一张 / 下一张 */
  prev: () => void;
  next: () => void;
  /** 进入/退出全屏 */
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

/**
 * 从 Markdown 内容解析幻灯片列表
 * 水平分页：`---`（三个横线独占一行）
 * 垂直分页：`--`（两个横线独占一行）
 */
function parseSlides(md: string): SlideInfo[] {
  const hSections = md.split(/^---\s*$/m);
  const slides: SlideInfo[] = [];

  hSections.forEach((hSection, h) => {
    const vSections = hSection.split(/^--\s*$/m);
    vSections.forEach((vSection, v) => {
      const lines = vSection.trim().split('\n');
      // 取第一个非空行作为标题
      let title = `幻灯片 ${slides.length + 1}`;
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // 去掉 Markdown 标题符号
        title = trimmed.replace(/^#{1,6}\s+/, '').slice(0, 40);
        break;
      }
      slides.push({ h, v, title });
    });
  });

  return slides;
}

/**
 * 将 Markdown 内容转换为 reveal.js 的 HTML 结构
 * 水平 slide 用 <section>，垂直 slide 嵌套 <section>
 */
function buildRevealHTML(md: string): string {
  const hSections = md.split(/^---\s*$/m);

  return hSections
    .map((hSection) => {
      const vSections = hSection.split(/^--\s*$/m);
      if (vSections.length === 1) {
        // 单层 slide
        const escaped = encodeMarkdown(hSection.trim());
        return `<section data-markdown><textarea data-template>${escaped}</textarea></section>`;
      }
      // 多层嵌套 slide
      const inner = vSections
        .map((v) => {
          const escaped = encodeMarkdown(v.trim());
          return `<section data-markdown><textarea data-template>${escaped}</textarea></section>`;
        })
        .join('\n');
      return `<section>${inner}</section>`;
    })
    .join('\n');
}

/** 对 textarea 内容进行最小转义（防止 </textarea> 破坏结构） */
function encodeMarkdown(md: string): string {
  return md.replace(/<\/textarea>/gi, '<\\/textarea>');
}

export function useReveal({ content, onSlideChange }: UseRevealOptions): UseRevealResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<InstanceType<typeof Reveal> | null>(null);
  const [slides, setSlides] = useState<SlideInfo[]>([]);
  const [currentH, setCurrentH] = useState(0);
  const [currentV, setCurrentV] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const onSlideChangeRef = useRef(onSlideChange);

  useEffect(() => {
    onSlideChangeRef.current = onSlideChange;
  }, [onSlideChange]);

  // 监听全屏变化
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // 内容变化时重新构建幻灯片
  useEffect(() => {
    const md = content?.trim() || '# 暂无内容\n\n请在编辑器中打开 Markdown 文件';
    const parsed = parseSlides(md);
    setSlides(parsed);

    const slidesContainer = containerRef.current?.querySelector('.slides');
    if (!slidesContainer) return;

    // 更新 HTML
    slidesContainer.innerHTML = buildRevealHTML(md);

    if (deckRef.current) {
      // 同步最新幻灯片内容
      deckRef.current.sync();
      deckRef.current.slide(0, 0);
      setCurrentH(0);
      setCurrentV(0);
    }
  }, [content]);

  // 初始化 reveal.js
  useEffect(() => {
    if (!containerRef.current) return;
    if (deckRef.current) return;

    const md = content?.trim() || '# 暂无内容\n\n请在编辑器中打开 Markdown 文件';
    const parsed = parseSlides(md);
    setSlides(parsed);

    const slidesEl = containerRef.current.querySelector('.slides');
    if (slidesEl) {
      slidesEl.innerHTML = buildRevealHTML(md);
    }

    const deck = new Reveal(containerRef.current, {
      embedded: true,          // 嵌入模式（非全屏占用整个视口）
      margin: 0.08,
      width: '100%',
      height: '100%',
      minScale: 0.2,
      maxScale: 2.0,
      controls: true,
      controlsTutorial: false,
      progress: true,
      slideNumber: 'c/t',
      hash: false,
      history: false,
      keyboard: true,
      overview: true,
      center: true,
      touch: true,
      loop: false,
      rtl: false,
      shuffle: false,
      fragments: true,
      fragmentInURL: false,
      help: true,
      showNotes: false,
      autoPlayMedia: null,
      preloadIframes: null,
      autoAnimate: true,
      autoAnimateMatcher: null,
      autoAnimateEasing: 'ease',
      autoAnimateDuration: 1.0,
      autoAnimateUnmatched: true,
      autoSlide: 0,
      autoSlideStoppable: true,
      autoSlideMethod: null,
      defaultTiming: null,
      mouseWheel: false,
      previewLinks: false,
      postMessage: false,
      postMessageEvents: false,
      focusBodyOnPageVisibilityChange: true,
      transition: 'slide',
      transitionSpeed: 'default',
      backgroundTransition: 'fade',
      pdfMaxPagesPerSlide: 1,
      pdfSeparateFragments: true,
      pdfPageHeightOffset: -1,
      viewDistance: 3,
      mobileViewDistance: 2,
      display: 'flex',
      hideInactiveCursor: true,
      hideCursorTime: 5000,
      // Markdown 插件内置于 reveal.js core，无需额外引入
      markdown: {
        smartypants: false,
      },
    });

    deck.on('slidechanged', (event: Event) => {
      const e = event as Event & { indexh: number; indexv: number };
      setCurrentH(e.indexh);
      setCurrentV(e.indexv);
      onSlideChangeRef.current?.(e.indexh, e.indexv);
    });

    deck.initialize().then(() => {
      deckRef.current = deck;
    });

    return () => {
      deckRef.current?.destroy();
      deckRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = useCallback((h: number, v: number) => {
    deckRef.current?.slide(h, v);
  }, []);

  const prev = useCallback(() => {
    deckRef.current?.prev();
  }, []);

  const next = useCallback(() => {
    deckRef.current?.next();
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return {
    containerRef,
    slides,
    currentH,
    currentV,
    goTo,
    prev,
    next,
    toggleFullscreen,
    isFullscreen,
  };
}

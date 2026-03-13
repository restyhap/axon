/**
 * 标题栏组件
 * 显示应用标题、视图切换器和主题切换按钮
 * 支持根据面板宽度自动切换紧凑模式
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sun, Moon, Languages } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Button } from '@/components/ui/button';
import { ViewSwitcher } from './ViewSwitcher';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

/** 支持的语言列表 */
const LANGUAGES = [
  { code: 'zh', label: '中文', nativeLabel: '中文' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ko', label: '한국어', nativeLabel: '한국어' },
  { code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch' },
  { code: 'ru', label: 'Русский', nativeLabel: 'Русский' },
  { code: 'fr', label: 'Français', nativeLabel: 'Français' },
  { code: 'es', label: 'Español', nativeLabel: 'Español' },
  { code: 'pt', label: 'Português', nativeLabel: 'Português' },
];

/** 标题栏属性 */
interface HeaderBarProps {
  /** 面板宽度（用于计算紧凑模式） */
  panelWidth?: number;
  /** 是否显示视图切换器 */
  showViewSwitcher?: boolean;
  /** 标题栏变体：文档模式或演示模式 */
  variant?: 'document' | 'presentation';
}

/** 标题栏组件 */
export const HeaderBar: React.FC<HeaderBarProps> = ({
  panelWidth,
  showViewSwitcher = true,
  variant = 'document',
}) => {
  const { t, i18n } = useTranslation();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [langMenuPosition, setLangMenuPosition] = useState({ top: 0, right: 0, minWidth: 0 });
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [isCompact, setIsCompact] = useState(false);
  const [expandedWidth, setExpandedWidth] = useState(0);
  const switcherContainerRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language || 'zh';

  const updateCompactMode = useCallback(() => {
    if (!showViewSwitcher) return;
    if (!switcherContainerRef.current) return;
    const element = switcherContainerRef.current;
    const availableWidth = element.clientWidth;
    if (availableWidth <= 0 || expandedWidth <= 0) return;
    setIsCompact((prev) => {
      const enterCompactDelta = 8;
      const exitCompactDelta = 32;
      if (prev) return expandedWidth > availableWidth - exitCompactDelta;
      return expandedWidth > availableWidth + enterCompactDelta;
    });
  }, [showViewSwitcher, expandedWidth]);

  useEffect(() => {
    if (!showViewSwitcher) return;
    if (!switcherContainerRef.current) return;

    const resizeObserver = new ResizeObserver(updateCompactMode);
    resizeObserver.observe(switcherContainerRef.current);

    return () => resizeObserver.disconnect();
  }, [showViewSwitcher, updateCompactMode]);

  useEffect(() => {
    const raf = requestAnimationFrame(updateCompactMode);
    return () => cancelAnimationFrame(raf);
  }, [panelWidth, currentLanguage, updateCompactMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    void (async () => {
      try {
        await getCurrentWindow().setTheme(isDarkMode ? 'dark' : 'light');
      } catch {}
    })();
  }, [isDarkMode]);

  const toggleLangMenu = useCallback(() => {
    setIsLangMenuOpen((prev) => {
      if (!prev && langButtonRef.current) {
        const rect = langButtonRef.current.getBoundingClientRect();
        setLangMenuPosition({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
          minWidth: rect.width,
        });
      }
      return !prev;
    });
  }, []);

  const selectLanguage = useCallback((code: string) => {
    i18n.changeLanguage(code);
    setIsLangMenuOpen(false);
  }, [i18n]);

  useEffect(() => {
    if (!isLangMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        langButtonRef.current &&
        !langButtonRef.current.contains(target) &&
        langMenuRef.current &&
        !langMenuRef.current.contains(target)
      ) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangMenuOpen]);

  const isPresentation = variant === 'presentation';

  return (
    <div
      data-tauri-drag-region
      className={cn(
        'h-8 flex items-center px-4 bg-background shadow-[inset_0_-1px_0_0_var(--border)]',
        isPresentation && 'border-r rounded-br-md'
      )}
    >
      <h1 className="text-base font-black flex-shrink-0 tracking-tight cursor-pointer leading-none text-primary transition-all duration-300 hover:drop-shadow-[0_0_10px_var(--ring)]">
        Axon
      </h1>
      <div className="flex flex-1 items-center justify-end gap-1 min-w-0">
        {showViewSwitcher && (
          <div
            ref={switcherContainerRef}
            className="flex flex-1 items-center justify-end overflow-hidden min-w-0"
          >
            <ViewSwitcher isCompact={isCompact} onExpandedWidthChange={setExpandedWidth} />
          </div>
        )}
        <div className="flex-shrink-0">
          <Button
            ref={langButtonRef}
            variant="ghost"
            size="icon-sm"
            onClick={toggleLangMenu}
            className="rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={t('header.selectLanguage')}
          >
            <Languages size={16} />
          </Button>
          {isLangMenuOpen &&
            createPortal(
              <div
                ref={langMenuRef}
                className="fixed inline-flex flex-col z-[9999] overflow-hidden p-1 rounded-[10px] border border-[color:var(--menu-border)] bg-popover/90 shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl min-w-[10rem] max-w-[calc(100vw-16px)]"
                style={{
                  top: `${langMenuPosition.top}px`,
                  right: `${langMenuPosition.right}px`,
                  minWidth: langMenuPosition.minWidth ? `${langMenuPosition.minWidth}px` : undefined,
                }}
              >
                {LANGUAGES.map(({ code, nativeLabel }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => selectLanguage(code)}
                    className={cn(
                      'flex items-center h-6 px-3 text-[13px] leading-[22px] text-left transition-colors whitespace-nowrap rounded-[6px] select-none',
                      currentLanguage === code || currentLanguage.startsWith(code)
                        ? 'bg-[var(--menu-highlight)] text-[var(--menu-highlight-foreground)]'
                        : 'hover:bg-[var(--menu-hover)] hover:text-foreground'
                    )}
                  >
                    {nativeLabel}
                  </button>
                ))}
              </div>,
              document.body
            )}
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={isDarkMode ? t('header.switchToLightTheme') : t('header.switchToDarkTheme')}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;

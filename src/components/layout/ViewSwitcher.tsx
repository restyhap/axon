/**
 * 视图切换器组件
 * 提供编辑、脑图、演示三种视图模式的切换
 * - editor / mindmap：更新 viewMode store，左侧导航区内容随之切换
 * - presentation：跳转到演示路由（独立布局）
 * 支持紧凑模式（下拉菜单）和常规模式（按钮组）
 */
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Menu, FileText, Brain, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '@/stores/document';

/** 视图切换器属性 */
interface ViewSwitcherProps {
  /** 是否使用紧凑模式（下拉菜单） */
  isCompact?: boolean;
  onExpandedWidthChange?: (width: number) => void;
}

/** 视图切换器组件 */
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ isCompact = false, onExpandedWidthChange }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { viewMode, setViewMode } = useDocumentStore();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const dropdownMeasureRef = useRef<HTMLDivElement>(null);

  // 演示模式通过路由判断，editor/mindmap 通过 viewMode store 判断
  const isPresentation = location.pathname.startsWith('/presentation');
  const isEditor = !isPresentation && viewMode === 'editor';
  const isMindmap = !isPresentation && viewMode === 'mindmap';

  const items = useMemo(
    () => [
      {
        labelKey: 'editor',
        Icon: FileText,
        active: isEditor,
        onClick: () => {
          setViewMode('editor');
          // 如果当前在演示路由，切回文档路由
          if (isPresentation) navigate('/document');
          setIsOpen(false);
        },
      },
      {
        labelKey: 'mindmap',
        Icon: Brain,
        active: isMindmap,
        onClick: () => {
          setViewMode('mindmap');
          if (isPresentation) navigate('/document');
          setIsOpen(false);
        },
      },
      {
        labelKey: 'presentation',
        Icon: Presentation,
        active: isPresentation,
        onClick: () => {
          navigate('/presentation');
          setIsOpen(false);
        },
      },
    ],
    [isEditor, isMindmap, isPresentation, navigate, setViewMode]
  );

  useEffect(() => {
    if (!onExpandedWidthChange) return;
    if (!measureRef.current) return;

    const element = measureRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onExpandedWidthChange(entry.contentRect.width);
      }
    });
    resizeObserver.observe(element);
    onExpandedWidthChange(element.getBoundingClientRect().width);

    return () => resizeObserver.disconnect();
  }, [onExpandedWidthChange]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const margin = 8;
        let desiredWidth = dropdownMeasureRef.current?.getBoundingClientRect().width ?? 0;
        const maxWidth = window.innerWidth - margin * 2;
        if (!Number.isFinite(desiredWidth) || desiredWidth <= 0) desiredWidth = 0;
        desiredWidth = Math.min(desiredWidth, maxWidth);
        setDropdownWidth(desiredWidth);
        const maxRight = window.innerWidth - desiredWidth - margin;
        setDropdownPosition({
          top: rect.bottom + 4,
          right: Math.max(margin, Math.min(window.innerWidth - rect.right, maxRight)),
        });
      }
      return !prev;
    });
  }, []);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const expandedMeasure = (
    <div ref={measureRef} aria-hidden="true" className="absolute -z-10 opacity-0 pointer-events-none left-0 top-0">
      <div className="flex items-center gap-1">
        {items.map(({ labelKey, Icon }) => (
          <div
            key={labelKey}
            className="inline-flex items-center gap-1.5 h-7 px-3 whitespace-nowrap rounded-md text-[0.8rem] font-medium"
          >
            <Icon size={14} /> {t(`view.${labelKey}`)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-1">
      <div
        ref={dropdownMeasureRef}
        aria-hidden="true"
        className="fixed -z-10 opacity-0 pointer-events-none left-0 top-0"
      >
        <div className="inline-flex flex-col p-1 rounded-[10px] border border-[color:var(--menu-border)] bg-popover/90">
          {items.map(({ labelKey, Icon }) => (
            <div
              key={labelKey}
              className="flex items-center gap-2 h-6 px-3 text-[13px] leading-[22px] rounded-[6px] whitespace-nowrap"
            >
              <Icon size={14} /> {t(`view.${labelKey}`)}
            </div>
          ))}
        </div>
      </div>
      {expandedMeasure}
      {isCompact ? (
        <>
          <Button
            ref={buttonRef}
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            className="rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Menu size={16} />
          </Button>
          {isOpen &&
            createPortal(
              <div
                ref={menuRef}
                className="fixed z-[9999] overflow-hidden p-1 rounded-[10px] border border-[color:var(--menu-border)] bg-popover/90 shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl max-w-[calc(100vw-16px)]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                  width: dropdownWidth ? `${dropdownWidth}px` : undefined,
                }}
              >
                {items.map(({ labelKey, Icon, active, onClick }) => (
                  <button
                    key={labelKey}
                    type="button"
                    onClick={onClick}
                    className={cn(
                      'flex items-center gap-2 h-6 px-3 text-[13px] leading-[22px] rounded-[6px] transition-colors select-none w-full text-left',
                      active
                        ? 'bg-[var(--menu-highlight)] text-[var(--menu-highlight-foreground)]'
                        : 'hover:bg-[var(--menu-hover)] hover:text-foreground'
                    )}
                  >
                    <Icon size={14} /> {t(`view.${labelKey}`)}
                  </button>
                ))}
              </div>,
              document.body
            )}
        </>
      ) : (
        items.map(({ labelKey, Icon, active, onClick }) => (
          <Button
            key={labelKey}
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
              'gap-1.5 h-7 px-3 whitespace-nowrap rounded-md transition-colors',
              active
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon size={14} /> {t(`view.${labelKey}`)}
          </Button>
        ))
      )}
    </div>
  );
};

export default ViewSwitcher;

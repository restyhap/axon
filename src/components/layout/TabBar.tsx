/**
 * 标签栏组件
 * - 高度与标题栏一致（h-8）
 * - 宽度跟随右侧面板自适应
 * - 标签过多时支持滚轮横向滚动，左右溢出分别用下拉按钮展示隐藏标签
 * - 支持关闭单个标签、激活标签、dirty 状态标记
 */
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, FileText, Copy, Pin, RotateCcw, Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useTabsStore, type Tab } from '@/stores/tabs';
import { Button } from '@/components/ui/button';

type TabItemProps = {
  tab: Tab;
  isActive: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'>;

const TabItem = React.forwardRef<HTMLDivElement, TabItemProps>(
  ({ tab, isActive, onActivate, onClose, onContextMenu, className, style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        role="tab"
        data-tab-id={tab.id}
        aria-selected={isActive}
        onClick={() => onActivate(tab.id)}
        onContextMenu={onContextMenu}
        style={style}
        {...rest}
        className={cn(
          'group relative flex items-center gap-2 h-full px-2.5 cursor-pointer select-none touch-none',
          'text-[0.8rem] whitespace-nowrap shrink-0 transition-colors',
          'border-r border-[var(--border)]',
          isActive
            ? 'bg-accent text-foreground font-medium z-10 ring-1 ring-border/60 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-primary'
            : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground',
          className
        )}
      >
      <FileText
        size={12}
        className={cn(
          'shrink-0',
          isActive ? 'text-primary opacity-80' : 'opacity-60'
        )}
      />
      <span
        className={cn(
          'max-w-[140px] truncate',
          tab.isPreview && 'italic'
        )}
      >
        {tab.title}
      </span>
      {/* dirty 标记小圆点 */}
      {tab.isDirty && (
        <span className="size-1.5 rounded-full bg-primary shrink-0" />
      )}
      {/* 关闭按钮 */}
      <button
        type="button"
        aria-label={`关闭 ${tab.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          'shrink-0 flex items-center justify-center size-4 rounded-sm transition-colors text-muted-foreground/70',
          tab.isDirty ? 'hover:text-destructive' : 'hover:bg-destructive/15 hover:text-destructive'
        )}
      >
        <X size={10} />
      </button>
      </div>
    );
  }
);
TabItem.displayName = 'TabItem';

/** 标签栏组件 */
export const TabBar: React.FC = () => {
  const { tabs, activeTabId, activateTab, closeTab, reorderTabs } = useTabsStore();

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabElMapRef = useRef(new Map<string, HTMLDivElement>());

  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  }, []);

  const [hiddenLeftTabs, setHiddenLeftTabs] = useState<Tab[]>([]);
  const [hiddenRightTabs, setHiddenRightTabs] = useState<Tab[]>([]);
  const [scrollInfo, setScrollInfo] = useState({
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
  });
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const [isLeftDropdownOpen, setIsLeftDropdownOpen] = useState(false);
  const [isRightDropdownOpen, setIsRightDropdownOpen] = useState(false);
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);
  const leftDropdownRef = useRef<HTMLDivElement>(null);
  const rightDropdownRef = useRef<HTMLDivElement>(null);
  const [leftDropdownPos, setLeftDropdownPos] = useState({ top: 0, left: 0 });
  const [rightDropdownPos, setRightDropdownPos] = useState({ top: 0, left: 0 });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const activeDragIdRef = useRef<string | null>(null);
  
  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    tabId: string;
    x: number;
    y: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const updateHiddenTabs = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const left = scrollEl.scrollLeft;
    const right = left + scrollEl.clientWidth;
    const maxScrollLeft = Math.max(scrollEl.scrollWidth - scrollEl.clientWidth, 0);
    const showLeft = left > 2;
    const showRight = left < maxScrollLeft - 2;

    const viewLeft = left + (showLeftButton ? 36 : 0);
    const viewRight = right - (showRightButton ? 36 : 0);

    const nextLeft: Tab[] = [];
    const nextRight: Tab[] = [];

    for (const tab of tabs) {
      const el = tabElMapRef.current.get(tab.id);
      if (!el) continue;
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      const elRight = elLeft + elWidth;

      const visibleLeft = Math.max(elLeft, viewLeft);
      const visibleRight = Math.min(elRight, viewRight);
      const visibleWidth = Math.max(0, visibleRight - visibleLeft);
      const visibleRatio = elWidth > 0 ? visibleWidth / elWidth : 1;
      const isHiddenEnough = visibleRatio < 2 / 3;
      if (!isHiddenEnough) continue;

      const hiddenOnLeft = elLeft < viewLeft;
      const hiddenOnRight = elRight > viewRight;
      if (hiddenOnLeft && !hiddenOnRight) nextLeft.push(tab);
      else if (hiddenOnRight && !hiddenOnLeft) nextRight.push(tab);
      else if (hiddenOnLeft && hiddenOnRight) {
        const leftOverflow = viewLeft - elLeft;
        const rightOverflow = elRight - viewRight;
        if (leftOverflow >= rightOverflow) nextLeft.push(tab);
        else nextRight.push(tab);
      }
    }

    setHiddenLeftTabs(nextLeft);
    setHiddenRightTabs(nextRight);
    setScrollInfo({
      scrollLeft: scrollEl.scrollLeft,
      scrollWidth: scrollEl.scrollWidth,
      clientWidth: scrollEl.clientWidth,
    });
    setShowLeftButton((prev) => (prev ? left > 1 : showLeft));
    setShowRightButton((prev) =>
      prev ? left < maxScrollLeft - 1 : showRight
    );
  }, [showLeftButton, showRightButton, tabs]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateHiddenTabs);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateHiddenTabs]);

  useLayoutEffect(() => {
    updateHiddenTabs();
  }, [tabs, updateHiddenTabs]);

  useEffect(() => {
    if (!isLeftDropdownOpen && !isRightDropdownOpen && !contextMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        leftButtonRef.current?.contains(target) ||
        rightButtonRef.current?.contains(target) ||
        leftDropdownRef.current?.contains(target) ||
        rightDropdownRef.current?.contains(target) ||
        contextMenuRef.current?.contains(target)
      )
        return;
      setIsLeftDropdownOpen(false);
      setIsRightDropdownOpen(false);
      setContextMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isLeftDropdownOpen, isRightDropdownOpen, contextMenu]);

  useEffect(() => {
    if (hiddenLeftTabs.length === 0) setIsLeftDropdownOpen(false);
    if (hiddenRightTabs.length === 0) setIsRightDropdownOpen(false);
  }, [hiddenLeftTabs.length, hiddenRightTabs.length]);

  const setTabEl = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) tabElMapRef.current.set(id, el);
    else tabElMapRef.current.delete(id);
  }, []);

  const scrollTabToEdge = useCallback(
    (id: string, edge: 'left' | 'right') => {
      requestAnimationFrame(() => {
        const scrollEl = scrollRef.current;
        const el = tabElMapRef.current.get(id);
        if (!scrollEl || !el) return;

        const maxScrollLeft = Math.max(scrollEl.scrollWidth - scrollEl.clientWidth, 0);
        const elLeft = el.offsetLeft;
        const elRight = elLeft + el.offsetWidth;
        const paddingLeft = showLeftButton ? 36 : 0;
        const paddingRight = showRightButton ? 36 : 0;

        const targetLeft =
          edge === 'left'
            ? elLeft - paddingLeft
            : elRight - (scrollEl.clientWidth - paddingRight);

        scrollEl.scrollLeft = clamp(targetLeft, 0, maxScrollLeft);
      });
    },
    [clamp, showLeftButton, showRightButton]
  );

  const ensureTabFullyVisible = useCallback(
    (id: string) => {
      requestAnimationFrame(() => {
        const scrollEl = scrollRef.current;
        const el = tabElMapRef.current.get(id);
        if (!scrollEl || !el) return;

        const tabRect = el.getBoundingClientRect();
        const scrollRect = scrollEl.getBoundingClientRect();

        const leftLimit = scrollRect.left + (showLeftButton ? 36 : 0);
        const rightLimit = scrollRect.right - (showRightButton ? 36 : 0);

        let nextScrollLeft = scrollEl.scrollLeft;
        if (tabRect.left < leftLimit) {
          nextScrollLeft -= leftLimit - tabRect.left;
        } else if (tabRect.right > rightLimit) {
          nextScrollLeft += tabRect.right - rightLimit;
        } else {
          return;
        }

        const maxScrollLeft = Math.max(scrollEl.scrollWidth - scrollEl.clientWidth, 0);
        scrollEl.scrollLeft = clamp(nextScrollLeft, 0, maxScrollLeft);
      });
    },
    [clamp, showLeftButton, showRightButton]
  );

  const handleActivateFromBar = useCallback(
    (id: string) => {
      if (activeDragIdRef.current) return;
      activateTab(id);
      setIsLeftDropdownOpen(false);
      setIsRightDropdownOpen(false);
    },
    [activateTab]
  );

  const handleActivateFromLeftDropdown = useCallback(
    (id: string) => {
      activateTab(id);
      setIsLeftDropdownOpen(false);
      setIsRightDropdownOpen(false);
      scrollTabToEdge(id, 'left');
      ensureTabFullyVisible(id);
    },
    [activateTab, ensureTabFullyVisible, scrollTabToEdge]
  );

  const handleActivateFromRightDropdown = useCallback(
    (id: string) => {
      activateTab(id);
      setIsLeftDropdownOpen(false);
      setIsRightDropdownOpen(false);
      scrollTabToEdge(id, 'right');
      ensureTabFullyVisible(id);
    },
    [activateTab, ensureTabFullyVisible, scrollTabToEdge]
  );

  // 处理标签右键点击事件
  const handleTabContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      tabId,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  // 处理右键菜单项点击事件
  const handleContextMenuClick = useCallback((action: string, tabId: string) => {
    switch (action) {
      case 'duplicate':
        // 复制标签的逻辑
        break;
      case 'close':
        closeTab(tabId);
        break;
      case 'closeOther':
        // 关闭其他标签的逻辑
        tabs.forEach(tab => {
          if (tab.id !== tabId) {
            closeTab(tab.id);
          }
        });
        break;
      case 'closeAll':
        // 关闭所有标签的逻辑
        tabs.forEach(tab => closeTab(tab.id));
        break;
      default:
        break;
    }
    setContextMenu(null);
  }, [closeTab, tabs]);

  const toggleLeftDropdown = useCallback(() => {
    setIsLeftDropdownOpen((prev) => {
      if (!prev && leftButtonRef.current) {
        const rect = leftButtonRef.current.getBoundingClientRect();
        const maxWidth = 280;
        const padding = 8;
        const left = Math.min(
          Math.max(rect.left, padding),
          window.innerWidth - maxWidth - padding
        );
        setLeftDropdownPos({ top: rect.bottom + 4, left });
      }
      return !prev;
    });
    setIsRightDropdownOpen(false);
  }, []);

  const toggleRightDropdown = useCallback(() => {
    setIsRightDropdownOpen((prev) => {
      if (!prev && rightButtonRef.current) {
        const rect = rightButtonRef.current.getBoundingClientRect();
        setRightDropdownPos({ top: rect.bottom + 4, left: rect.right });
      }
      return !prev;
    });
    setIsLeftDropdownOpen(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta === 0) return;
    e.preventDefault();
    el.scrollLeft += delta;
  }, []);

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const id = String(e.active.id);
    activeDragIdRef.current = id;
    setActiveDragId(id);
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (over && active.id !== over.id) {
        const ids = tabs.map((t) => t.id);
        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderTabs(arrayMove(ids, oldIndex, newIndex));
        }
      }
      activeDragIdRef.current = null;
      setActiveDragId(null);
    },
    [reorderTabs, tabs]
  );

  const handleDragCancel = useCallback(() => {
    activeDragIdRef.current = null;
    setActiveDragId(null);
  }, []);

  const SortableTab: React.FC<{ tab: Tab }> = ({ tab }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: tab.id,
    });

    const setRef = useCallback(
      (el: HTMLDivElement | null) => {
        setNodeRef(el);
        setTabEl(tab.id, el);
      },
      [setNodeRef, tab.id]
    );

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <TabItem
        ref={setRef}
        tab={tab}
        isActive={tab.id === activeTabId}
        onActivate={handleActivateFromBar}
        onClose={closeTab}
        onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(isDragging ? 'opacity-30 cursor-grabbing' : 'cursor-grab')}
      />
    );
  };

  useLayoutEffect(() => {
    if (!isRightDropdownOpen) return;
    const btn = rightButtonRef.current;
    const menu = rightDropdownRef.current;
    if (!btn || !menu) return;

    const rect = btn.getBoundingClientRect();
    const width = menu.offsetWidth;
    const padding = 8;
    const left = clamp(rect.right - width, padding, window.innerWidth - width - padding);
    const top = rect.bottom + 4;

    if (Math.abs(rightDropdownPos.left - left) > 0.5 || Math.abs(rightDropdownPos.top - top) > 0.5) {
      setRightDropdownPos({ top, left });
    }
  }, [clamp, isRightDropdownOpen, rightDropdownPos.left, rightDropdownPos.top]);

  const isOverflowing = scrollInfo.scrollWidth > scrollInfo.clientWidth + 1;
  const trackThumbWidthPercent = isOverflowing
    ? Math.max(8, (scrollInfo.clientWidth / scrollInfo.scrollWidth) * 100)
    : 0;
  const trackThumbLeftPercent = isOverflowing
    ? (() => {
        const maxScrollLeft = Math.max(scrollInfo.scrollWidth - scrollInfo.clientWidth, 1);
        const maxLeft = 100 - trackThumbWidthPercent;
        return (scrollInfo.scrollLeft / maxScrollLeft) * maxLeft;
      })()
    : 0;

  const sideButtonWidth = 36;
  const scrollPaddingLeft = showLeftButton ? sideButtonWidth : 0;
  const scrollPaddingRight = showRightButton ? sideButtonWidth : 0;

  return (
    <div
      ref={rootRef}
      className="relative flex items-stretch h-8 bg-muted shadow-[inset_0_-1px_0_0_var(--border)] overflow-hidden"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={scrollRef}
          className="tabbar-scroll relative z-10 flex items-stretch flex-1 min-w-0 overflow-x-auto overflow-y-hidden"
          onScroll={updateHiddenTabs}
          onWheel={handleWheel}
          style={{
            paddingLeft: scrollPaddingLeft ? `${scrollPaddingLeft}px` : undefined,
            paddingRight: scrollPaddingRight ? `${scrollPaddingRight}px` : undefined,
          }}
        >
          <SortableContext
            items={tabs.map((t) => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <SortableTab key={tab.id} tab={tab} />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeDragId ? (
            (() => {
              const tab = tabs.find((t) => t.id === activeDragId) ?? null;
              if (!tab) return null;
              return (
                <TabItem
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onActivate={() => {}}
                  onClose={() => {}}
                  className="cursor-grabbing shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                />
              );
            })()
          ) : null}
        </DragOverlay>
      </DndContext>

      {showLeftButton && (
        <div className="absolute z-30 left-0 top-0 bottom-0 flex items-center justify-center w-9 border-r border-[var(--border)] bg-muted">
          <Button
            ref={leftButtonRef}
            variant="ghost"
            size="icon-sm"
            onClick={toggleLeftDropdown}
            aria-label="左侧隐藏标签"
            aria-expanded={isLeftDropdownOpen}
            className={cn(
              'rounded-md transition-colors',
              hiddenLeftTabs.some((t) => t.id === activeTabId) &&
                'bg-accent text-accent-foreground'
            )}
          >
            <ChevronDown size={14} />
          </Button>
        </div>
      )}

      {showRightButton && (
        <div className="absolute z-30 right-0 top-0 bottom-0 flex items-center justify-center w-9 border-l border-[var(--border)] bg-muted">
          <Button
            ref={rightButtonRef}
            variant="ghost"
            size="icon-sm"
            onClick={toggleRightDropdown}
            aria-label="右侧隐藏标签"
            aria-expanded={isRightDropdownOpen}
            className={cn(
              'rounded-md transition-colors',
              hiddenRightTabs.some((t) => t.id === activeTabId) &&
                'bg-accent text-accent-foreground'
            )}
          >
            <ChevronDown size={14} />
          </Button>
        </div>
      )}

      {isOverflowing && (
        <div
          className="pointer-events-none absolute bottom-0 h-[3px] z-0"
          style={{
            left: scrollPaddingLeft ? `${scrollPaddingLeft}px` : 0,
            right: scrollPaddingRight ? `${scrollPaddingRight}px` : 0,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-border/50" />
          <div
            className="absolute top-0 bottom-0 rounded-full bg-muted-foreground/50"
            style={{
              width: `${trackThumbWidthPercent}%`,
              left: `${trackThumbLeftPercent}%`,
            }}
          />
        </div>
      )}

      {isLeftDropdownOpen &&
        createPortal(
          <div
            ref={leftDropdownRef}
            className="fixed z-[9999] p-1 rounded-[10px] border border-[color:var(--menu-border)] bg-popover shadow-[inset_0_-1px_0_0_var(--border),0_12px_32px_rgba(0,0,0,0.18)] min-w-[160px] max-w-[280px]"
            style={{
              top: leftDropdownPos.top,
              left: leftDropdownPos.left,
            }}
          >
            {[...hiddenLeftTabs].reverse().map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleActivateFromLeftDropdown(tab.id)}
                className={cn(
                  'flex items-center gap-2 w-full h-7 px-3 text-[13px] leading-[22px] rounded-[6px] transition-colors text-left select-none',
                  tab.id === activeTabId
                    ? 'bg-[var(--menu-highlight)] text-[var(--menu-highlight-foreground)]'
                    : 'hover:bg-[var(--menu-hover)] hover:text-foreground text-muted-foreground'
                )}
              >
                <FileText size={12} className="shrink-0 opacity-60" />
                <span className="flex-1 truncate">{tab.title}</span>
                {tab.isDirty && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                )}
                <span
                  role="button"
                  aria-label={`关闭 ${tab.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="size-4 flex items-center justify-center rounded-sm opacity-0 hover:opacity-100 hover:bg-destructive/15 hover:text-destructive transition-all"
                >
                  <X size={10} />
                </span>
              </button>
            ))}
          </div>,
          document.body
        )}

      {isRightDropdownOpen &&
        createPortal(
          <div
            ref={rightDropdownRef}
            className="fixed z-[9999] p-1 rounded-[10px] border border-[color:var(--menu-border)] bg-popover shadow-[inset_0_-1px_0_0_var(--border),0_12px_32px_rgba(0,0,0,0.18)] min-w-[160px] max-w-[280px]"
            style={{
              top: rightDropdownPos.top,
              left: rightDropdownPos.left,
            }}
          >
            {hiddenRightTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleActivateFromRightDropdown(tab.id)}
                className={cn(
                  'flex items-center gap-2 w-full h-7 px-3 text-[13px] leading-[22px] rounded-[6px] transition-colors text-left select-none',
                  tab.id === activeTabId
                    ? 'bg-[var(--menu-highlight)] text-[var(--menu-highlight-foreground)]'
                    : 'hover:bg-[var(--menu-hover)] hover:text-foreground text-muted-foreground'
                )}
              >
                <FileText size={12} className="shrink-0 opacity-60" />
                <span className="flex-1 truncate">{tab.title}</span>
                {tab.isDirty && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                )}
                <span
                  role="button"
                  aria-label={`关闭 ${tab.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="size-4 flex items-center justify-center rounded-sm opacity-0 hover:opacity-100 hover:bg-destructive/15 hover:text-destructive transition-all"
                >
                  <X size={10} />
                </span>
              </button>
            ))}
          </div>,
          document.body
        )}

      {/* 右键菜单 */}
      {contextMenu &&
        createPortal(
          <div
            ref={contextMenuRef}
            className="fixed z-[9999] p-1 rounded-[10px] border border-[color:var(--menu-border)] bg-popover shadow-[inset_0_-1px_0_0_var(--border),0_12px_32px_rgba(0,0,0,0.18)] min-w-[160px]"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
            }}
          >
            <button
              type="button"
              onClick={() => handleContextMenuClick('duplicate', contextMenu.tabId)}
              className="flex items-center gap-2 w-full h-7 px-3 text-[13px] leading-[22px] rounded-[6px] transition-colors text-left select-none hover:bg-[var(--menu-hover)] hover:text-foreground text-muted-foreground"
            >
              <Copy size={12} className="shrink-0 opacity-60" />
              <span>复制标签</span>
            </button>
            <div className="h-px bg-border/50 my-1" />
            <button
              type="button"
              onClick={() => handleContextMenuClick('close', contextMenu.tabId)}
              className="flex items-center gap-2 w-full h-7 px-3 text-[13px] leading-[22px] rounded-[6px] transition-colors text-left select-none hover:bg-[var(--menu-hover)] hover:text-foreground text-muted-foreground"
            >
              <X size={12} className="shrink-0 opacity-60" />
              <span>关闭</span>
            </button>
            <button
              type="button"
              onClick={() => handleContextMenuClick('closeOther', contextMenu.tabId)}
              className="flex items-center gap-2 w-full h-7 px-3 text-[13px] leading-[22px] rounded-[6px] transition-colors text-left select-none hover:bg-[var(--menu-hover)] hover:text-foreground text-muted-foreground"
            >
              <X size={12} className="shrink-0 opacity-60" />
              <span>关闭其他标签</span>
            </button>
            <button
              type="button"
              onClick={() => handleContextMenuClick('closeAll', contextMenu.tabId)}
              className="flex items-center gap-2 w-full h-7 px-3 text-[13px] leading-[22px] rounded-[6px] transition-colors text-left select-none hover:bg-[var(--menu-hover)] hover:text-foreground text-muted-foreground"
            >
              <X size={12} className="shrink-0 opacity-60" />
              <span>关闭所有标签</span>
            </button>
          </div>,
          document.body
        )}

    </div>
  );

};

export default TabBar;

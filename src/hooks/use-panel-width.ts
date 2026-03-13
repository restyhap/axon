/**
 * 面板宽度监听 Hook
 * 使用 ResizeObserver 监听面板尺寸变化
 */
import { useState, useEffect, useRef } from 'react';

/** 获取面板宽度的 Hook */
export function usePanelWidth() {
  /** 面板宽度（像素） */
  const [panelWidth, setPanelWidth] = useState<number>(0);
  /** 面板 DOM 引用 */
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPanelWidth(entry.contentRect.width);
      }
    });
    
    resizeObserver.observe(panelRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return { panelWidth, panelRef };
}

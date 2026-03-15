/**
 * useMarkmap Hook
 * 封装 markmap 实例的创建、数据更新、销毁逻辑
 * 将 Markdown 文本转换为脑图数据并渲染到 SVG
 * 支持节点点击回调（通过 SVG 事件委托）
 */
import { useEffect, useRef, useCallback } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

const transformer = new Transformer();

interface UseMarkmapOptions {
  content: string;
  /** 点击节点时触发，参数为节点显示文本（纯文本，去除 Markdown 格式） */
  onNodeClick?: (label: string) => void;
}

export function useMarkmap({ content, onNodeClick }: UseMarkmapOptions) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  // 手动记录当前缩放比例
  const scaleRef = useRef<number>(1);
  // 用 ref 保存回调，避免重新绑定事件
  const onNodeClickRef = useRef(onNodeClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // 初始化 Markmap 实例
  useEffect(() => {
    if (!svgRef.current) return;
    if (mmRef.current) return;

    mmRef.current = Markmap.create(svgRef.current, {
      autoFit: true,
      duration: 300,
      zoom: true,
      pan: true,
      initialExpandLevel: 2,
      embedGlobalCSS: true,
    });

    // 通过事件委托监听节点点击
    // markmap 节点的文字在 <foreignObject> > <div> 内，或 <text> 内
    // 使用 SVG 根元素上的 click 事件冒泡，读取最近的 .markmap-node text/foreignObject 内容
    const handleClick = (e: MouseEvent) => {
      if (!onNodeClickRef.current) return;
      const target = e.target as Element;

      // 向上找最近的 .markmap-node 容器
      const nodeEl = target.closest('.markmap-node') as SVGGElement | null;
      if (!nodeEl) return;

      // 尝试从 foreignObject > div 中读取文本内容
      const fo = nodeEl.querySelector('foreignObject');
      if (fo) {
        // 取纯文本，去掉 HTML 标签
        const text = (fo.textContent ?? '').trim();
        if (text) {
          onNodeClickRef.current(text);
          return;
        }
      }
      // fallback：从 <text> 读取
      const textEl = nodeEl.querySelector('text');
      if (textEl) {
        const text = (textEl.textContent ?? '').trim();
        if (text) onNodeClickRef.current(text);
      }
    };

    svgRef.current.addEventListener('click', handleClick);

    return () => {
      svgRef.current?.removeEventListener('click', handleClick);
      mmRef.current?.destroy();
      mmRef.current = null;
    };
  }, []);

  // 内容变更时更新脑图数据
  useEffect(() => {
    if (!mmRef.current) return;
    const md = content?.trim() || '# 暂无内容';
    const { root } = transformer.transform(md);
    mmRef.current.setData(root).then(() => {
      mmRef.current?.fit();
      scaleRef.current = 1;
    });
  }, [content]);

  /** 适应视图 */
  const handleFit = useCallback(() => {
    mmRef.current?.fit();
    scaleRef.current = 1;
  }, []);

  /** 放大 */
  const handleZoomIn = useCallback(() => {
    const mm = mmRef.current;
    if (!mm) return;
    const next = scaleRef.current * 1.25;
    scaleRef.current = next;
    mm.rescale(next);
  }, []);

  /** 缩小 */
  const handleZoomOut = useCallback(() => {
    const mm = mmRef.current;
    if (!mm) return;
    const next = Math.max(0.1, scaleRef.current * 0.8);
    scaleRef.current = next;
    mm.rescale(next);
  }, []);

  return { svgRef, handleFit, handleZoomIn, handleZoomOut };
}

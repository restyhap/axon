import React, { useState } from 'react';

interface ResizableDividerProps {
  orientation?: 'vertical' | 'horizontal';
  onResize?: (delta: number) => void;
  className?: string;
}

export const ResizableDivider: React.FC<ResizableDividerProps> = ({
  orientation = 'vertical',
  onResize,
  className = ''
}) => {
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    if (onResize) {
      onResize(orientation === 'vertical' ? e.clientX : e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, onResize, orientation]);

  const baseClasses = orientation === 'vertical'
    ? 'w-1.5 h-full bg-bg border-l border-r border-divider flex items-center justify-center'
    : 'h-1.5 w-full bg-bg border-t border-b border-divider flex items-center justify-center';

  return (
    <div className={`${baseClasses} ${className}`} onMouseDown={handleMouseDown}>
      <div className={`${orientation === 'vertical' ? 'w-1 h-8' : 'w-8 h-1'} bg-divider rounded`} />
    </div>
  );
};

import React from 'react';

interface TabItemProps {
  label: string;
  isActive?: boolean;
  onClose: () => void;
  onSelect: () => void;
  className?: string;
}

export const TabItem: React.FC<TabItemProps> = ({
  label,
  isActive = false,
  onClose,
  onSelect,
  className = ''
}) => {
  const baseClasses = 'px-3 py-2 flex items-center gap-2 rounded-md cursor-pointer';
  const activeClasses = isActive
    ? 'bg-bg-tertiary border border-border'
    : 'hover:bg-bg-tertiary';

  return (
    <div
      onClick={onSelect}
      className={`${baseClasses} ${activeClasses} ${className}`}
    >
      <span className="text-sm font-medium text-text">{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="w-4 h-4 flex items-center justify-center rounded hover:bg-bg"
      >
        <span className="text-xs text-text-muted">×</span>
      </button>
    </div>
  );
};

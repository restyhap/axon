import React, { useState } from 'react';
import { Button } from './Button';

interface ButtonGroupItem {
  id: string;
  label: string;
  onClick: () => void;
}

interface ButtonGroupProps {
  items: ButtonGroupItem[];
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  items,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      {!isCollapsed ? (
        <div className="flex gap-1">
          {items.map((item) => (
            <Button key={item.id} onClick={item.onClick}>
              {item.label}
            </Button>
          ))}
        </div>
      ) : (
        <>
          <Button onClick={toggleDropdown}>
            ⋮
          </Button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-30 bg-bg-secondary border border-border rounded-md shadow-lg z-10">
              <div className="py-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary rounded"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

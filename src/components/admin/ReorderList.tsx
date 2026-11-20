'use client';

import React from 'react';

interface ReorderListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  itemClassName?: string;
}

export default function ReorderList<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  className = '',
  itemClassName = '',
}: ReorderListProps<T>) {
  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    onReorder(newItems);
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    onReorder(newItems);
  };

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs tracking-wider uppercase text-neutral-600 border border-dashed border-neutral-800">
        No items yet
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div
            key={keyExtractor(item, index)}
            className={`flex items-start gap-4 p-4 bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-colors ${itemClassName}`}
          >
            {/* Position indicator */}
            <div className="flex flex-col items-center justify-center shrink-0 w-8 pt-1">
              <span className="text-[11px] font-mono text-neutral-600 mb-1">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={isFirst}
                  title="Move up in priority"
                  className="p-1 text-neutral-500 hover:text-text-bright disabled:opacity-20 disabled:hover:text-neutral-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={isLast}
                  title="Move down in priority"
                  className="p-1 text-neutral-500 hover:text-text-bright disabled:opacity-20 disabled:hover:text-neutral-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Custom content */}
            <div className="flex-1 min-w-0">{renderItem(item, index)}</div>
          </div>
        );
      })}
    </div>
  );
}

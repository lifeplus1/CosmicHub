import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import styles from '../../styles/modules/components/VirtualizedList.module.css';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number; // px
  height: number; // px viewport
  width: number | string;
  render: (item: T, index: number) => React.ReactNode;
  overscanCount?: number;
  ariaLabel?: string;
  className?: string;
}

export const VirtualizedList = memo(function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  width,
  render,
  overscanCount = 4,
  ariaLabel,
  className = '',
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * itemHeight;
  const itemsPerViewport = Math.ceil(height / itemHeight);
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscanCount
  );
  const endIndex = Math.min(
    items.length,
    startIndex + itemsPerViewport + overscanCount * 2
  );
  const visible = items.slice(startIndex, endIndex);

  const onScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // Set CSS custom properties programmatically to avoid inline styles
  useEffect(() => {
    if (containerRef.current) {
      const containerElement = containerRef.current;
      containerElement.style.setProperty('--virtualized-height', typeof height === 'number' ? `${height}px` : height);
      containerElement.style.setProperty('--virtualized-width', typeof width === 'number' ? `${width}px` : width);
      containerElement.style.setProperty('--total-height', `${totalHeight}px`);
    }
  }, [height, width, totalHeight]);

  // Helper function to set item positioning via CSS custom properties
  const setItemPosition = useCallback((element: HTMLDivElement, index: number) => {
    const top = index * itemHeight;
    element.style.setProperty('--item-top', `${top}px`);
    element.style.setProperty('--item-height', `${itemHeight}px`);
  }, [itemHeight]);

  return (
    <div
      ref={containerRef}
      className={`${styles['virtualized-container']} scrollbar-thin scrollbar-track-cosmic-dark scrollbar-thumb-cosmic-purple ${className}`}
      role='region'
      aria-label={ariaLabel}
    >
      <div 
        className={styles['virtualized-inner']} 
        role='list'
        id="virtualized-list-context"
      >
        {items.length === 0 ? (
          <div role="listitem" aria-label="No items to display">
            {/* Empty state - can be customized via props if needed */}
          </div>
        ) : (
          visible.map((item, i) => {
            const index = startIndex + i;
            return (
              <div
                key={index}
                role='listitem'
                className={styles['virtualized-item']}
                ref={(el) => {
                  if (el) setItemPosition(el, index);
                }}
              >
                {render(item, index)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}) as <T>(props: VirtualizedListProps<T>) => React.ReactElement;

// Export the props type for external use
export type { VirtualizedListProps };

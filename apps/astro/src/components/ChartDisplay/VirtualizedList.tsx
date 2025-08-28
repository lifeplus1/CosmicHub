import React, { useRef, useState, useEffect, useCallback } from 'react';

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

export function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  width,
  render,
  overscanCount = 4,
  ariaLabel,
  className,
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

  return (
    <div
      ref={containerRef}
      data-style={JSON.stringify({
        position: 'relative',
        height,
        width,
        overflowY: 'auto',
      })}
      className={className ?? ''}
      role='list'
      aria-label={ariaLabel}
    >
      <div
        data-style={JSON.stringify({
          height: totalHeight,
          position: 'relative',
        })}
      >
        {visible.map((item, i) => {
          const index = startIndex + i;
          const top = index * itemHeight;
          return (
            <div
              key={index}
              role='listitem'
              data-style={JSON.stringify({
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                height: itemHeight,
              })}
            >
              {render(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

const DOT_SIZE = 8;
const DOT_GAP = 2;

export const useResponsiveColumns = (columns?: number) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const dotsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let resizeObserver: ResizeObserver;
    
    const updateWidth = () => {
      if (dotsContainerRef.current) {
        const rect = dotsContainerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
      }
    };

    updateWidth();

    if (dotsContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(dotsContainerRef.current);
    } else {
      window.addEventListener("resize", updateWidth);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateWidth);
      }
    };
  }, []);

  const computedColumns = columns || (() => {
    if (containerWidth <= 0) return 20;
    
    const availableWidth = containerWidth;
    const dotWidth = DOT_SIZE;
    const gapWidth = DOT_GAP;
    
    const maxColumns = Math.floor((availableWidth + gapWidth) / (dotWidth + gapWidth));
    
    return Math.max(10, Math.min(100, maxColumns));
  })();

  return { computedColumns, dotsContainerRef };
};

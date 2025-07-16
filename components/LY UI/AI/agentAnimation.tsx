"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface AgentAnimationProps {
  title?: string;
  onComplete?: () => void;
  columns?: number;
  rows?: number;
  duration?: number;
  blinkDuration?: number;
}

const DEFAULT_ROWS = 3;
const DOT_SIZE = 6;

const DOT_COLORS = {
  active: "text-blue-500",
  inactive: "text-neutral-400 dark:text-neutral-600"
} as const;

const AgentAnimation: React.FC<AgentAnimationProps> = ({
  title = "Agent",
  onComplete,
  rows = DEFAULT_ROWS,
  columns,
  duration = 3000,
  blinkDuration = 150,
}) => {
  const [percent, setPercent] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dotStates, setDotStates] = useState<boolean[][]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Memoized computed columns
  const computedColumns = useMemo(() =>
    columns || Math.max(6, Math.floor((containerWidth * 0.95) / DOT_SIZE)),
    [columns, containerWidth]
  );

  // Optimized resize handler with debounce
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Initialize dot states only when dimensions change
  useEffect(() => {
    if (computedColumns > 0 && !hasAnimated) {
      setDotStates(Array(rows).fill(null).map(() => Array(computedColumns).fill(false)));
    }
  }, [rows, computedColumns, hasAnimated]);

  // Optimized percentage update using RAF
  const updatePercent = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const newPercent = Math.min(100, Math.round((elapsed / totalDurationRef.current) * 100));

    setPercent(newPercent);

    if (newPercent < 100) {
      animationFrameRef.current = requestAnimationFrame(updatePercent);
    } else {
      onComplete?.();
    }
  }, [onComplete]);

  // Optimized dot state update with batch processing
  const updateDotState = useCallback((row: number, col: number, state: boolean) => {
    setDotStates(prev => {
      const newStates = prev.map(r => [...r]);
      newStates[row][col] = state;
      return newStates;
    });
  }, []);

  // Animation principale - ne se déclenche qu'une seule fois
  useEffect(() => {
    if (dotStates.length === 0 || hasAnimated) return;

    setHasAnimated(true);

    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.clear();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    startTimeRef.current = performance.now();
    totalDurationRef.current = duration;

    // Pre-calculate all animation timings
    const animations: Array<{
      row: number;
      col: number;
      delays: number[];
    }> = [];

    // Calculer les timings pour s'adapter à la durée totale
    const animationWindow = duration * 0.8; // 80% de la durée pour les animations
    const columnDelay = animationWindow / computedColumns; // Délai entre chaque colonne

    for (let col = 0; col < computedColumns; col++) {
      const baseDelay = col * columnDelay;

      for (let row = 0; row < rows; row++) {
        const randomDelay = Math.random() * (columnDelay * 0.3); // 30% de variation
        const blinkCount = 2 + Math.floor(Math.random() * 3);
        const totalDelay = baseDelay + randomDelay;

        const delays: number[] = [];

        // Calculate blink timings avec blinkDuration
        for (let blink = 0; blink < blinkCount; blink++) {
          const onTime = totalDelay + blink * blinkDuration * 2;
          const offTime = onTime + blinkDuration;
          delays.push(onTime, offTime);
        }

        // Final state - tous les dots restent allumés à la fin
        const finalTime = totalDelay + blinkCount * blinkDuration * 2;
        delays.push(finalTime);

        animations.push({ row, col, delays });
      }
    }

    // Execute animations with optimized scheduling
    animations.forEach(({ row, col, delays }) => {
      delays.forEach((delay, index) => {
        const timeout = setTimeout(() => {
          const isOn = index === delays.length - 1 || index % 2 === 0;
          updateDotState(row, col, isOn);
        }, delay);

        timeoutsRef.current.add(timeout);
      });
    });

    // Start percentage animation
    animationFrameRef.current = requestAnimationFrame(updatePercent);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dotStates.length, hasAnimated, duration, blinkDuration, computedColumns, rows, updatePercent, updateDotState]);

  // Memoized dot color calculation
  const getDotColor = useCallback((col: number, row: number) => {
    return dotStates[row]?.[col] ? DOT_COLORS.active : DOT_COLORS.inactive;
  }, [dotStates]);

  // Memoized rows and columns arrays
  const rowsArray = useMemo(() => Array.from({ length: rows }, (_, i) => i), [rows]);
  const columnsArray = useMemo(() => Array.from({ length: computedColumns }, (_, i) => i), [computedColumns]);

  return (
    <div className="flex flex-col items-center px-4 gap-2 w-full">
      <div
        style={{ fontFamily: 'Consolas, monospace' }}
        className="text-lg font-mono text-neutral-800 uppercase dark:text-white"
      >
        {title}: {percent}%
      </div>
      <div
        ref={containerRef}
        className="flex flex-col gap-0 w-full items-center"
        style={{ minHeight: rows * 10 }}
      >
        {rowsArray.map((row) => (
          <div key={row} className="flex flex-row gap-0.5 w-full justify-center">
            {columnsArray.map((col) => (
              <span
                key={col}
                className={`text-[8px] transition-colors duration-100 ${getDotColor(col, row)}`}
                style={{ display: "inline-block", lineHeight: 1 }}
              >
                •
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentAnimation;

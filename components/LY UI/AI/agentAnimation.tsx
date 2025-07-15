"use client";
import React, { useEffect, useRef, useState } from "react";

interface AgentAnimationProps {
  title?: string;
  onComplete?: () => void;
  columns?: number;
  rows?: number;
  blinkDuration?: number;
}

const DEFAULT_ROWS = 3;
const DOT_SIZE = 6;

const AgentAnimation: React.FC<AgentAnimationProps> = ({
  title = "Agent",
  onComplete,
  rows = DEFAULT_ROWS,
  columns,
  blinkDuration = 2000,
}) => {
  const [percent, setPercent] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dotStates, setDotStates] = useState<boolean[][]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const blinkTimeouts = useRef<NodeJS.Timeout[]>([]);
  const phaseTimeout = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const computedColumns = columns || Math.max(6, Math.floor((containerWidth * 0.95) / DOT_SIZE));

  useEffect(() => {
    setDotStates(Array(rows).fill(null).map(() => Array(computedColumns).fill(false)));
  }, [rows, computedColumns]);

  useEffect(() => {
    if (dotStates.length === 0) return;

    blinkTimeouts.current.forEach(clearTimeout);
    blinkTimeouts.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);

    let maxDelay = 0;

    // Dot animation logic
    for (let col = 0; col < computedColumns; col++) {
      const baseDelay = col * 150;

      for (let row = 0; row < rows; row++) {
        const randomDelay = Math.random() * 100;
        const blinkCount = 2 + Math.floor(Math.random() * 3);
        const blinkSpeed = 80 + Math.random() * 80;
        const totalDelay = baseDelay + randomDelay;

        for (let blink = 0; blink < blinkCount; blink++) {
          const onTimeout = setTimeout(() => {
            setDotStates(prev => {
              const newStates = prev.map(r => [...r]);
              newStates[row][col] = true;
              return newStates;
            });
          }, totalDelay + blink * blinkSpeed * 2);

          const offTimeout = setTimeout(() => {
            setDotStates(prev => {
              const newStates = prev.map(r => [...r]);
              newStates[row][col] = false;
              return newStates;
            });
          }, totalDelay + blink * blinkSpeed * 2 + blinkSpeed);

          blinkTimeouts.current.push(onTimeout, offTimeout);
        }

        const finalTimeout = setTimeout(() => {
          setDotStates(prev => {
            const newStates = prev.map(r => [...r]);
            newStates[row][col] = true;
            return newStates;
          });
        }, totalDelay + blinkCount * blinkSpeed * 2);

        blinkTimeouts.current.push(finalTimeout);

        maxDelay = Math.max(maxDelay, totalDelay + blinkCount * blinkSpeed * 2);
      }
    }

    // Smooth percentage animation
    const totalDuration = maxDelay + 200;
    const increment = 100 / (totalDuration / 50); // Update every 50ms
    let currentPercent = 0;

    intervalRef.current = setInterval(() => {
      currentPercent += increment;
      if (currentPercent >= 100) {
        setPercent(100);
        clearInterval(intervalRef.current!);
      } else {
        setPercent(Math.min(Math.round(currentPercent), 100));
      }
    }, 50);

    // Complete the animation
    phaseTimeout.current = setTimeout(() => {
      setPercent(100);
      onComplete?.();
    }, totalDuration);

    return () => {
      blinkTimeouts.current.forEach(clearTimeout);
      if (phaseTimeout.current) clearTimeout(phaseTimeout.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [blinkDuration, rows, computedColumns, dotStates.length, onComplete]);

  const getDotColor = (col: number, row: number) => {
    return dotStates[row]?.[col]
      ? "text-blue-500"
      : "text-neutral-400 dark:text-neutral-600";
  };

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
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex flex-row gap-0.5 w-full justify-center">
            {Array.from({ length: computedColumns }).map((_, col) => (
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
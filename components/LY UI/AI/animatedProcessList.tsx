"use client";
import { Loader } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LineListItemProps {
  numberOfLine: number;
  contenu: string;
  loading?: boolean;
}

interface AnimatedProcessListProps {
  title?: string;
  lines?: string[];
  className?: string;
  scrollDirection?: "up" | "down";
  animationSpeed?: "slow" | "normal" | "fast";
  onAnimationEnd?: () => void;
  skeletonDuration?: number;
  lineRevealDelay?: number;
}

const SkeletonItem: React.FC = () => (
  <div className="flex items-center justify-start gap-2 p-4 h-8 w-full rounded-lg">
    <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-10 animate-pulse"></div>
    <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-4/6 animate-pulse"></div>
  </div>
);

const LineListItem: React.FC<LineListItemProps> = ({
  numberOfLine,
  contenu,
  loading = false,
}) => {
  if (loading) {
    return <SkeletonItem />;
  }

  return (
    <li className="flex items-center justify-start gap-2 py-4 h-8 px-2 w-full rounded-lg hover:bg-neutral-300/30 dark:hover:bg-neutral-700/30">
      <div className="text-sm font-mono text-red-800 dark:text-neutral-400">
        {numberOfLine}
      </div>
      <p className="text-sm line-clamp-1 overflow-hidden text-ellipsis text-neutral-800 dark:text-gray-200">
        {contenu}
      </p>
    </li>
  );
};

const AnimatedProcessList: React.FC<AnimatedProcessListProps> = ({
  title = "Generating elements for your web page",
  lines = [],
  className,
  scrollDirection = "up",
  animationSpeed = "normal",
  onAnimationEnd,
  skeletonDuration = 2000,
  lineRevealDelay = 150,
}) => {
  // --- Animation speed mapping (match lovable version for infinite effect) ---
  const speedMap = {
    slow: "8s",
    normal: "5s",
    fast: "3s",
  };

  // --- State for reveal animation ---
  const [revealedLines, setRevealedLines] = useState<boolean[]>([]);
  const [isSkeletonPhase, setIsSkeletonPhase] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // --- Reveal lines one by one after skeleton phase ---
  useEffect(() => {
    setRevealedLines(new Array(lines.length).fill(false));
    setIsSkeletonPhase(true);
    setStartAnimation(false);

    const skeletonTimer = setTimeout(() => {
      setIsSkeletonPhase(false);
      const interval = setInterval(() => {
        setRevealedLines((prev) => {
          const nextIndex = prev.findIndex((revealed) => !revealed);
          if (nextIndex === -1) {
            clearInterval(interval);
            setTimeout(() => setStartAnimation(true), 500);
            onAnimationEnd?.();
            return prev;
          }
          const newState = [...prev];
          newState[nextIndex] = true;
          return newState;
        });
      }, lineRevealDelay);
      return () => clearInterval(interval);
    }, skeletonDuration);

    return () => clearTimeout(skeletonTimer);
  }, [lines.length, skeletonDuration, lineRevealDelay, onAnimationEnd]);

  // --- For infinite scroll, duplicate the lines array ---
  const duplicatedLines = [...lines, ...lines];

  return (
    <>
      <style>{`
        @keyframes scrollUp {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }

        @keyframes scrollDown {
          from {
            transform: translateY(-50%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes fadeInLine {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .line-reveal {
          animation: fadeInLine 0.3s ease-out forwards;
        }

        .scroll-animation-up {
          animation: scrollUp ${speedMap[animationSpeed]} linear infinite;
        }

        .scroll-animation-down {
          animation: scrollDown ${speedMap[animationSpeed]} linear infinite;
        }
      `}</style>

      <div
        className={cn(
          "flex flex-col max-w-3xl justify-start items-center gap-2 bg-transparent rounded-xl p-4",
          className
        )}
      >
        <div className="flex gap-2 justify-start items-center w-full">
          <Loader className="animate-spin w-4 h-4 min-w-4 text-black dark:text-white" />
          <h2 className="text-xl font-semibold py-2 text-center text-neutral-700 dark:text-gray-200">
            {title}
          </h2>
        </div>

        <div className="relative w-full max-w-xl h-72 overflow-hidden rounded-lg">
          <div
            ref={contentRef}
            className={cn(
              "absolute top-0 left-0 w-full",
              startAnimation &&
                !isSkeletonPhase &&
                (scrollDirection === "up"
                  ? "scroll-animation-up"
                  : "scroll-animation-down")
            )}
          >
            <ul className="space-y-1 px-4">
              {(startAnimation ? duplicatedLines : lines).map((contenu, idx) => {
                // For infinite scroll, reveal all lines after animation starts
                const originalIndex = idx % lines.length;
                const isRevealed = startAnimation || revealedLines[originalIndex];
                return (
                  <li
                    key={`line-container-${idx}`}
                    className={isRevealed && !isSkeletonPhase ? "line-reveal" : ""}
                  >
                    <LineListItem
                      numberOfLine={originalIndex + 112}
                      contenu={contenu}
                      loading={isSkeletonPhase || !isRevealed}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Gradients for fade effect */}
          <div className="absolute z-10 pointer-events-none inset-0 h-full">
            <div className="absolute inset-0 bg-gradient-to-b dark:from-black from-white dark:via-white/10 via-white/5 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t dark:from-black from-white dark:via-black/10 via-white/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-l dark:from-black from-white dark:via-black/30 via-white/70 to-transparent"></div>
          </div>
        </div>
      </div>
    </>
  );
};

AnimatedProcessList.displayName = "AnimatedProcessList";
export default AnimatedProcessList;
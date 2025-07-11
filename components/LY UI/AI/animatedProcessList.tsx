"use client";
import { Loader } from "lucide-react";
import React, { useState, useEffect, useRef, forwardRef } from "react";
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
  <div className="flex items-center justify-start gap-2 p-4 h-8 w-full  rounded-lg ">
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

const AnimatedProcessList = forwardRef<HTMLDivElement, AnimatedProcessListProps>(({
  title = "Generating elements for your web page",
  lines = [],
  className,
  scrollDirection = "up",
  animationSpeed = "normal",
  onAnimationEnd,
  skeletonDuration = 2000,
  lineRevealDelay = 150,
  ...props
}, ref) => {
  const [revealedLines, setRevealedLines] = useState<boolean[]>([]);
  const [isSkeletonPhase, setIsSkeletonPhase] = useState(true);
  const contentRef = useRef<HTMLUListElement>(null);

  // Animation speed mapping
  const speedMap = {
    slow: "5s",
    normal: "3s",
    fast: "1.5s",
  };

  // Initialisation et gestion du skeleton/révélation
  useEffect(() => {
    setRevealedLines(new Array(lines.length).fill(false));
    setIsSkeletonPhase(true);

    const skeletonTimer = setTimeout(() => {
      setIsSkeletonPhase(false);

      // Révélation progressive des lines
      const interval = setInterval(() => {
        setRevealedLines((prev) => {
          const nextIndex = prev.findIndex((revealed) => !revealed);
          if (nextIndex === -1) {
            clearInterval(interval);
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

  // Animation de scroll continue
  useEffect(() => {
    if (!contentRef.current) return;

    const animationName = scrollDirection === "up" ? "scrollUp" : "scrollDown";
    contentRef.current.style.animation = `${animationName} ${
      speedMap[animationSpeed]
    } linear infinite`;

    return () => {
      if (contentRef.current) {
        contentRef.current.style.animation = "";
      }
    };
  }, [scrollDirection, animationSpeed]);

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
      `}</style>

      <div
        ref={ref}
        className={cn(
          "flex flex-col max-w-xl  justify-start items-center gap-2 bg-transparent rounded-xl p-4",
          className
        )}
        {...props}
      >
        <div className="flex gap-2 justify-start items-center w-full">
          <Loader className="animate-spin min-h-5 min-w-5  text-black dark:text-white" />
          <h2 className="text-xl font-semibold py-2 text-center text-neutral-700 dark:text-gray-200">
            {title}
          </h2>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl px-4 w-full max-w-xl relative h-72 justify-center items-center">
          <div className="absolute z-10  pointer-events-none inset-0 h-full">
            <div className="absolute inset-0 bg-gradient-to-b dark:from-black from-white dark:via-white/10 via-white/5 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t dark:from-black from-white dark:via-black/10 via-white/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-l dark:from-black from-white dark:via-black/30 via-white/70 to-transparent"></div>
          </div>

          <ul ref={contentRef} className="absolute bg-transparent z-0 w-full space-y-1">
            {lines.map((contenu, idx) => (
              <div key={`line-container-${idx}`} className={revealedLines[idx] ? "line-reveal" : ""}>
                <LineListItem
                  numberOfLine={idx + 112}
                  contenu={contenu}
                  loading={isSkeletonPhase || !revealedLines[idx]}
                />
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
});

AnimatedProcessList.displayName = 'AnimatedProcessList';
export default AnimatedProcessList;

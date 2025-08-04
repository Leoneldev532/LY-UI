"use client";
import { Loader } from "lucide-react";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useCodeListAnimation } from "@/components/hooks/useCodeListAnimation";

interface CodeLineItemProps {
  lineNumber: number;
  content: string;
  loading?: boolean;
}

interface AnimatedCodeListProps {
  title?: string;
  codeLines?: string[];
  className?: string;
  scrollDirection?: "up" | "down";
  animationSpeed?: "slow" | "normal" | "fast";
  scrollDuration?: number; // Custom duration in ms
  scrollCadence?: "smooth" | "stepped";
  pauseDuration?: number;
  skeletonDuration?: number;
  lineRevealDelay?: number;
  containerHeight?: number; // Hauteur du conteneur en pixels
  startLineNumber?: number;
}

const SkeletonItem: React.FC = () => (
  <div className="flex items-center justify-start gap-2 py-2 h-9 w-full rounded-lg">
    <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-10 animate-pulse"></div>
    <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-4/6 animate-pulse"></div>
  </div>
);

const CodeLineItem: React.FC<CodeLineItemProps> = ({
  lineNumber,
  content,
  loading = false,
}) => {
  if (loading) {
    return <SkeletonItem />;
  }

  return (
    <li className="flex items-center justify-start gap-2 py-2 h-9 px-2 w-full rounded-lg hover:bg-neutral-300/30 dark:hover:bg-neutral-700/30">
      <div className="text-sm font-mono text-red-800 dark:text-neutral-400 min-w-[2rem]">
        {lineNumber}
      </div>
      <p className="text-sm line-clamp-1 overflow-hidden text-ellipsis text-neutral-800 dark:text-gray-200">
        {content}
      </p>
    </li>
  );
};

const AnimatedCodeList = forwardRef<HTMLDivElement, AnimatedCodeListProps>(
  (
    {
      title = "Generating code for your application",
      codeLines = [],
      className,  
      scrollDirection = "up",
      animationSpeed = "normal",
      scrollDuration,
      scrollCadence = "smooth",
      pauseDuration = 200,
      skeletonDuration = 150,
      lineRevealDelay = 10,
      containerHeight = 288, // 18rem = 288px default (h-72)
      startLineNumber = 1,
      ...props
    },
    ref
  ) => {
    const { isSkeletonPhase, revealedLines, visibleLines, contentRef, visibleItems } =
      useCodeListAnimation({
        codeLines,
        scrollDirection,
        animationSpeed,
        scrollDuration,
        scrollCadence,
        pauseDuration,
        skeletonDuration,
        lineRevealDelay,
        containerHeight,
      });

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col max-w-xl justify-start items-center gap-2 bg-transparent rounded-xl p-4",
          className
        )}
        {...props}
      >
        <div className="flex gap-2 justify-start items-center w-full">
          <Loader className="animate-spin min-h-5 min-w-5 text-black dark:text-white" />
          <h2 className="text-lg md:text-xl line-clamp-1 font-semibold py-2 text-left text-neutral-700 dark:text-gray-200 w-full">
            {title}
          </h2>
        </div>

        <div 
          className="flex flex-col overflow-hidden rounded-xl px-4 w-full max-w-xl relative justify-center items-center"
          style={{ height: `${containerHeight}px` }} // Hauteur dynamique
        >
          {/* Gradients pour masquer les bords */}
          <div className="absolute z-10 pointer-events-none inset-0 h-full">
            <div className="absolute inset-0 bg-gradient-to-b dark:from-black from-white via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t dark:from-black from-white via-transparent to-transparent"></div>
          </div>

          {/* Liste de code */}
          <ul 
            ref={contentRef} 
            className="absolute bg-transparent z-0 w-full space-y-0"
          >
            {visibleLines.map(({ content, actualIndex }, idx) => (
              <div
                key={`${actualIndex}-${idx}`}
                className={cn(
                  "transition-opacity duration-300",
                  revealedLines[actualIndex] ? "opacity-100" : "opacity-0"
                )}
              >
                <CodeLineItem
                  lineNumber={startLineNumber + actualIndex}
                  content={content}
                  loading={isSkeletonPhase || !revealedLines[actualIndex]}
                />
              </div>
            ))}
          </ul>
        </div>
        
      </div>
    );
  }
);

AnimatedCodeList.displayName = "AnimatedCodeList";
export default AnimatedCodeList;
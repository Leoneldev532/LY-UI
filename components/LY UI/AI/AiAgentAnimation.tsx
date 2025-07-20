"use client";
import { useAnimationState } from "@/components/hooks/useAnimationState";
import { useResponsiveColumns } from "@/components/hooks/useResponsiveColumns";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import AnimationStatus from "./AnimationStatus";
import DotGrid from "./dotsGrid";

interface AiAgentAnimationProps {
  title?: string;
  duration?: number;
  onAnimationComplete?: () => void;
  columns?: number;
  rows?: number;
  className?: string;
  pauseDuration?: number;
  isRunning?: boolean;
  onAnimationStart?: () => void;
  onAnimationStop?: () => void;
  onAnimationReset?: () => void;
  dotType?: 'round' | 'square';
}

const DEFAULT_ROWS = 3;

const AiAgentAnimation = forwardRef<HTMLDivElement, AiAgentAnimationProps>(({
  title = "Agent",
  duration = 3000,
  onAnimationComplete,
  className,
  rows = DEFAULT_ROWS,
  columns,
  pauseDuration = 500,
  isRunning = false,
  onAnimationStart,
  onAnimationStop,
  onAnimationReset,
  dotType = 'round',
  ...props
}, ref) => {
  const { computedColumns, dotsContainerRef } = useResponsiveColumns(columns);

  const animationState = useAnimationState({
    rows,
    columns: computedColumns,
    duration,
    pauseDuration,
    isRunning,
    onStart: onAnimationStart,
    onStop: onAnimationStop,
    onReset: onAnimationReset,
    onComplete: onAnimationComplete
  });

  return (
    <div
      ref={ref}
      className={cn("flex flex-col items-start justify-start px-4 gap-2 w-full", className)}
      {...props}
    >
      <AnimationStatus
        title={title}
        phase={animationState.phase}
        displayPercent={animationState.displayPercent}
        elapsedTime={animationState.elapsedTime}
        computedColumns={computedColumns}
      />

      <DotGrid
        dotStates={animationState.dotStates}
        phase={animationState.phase}
        rows={rows}
        columns={computedColumns}
        dotType={dotType}
        containerRef={dotsContainerRef}
      />
    </div>
  );
});

AiAgentAnimation.displayName = "AiAgentAnimation";
export default AiAgentAnimation;

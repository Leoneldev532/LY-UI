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
  onComplete?: () => void;
  columns?: number;
  rows?: number;
  className?: string;
  blinkDuration?: number;
  pauseDuration?: number;
  isRunning?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  dotType?: 'round' | 'square';
}

const DEFAULT_ROWS = 3;

const AiAgentAnimation = forwardRef<HTMLDivElement, AiAgentAnimationProps>(({
  title = "Agent",
  duration = 3000,
  onComplete,
  className,
  rows = DEFAULT_ROWS,
  columns,
  blinkDuration = 2000,
  pauseDuration = 500,
  isRunning = false,
  onStart,
  onStop,
  onReset,
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
    onStart,
    onStop,
    onReset,
    onComplete
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

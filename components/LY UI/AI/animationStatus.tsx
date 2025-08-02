import React from "react";

interface AnimationStatusProps {
  title: string;
  phase: 'idle' | 'blinking' | 'pause' | 'stopped' | 'completed';
  displayPercent: number;
  elapsedTime: number;
  computedColumns?: number;
}

const AnimationStatus: React.FC<AnimationStatusProps> = ({
  title,
  phase,
  displayPercent,
  elapsedTime,
  computedColumns
}) => {
  const getStatusText = () => {
    switch (phase) {
      case 'idle': 
        return 'Ready';
      case 'blinking': 
        return `Pending ${Math.round(displayPercent)}%`;
      case 'pause': 
        return 'Finalizing 100%';
      case 'completed': 
        return 'Completed ✓';
      case 'stopped': 
        return `Paused (${Math.round(displayPercent)}%)`;
      default: 
        return `${Math.round(displayPercent)}%`;
    }
  };

  const getStatusIndicator = () => {
    switch (phase) {
      case 'idle':
        return <span className="text-neutral-400 dark:text-neutral-500">●</span>;
      case 'blinking':
        return <span className="text-blue-500 animate-pulse">●</span>;
      case 'pause':
        return <span className="text-amber-500 animate-pulse">●</span>;
      case 'completed':
        return <span className="text-green-500">●</span>;
      case 'stopped':
        return <span className="text-red-500">●</span>;
      default:
        return <span className="text-neutral-400">●</span>;
    }
  };

  const formatTime = (seconds: number) => {
    return seconds.toFixed(1) + 's';
  };

  return (
    <div className="text-sm flex justify-between items-center font-light text-neutral-800 uppercase dark:text-neutral-200 w-full">
      <div className="flex items-center gap-2">
        {getStatusIndicator()}
        <span className="font-mono dark:text-neutral-200/70">{title}: {getStatusText()}</span>
      </div>
      <div className="flex items-center gap-3 pr-2">
       
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          {formatTime(elapsedTime)}
        </span>
      </div>
    </div>
  );
};
AnimationStatus.displayName = 'AnimationStatus';
export default AnimationStatus;

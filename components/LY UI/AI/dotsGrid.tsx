import React from "react";

const DOT_SIZE = 8;
const DOT_GAP = 2;

interface DotGridProps {
  dotStates: boolean[][];
  phase: 'idle' | 'blinking' | 'pause' | 'stopped' | 'completed';
  rows: number;
  columns: number;
  dotType?: 'round' | 'square';
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const DotGrid: React.FC<DotGridProps> = ({
  dotStates,
  phase,
  rows,
  columns,
  dotType = 'round',
  containerRef
}) => {
  const getDotColor = (col: number, row: number) => {
    if (phase === 'idle') {
      return "text-neutral-400 dark:text-neutral-600";
    }
    if (phase === 'blinking' || phase === 'stopped') {
      return dotStates[row]?.[col]
        ? "text-blue-500"
        : "text-neutral-400 dark:text-neutral-600";
    }
    if (phase === 'pause' || phase === 'completed') {
      return "text-green-500";
    }
    
    return "text-blue-500";
  };

  const getDotSymbol = () => {
    return dotType === 'square' ? '▪' : '•';
  };

  const getDotStyle = () => {
    return {
      fontSize: `${DOT_SIZE}px`,
      display: 'inline-block' as const,
      lineHeight: 1,
      width: `${DOT_SIZE}px`,
      textAlign: 'center' as const,
    };
  };

  return (
    <div
      className="flex flex-col gap-0 w-full justify-start items-start"
      style={{ minHeight: rows * (DOT_SIZE + DOT_GAP) }}
    >
      <div ref={containerRef} className="w-full">
        {Array.from({ length: rows }).map((_, row) => (
          <div 
            key={row} 
            className="flex flex-row justify-start items-center w-full" 
            style={{ gap: `${DOT_GAP}px`, marginBottom: row < rows - 1 ? `${DOT_GAP}px` : '0' }}
          >
            {Array.from({ length: columns }).map((_, col) => (
              <span
                key={col}
                className={`select-none transition-colors duration-100 ${getDotColor(col, row)}`}
                style={getDotStyle()}
              >
                {getDotSymbol()}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DotGrid;

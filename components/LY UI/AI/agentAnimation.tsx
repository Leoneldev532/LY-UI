"use client"
import React, { useEffect, useRef, useState } from "react";

interface AgentAnimationProps {
  title?: string;
  duration?: number; // durée de l'animation en ms (par défaut 3000)
  onComplete?: () => void;
}

const DOTS = 40;

const AgentAnimation: React.FC<AgentAnimationProps> = ({
  title = "Agent",
  duration = 3000,
  onComplete,
}) => {
  const [percent, setPercent] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    function animate(time: number) {
      if (startTime.current === null) startTime.current = time;
      const elapsed = time - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setPercent(Math.round(progress * 100));
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
      startTime.current = null;
    };
  }, [duration, onComplete]);

  // Calcul du nombre de points à remplir
  const filledDots = Math.round((percent / 100) * DOTS);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        style={{ fontFamily: 'Consolas, monospace' }}
        className="text-lg font-mono text-neutral-800 dark:text-white"
      >
        {title}: {percent}%
      </div>
      <div className="flex gap-1 w-full justify-center">
        {Array.from({ length: DOTS }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full border border-dashed border-neutral-400 dark:border-neutral-600 transition-colors duration-200 ${
              i < filledDots
                ? "bg-blue-500 border-blue-500"
                : "bg-transparent"
            }`}
            style={{ display: "inline-block" }}
          />
        ))}
      </div>
    </div>
  );
};

export default AgentAnimation; 
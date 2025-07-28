import { useState, useRef, useCallback, useEffect } from "react";

export const useItemCompletion = (
  index: number,
  isVisible: boolean,
  onComplete: (index: number) => void,
  onItemCompleted?: (index: number) => void
) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const completionCalledRef = useRef(false);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleItemComplete = useCallback(() => {
    if (completionCalledRef.current || !isVisible) {
      return;
    }

    completionCalledRef.current = true;
    console.log(`Item ${index} completing...`);

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    setIsCompleted(true);

    setTimeout(() => {
      if (completionCalledRef.current) {
        onComplete(index);
        if (onItemCompleted) onItemCompleted(index);
      }
    }, 200);
  }, [isVisible, onComplete, index, onItemCompleted]);

  const resetCompletion = useCallback(() => {
    setIsCompleted(false);
    setIsAnimating(false);
    completionCalledRef.current = false;

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (isVisible && !isAnimating && !isCompleted && !completionCalledRef.current) {
      console.log(`Starting animation for item ${index}`);
      setIsAnimating(true);

      safetyTimerRef.current = setTimeout(() => {
        if (!completionCalledRef.current && isVisible) {
          console.log(`Safety timeout triggered for item ${index}`);
          handleItemComplete();
        }
      }, 2000);
    }
  }, [isVisible, isAnimating, isCompleted, handleItemComplete, index]);

  return {
    isCompleted,
    isAnimating,
    handleItemComplete,
    resetCompletion,
    startAnimation,
    safetyTimerRef,
  };
};
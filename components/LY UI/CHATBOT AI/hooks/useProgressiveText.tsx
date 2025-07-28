import { useState, useEffect, useRef, useMemo } from 'react';

export function useProgressiveText(
  text: string,
  isActive: boolean = false,
  speed: number = 50
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);
  const prevTextRef = useRef('');
  const prevIsActiveRef = useRef(false);

  // Stable speed value to prevent unnecessary effect re-runs
  const stableSpeed = useMemo(() => Math.max(1, speed), [speed]);

  // Reset when text or isActive changes
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isActive) {
      // If not active, show full text immediately
      setDisplayedText(text);
      setIsWriting(false);
      setIsComplete(true);
      indexRef.current = text.length;
      prevTextRef.current = text;
      prevIsActiveRef.current = isActive;
      return;
    }

    // Check if we need to restart the animation
    const shouldRestart = 
      prevTextRef.current !== text || 
      prevIsActiveRef.current !== isActive ||
      isComplete;

    if (shouldRestart) {
      // Reset for new progressive display
      setDisplayedText('');
      setIsWriting(true);
      setIsComplete(false);
      indexRef.current = 0;

      prevTextRef.current = text;
      prevIsActiveRef.current = isActive;

      // Start progressive text display
      if (text.length > 0) {
        intervalRef.current = setInterval(() => {
          const currentIndex = indexRef.current;
          const nextIndex = currentIndex + 1;
          
          if (nextIndex >= text.length) {
            // Animation complete
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setDisplayedText(text);
            setIsWriting(false);
            setIsComplete(true);
            indexRef.current = text.length;
          } else {
            indexRef.current = nextIndex;
            setDisplayedText(text.slice(0, nextIndex));
          }
        }, stableSpeed);
      } else {
        // Empty text case
        setIsWriting(false);
        setIsComplete(true);
      }
    }
  }, [text, isActive, stableSpeed, isComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return useMemo(() => ({
    displayedText,
    isWriting,
    isComplete
  }), [displayedText, isWriting, isComplete]);
}
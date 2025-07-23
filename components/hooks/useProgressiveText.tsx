"use client"

import { useEffect, useState, useRef, useCallback } from "react";

export const useProgressiveText = (text: string, isLoading: boolean, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Use refs to avoid recreating values on each render
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

  // Memoized cleanup function
  const clearAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Clear any existing animation
    clearAnimation();
    currentIndexRef.current = 0;

    if (!text || isLoading) {
      setDisplayedText("");
      setIsWriting(false);
      setIsComplete(false);
      return;
    }

    setIsWriting(true);
    setIsComplete(false);
    setDisplayedText("");

    intervalRef.current = setInterval(() => {
      if (currentIndexRef.current < text.length) {
        currentIndexRef.current++;
        setDisplayedText(text.slice(0, currentIndexRef.current));
      } else {
        setIsWriting(false);
        setIsComplete(true);
        clearAnimation();
      }
    }, speed);

    return clearAnimation;
  }, [text, isLoading, speed, clearAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return clearAnimation;
  }, [clearAnimation]);

  return { displayedText, isWriting, isComplete };
};

// File: components/hooks/useProgressiveText.ts
"use client";
import { useState, useEffect, useRef, useMemo } from "react";

export function useProgressiveText(
  text: string,
  isActive: boolean = false,
  speed: number = 50 // Increased speed for visibility
) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const charIndexRef = useRef<number>(0);
  const prevTextRef = useRef<string>("");
  const prevIsActiveRef = useRef<boolean>(false);

  const stableSpeed = useMemo(() => Math.max(1, speed), [speed]);

  useEffect(() => {

    if (typeof text !== "string") {
      console.warn("useProgressiveText: 'text' must be a string");
      setDisplayedText("");
      setIsWriting(false);
      setIsComplete(true);
      return;
    }

    if (speed <= 0) {
      console.warn("useProgressiveText: 'speed' must be greater than 0");
      setDisplayedText(text);
      setIsWriting(false);
      setIsComplete(true);
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isActive) {
      setDisplayedText(text);
      setIsWriting(false);
      setIsComplete(true);
      charIndexRef.current = text.length;
      prevTextRef.current = text;
      prevIsActiveRef.current = isActive;
      return;
    }

    const shouldRestart =
      prevTextRef.current !== text ||
      prevIsActiveRef.current !== isActive ||
      isComplete;

    if (shouldRestart) {
      setDisplayedText("");
      setIsWriting(true);
      setIsComplete(false);
      charIndexRef.current = 0;
      prevTextRef.current = text;
      prevIsActiveRef.current = isActive;

      if (text.length > 0) {
        const characters = text.split("");
        intervalRef.current = setInterval(() => {
          const currentIndex = charIndexRef.current;
        
          if (currentIndex < characters.length) {
            const currentText = characters.slice(0, currentIndex + 1).join("");
            setDisplayedText(currentText);
            charIndexRef.current = currentIndex + 1;
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setDisplayedText(text);
            setIsWriting(false);
            setIsComplete(true);
          }
        }, stableSpeed);
      } else {
        setDisplayedText("");
        setIsWriting(false);
        setIsComplete(true);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, isActive, stableSpeed, isComplete]);

  return useMemo(
    () => ({
      displayedText,
      isWriting,
      isComplete,
    }),
    [displayedText, isWriting, isComplete]
  );
}
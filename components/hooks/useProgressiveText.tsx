
"use client"

import { useEffect, useState } from "react";

export const useProgressiveText = (text: string, isLoading: boolean, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text || isLoading) {
      setDisplayedText("");
      setIsWriting(false);
      setIsComplete(false);
      return;
    }

    setIsWriting(true);
    setIsComplete(false);
    setDisplayedText("");

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsWriting(false);
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isLoading, speed]);

  return { displayedText, isWriting, isComplete };
};

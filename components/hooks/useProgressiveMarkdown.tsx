"use client"
import { useEffect, useState } from "react";
import { marked } from 'marked';

export const useProgressiveMarkdown = (
  markdownText: string, 
  isLoading: boolean, 
  speed: number = 100
) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!markdownText || isLoading) {
      setDisplayedText("");
      setIsWriting(false);
      setIsComplete(false);
      return;
    }

    setIsWriting(true);
    setIsComplete(false);
    setDisplayedText("");

    // Découper par mots au lieu de caractères
    const words = markdownText.split(/(\s+)/);
    let currentWordIndex = 0;

    const interval = setInterval(() => {
      if (currentWordIndex < words.length) {
        const currentText = words.slice(0, currentWordIndex + 1).join('');
        // Parser le texte partiel en Markdown
        // marked.parse can return a Promise if async extensions are used, so ensure we handle only string
        const parsed = marked.parse(currentText);
        if (typeof parsed === "string") {
          setDisplayedText(parsed);
        } else if (parsed instanceof Promise) {
          parsed.then((html) => {
            setDisplayedText(html);
          });
        }
        currentWordIndex++;
      } else {
        setIsWriting(false);
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [markdownText, isLoading, speed]);

  return { displayedHTML: displayedText, isWriting, isComplete };
};
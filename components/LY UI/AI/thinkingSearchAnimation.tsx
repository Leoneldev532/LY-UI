/**
 * ThinkingSearchAnimation component.
 * Animated thinking/searching component with scrolling text and customizable animation.
 *
 * Props:
 * @prop variant - Visual style variant of the component ("default", "ghost", or "outline").
 * @prop streamingText - Text content to animate (split into paragraphs if no messages provided).
 * @prop messages - Array of text content to display in the animation.
 * @prop onAnimationEnd - Callback called when the animation ends.
 * @prop onComplete - Callback called when the animation is fully complete (after collapse).
 * @prop className - Additional CSS classes for styling.
 * @prop scrollDirection - Direction of the scrolling animation ("up" or "down").
 * @prop animationSpeed - Speed of the animation ("slow", "normal", or "fast").
 * @prop minParagraphLength - Minimum length for auto-generated paragraphs from streamingText.
 * @prop sentenceEndPattern - Pattern to split sentences for paragraph grouping in streamingText.
 */

"use client";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React, { useState, useEffect, useRef, forwardRef, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import useScrollYAnimation from "@/components/hooks/useScrollYAnimation";

const cnFallback = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(" ");
const cnUtil = typeof cn !== "undefined" ? cn : cnFallback;

type ThinkingSearchAnimationProps = {
  variant?: "default" | "ghost" | "outline";
  streamingText?: string;
  messages?: string[];
  onAnimationEnd?: () => void;
  onComplete?: () => void; // Added for animation onComplete
  className?: string;
  scrollDirection?: "up" | "down";
  animationSpeed?: "slow" | "normal" | "fast";
  minParagraphLength?: number;
  sentenceEndPattern?: RegExp;
};

const ThinkingSearchAnimation = forwardRef<HTMLDivElement, ThinkingSearchAnimationProps>(({
  variant,
  streamingText,
  messages,
  onAnimationEnd,
  onComplete, // Added here
  className,
  scrollDirection = "up",
  animationSpeed = "normal",
  minParagraphLength = 50,
  sentenceEndPattern = /[.!?]\s+/g,
  ...props
}, ref) => {
  const [animationEnded, setAnimationEnded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [timer, setTimer] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState(200);
  const timerRef = useRef(0);
  const measureRef = useRef<HTMLDivElement>(null);

  // Process streaming text into paragraphs
  const processedMessages = useMemo(() => {
    if (messages && messages.length > 0) {
      return messages;
    }

    if (!streamingText) {
      return [];
    }

    // Split by double line breaks first (natural paragraphs)
    let paragraphs = streamingText.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // If no natural paragraphs found, split by sentences and group them
    if (paragraphs.length <= 1) {
      const sentences = streamingText.split(sentenceEndPattern).filter(s => s.trim().length > 0);
      paragraphs = [];

      let currentParagraph = "";
      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;

        // Add sentence to current paragraph
        currentParagraph += (currentParagraph ? " " : "") + trimmedSentence;

        // If paragraph is long enough, start a new one
        if (currentParagraph.length >= minParagraphLength) {
          paragraphs.push(currentParagraph.trim());
          currentParagraph = "";
        }
      }

      // Add remaining text as final paragraph
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
      }
    }

    // Clean up paragraphs
    return paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => {
        // Ensure paragraphs end with proper punctuation
        const lastChar = p.slice(-1);
        if (!/[.!?]/.test(lastChar)) {
          return p + (p.length > minParagraphLength ? "." : "");
        }
        return p;
      });
  }, [streamingText, messages, minParagraphLength, sentenceEndPattern]);

  // Ajout du onComplete de l'animation ici
  const handleAnimationEnd = () => {
    const currentTime = timerRef.current;
    console.log("Animation ended, capturing time:", currentTime);
    setFinalTime(currentTime);
    setAnimationEnded(true);
    setTimeout(() => {
      setCollapsed(true);
      if (typeof onComplete === "function") {
        onComplete();
      }
    }, 2000);
    if (typeof onAnimationEnd === "function") {
      onAnimationEnd();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!animationEnded && processedMessages && processedMessages.length > 0) {
      interval = setInterval(() => {
        timerRef.current += 1;
        setTimer(timerRef.current);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [animationEnded, processedMessages]);

  useEffect(() => {
    if (processedMessages && processedMessages.length > 0 && timerRef.current === 0) {
      console.log("Resetting states for new content");
      setTimer(0);
      timerRef.current = 0;
      setFinalTime(null);
      setAnimationEnded(false);
      setCollapsed(false);
    }
  }, [processedMessages]);

  // Calculate content height based on actual content
  useEffect(() => {
    if (processedMessages && processedMessages.length > 0 && measureRef.current) {
      const measureHeight = measureRef.current.scrollHeight;
      const padding = 32; // Padding top/bottom
      const calculatedHeight = measureHeight + padding;
      const maxHeight = 400; // Maximum height during animation
      setContentHeight(Math.min(calculatedHeight, maxHeight));
    }
  }, [processedMessages]);

  const { contentRef } = useScrollYAnimation(
    processedMessages || [],
    scrollDirection,
    animationSpeed,
    handleAnimationEnd
  );

  const thinkingSearchAnimationVariants = cva(
    "relative rounded-xl h-auto text-neutral-900 dark:text-gray-200 inline-block text-left",
    {
      variants: {
        variant: {
          default:
            "bg-neutral-200/40 dark:border-neutral-200/20 border-2 border-neutral-300/50 dark:bg-neutral-900 dark:text-gray-200 text-neutral-700",
          ghost: "bg-neutral-200/40 dark:border-neutral-200/20 dark:text-gray-200",
          outline:
            "border-2 border-neutral-300/50 dark:border-neutral-200/40 dark:bg-neutral-900 dark:text-gray-200",
        },
      },
      defaultVariants: { variant: "default" },
    }
  );

  const getHeaderClasses = () => {
    switch (variant) {
      case "ghost":
        return "bg-neutral-200/40 dark:bg-neutral-900 text-neutral-700 dark:text-gray-200";
      case "outline":
        return "bg-transparent border-b border-neutral-300/50 dark:border-neutral-200/40 text-neutral-700 dark:text-gray-200";
      default:
        return "bg-neutral-200/40 dark:bg-neutral-900 text-neutral-700 dark:text-gray-200";
    }
  };

  const getButtonClasses = () => {
    switch (variant) {
      case "ghost":
      case "outline":
      case "default":
        return "hover:bg-neutral-300/50 dark:hover:bg-neutral-200/20 text-neutral-700 dark:text-gray-200";
    }
  };

  const getGradientClasses = () => {
    switch (variant) {
      case "ghost":
        return "from-neutral-200/80 dark:from-neutral-900/80";
      case "outline":
        return "from-white/80 dark:from-neutral-900/80";
      default:
        return "from-neutral-200/80 dark:from-neutral-900/80";
    }
  };

  // Show loading state if no content yet
  if (!processedMessages || processedMessages.length === 0) {
    return (
      <div
        ref={ref}
        className={cnUtil(
          thinkingSearchAnimationVariants({ variant }),
          "w-full max-w-xl min-w-0 overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className={cnUtil(
            "text-sm p-4 flex font-semibold w-full justify-between items-center rounded-t-xl min-w-0",
            getHeaderClasses()
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h5 className="whitespace-nowrap">Thinking Search</h5>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-normal whitespace-nowrap">
              Waiting for content...
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cnUtil(
        thinkingSearchAnimationVariants({ variant }),
        "w-full max-w-xl min-w-0 overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className={cnUtil(
          "text-sm p-4 flex font-semibold w-full justify-between items-center rounded-t-xl min-w-0",
          getHeaderClasses()
        )}
        id="thinking-search-title"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h5 className="whitespace-nowrap">Thinking Search</h5>
          {!animationEnded && processedMessages && processedMessages.length > 0 && (
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-normal whitespace-nowrap">
              {timer}s
            </span>
          )}
          {animationEnded && finalTime !== null && (
            <span className="text-green-500 dark:text-green-400 text-xs font-normal whitespace-nowrap">
              {finalTime}s
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          aria-controls="thinking-search-content"
          aria-label={collapsed ? "Expand content" : "Collapse content"}
          className={cnUtil(
            "flex items-center justify-center p-1 rounded-full transition-colors cursor-pointer flex-shrink-0",
            getButtonClasses()
          )}
        >
          <ChevronDown
            className={cnUtil(
              "w-4 h-4 transition-transform duration-300 ease-in-out",
              collapsed ? "-rotate-180" : "rotate-0"
            )}
          />
        </button>
      </div>
      <div
        id="thinking-search-content"
        className={cnUtil(
          "transition-all duration-300 ease-in-out w-full min-w-0",
          collapsed ? "max-h-0 opacity-0 overflow-hidden" : "opacity-100",
          animationEnded ? "overflow-y-auto" : "overflow-hidden"
        )}
        style={{
          maxHeight: collapsed ? "0px" : animationEnded ? "500px" : `${contentHeight}px`,
        }}
        role="region"
        aria-labelledby="thinking-search-title"
      >
        <style>
          {`
          @keyframes scrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(calc(-100% + ${contentHeight}px)); }
          }
          @keyframes scrollDown {
            0% { transform: translateY(calc(-100% + ${contentHeight}px)); }
            100% { transform: translateY(0); }
          }
        `}
        </style>
        <div
          className={cnUtil(
            "relative w-full h-full min-w-0",
            animationEnded ? "min-h-[200px] max-h-[500px]" : "min-h-[200px]"
          )}
          style={{
            height: animationEnded ? "auto" : `${contentHeight}px`,
          }}
        >
          {/* Invisible element to measure content height */}
          <div
            ref={measureRef}
            className="invisible absolute top-0 left-0 w-full p-4 min-w-0"
            aria-hidden="true"
          >
            <ul className="space-y-4 w-full min-w-0">
              {processedMessages.map((item, index) => (
                <li
                  key={index}
                  className="mb-4 text-sm leading-relaxed w-full min-w-0 break-words"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            ref={contentRef}
            className={cnUtil(
              "w-full p-4 min-w-0",
              animationEnded ? "relative z-10 transform-none" : "absolute top-0 left-0 z-0"
            )}
            style={animationEnded ? { transform: "translateY(0)" } : {}}
            aria-labelledby="thinking-search-title"
          >
            <ul className={cnUtil("space-y-4 w-full min-w-0", animationEnded ? "max-h-full" : "")}>
              {processedMessages.map((item, index) => (
                <li
                  key={index}
                  className={cnUtil(
                    "mb-4 transition-opacity duration-500 text-sm leading-relaxed text-neutral-700 dark:text-gray-200 w-full min-w-0 break-words",
                    animationEnded ? "opacity-100" : "opacity-80"
                  )}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {!animationEnded && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col w-full min-w-0">
              <div
                className={cnUtil("flex-grow bg-gradient-to-b to-transparent", getGradientClasses())}
              ></div>
              <div
                className={cnUtil("flex-grow bg-gradient-to-t to-transparent", getGradientClasses())}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ThinkingSearchAnimation.displayName = "ThinkingSearchAnimation";
export default React.memo(ThinkingSearchAnimation);

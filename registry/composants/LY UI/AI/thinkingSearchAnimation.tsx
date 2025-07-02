"use client";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React, { useState, useEffect, useRef } from "react";
import useScrollYAnimation from "../../../hooks/useScrollYAnimation";
import { ChevronDown } from "lucide-react";

const cnFallback = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(" ");
const cnUtil = typeof cn !== "undefined" ? cn : cnFallback;

type thinkingSearchAnimationProps = {
  variant?: "default" | "ghost" | "outline";
  step?: number;
  content?: string[];
  callBackAnimationEnd?: () => void;
  className?: string;
  scrollDirection?: "up" | "down";
  animationSpeed?: "slow" | "normal" | "fast";
};

const thinkingSearchAnimation: React.FC<thinkingSearchAnimationProps> = ({
  variant,
  step,
  content,
  callBackAnimationEnd,
  className,
  scrollDirection = "up",
  animationSpeed = "normal",
}) => {
  const [animationEnded, setAnimationEnded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [timer, setTimer] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState(200);
  const timerRef = useRef(0);
  const measureRef = useRef<HTMLDivElement>(null);

  const handleAnimationEnd = () => {
    const currentTime = timerRef.current;
    console.log("Animation ended, capturing time:", currentTime);
    setFinalTime(currentTime);
    setAnimationEnded(true);
    setTimeout(() => setCollapsed(true), 2000);
    callBackAnimationEnd?.();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!animationEnded && content && content.length > 0) {
      interval = setInterval(() => {
        timerRef.current += 1;
        setTimer(timerRef.current);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [animationEnded, content]);

  useEffect(() => {
    if (content && content.length > 0 && timerRef.current === 0) {
      console.log("Resetting states for new content");
      setTimer(0);
      timerRef.current = 0;
      setFinalTime(null);
      setAnimationEnded(false);
      setCollapsed(false);
    }
  }, [content]);

  // Calculer la hauteur basée sur le contenu
  useEffect(() => {
    if (content && content.length > 0 && measureRef.current) {
      const itemHeight = 60; // Hauteur approximative par item (texte + espacement)
      const padding = 32; // Padding top/bottom
      const calculatedHeight = Math.max(200, (content.length * itemHeight) + padding);
      const maxHeight = 400; // Hauteur maximale
      setContentHeight(Math.min(calculatedHeight, maxHeight));
    }
  }, [content]);

  const { contentRef } = useScrollYAnimation(
    content || [],
    scrollDirection,
    animationSpeed,
    handleAnimationEnd
  );

  const thinkingSearchAnimationVariants = cva(
    "relative lg:min-w-fit max-w-3xl w-full rounded-xl h-auto text-neutral-900 dark:text-gray-200 inline-block text-left ",
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

  return (
    <div className={cnUtil(thinkingSearchAnimationVariants({ variant }), "max-w-xl w-full overflow-hidden", className)}>
      <div
        className={cnUtil("text-sm p-4 flex font-semibold w-full justify-between items-center rounded-t-xl", getHeaderClasses())}
        id="thinking-search-title"
      >
        <div className="flex items-center gap-2">
          <h5>Thinking Search</h5>
          {!animationEnded && content && content.length > 0 && (
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-normal">{timer}s</span>
          )}
          {animationEnded && finalTime !== null && (
            <span className="text-green-500 dark:text-green-400 text-xs font-normal">{finalTime}s</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          aria-controls="thinking-search-content"
          aria-label={collapsed ? "Expand content" : "Collapse content"}
          className={cnUtil("flex items-center justify-center p-1 rounded-full transition-colors cursor-pointer", getButtonClasses())}
        >
          <ChevronDown
            className={cnUtil("w-4 h-4 transition-transform duration-300 ease-in-out", collapsed ? "-rotate-180" : "rotate-0")}
          />
        </button>
      </div>
      <div
        id="thinking-search-content"
        className={cnUtil(
          "transition-all duration-300 ease-in-out",
          collapsed ? "max-h-0 opacity-0 overflow-hidden" : "max-h-[500px] opacity-100",
          animationEnded ? "overflow-y-auto" : "overflow-hidden"
        )}
        style={{
          maxHeight: collapsed ? '0px' : animationEnded ? '500px' : `${contentHeight}px`
        }}
        role="region"
        aria-labelledby="thinking-search-title"
      >
        <style>{`
          @keyframes scrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
          }
          @keyframes scrollDown {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(0); }
          }
        `}</style>
        <div 
          className={cnUtil("relative w-full h-full", animationEnded ? "min-h-[200px] max-h-[400px]" : "min-h-[200px]")}
          style={{
            height: animationEnded ? 'auto' : `${contentHeight}px`
          }}
        >
          {/* Élément invisible pour mesurer le contenu */}
          <div
            ref={measureRef}
            className="invisible absolute top-0 left-0 w-full p-4"
            aria-hidden="true"
          >
            <ul className="space-y-4">
              {content?.map((item, index) => (
                <li key={index} className="mb-4 text-sm leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
         
          <div
            ref={contentRef}
            className={cnUtil("w-full p-4", animationEnded ? "relative z-10" : "absolute top-0 left-0 z-0")}
            aria-labelledby="thinking-search-title"
          >
            <ul className={cnUtil("space-y-4", animationEnded ? "max-h-full" : "")}>
              {content?.map((item, index) => (
                <li
                  key={index}
                  className={cnUtil(
                    "mb-4 transition-opacity duration-500 text-sm leading-relaxed text-neutral-700 dark:text-gray-200",
                    animationEnded ? "opacity-100" : "opacity-80"
                  )}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {!animationEnded && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
              <div className={cnUtil("flex-grow bg-gradient-to-b to-transparent", getGradientClasses())}></div>
              <div className={cnUtil("flex-grow bg-gradient-to-t to-transparent", getGradientClasses())}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

thinkingSearchAnimation.displayName = 'thinkingSearchAnimation';
export default React.memo(thinkingSearchAnimation);
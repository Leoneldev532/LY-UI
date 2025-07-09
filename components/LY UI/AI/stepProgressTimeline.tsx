"use client";
import React, { useState, useEffect, useRef } from "react";
import { Loader } from "lucide-react";

const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

type initialTabListPageProps = {
  step?: number;
  namePage?: string;
  numberOfTime?: number;
  status: "waiting..." | "generating..." | "completed";
};

type StepProgressTimelineProps = {
  initialTabListPage: initialTabListPageProps[];
  onGenerationStart?: () => void;
  onGenerationComplete?: () => void;
  onGenerationStop?: () => void;
  externalStop?: boolean;
  className?: string;
  externalStart?: boolean;
  autoScroll?: boolean;
  scrollSpeed?: "slow" | "normal" | "fast";
};

const StepProgressTimeline: React.FC<StepProgressTimelineProps> = ({
  initialTabListPage = [
    {
      step: 1,
      namePage: "page-1",
      numberOfTime: 3000,
      status: "waiting...",
    },
    {
      step: 2,
      namePage: "page-2",
      numberOfTime: 2500,
      status: "waiting...",
    },
    {
      step: 3,
      namePage: "page-3",
      numberOfTime: 4000,
      status: "waiting...",
    },
    {
      step: 4,
      namePage: "page-4",
      numberOfTime: 4000,
      status: "waiting...",
    },
  ],
  onGenerationStart,
  onGenerationComplete,
  onGenerationStop,
  className,
  externalStop = false,
  externalStart = false,
  autoScroll = false,
  scrollSpeed = "normal",
}) => {
  const [tabListPage, setTabListPage] = useState(initialTabListPage);

  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  const [currentProcessing, setCurrentProcessing] = useState(-1);

  const [isGenerating, setIsGenerating] = useState(false);

  const [connectorHeights, setConnectorHeights] = useState<{
    [key: number]: boolean;
  }>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollSpeedMap = {
    slow: 800,
    normal: 500,
    fast: 300,
  };

  const startGeneration = () => {
    setTabListPage(initialTabListPage);

    setVisibleItems([]);

    setCurrentProcessing(0);

    setIsGenerating(true);

    setConnectorHeights({});

    onGenerationStart?.();
  };

  const stopGeneration = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsGenerating(false);

    setCurrentProcessing(-1);

    onGenerationStop?.();
  };

  const scrollToCurrentItem = (index: number) => {
    if (!autoScroll || !containerRef.current) return;

    const container = containerRef.current;

    const item = container.querySelector(
      `[data-step="${index}"]`
    ) as HTMLElement;

    if (item) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      if (
        itemRect.bottom > containerRect.bottom ||
        itemRect.top < containerRect.top
      ) {
        item.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  useEffect(() => {
    if (externalStop && isGenerating) {
      stopGeneration();
    }
  }, [externalStop, isGenerating]);

  useEffect(() => {
    if (externalStart && !isGenerating) {
      startGeneration();
    }
  }, [externalStart, isGenerating]);

  useEffect(() => {
    if (!isGenerating || currentProcessing === -1) return;

    if (currentProcessing < initialTabListPage.length) {
      setVisibleItems((prev) => {
        if (!prev.includes(currentProcessing)) {
          const newItems = [...prev, currentProcessing];
          setTimeout(() => scrollToCurrentItem(currentProcessing), 100);
          return newItems;
        }
        return prev;
      });

      setTabListPage((prev) =>
        prev.map((page, index) =>
          index === currentProcessing
            ? { ...page, status: "generating..." }
            : page
        )
      );

      timerRef.current = setTimeout(() => {
        setTabListPage((prev) =>
          prev.map((page, index) =>
            index === currentProcessing
              ? { ...page, status: "completed" }
              : page
          )
        );

        if (currentProcessing < initialTabListPage.length - 1) {
          setTimeout(() => {
            setConnectorHeights((prev) => ({
              ...prev,
              [currentProcessing]: true,
            }));
          }, 100);
        }

        setTimeout(() => {
          if (currentProcessing + 1 >= initialTabListPage.length) {
            setIsGenerating(false);
            onGenerationComplete?.();
          } else {
            setCurrentProcessing((prev) => prev + 1);
          }
        }, scrollSpeedMap[scrollSpeed]);
      }, initialTabListPage[currentProcessing].numberOfTime);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [currentProcessing, isGenerating, scrollSpeed]);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .step-item-reveal {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .step-connector-grow {
          animation: slideInLeft 0.3s ease-out forwards;
        }
      `}</style>

      <div
        ref={containerRef}
        className={cn(
          "flex items-center w-full justify-center p-6 max-h-96 overflow-y-auto",
          className
        )}
      >
        <div className="flex flex-col min-w-fit w-full">
          {tabListPage.map(
            (page, index) =>
              visibleItems.includes(index) && (
                <div
                  key={page.step}
                  className="flex flex-col step-item-reveal"
                  data-step={index}
                >
                  <div className="flex text-neutral-400 w-full items-center justify-between gap-4 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200">
                    <div className="flex items-center w-full gap-3">
                      {page.status === "generating..." ? (
                        <Loader className="animate-spin w-6 h-6 text-blue-500" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={cn(
                            "w-6 h-6 transition-colors duration-200",
                            page.status === "completed"
                              ? "text-green-500"
                              : "text-gray-400"
                          )}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
                      <span className="font-medium">{page.namePage}</span>
                    </div>
                    <span
                      className={cn(
                        "text-sm px-2 py-1 rounded-full text-xs font-medium",
                        page.status === "generating..." &&
                          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                        page.status === "completed" &&
                          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                        page.status === "waiting..." &&
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {page.status}
                    </span>
                  </div>
                  {index !== initialTabListPage.length - 1 &&
                    page.status === "completed" && (
                      <div
                        className={cn(
                          "w-[2px] ml-3 bg-gradient-to-b from-green-400 to-blue-400 transition-all duration-500 ease-out step-connector-grow",
                          connectorHeights[index] ? "h-4" : "h-0"
                        )}
                      />
                    )}
                </div>
              )
          )}
        </div>
      </div>
    </>
  );
};

export default StepProgressTimeline;

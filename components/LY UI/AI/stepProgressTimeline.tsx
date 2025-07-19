
"use client"
import { Loader } from "lucide-react";
import React, { useState, useEffect, useRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

type initialTabListPageProps = {
  step?: number;
  namePage?: string;
  numberOfTime?: number;
  status: "waiting..." | "generating..." | "completed";
};

type ProcessList_V0Props = {
  initialTabListPage: initialTabListPageProps[];
  onGenerationStart?: () => void;
  onGenerationComplete?: () => void;
  onGenerationStop?: () => void;
  externalStop?: boolean;
  externalStart?: boolean;
  className?: string;
  autoScroll?: boolean;
  scrollSpeed?: "fast" | "normal" | "slow";
};

const StepProgressTimeline = forwardRef<HTMLDivElement, ProcessList_V0Props>(({
  initialTabListPage = [
    {
      step: 1,
      namePage: "page1",
      numberOfTime: 3000,
      status: "waiting",
    },
    {
      step: 2,
      namePage: "page2",
      numberOfTime: 2500,
      status: "waiting",
    },
    {
      step: 3,
      namePage: "page3",
      numberOfTime: 4000,
      status: "waiting",
    },
    {
      step: 4,
      namePage: "page4",
      numberOfTime: 4000,
      status: "waiting",
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
  ...props
}, ref) => {
  const [tabListPage, setTabListPage] = useState(initialTabListPage);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [currentProcessing, setCurrentProcessing] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectorHeights, setConnectorHeights] = useState<{
    [key: number]: boolean;
  }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Effet pour gérer l'arrêt externe
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
      setVisibleItems((prev: any) => {
        if (!prev.includes(currentProcessing)) {
          return [...prev, currentProcessing];
        }
        return prev;
      });

      // Set status to generating
      setTabListPage((prev) => {
        // Ensure all items are of type initialTabListPageProps
        return (prev as initialTabListPageProps[]).map((page, index) =>
          index === currentProcessing ? { ...page, status: "generating..." } : page
        );
      });

      // Timer for generation completion
      timerRef.current = setTimeout(() => {
        setTabListPage((prev) => {
          return (prev as initialTabListPageProps[]).map((page, index) =>
            index === currentProcessing
              ? { ...page, status: "completed" }
              : page
          );
        });

        // Animer le connecteur après la complétion
        if (currentProcessing < initialTabListPage.length - 1) {
          setTimeout(() => {
            setConnectorHeights((prev) => ({
              ...prev,
              [currentProcessing]: true,
            }));
          }, 100);
        }

        // Move to next page after a short delay
        setTimeout(() => {
          if (currentProcessing + 1 >= initialTabListPage.length) {
            setIsGenerating(false);
            onGenerationComplete?.();
          } else {
            setCurrentProcessing((prev) => prev + 1);
          }
        }, 300);
      }, initialTabListPage[currentProcessing].numberOfTime);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [currentProcessing, isGenerating]);

  return (
    <>
      <style>{/* ...styles... */}</style>
      <div className="relative">
      
        <div
          ref={ref}
          className={cn(
            "flex items-center w-full justify-center p-6 max-h-96 overflow-y-auto relative",
            className
          )}
          {...props}
        >
          <div className="flex flex-col min-w-sm">
            {tabListPage.map(
              (page, index) =>
                visibleItems.includes(index) && (
                  <div key={page.step} className="flex flex-col">
                    <div className="flex text-neutral-400 w-full items-center justify-between gap-4">
                      <div className="flex items-center text-xs md:text-sm w-full gap-2">
                        {page.status === "generating..." ? (
                          <Loader className="animate-spin min-h-3 mim-w-3 md:min-w-5 md:min-h-5" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                        )}
                        <span>{page.namePage}</span>
                      </div>
                      <span className="text-xs md:text-sm ">{page.status}</span>
                    </div>
                    {index !== initialTabListPage.length - 1 &&
                      page.status === "completed" && (
                        <div
                          className={`w-[1px] ml-3  bg-neutral-400 transition-all 
                            duration-500 ease-out ${
                            connectorHeights[index] ? "h-3" : "h-0"
                          }`}
                        />
                      )}
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </>
  );
});
StepProgressTimeline.displayName = "StepProgressTimeline";
export default StepProgressTimeline;

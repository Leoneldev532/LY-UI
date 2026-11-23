"use client";

/**
 * @author: @lyui
 * @description: Generated Answer component for displaying AI responses with progressive markdown rendering and interactive controls
 * @version: 1.0.0
 * @date: 2024-12-19
 * @license: MIT
 * @website: https://ly-ui.leonelyimga.com
 */
import React, { useState, useEffect, forwardRef, useCallback } from "react";
import { Copy, Check, RotateCcw, MoreHorizontal, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProgressiveMarkdown } from "@/components/hooks/useProgressiveMarkdown";

type GeneratedAnswerProps = {
  className?: string;
  content?: string;
  timestamp?: string;
  isLoading?: boolean;
  LoaderComponent?: React.ReactNode;
  onEndAnimation?: () => void;
  onComplete?: () => void;
  textSpeed?: number;
  markdownMode?: boolean;
  hideControls?: boolean;
};

const endAnimation = (onEndAnimation?: () => void) => {
  if (typeof onEndAnimation === "function") {
    onEndAnimation();
  }
};



const GeneratedAnswer = forwardRef<HTMLDivElement, GeneratedAnswerProps>(({
  content = "",
  className,
  timestamp = "00:00",
  isLoading = false,
  LoaderComponent,
  onEndAnimation,
  onComplete,
  textSpeed = 30,
  hideControls = false,
  ...props
}, ref) => {
  const [copied, setCopied] = useState(false);
  const [hasCalledComplete, setHasCalledComplete] = useState(false);

  const { displayedHTML, isComplete } = useProgressiveMarkdown(
    content,
    isLoading,
    textSpeed
  );

  useEffect(() => {
    if (isComplete && !isLoading && !hasCalledComplete) {
      endAnimation(onEndAnimation);
      if (typeof onComplete === "function") {
        onComplete();
      }
      setHasCalledComplete(true);
    }
  }, [isComplete, isLoading, onEndAnimation, onComplete, hasCalledComplete]);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleLike = () => {};
  const handleDisLike = () => {};

  const showActionsBar = !hideControls 

  const handleAnimationEnd = useCallback(() => {
    endAnimation(onEndAnimation);
    if (typeof onComplete === "function") {
      onComplete();
    }
  }, [onEndAnimation, onComplete]);

  return (
    <div
      ref={ref}
      className={cn("flex flex-col w-full text-left gap-2 ", className)}
      {...props}
    >
      <div className="min-h-auto w-full  text-left  flex items-start justify-start rounded-lg">
        {isLoading ? (
          LoaderComponent ? (
            LoaderComponent
          ) : (
            <span
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"
              onAnimationEnd={handleAnimationEnd}
            />
          )
        ) : (
          <div className="w-full flex  text-left  justify-start items-start break-words">
            <div className="whitespace-pre-wrap  text-gray-900 dark:text-gray-100 leading-relaxed">
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: displayedHTML }}
              />
            </div>
          </div>
        )}
      </div>

      {showActionsBar && (
        <div className="w-full flex justify-between items-center">
         
            <span className="text-sm text-neutral-400">{timestamp}</span>
        
          <div className="flex gap-2">
            <Button
              className={cn(
                "bg-transparent dark:hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2.5 dark:bg-neutral-700/20 hover:bg-neutral-200/40 relative transition-all duration-200",
                copied && "bg-green-100"
              )}
              onClick={handleCopy}
              title="Copier"
              disabled={copied}
            >
              <span className="flex items-center justify-center transition-all duration-200">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </span>
            </Button>

            <Button
              className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
              onClick={handleLike}
              title="like GeneratedAnswer"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>

            <Button
              className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
              onClick={handleDisLike}
              title="dislike GeneratedAnswer"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
                  title="regenerate"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  "min-w-[12rem]",
                  "border-black/10 mt-1 rounded-xl dark:border-white/10",
                  "bg-neutral-100 dark:bg-neutral-900"
                )}
              >
                <DropdownMenuItem className="rounded-lg h-9 cursor-pointer hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 gap-2">
                  Ajouter un commentaire
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg h-9 cursor-pointer hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 gap-2">
                  Sans commentaire
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
                  title="more options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  "min-w-[12rem]",
                  "border-black/10 mt-1 rounded-xl dark:border-white/10",
                  "bg-neutral-100 dark:bg-neutral-900"
                )}
              >
                <DropdownMenuItem className="rounded-lg h-9 cursor-pointer hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 gap-2">
                  Signaler un problème
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg h-9 cursor-pointer hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 gap-2">
                  Exporter en PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
});
GeneratedAnswer.displayName = 'GeneratedAnswer';
export default GeneratedAnswer;
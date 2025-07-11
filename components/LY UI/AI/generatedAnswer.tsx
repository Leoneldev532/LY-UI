"use client"

import React, { useState, forwardRef } from "react";
import { CopyIcon, RefreshCwIcon, CheckIcon, Ellipsis, ThumbsUp, ThumbsDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type GeneratedAnswer = {
  className?: string;
  GeneratedAnswer?: string;
  hours?: string;
};

const GeneratedAnswer = forwardRef<HTMLDivElement, GeneratedAnswer>(({
  GeneratedAnswer,
  className,
  hours = "00:00",
  ...props
}, ref) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (GeneratedAnswer) {
      navigator.clipboard.writeText(GeneratedAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleLike = () => {};

  const handleDisLike = () => {};

  const handleRegenerate = () => {};

  return (
    <div ref={ref} className="flex flex-col w-full gap-2 max-w-lg" {...props}>
      <div className={cn("min-h-72 w-full", className)}>{GeneratedAnswer}</div>

      <div className="w-full flex justify-between items-center">
        <div>
          <span className="text-sm text-neutral-400">{hours}</span>
        </div>

        <div className="flex gap-2">
          <Button
            className={cn(
              "bg-transparent dark:hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2.5 dark:bg-neutral-700/20 hover:bg-neutral-200/40 relative transition-all duration-200",
              copied && "bg-green-100 "
            )}
            onClick={handleCopy}
            title="Copier"
            disabled={copied}
          >
            <span className="flex items-center justify-center transition-all duration-200">
              {copied ? <CheckIcon className="" /> : <CopyIcon />}
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
            className="bg-transparent dark:hover:bg-neutral-200/40  dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
            onClick={handleDisLike}
            title="like GeneratedAnswer"
          >

           <ThumbsDown className="h-3 w-3" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
                onClick={handleRegenerate}
                title="regenerate"
              >
                <RefreshCwIcon />
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
                onClick={handleRegenerate}
                title="regenerate"
              >
                <Ellipsis />
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
                Signaler un probleme
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg h-9 cursor-pointer hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 gap-2">
                Exporter en PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

GeneratedAnswer.displayName = 'GeneratedAnswer';
export default GeneratedAnswer;

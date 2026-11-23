"use client"

/**
 * @author: @lyui
 * @description: Answer Controls Bar component for managing AI response interactions with copy, like, and regenerate actions
 * @version: 1.0.0
 * @date: 2024-12-19
 * @license: MIT
 * @website: https://ly-ui.leonelyimga.com
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AnswerControlsBarProps {
  timestamp?: string;
  copied?: boolean;
  onCopy?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onRegenerate?: () => void;
}

const AnswerControlsBar: React.FC<AnswerControlsBarProps> = ({
  timestamp = "00:00",
  copied = false,
  onCopy,
  onLike,
  onDislike,
  onRegenerate,
}) => {
  return (
    <div className="w-full flex justify-between items-center mt-2">
      <div>
        <span className="text-sm text-neutral-400">{timestamp}</span>
      </div>
      <div className="flex gap-2">
        <Button
          className={cn(
            "bg-transparent dark:hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2.5 dark:bg-neutral-700/20 hover:bg-neutral-200/40 relative transition-all duration-200",
            copied && "bg-green-100"
          )}
          onClick={onCopy}
          title="Copier"
          disabled={copied}
        >
          <span className="flex items-center justify-center transition-all duration-200">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </span>
        </Button>
        <Button
          className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
          onClick={onLike}
          title="like"
        >
          <ThumbsUp className="h-3 w-3" />
        </Button>
        <Button
          className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
          onClick={onDislike}
          title="dislike"
        >
          <ThumbsDown className="h-3 w-3" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
              title="regenerate"
              onClick={onRegenerate}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={cn("min-w-[12rem] border-black/10 mt-1 rounded-xl dark:border-white/10 bg-neutral-100 dark:bg-neutral-900")}
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
          <DropdownMenuContent className={cn("min-w-[12rem] border-black/10 mt-1 rounded-xl dark:border-white/10 bg-neutral-100 dark:bg-neutral-900")}
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
  );
};
AnswerControlsBar.displayName = 'AnswerControlsBar';
export default AnswerControlsBar;

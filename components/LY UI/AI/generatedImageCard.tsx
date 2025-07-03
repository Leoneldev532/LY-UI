"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  CheckIcon,
  CopyIcon,
  Ellipsis,
  RefreshCwIcon,
  DownloadIcon,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GeneratedImageCardProps {
  src?: string | Blob | StaticImport;
  title?: string | null;
  width?: number;
  height?: number;
  className?: string;
  hours?: string;
  prompt?: string;
  onLike?: () => void;
  onDislike?: () => void;
  onRegenerate?: () => void;
}

const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({
  src = "https://via.placeholder.com/150",
  title,
  width = 2225,
  height = 2465,
  className,
  hours = "00:00",
  prompt = "",
  onLike,
  onDislike,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | StaticImport>("");

  useEffect(() => {
    if (src instanceof Blob) {
      const url = URL.createObjectURL(src);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageSrc(src);
    }
  }, [src]);

  const handleCopy = async () => {
    try {
      if (prompt && prompt.trim() !== "") {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } else {
        console.log("Prompt is empty or undefined, nothing to copy.");
      }
    } catch (e) {
      console.log("An error occurred while copying to clipboard:", e);
    }
  };

  const handleDownload = async () => {
    let url = "";
    let filename = title ?? "image";

    if (src instanceof Blob) {
      url = URL.createObjectURL(src);
      filename = filename + ".png";
    } else if (typeof src === "string") {
      url = src;
      const parts = src.split("/");
      filename = parts[parts.length - 1] || filename;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (src instanceof Blob) {
      URL.revokeObjectURL(url);
    }
  };

  const handleLike = () => {
    onLike?.();
  };

  const handleDisLike = () => {
    onDislike?.();
  };

  const handleRegenerate = () => {
    onRegenerate?.();
  };

  return (
    <div className={cn("flex flex-col gap-y-2", className)}>
      <div
        className="relative group rounded-xl overflow-hidden w-full "
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 z-10">
            <span className="animate-spin rounded-full border-2 border-neutral-300 border-t-transparent h-8 w-8" />
          </div>
        )}
        <Image
          src={imageSrc}
          alt={title ?? "Generated image"}
          width={width}
          height={height}
          sizes="(min-width: 1351px) 416px, (min-width: 992px) calc(calc(100vw - 88px) / 3), (min-width: 768px) calc(calc(100vw - 64px) / 2), 100vw"
          onLoadingComplete={() => setLoading(false)}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          className={cn(
            loading ? "opacity-0" : "opacity-100",
            "transition-opacity w-full h-full duration-300 object-cover"
          )}
        />
        {hovered && !loading && (
          <Button
            size="icon"
            className="absolute top-2 right-2 z-20 bg-white/80 hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-800"
            onClick={handleDownload}
            title="Télécharger"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-3 justify-between w-full items-center">
        <div>
          <span className="text-sm text-neutral-400">{hours}</span>
        </div>

        <div className="flex gap-2">
          <Button
            className={cn(
              "bg-transparent dark:hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2 dark:bg-neutral-700/20 hover:bg-neutral-200/40 relative transition-all duration-200",
              copied && "bg-green-100 dark:bg-green-900/30"
            )}
            onClick={handleCopy}
            title="Copier le prompt"
            disabled={copied || !prompt}
          >
            <span className="flex items-center justify-center transition-all duration-200">
              {copied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </span>
          </Button>

          <Button
            className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
            onClick={handleLike}
            title="J'aime cette image"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>

          <Button
            className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
            onClick={handleDisLike}
            title="Je n'aime pas cette image"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
                title="Régénérer"
              >
                <RefreshCwIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={cn(
                "min-w-[12rem]",
                "border-black/10 mt-1 rounded-xl dark:border-white/10",
                "bg-neutral-100 dark:bg-neutral-900"
              )}
            >
              <DropdownMenuItem
                className="rounded-lg h-9 cursor-pointer hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 gap-2"
                onClick={handleRegenerate}
              >
                Ajouter un commentaire
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg h-9 cursor-pointer hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 gap-2"
                onClick={handleRegenerate}
              >
                Sans commentaire
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-transparent dark:hover:bg-neutral-200/40 dark:bg-neutral-700/20 hover:bg-neutral-200/40 px-1.5 py-0.5 md:p-2"
                title="Plus d'options"
              >
                <Ellipsis className="h-4 w-4" />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImageCard;

"use client";

/**
 * @author: @lyui
 * @description: Generated Image Card component for displaying AI-generated images with interactive controls and download functionality
 * @version: 1.0.0
 * @date: 2024-12-19
 * @license: MIT
 * @website: https://ly-ui.dev
 */
import React, { useState, useEffect, useRef, forwardRef } from "react";
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
  imageTitle?: string | null;
  width?: number;
  height?: number;
  className?: string;
  timestamp?: string;
  prompt?: string;
  onLike?: () => void;
  onDislike?: () => void;
  onRegenerate?: () => void;
  onComplete?: () => void;
  hideControls?: boolean;
}

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

const isBase64Image = (src: string): boolean => {
  return /^data:image\/(png|jpeg|jpg|gif|webp|bmp|svg\+xml);base64,/.test(src.trim());
};

const isValidImageSrc = (src: unknown): src is string | StaticImport => {
  if (!src) return false;
  if (typeof src === "string") {
    return src.trim() !== "";
  }
  if (typeof src === "object" && src !== null && "src" in src) {
    return true;
  }
  return false;
};

const GeneratedImageCard = forwardRef<HTMLDivElement, GeneratedImageCardProps>(({
  src,
  imageTitle,
  width = 400,
  height = 400,
  className,
  timestamp = "00:00",
  prompt = "",
  onLike,
  onDislike,
  onRegenerate,
  onComplete,
  hideControls = false,
  ...props
}, ref) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | StaticImport | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (src instanceof Blob) {
      const url = URL.createObjectURL(src);
      setImageSrc(url);
      blobUrlRef.current = url;
    } else if (typeof src === "string" && isBase64Image(src)) {
      setImageSrc(src);
    } else if (isValidImageSrc(src)) {
      setImageSrc(src as string | StaticImport);
    } else {
      setImageSrc(null);
    }

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    if (!loading && !completed && typeof onComplete === "function") {
      setCompleted(true);
      onComplete();
    }
  }, [loading, completed, onComplete]);

  const handleCopy = async () => {
    try {
      if (prompt && prompt.trim() !== "") {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch (e) {
      console.log("An error occurred while copying to clipboard:", e);
    }
  };

  const handleDownload = async () => {
    let url = "";
    let filename = imageTitle ?? "image";

    if (src instanceof Blob) {
      url = blobUrlRef.current || URL.createObjectURL(src);
      filename = filename + ".png";
    } else if (typeof src === "string" && isBase64Image(src)) {
      url = src;
      filename = filename + ".png";
    } else if (typeof src === "string" && src.trim() !== "") {
      url = src;
      const parts = src.split("/");
      filename = parts[parts.length - 1] || filename;
    } else if (typeof imageSrc === "string" && imageSrc.trim() !== "") {
      url = imageSrc;
      if (isBase64Image(imageSrc)) {
        filename = filename + ".png";
      } else {
        const parts = imageSrc.split("/");
        filename = parts[parts.length - 1] || filename;
      }
    } else {
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const shouldShowImage =
    isValidImageSrc(imageSrc) ||
    (typeof imageSrc === "string" && isBase64Image(imageSrc)) ||
    (src instanceof Blob);

  return (
    <div ref={ref} className={cn("flex flex-col gap-y-2 w-full", className)} {...props}>
      <div
        className="relative group rounded-xl overflow-hidden w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {loading && shouldShowImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 z-10">
            <span className="animate-spin rounded-full border-2 border-neutral-300 border-t-transparent h-8 w-8" />
          </div>
        )}
        
        <div className="relative w-full aspect-square">
          {shouldShowImage ? (
            <Image
              src={imageSrc as string | StaticImport}
              alt={imageTitle ?? "Generated image"}
              width={width}
              height={height}
              onLoadingComplete={() => setLoading(false)}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              className={cn(
                loading ? "opacity-0" : "opacity-100",
                "transition-opacity rounded-xl duration-300 object-cover w-full h-full"
              )}
              unoptimized={typeof imageSrc === "string" && isBase64Image(imageSrc)}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-neutral-100 dark:bg-neutral-900">
              <span className="text-neutral-400 text-sm">Aucune image à afficher</span>
            </div>
          )}
        </div>

        <div className="absolute top-0 left-0 right-0 flex justify-end p-2 z-20">
          <Button
            size="icon"
            className={cn(
              "bg-white/80 hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-800 transition-opacity",
              hovered ? "opacity-100" : "opacity-0"
            )}
            onClick={handleDownload}
            title="Télécharger"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!hideControls && (
        <div className="flex gap-3 justify-between w-full items-center">
          <div>
            <span className="text-sm text-neutral-400">{timestamp}</span>
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
      )}
    </div>
  );
});

GeneratedImageCard.displayName = 'GeneratedImageCard';
export default GeneratedImageCard;
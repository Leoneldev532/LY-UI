"use client";
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

/**
 * GeneratedImageCard component.
 * Displays an image in a styled card with interactive controls (like, dislike, copy prompt, download, regenerate).
 *
 * Props:
 * @prop src - Source of the image to display. Accepts string, Blob, or StaticImport.
 * @prop imageTitle - Title of the image.
 * @prop width - Width of the image. Default: 2225.
 * @prop height - Height of the image. Default: 2465.
 * @prop className - Additional CSS classes for styling.
 * @prop timestamp - Time displayed at the bottom of the card. Default: '00:00'.
 * @prop prompt - The prompt associated with the image (can be copied).
 * @prop onLike - Callback when user likes the image.
 * @prop onDislike - Callback when user dislikes the image.
 * @prop onRegenerate - Callback when user requests regeneration.
 * @prop onComplete - Callback when the image is fully loaded and displayed.
 */
// ===================== GeneratedImageCard Component =====================

interface GeneratedImageCardProps {
  /** Source of the image to display. Accepts string, Blob, or StaticImport. */
  src?: string | Blob | StaticImport;
  /** Title of the image. */
  imageTitle?: string | null;
  /** Width of the image. Default: 2225 */
  width?: number;
  /** Height of the image. Default: 2465 */
  height?: number;
  /** Additional CSS classes for styling. */
  className?: string;
  /** Time displayed at the bottom of the card. Default: '00:00' */
  timestamp?: string;
  /** The prompt associated with the image (can be copied). */
  prompt?: string;
  /** Callback when user likes the image. */
  onLike?: () => void;
  /** Callback when user dislikes the image. */
  onDislike?: () => void;
  /** Callback when user requests regeneration. */
  onRegenerate?: () => void;
  /** Callback when the image is fully loaded and displayed. */
  onComplete?: () => void;
}
// ===================== End GeneratedImageCard Props =====================

const GeneratedImageCard = forwardRef<HTMLDivElement, GeneratedImageCardProps>(({
  src = "https://via.placeholder.com/150",
  imageTitle,
  width = 2225,
  height = 2465,
  className,
  timestamp = "00:00",
  prompt = "",
  onLike,
  onDislike,
  onRegenerate,
  onComplete,
  ...props
}, ref) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | StaticImport>("");
  const blobUrlRef = useRef<string | null>(null);

  // Pour éviter d'appeler onComplete plusieurs fois
  const [completed, setCompleted] = useState(false);

  // Gestion correcte du blob pour Next/Image
  useEffect(() => {
    // Nettoie l'ancien blobUrl si existant
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (src instanceof Blob) {
      const url = URL.createObjectURL(src);
      setImageSrc(url);
      blobUrlRef.current = url;
    } else {
      setImageSrc(src as string | StaticImport);
    }

    // Cleanup on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src]);

  // Appelle onComplete quand l'image est chargée et visible
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
      } else {
        console.log("Prompt is empty or undefined, nothing to copy.");
      }
    } catch (e) {
      console.log("An error occurred while copying to clipboard:", e);
    }
  };

  const handleDownload = async () => {
    let url = "";
    let filename = imageTitle ?? "image";

    if (src instanceof Blob) {
      // Utilise le blobUrl déjà généré pour l'image affichée
      url = blobUrlRef.current || URL.createObjectURL(src);
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

    // Ne pas révoquer le blobUrl ici, sinon Next/Image perd la source
    // Le cleanup est géré dans useEffect cleanup
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
    <div ref={ref} className={cn("flex flex-col gap-y-2", className)} {...props}>
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
        {/* Si src est un Blob, imageSrc est un blobUrl, sinon string ou StaticImport */}
        <Image
          src={imageSrc}
          alt={imageTitle ?? "Generated image"}
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
    </div>
  );
});

GeneratedImageCard.displayName = 'GeneratedImageCard';
export default GeneratedImageCard;
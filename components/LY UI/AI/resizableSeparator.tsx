"use client";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React, { useRef, useEffect, useState, RefObject, forwardRef } from "react";

/**
 * ResizableSeparator component.
 * A resizable separator for managing layout space between elements.
 *
 * Props:
 * @prop direction - Direction of the separator ("vertical" or "horizontal").
 * @prop variant - Visual style variant of the separator ("ghost" or "outline").
 * @prop size - Size of the separator ("small", "medium", or "large").
 * @prop onResize - Callback when the size changes.
 * @prop minSize - Minimum size in pixels.
 * @prop maxSize - Maximum size in pixels.
 * @prop className - Additional CSS classes for styling.
 * @prop parentRef - Reference to the parent element.
 * @prop showIndicator - Show the visual indicator.
 * @prop animated - Enable animations.
 * @prop zIndex - Z-index of the separator.
 */

type ResizableSeparatorDirection = "vertical" | "horizontal";
type ResizableSeparatorVariant = "ghost" | "outline";
type ResizableSeparatorSize = "small" | "medium" | "large";

interface ResizableSeparatorProps {
  direction?: ResizableSeparatorDirection;
  variant?: ResizableSeparatorVariant;
  size?: ResizableSeparatorSize;
  onResize: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  className?: string;
  parentRef: RefObject<HTMLElement | null>;
  showIndicator?: boolean;
  animated?: boolean;
  zIndex?: number;
}

const cnFallback = (...classes: (string | undefined | false)[]): string =>
  classes.filter(Boolean).join(" ");
const cnUtil = typeof cn !== "undefined" ? cn : cnFallback;

const ResizableSeparator = forwardRef<HTMLDivElement, ResizableSeparatorProps>(({
  direction = "vertical",
  variant = "ghost",
  size = "medium",
  onResize,
  minSize = 100,
  maxSize = 600,
  className,
  parentRef,
  showIndicator = false,
  animated = true,
  zIndex = 20,
  ...props
}, ref) => {
  const isDragging = useRef(false);

  const ResizableSeparatorVariants = cva("flex-shrink-0 relative", {
    variants: {
      variant: {
        ghost:
          "bg-neutral-200/40 dark:bg-neutral-900 text-neutral-700 dark:text-gray-200",
        outline:
          "bg-white dark:bg-neutral-900 border border-neutral-300/50 dark:border-neutral-200/40 text-neutral-700 dark:text-gray-200",
      },
      size: {
        small: "",
        medium: "",
        large: "",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "medium",
    },
  });

  const getSizeClasses = () => {
    const sizeMap: Record<ResizableSeparatorSize, string> = {
      small: direction === "vertical" ? "h-1" : "w-1",
      medium: direction === "vertical" ? "h-2" : "w-2",
      large: direction === "vertical" ? "h-3" : "w-3",
    };
    return sizeMap[size] || sizeMap.medium;
  };

  const getDirectionClasses = () => {
    return direction === "vertical"
      ? "w-full cursor-ns-resize"
      : "h-full cursor-ew-resize";
  };

  const getIndicatorClasses = () => {
    const baseClasses = cnUtil(
      "absolute inset-0 flex items-center justify-center pointer-events-none",
      direction === "vertical" ? "flex-row" : "flex-col"
    );

    const variantClasses = {
      ghost: "opacity-60 hover:opacity-90",
      outline: "opacity-80 hover:opacity-100",
    };

    const indicatorBarClasses = {
      ghost: "bg-neutral-500 dark:bg-neutral-500 rounded-full",
      outline: "bg-neutral-700 dark:bg-neutral-300 rounded-full",
    };

    return {
      container: cnUtil(
        baseClasses,
        animated ? "transition-opacity duration-200" : "",
        variantClasses[variant]
      ),
      bar: cnUtil(
        indicatorBarClasses[variant],
        direction === "vertical" ? "w-8 h-0.5" : "w-0.5 h-8"
      ),
    };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    e.preventDefault();
    e.stopPropagation();
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      direction === "vertical" ? "ns-resize" : "ew-resize";
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !parentRef.current) return;

    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const rect = parentRef.current.getBoundingClientRect();

    if (direction === "vertical") {
      const newHeight = clientY - rect.top;
      onResize(Math.max(minSize, Math.min(newHeight, maxSize)));
    } else {
      const newWidth = clientX - rect.left;
      onResize(Math.max(minSize, Math.min(newWidth, maxSize)));
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [parentRef, direction, onResize, minSize, maxSize]);

  const indicatorClasses = getIndicatorClasses();

  return (
    <div
      ref={ref}
      className={cnUtil(
        ResizableSeparatorVariants({ variant, size }),
        getSizeClasses(),
        getDirectionClasses(),
        animated && "transition-all duration-200",
        // Ajout des classes pour gérer la superposition
        "select-none touch-none",
        className
      )}
      style={{
        zIndex: zIndex,
        // S'assurer que le séparateur reste au-dessus
        position: "relative",
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      {...props}
    >
      {showIndicator && (
        <div className={indicatorClasses.container}>
          <div className={indicatorClasses.bar} />
        </div>
      )}
    </div>
  );
});

ResizableSeparator.displayName = "ResizableSeparator";
export default React.memo(ResizableSeparator);

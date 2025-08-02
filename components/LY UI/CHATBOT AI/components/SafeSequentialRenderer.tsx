"use client";

import React, { useMemo, useEffect } from "react";
import { useSequentialRenderer } from "../hooks/useSequentialRenderer";
import { useAnswerControls } from "../hooks/useAnswerControls";
import { useTimeUtils } from "../hooks/useTimeUtils";
import ItemWrapper from "./ItemWrapper";
import { SafeSequentialRendererProps } from "../utils";
import AnswerControlsBar from "../../AI/answerControlsBar";

const SafeSequentialRenderer: React.FC<SafeSequentialRendererProps> = ({
  items,
  onAllComplete,
  showProgress = true,
  maxWaitTime = 5000,
  className = "",
  retryCount = 1,
}) => {
  const { getCurrentTimeString } = useTimeUtils();
  
  const {
    currentIndex,
    completedItems,
    isAllComplete,
    handleItemComplete,
  } = useSequentialRenderer(items, onAllComplete);

  const {
    copied,
    liked,
    disliked,
    handleCopy,
    handleLike,
    handleDislike,
    handleRegenerate,
    resetControls,
  } = useAnswerControls(items, completedItems);

  // Reset controls when items change
  useEffect(() => {
    resetControls();
  }, [items, resetControls]);

  // Rendu des items mémorisé
  const renderedItems = useMemo(() => {
    return items.map((item, index) => (
      <ItemWrapper
        key={`safe-item-${index}-${item.type}`}
        item={item}
        index={index}
        onComplete={handleItemComplete}
        isVisible={index <= currentIndex}
      />
    ));
  }, [items, currentIndex, handleItemComplete]);

  if (!items || items.length === 0) {
    return <div className="text-neutral-400 text-sm">Aucun contenu à afficher</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {renderedItems}

      {isAllComplete && (
        <div className="mt-4  z-10">
          <AnswerControlsBar
            timestamp={getCurrentTimeString()}
            copied={copied}
            onCopy={handleCopy}
            onLike={handleLike}
            onDislike={handleDislike}
            onRegenerate={handleRegenerate}
          />
        </div>
      )}
    </div>
  );
};

export default SafeSequentialRenderer;
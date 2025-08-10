"use client";

import React from "react";
import { useItemCompletion } from "../hooks/useItemCompletion";
import { useItemVisibility } from "../hooks/useItemVisibility";
import { useItemRenderer } from "../hooks/useItemRenderer";
import { ItemWrapperProps } from "../utils";


const ItemWrapper: React.FC<ItemWrapperProps> = React.memo(({
  item,
  index,
  onComplete,
  isVisible,
  onItemCompleted,
}) => {
  const {
    isCompleted,
    isAnimating,
    handleItemComplete,
    resetCompletion,
    startAnimation,
    safetyTimerRef,
  } = useItemCompletion(index, isVisible, onComplete, onItemCompleted);

  useItemVisibility(isVisible, resetCompletion, startAnimation, safetyTimerRef);

  const { itemContent } = useItemRenderer(
    item,
    index,
    isVisible,
    isAnimating,
    handleItemComplete
  );

  if (!isVisible) return null;

  return (
    <div className="relative mb-4">
      {itemContent}
    </div>
  );
});

ItemWrapper.displayName = 'ItemWrapper';

export default ItemWrapper;

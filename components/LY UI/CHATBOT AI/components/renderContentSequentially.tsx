import React from "react";
import SafeSequentialRenderer from "../components/SafeSequentialRenderer";
import { RenderContentItem, RenderContentOptions } from "../utils";

export const renderContentSequentially = (
  items: RenderContentItem[],
  options: RenderContentOptions = {}
) => {
  const { onComplete, showProgress = true, maxWaitTime = 5000, retryCount = 1 } = options;

  if (!items || items.length === 0) {
    return <div className="text-neutral-400 text-sm">Aucun contenu à afficher</div>;
  }

  return React.createElement(SafeSequentialRenderer, {
    items,
    onAllComplete: onComplete,
    showProgress,
    maxWaitTime,
    retryCount,
  });
};

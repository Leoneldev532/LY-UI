"use client";

import React, { useState, useEffect, useCallback } from "react";
import GeneratedAnswer from "./generatedAnswer";
import CodeSection from "../CODING/CodeSection";
import GeneratedImageCard from "./generatedImageCard";
import AudioInteraction from "./audioInteraction";
import AnswerControlsBar from "./AnswerControlsBar";

export type RenderContentItem = {
  type: string;
  content: any;
  metadata?: any;
}

type ItemWrapperProps = {
  item: RenderContentItem;
  index: number;
  onComplete: (index: number) => void;
  isVisible: boolean;
  onItemCompleted?: (index: number) => void;
}

function getCurrentTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const ItemWrapper: React.FC<ItemWrapperProps> = ({
  item,
  index,
  onComplete,
  isVisible,
  onItemCompleted,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setIsCompleted(false);
      setIsAnimating(false);
    }
  }, [isVisible]);

  const handleItemComplete = useCallback(() => {
    if (!isCompleted && isVisible) {
      console.log(`Item ${index} completing...`);
      setIsCompleted(true);
      
      setTimeout(() => {
        console.log(`Item ${index} completed, calling onComplete`);
        onComplete(index);
        if (onItemCompleted) onItemCompleted(index);
      }, 500);
    }
  }, [isCompleted, isVisible, onComplete, index, onItemCompleted]);

  useEffect(() => {
    if (isVisible && !isAnimating && !isCompleted) {
      console.log(`Starting animation for item ${index}`);
      setIsAnimating(true);

      const safetyTimer = setTimeout(() => {
        if (!isCompleted) {
          console.log(`Safety timeout triggered for item ${index}`);
          handleItemComplete();
        }
      }, 5000); // 5 secondes de sécurité
      
      return () => clearTimeout(safetyTimer);
    }
  }, [isVisible, isAnimating, isCompleted, handleItemComplete, index]);

  if (!isVisible) return null;

  const renderItemContent = () => {
    const { type, content, metadata } = item;
    const key = `content-${index}`;
    const baseClasses = "transition-all duration-500 ease-out transform";
    const animationClasses = isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4";
    const wrapperClasses = `${baseClasses} ${animationClasses}`;

    switch (type?.toLowerCase()) {
      case "text":
      case "markdown":
        return (
          <div key={key} className={wrapperClasses}>
            <GeneratedAnswer
              content={content}
              hideControls={true}
              onComplete={handleItemComplete}
            />
          </div>
        );
      case "code":
        return (
          <div key={key} className={wrapperClasses}>
            <CodeSection
              autoHeight={true}
              minHeight="150px"
              maxHeight="500px"
              progressiveMode={true}
              onComplete={handleItemComplete}
              defaultValue={content}
              defaultLanguage={metadata?.language || metadata || "javascript"}
            />
          </div>
        );
      case "image":
        return (
          <div key={key} className={wrapperClasses}>
            <GeneratedImageCard
              src={content}   
              hideControls={true}
              onComplete={handleItemComplete}
              imageTitle={metadata?.imageTitle}
              width={400}
              height={400}
              className={"w-96"}
              timestamp={metadata?.timestamp}
              prompt={metadata?.prompt}
            />
          </div>
        );
      case "audio":
        return (
          <div key={key} className={wrapperClasses}>
            <AudioInteraction
              audioUrl={content}
              onComplete={handleItemComplete}
              {...(metadata || {})}
            />
          </div>
        );
      default:
        setTimeout(() => handleItemComplete(), 100);
        return (
          <div key={key} className={`p-4 border border-red-300 bg-red-50 rounded-md ${wrapperClasses}`}>
            <p className="text-red-600">
              Type de contenu non supporté: <strong>{type}</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Contenu: {typeof content === "string" ? content : JSON.stringify(content)}
            </p>
          </div>
        );
    }
  };

  return (
    <div 
      className="relative mb-4" 
      style={{
        display: isVisible ? 'block' : 'none',
        height: isVisible ? 'auto' : 0,
        overflow: 'hidden'
      }}
    >
      {renderItemContent()}
    </div>
  );
};

const SafeSequentialRenderer: React.FC<{
  items: RenderContentItem[];
  onAllComplete?: () => void;
  showProgress?: boolean;
  maxWaitTime?: number;
  className?: string;
  retryCount?: number;
}> = ({
  items,
  onAllComplete,
  showProgress = true,
  maxWaitTime = 8000,
  className = "",
  retryCount = 1,
}) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [timeoutWarnings, setTimeoutWarnings] = useState<Set<number>>(new Set());
  const [retryAttempts, setRetryAttempts] = useState<Map<number, number>>(new Map());
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [allItemsReallyComplete, setAllItemsReallyComplete] = useState(false);


  useEffect(() => {
    console.log("Items changed, resetting state");
    setCurrentIndex(-1);
    setCompletedItems(new Set());
    setIsAllComplete(false);
    setTimeoutWarnings(new Set());
    setRetryAttempts(new Map());
    setCopied(false);
    setLiked(false);
    setDisliked(false);
    setAllItemsReallyComplete(false);
  }, [items]);


  useEffect(() => {
    if (items.length > 0 && currentIndex === -1) {
      const startTimer = setTimeout(() => {
        console.log("Starting sequence with first item");
        setCurrentIndex(0);
      }, 200);
      return () => clearTimeout(startTimer);
    }
  }, [items.length, currentIndex]);

  // Timeout de sécurité pour chaque item
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < items.length && !completedItems.has(currentIndex)) {
      const timeoutId = setTimeout(() => {
        console.log(`Timeout for item ${currentIndex}`);
        const attempts = retryAttempts.get(currentIndex) || 0;
        if (attempts < retryCount) {
          setRetryAttempts((prev) => new Map(prev).set(currentIndex, attempts + 1));
        } else {
          setTimeoutWarnings((prev) => new Set(prev).add(currentIndex));
          handleItemComplete(currentIndex, true);
        }
      }, maxWaitTime);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, completedItems, maxWaitTime, retryAttempts, retryCount, items.length]);

  // Vérifier si tous les items sont complétés
  useEffect(() => {
    if (items.length > 0 && completedItems.size === items.length) {
      console.log("All items completed");
      setAllItemsReallyComplete(true);
      setIsAllComplete(true);
      if (onAllComplete) {
        onAllComplete();
      }
    }
  }, [completedItems, items.length, onAllComplete]);

  const handleItemComplete = useCallback(
    (index: number, isTimeout = false) => {
      console.log(`Item ${index} completed (timeout: ${isTimeout})`);
      
      setCompletedItems((prev) => {
        const newCompleted = new Set(prev);
        newCompleted.add(index);
        return newCompleted;
      });

      // Passer au suivant après un délai
      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = index + 1;
          console.log(`Moving from item ${index} to ${nextIndex}`);
          
          if (nextIndex >= items.length) {
            console.log("All items processed");
            return items.length; // Dépasser la longueur pour indiquer la fin
          }
          return nextIndex;
        });
      }, 300); // Délai réduit pour une meilleure fluidité
    },
    [items.length]
  );

  // Helper functions pour les contrôles
  const getAllVisibleTextContent = () => {
    return items
      .filter((item, idx) => completedItems.has(idx))
      .map((item) => {
        if (item.type?.toLowerCase() === "code") {
          return typeof item.content === "string" ? item.content : "";
        } else if (item.type?.toLowerCase() === "image") {
          return item.metadata?.prompt || item.metadata?.imageTitle || "";
        } else if (item.type?.toLowerCase() === "audio") {
          return item.metadata?.transcript || "";
        } else if (item.type?.toLowerCase() === "text" || item.type?.toLowerCase() === "markdown") {
          return typeof item.content === "string" ? item.content : "";
        } else {
          return typeof item.content === "string"
            ? item.content
            : JSON.stringify(item.content);
        }
      })
      .filter(Boolean)
      .join("\n\n");
  };

  const getLatestTimestamp = () => {
    if (completedItems.size === 0) return getCurrentTimeString();
    for (let i = Math.min(currentIndex, items.length - 1); i >= 0; i--) {
      if (completedItems.has(i)) {
        const item = items[i];
        if (item.metadata && item.metadata.timestamp) {
          return String(item.metadata.timestamp);
        }
      }
    }
    return getCurrentTimeString();
  };

  const getLatestMetadataCallbacks = () => {
    for (let i = Math.min(currentIndex, items.length - 1); i >= 0; i--) {
      if (completedItems.has(i)) {
        return items[i].metadata || {};
      }
    }
    return {};
  };

  const handleCopy = () => {
    const plainText = getAllVisibleTextContent();
    if (plainText) {
      navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleLike = () => {
    setLiked(true);
    setDisliked(false);
    const metadata = getLatestMetadataCallbacks();
    if (metadata?.onLike) metadata.onLike();
  };

  const handleDislike = () => {
    setDisliked(true);
    setLiked(false);
    const metadata = getLatestMetadataCallbacks();
    if (metadata?.onDislike) metadata.onDislike();
  };

  const handleRegenerate = () => {
    setLiked(false);
    setDisliked(false);
    setCopied(false);
    const metadata = getLatestMetadataCallbacks();
    if (metadata?.onRegenerate) metadata.onRegenerate();
  };

  const renderGlobalControlsBar = () => {
    return (
      <div className="mt-4 sticky bottom-4 z-10">
        <AnswerControlsBar
          timestamp={getLatestTimestamp()}
          copied={copied}
          onCopy={handleCopy}
          onLike={handleLike}
          onDislike={handleDislike}
          onRegenerate={handleRegenerate}
        />
      </div>
    );
  };

  if (!items || items.length === 0) {
    return <div className="text-neutral-400 text-sm">Aucun contenu à afficher</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <div key={`safe-item-${index}-${item.type}`} className="relative">
          <ItemWrapper
            item={item}
            index={index}
            onComplete={(idx) => handleItemComplete(idx, false)}
            isVisible={index <= currentIndex}
          />
        </div>
      ))}

      {allItemsReallyComplete && renderGlobalControlsBar()}
      
      {/* Debug info - à supprimer en production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2">
          Current: {currentIndex}, Completed: {completedItems.size}/{items.length}
        </div>
      )} */}
    </div>
  );
};

const renderContentSequentially = (
  items: RenderContentItem[],
  options: {
    onComplete?: () => void;
    showProgress?: boolean;
    maxWaitTime?: number;
    useSafeMode?: boolean;
    delay?: number;
    retryCount?: number;
  } = {}
) => {
  const { onComplete, showProgress = true, maxWaitTime = 8000, retryCount = 1 } = options;

  if (!items || items.length === 0) {
    return <div className="text-neutral-400 text-sm">Aucun contenu à afficher</div>;
  }

  return (
    <SafeSequentialRenderer
      items={items}
      onAllComplete={onComplete}
      showProgress={showProgress}
      maxWaitTime={maxWaitTime}
      retryCount={retryCount}
    />
  );
};

export { renderContentSequentially, SafeSequentialRenderer, ItemWrapper };
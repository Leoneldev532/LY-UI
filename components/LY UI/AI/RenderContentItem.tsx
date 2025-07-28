"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

// Mémoisation du ItemWrapper pour éviter les re-rendus
const ItemWrapper: React.FC<ItemWrapperProps> = React.memo(({
  item,
  index,
  onComplete,
  isVisible,
  onItemCompleted,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const completionCalledRef = useRef(false);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Callback stable pour éviter les re-rendus
  const handleItemComplete = useCallback(() => {
    if (completionCalledRef.current || !isVisible) {
      return;
    }

    completionCalledRef.current = true;
    console.log(`Item ${index} completing...`);

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    setIsCompleted(true);

    setTimeout(() => {
      if (completionCalledRef.current) {
        onComplete(index);
        if (onItemCompleted) onItemCompleted(index);
      }
    }, 200);
  }, [isVisible, onComplete, index, onItemCompleted]);

  // Reset avec nettoyage
  useEffect(() => {
    if (!isVisible) {
      setIsCompleted(false);
      setIsAnimating(false);
      completionCalledRef.current = false;

      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
    }
  }, [isVisible]);

  // Démarrage de l'animation
  useEffect(() => {
    let mounted = true;

    if (isVisible && !isAnimating && !isCompleted && !completionCalledRef.current) {
      console.log(`Starting animation for item ${index}`);
      setIsAnimating(true);

      safetyTimerRef.current = setTimeout(() => {
        if (mounted && !completionCalledRef.current && isVisible) {
          console.log(`Safety timeout triggered for item ${index}`);
          handleItemComplete();
        }
      }, 2000);
    }

    return () => {
      mounted = false;
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
    };
  }, [isVisible, isAnimating, isCompleted, handleItemComplete, index]);

  // Mémoisation du contenu pour éviter les re-rendus
  const itemContent = useMemo(() => {
    if (!isVisible) return null;

    const { type, content, metadata } = item;
    const key = `content-${index}`;
    const baseClasses = "transition-all duration-300 ease-out transform";
    const animationClasses = isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2";
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
            maxHeight="400"
              autoHeight={true}
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
  }, [isVisible, item, index, isAnimating, handleItemComplete]);

  if (!isVisible) return null;

  return (
    <div className="relative mb-4">
      {itemContent}
    </div>
  );
});

// Ajout du displayName pour le debugging
ItemWrapper.displayName = 'ItemWrapper';

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
  maxWaitTime = 5000,
  className = "",
  retryCount = 1,
}) => {
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
    const [isAllComplete, setIsAllComplete] = useState(false);
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

    // Refs stables pour éviter les re-rendus
    const itemsRef = useRef(items);
    const onAllCompleteRef = useRef(onAllComplete);

    // Mise à jour des refs sans causer de re-rendus
    useEffect(() => {
      itemsRef.current = items;
      onAllCompleteRef.current = onAllComplete;
    });

    // Reset complet seulement quand les items changent vraiment
    const itemsKey = useMemo(() =>
      items.map((item, idx) => `${item.type}-${idx}`).join('|')
      , [items]);

    useEffect(() => {
      console.log("Items changed, resetting state");
      setCurrentIndex(-1);
      setCompletedItems(new Set());
      setIsAllComplete(false);
      setCopied(false);
      setLiked(false);
      setDisliked(false);
    }, [itemsKey]);

    // Démarrage de la séquence
    useEffect(() => {
      if (items.length > 0 && currentIndex === -1) {
        const timer = setTimeout(() => {
          console.log("Starting sequence with first item");
          setCurrentIndex(0);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [items.length, currentIndex]);

    // Vérification de completion
    useEffect(() => {
      if (items.length > 0 && completedItems.size === items.length && !isAllComplete) {
        console.log("All items completed");
        setIsAllComplete(true);
        if (onAllCompleteRef.current) {
          onAllCompleteRef.current();
        }
      }
    }, [completedItems.size, items.length, isAllComplete]);

    // Callback stable pour la completion des items
    const handleItemComplete = useCallback((index: number) => {
      console.log(`Item ${index} completed`);

      setCompletedItems(prev => {
        const newCompleted = new Set(prev);
        newCompleted.add(index);
        return newCompleted;
      });

      setTimeout(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = index + 1;
          console.log(`Moving from item ${index} to ${nextIndex}`);
          return nextIndex >= itemsRef.current.length ? itemsRef.current.length : nextIndex;
        });
      }, 150);
    }, []);

    // Fonctions helper mémorisées
    const getAllVisibleTextContent = useCallback(() => {
      return items
        .filter((item, idx) => completedItems.has(idx))
        .map((item) => {
          if (item.type?.toLowerCase() === "code") {
            return typeof item.content === "string" ? item.content : "";
          } else if (item.type?.toLowerCase() === "text" || item.type?.toLowerCase() === "markdown") {
            return typeof item.content === "string" ? item.content : "";
          }
          return "";
        })
        .filter(Boolean)
        .join("\n\n");
    }, [items, completedItems]);

    const handleCopy = useCallback(() => {
      const plainText = getAllVisibleTextContent();
      if (plainText) {
        navigator.clipboard.writeText(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    }, [getAllVisibleTextContent]);

    const handleLike = useCallback(() => {
      setLiked(true);
      setDisliked(false);
    }, []);

    const handleDislike = useCallback(() => {
      setDisliked(true);
      setLiked(false);
    }, []);

    const handleRegenerate = useCallback(() => {
      setLiked(false);
      setDisliked(false);
      setCopied(false);
    }, []);

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
          <div className="mt-4 sticky bottom-4 z-10">
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
  const { onComplete, showProgress = true, maxWaitTime = 5000, retryCount = 1 } = options;

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

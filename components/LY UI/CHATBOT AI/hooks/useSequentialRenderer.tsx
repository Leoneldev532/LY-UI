import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { RenderContentItem } from "../utils";


export const useSequentialRenderer = (items: RenderContentItem[], onAllComplete?: () => void) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [isAllComplete, setIsAllComplete] = useState(false);

  // Refs stables pour éviter les re-rendus
  const itemsRef = useRef(items);
  const onAllCompleteRef = useRef(onAllComplete);


  useEffect(() => {
    itemsRef.current = items;
    onAllCompleteRef.current = onAllComplete;
  });


  const itemsKey = useMemo(() =>
    items.map((item, idx) => `${item.type}-${idx}`).join('|'),
    [items]
  );

  const resetState = useCallback(() => {
    console.log("Items changed, resetting state");
    setCurrentIndex(-1);
    setCompletedItems(new Set());
    setIsAllComplete(false);
  }, []);

  useEffect(() => {
    resetState();
  }, [itemsKey, resetState]);

  useEffect(() => {
    if (items.length > 0 && currentIndex === -1) {
      const timer = setTimeout(() => {
        console.log("Starting sequence with first item");
        setCurrentIndex(0);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [items.length, currentIndex]);

  
  useEffect(() => {
    if (items.length > 0 && completedItems.size === items.length && !isAllComplete) {
      console.log("All items completed");
      setIsAllComplete(true);
      if (onAllCompleteRef.current) {
        onAllCompleteRef.current();
      }
    }
  }, [completedItems.size, items.length, isAllComplete]);


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

  return {
    currentIndex,
    completedItems,
    isAllComplete,
    handleItemComplete,
  };
};
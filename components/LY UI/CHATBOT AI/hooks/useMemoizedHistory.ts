import { useMemo, useRef } from 'react';
import { QA } from '../utils';

/**
 * Hook personnalisé pour mémoriser les éléments de l'historique terminés
 * @param {Array} history - L'historique des conversations
 * @param {Function} renderItem - Fonction pour rendre un élément de l'historique
 * @returns {Object} - { getMemoizedItem, isItemFinished }
 */
export const useMemoizedHistory = (history:QA[], renderItem: (qa:QA, idx:number) => React.ReactNode) => {

  const memoizedItemsRef = useRef(new Map());
  

  const generateItemKey = (idx:number, qa:QA) => {
    const finishedStatuses = ['stopped', 'error', 'generated'];
    if (finishedStatuses.includes(qa.status)) {
      return `${idx}-${qa.status}-${qa.question}-${JSON.stringify(qa.answer)}`;
    }
    return null;
  };


  const isItemFinished = (qa:QA) => {
    return qa.status === 'stopped' || qa.status === 'error' || qa.status === 'generated';
  };


  const memoizedItems = useMemo(() => {
    const currentMemoized = new Map();
    
    history.forEach((qa, idx) => {
      if (isItemFinished(qa)) {
        const itemKey = generateItemKey(idx, qa);
        
        
        if (memoizedItemsRef.current.has(itemKey)) {
          currentMemoized.set(idx, memoizedItemsRef.current.get(itemKey));
        } else {
          // Sinon, le rendre et le mémoriser
          const renderedItem = renderItem(qa, idx);
          currentMemoized.set(idx, renderedItem);
          memoizedItemsRef.current.set(itemKey, renderedItem);
        }
      }
    });

    const currentKeys = new Set();
    history.forEach((qa, idx) => {
      if (isItemFinished(qa)) {
        currentKeys.add(generateItemKey(idx, qa));
      }
    });

 
    for (const [key] of memoizedItemsRef.current) {
      if (!currentKeys.has(key)) {
        memoizedItemsRef.current.delete(key);
      }
    }
    
    return currentMemoized;
  }, [
    history.filter(isItemFinished).map((qa, idx) => 
      `${idx}-${qa.status}-${qa.question}-${JSON.stringify(qa.answer)}`
    ).join('|')
  ]);


  const getMemoizedItem = (idx:number) => {
    return memoizedItems.get(idx);
  };


  const isItemProcessing = (qa:QA) => {
    return qa.status === 'generating' || qa.status === 'pending';
  };

 
  const clearMemoizedCache = () => {
    memoizedItemsRef.current.clear();
  };


  const getCacheStats = () => {
    return {
      totalMemoized: memoizedItemsRef.current.size,
      currentlyMemoized: memoizedItems.size,
      finishedItems: history.filter(isItemFinished).length,
      processingItems: history.filter(isItemProcessing).length
    };
  };

  return {
    getMemoizedItem,
    isItemFinished,
    isItemProcessing,
    clearMemoizedCache,
    getCacheStats
  };
};
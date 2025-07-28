import { useEffect } from "react";

export const useItemVisibility = (
  isVisible: boolean,
  resetCompletion: () => void,
  startAnimation: () => void,
  safetyTimerRef: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  // Reset avec nettoyage
  useEffect(() => {
    if (!isVisible) {
      resetCompletion();
    }
  }, [isVisible, resetCompletion]);

  // Démarrage de l'animation
  useEffect(() => {
    let mounted = true;
    
    if (isVisible) {
      startAnimation();
    }

    return () => {
      mounted = false;
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
    };
  }, [isVisible, startAnimation, safetyTimerRef]);
};
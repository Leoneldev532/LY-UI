import { useState, useEffect, useRef, useMemo } from 'react';

export function useProgressiveText(
  text: string,
  isActive: boolean = false,
  speed: number = 50
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);
  const lastTextRef = useRef('');
  const isAnimatingRef = useRef(false);

  // Fonction pour nettoyer les timeouts
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  // Fonction récursive optimisée pour l'animation
  const animateText = useCallback((targetText: string, currentIndex: number = 0) => {
    // Vérifier si on doit arrêter l'animation
    if (!isAnimatingRef.current || currentIndex >= targetText.length) {
      setDisplayedText(targetText);
      setIsWriting(false);
      setIsComplete(true);
      isAnimatingRef.current = false;
      return;
    }

    // Calculer la taille du chunk basé sur la vitesse
    const chunkSize = speed > 20 ? 1 : Math.max(1, Math.floor(20 / speed));
    const nextIndex = Math.min(currentIndex + chunkSize, targetText.length);

    // Mettre à jour le texte affiché
    setDisplayedText(targetText.slice(0, nextIndex));
    indexRef.current = nextIndex;

    // Continuer l'animation si pas terminé
    if (nextIndex < targetText.length) {
      timeoutRef.current = setTimeout(() => {
        animateText(targetText, nextIndex);
      }, Math.max(1, speed)); // Minimum 1ms pour éviter les blocages
    } else {
      // Animation terminée
      setIsWriting(false);
      setIsComplete(true);
      isAnimatingRef.current = false;
    }
  }, [speed]);

  // Effet principal pour gérer les changements
  useEffect(() => {
    // Nettoyer les animations précédentes
    cleanup();

    if (!isActive) {
      // Si pas actif, afficher le texte complet immédiatement
      setDisplayedText(text);
      setIsWriting(false);
      setIsComplete(true);
      lastTextRef.current = text;
      return;
    }

    // Si le texte est vide
    if (!text || text.length === 0) {
      setDisplayedText('');
      setIsWriting(false);
      setIsComplete(true);
      lastTextRef.current = text;
      return;
    }

    // Si c'est le même texte, pas besoin de relancer l'animation
    if (text === lastTextRef.current && isComplete) {
      return;
    }

    // Démarrer une nouvelle animation
    lastTextRef.current = text;
    setDisplayedText('');
    setIsWriting(true);
    setIsComplete(false);
    indexRef.current = 0;
    isAnimatingRef.current = true;

    // Délai court avant de commencer pour éviter les conflits visuels
    timeoutRef.current = setTimeout(() => {
      animateText(text, 0);
    }, 10);

  }, [text, isActive, animateText, cleanup, isComplete]);

  // Nettoyage au démontage
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useMemo(() => ({
    displayedText,
    isWriting,
    isComplete
  }), [displayedText, isWriting, isComplete]);
}

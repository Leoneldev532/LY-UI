import { useState, useEffect, useRef, useMemo } from "react";

interface UseCodeListAnimationProps {
  codeLines?: string[];
  scrollDirection?: "up" | "down";
  animationSpeed?: "slow" | "normal" | "fast";
  scrollDuration?: number; // Durée personnalisée en ms
  scrollCadence?: "smooth" | "stepped";
  pauseDuration?: number;
  skeletonDuration?: number;
  lineRevealDelay?: number;
  containerHeight?: number; // Hauteur du conteneur en pixels
}

interface UseCodeListAnimationReturn {
  isSkeletonPhase: boolean;
  revealedLines: boolean[];
  visibleLines: { content: string; actualIndex: number }[];
  contentRef: React.RefObject<HTMLUListElement | null>;
  visibleItems: number; // Nombre calculé automatiquement
}

export const useCodeListAnimation = ({
  codeLines = [],
  scrollDirection = "up",
  animationSpeed = "normal",
  scrollDuration,
  scrollCadence = "smooth",
  pauseDuration = 1000,
  skeletonDuration = 1500,
  lineRevealDelay = 100,
  containerHeight = 288, // 18rem = 288px par défaut (h-72)
}: UseCodeListAnimationProps): UseCodeListAnimationReturn => {
  const [isSkeletonPhase, setIsSkeletonPhase] = useState(true);
  const [revealedLines, setRevealedLines] = useState<boolean[]>([]);
  const contentRef = useRef<HTMLUListElement>(null);

  const totalItems = codeLines.length;
  const itemHeight = 36; // Hauteur d'une ligne ajustée (py-4 + h-8 + space-y-1)
  
  // Calcul automatique du nombre d'éléments visibles avec marge
  const visibleItems = Math.floor(containerHeight / itemHeight) + 1;

  // Vitesses d'animation (durée pour faire défiler complètement la liste)
  const speedMap = {
    slow: 20000,   // 20 secondes
    normal: 15000, // 15 secondes  
    fast: 10000,   // 10 secondes
  };

  // Phase skeleton
  useEffect(() => {
    setRevealedLines(new Array(totalItems).fill(false));
    setIsSkeletonPhase(true);

    const skeletonTimer = setTimeout(() => {
      setIsSkeletonPhase(false);
      
      // Révéler toutes les lignes progressivement
      let currentLine = 0;
      const revealInterval = setInterval(() => {
        setRevealedLines(prev => {
          const newState = [...prev];
          newState[currentLine] = true;
          return newState;
        });
        currentLine++;
        
        if (currentLine >= totalItems) {
          clearInterval(revealInterval);
        }
      }, lineRevealDelay);

      return () => clearInterval(revealInterval);
    }, skeletonDuration);

    return () => clearTimeout(skeletonTimer);
  }, [totalItems, skeletonDuration, lineRevealDelay]);

  // Animation de scroll
  useEffect(() => {
    // DEBUG: Log pour comprendre pourquoi ça ne scroll pas
    console.log('Animation check:', { 
      isSkeletonPhase, 
      totalItems, 
      visibleItems, 
      shouldScroll: totalItems > visibleItems,
      codeLines: codeLines.length
    });
    
    if (isSkeletonPhase || totalItems <= visibleItems) {
      console.log('Animation stopped: skeleton =', isSkeletonPhase, 'not enough items =', totalItems <= visibleItems);
      return;
    }

    let animationId: number;
    let timeoutId: NodeJS.Timeout;
    
    // Calculer le scroll maximum pour un défilement infini
    // On utilise la hauteur totale du contenu dupliqué
    const totalHeight = totalItems * itemHeight;
    const duration = scrollDuration ?? speedMap[animationSpeed];
    
    console.log('Animation params:', { totalHeight, totalItems, visibleItems, itemHeight, duration });

    if (scrollCadence === "smooth") {
      // SMOOTH: Animation continue infinie sans retour visible
      console.log('Starting SMOOTH infinite animation');
      const startTime = Date.now();
      
      const animateSmooth = () => {
        if (!contentRef.current) return;
        
        const elapsed = Date.now() - startTime;
        // Utiliser modulo pour créer une boucle infinie
        const progress = (elapsed % duration) / duration;
        const scrollY = progress * totalHeight;
        
        const translateY = scrollDirection === "up" ? -scrollY : scrollY;
        contentRef.current.style.transform = `translateY(${translateY}px)`;
        
        animationId = requestAnimationFrame(animateSmooth);
      };

      // Démarrer l'animation après un délai
      timeoutId = setTimeout(() => {
        animationId = requestAnimationFrame(animateSmooth);
      }, 500);

    } else {
      // STEPPED: Animation par étapes infinie sans retour visible
      console.log('Starting STEPPED infinite animation');
      let currentStep = 0;
      const totalSteps = totalItems;
      
      const animateStep = () => {
        if (!contentRef.current) return;
        
        // Calculer la position de scroll
        const scrollY = (currentStep % totalSteps) * itemHeight;
        const translateY = scrollDirection === "up" ? -scrollY : scrollY;
        
        console.log('Step:', currentStep, 'scrollY:', scrollY, 'translateY:', translateY);
        
        // Transition CSS pour un mouvement fluide
        contentRef.current.style.transition = `transform 300ms ease-out`;
        contentRef.current.style.transform = `translateY(${translateY}px)`;
        
        // Passer à l'étape suivante (boucle infinie)
        currentStep++;
        
        // Programmer la prochaine étape
        timeoutId = setTimeout(animateStep, pauseDuration + 300);
      };

      // Démarrer l'animation stepped
      timeoutId = setTimeout(animateStep, 500);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (timeoutId) clearTimeout(timeoutId);
      if (contentRef.current) {
        contentRef.current.style.transform = "";
        contentRef.current.style.transition = "";
      }
    };
  }, [isSkeletonPhase, totalItems, visibleItems, scrollDirection, scrollCadence, animationSpeed, pauseDuration, itemHeight, codeLines.length, scrollDuration]);

  // Calcul des lignes visibles - AFFICHER TOUTES LES LIGNES
  const visibleLines = useMemo(() => {
    if (isSkeletonPhase) {
      // Phase skeleton : montrer seulement les lignes qui rentrent dans le conteneur
      return codeLines.slice(0, Math.min(visibleItems, totalItems)).map((content, idx) => ({
        content,
        actualIndex: idx,
      }));
    }

    // Phase animation : Créer un défilement infini sans coupure
    const allLines: { content: string; actualIndex: number }[] = [];
    
    // Dupliquer le contenu plusieurs fois pour créer un effet infini
    const repetitions = 3; // Répéter 3 fois pour assurer l'infini
    
    for (let rep = 0; rep < repetitions; rep++) {
      codeLines.forEach((content, idx) => {
        allLines.push({
          content,
          actualIndex: idx,
        });
      });
    }
    
    console.log('Total lignes créées pour animation:', allLines.length, 'lignes originales:', totalItems);
    return allLines;
  }, [codeLines, visibleItems, isSkeletonPhase, totalItems]);

  return {
    isSkeletonPhase,
    revealedLines,
    visibleLines,
    contentRef,
    visibleItems, // Retourner le nombre calculé pour information
  };
};
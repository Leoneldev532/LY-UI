"use client";
import React, { useEffect, useRef, useState } from "react";

interface AgentAnimationProps {
  title?: string;
  duration?: number;
  onComplete?: () => void;
  columns?: number;
  rows?: number;
  blinkDuration?: number;
  pauseDuration?: number;
}

const DEFAULT_ROWS = 3;
const DOT_SIZE = 6;

const AgentAnimation: React.FC<AgentAnimationProps> = ({
  title = "Agent",
  duration = 3000,
  onComplete,
  rows = DEFAULT_ROWS,
  columns,
  blinkDuration = 2000,
  pauseDuration = 500,
}) => {
  const [percent, setPercent] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [phase, setPhase] = useState<'blinking' | 'pause' | 'loading'>('blinking');
  const [dotStates, setDotStates] = useState<boolean[][]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const blinkTimeouts = useRef<NodeJS.Timeout[]>([]);
  const phaseTimeout = useRef<NodeJS.Timeout | null>(null);

  // Calculer la largeur du conteneur de manière responsive
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const computedColumns = columns || Math.max(6, Math.floor((containerWidth * 0.95) / DOT_SIZE));

  // Initialiser la grille de points
  useEffect(() => {
    setDotStates(Array(rows).fill(null).map(() => Array(computedColumns).fill(false)));
  }, [rows, computedColumns]);

  // Calculer le pourcentage total basé sur toutes les phases
  const getTotalProgress = () => {
    const totalBlinkTime = (computedColumns - 1) * 150 + 300;
    const totalAnimationTime = totalBlinkTime + pauseDuration + duration;
    
    if (phase === 'blinking') {
      // Estimation du progrès pendant le clignotement (0-30%)
      return Math.min(30, (Date.now() - (startTime.current || Date.now())) / totalBlinkTime * 30);
    } else if (phase === 'pause') {
      // Pause représente 30-35% du progrès
      return 35;
    } else {
      // Loading représente 35-100% du progrès
      return 35 + (percent * 0.65);
    }
  };

  // Gérer la phase de clignotement colonne par colonne avec clignotement aléatoire
  useEffect(() => {
    if (phase !== 'blinking' || dotStates.length === 0) return;

    // Initialiser le temps de début pour le calcul du pourcentage
    if (!startTime.current) {
      startTime.current = Date.now();
    }

    blinkTimeouts.current.forEach(clearTimeout);
    blinkTimeouts.current = [];

    // Animation colonne par colonne avec clignotement aléatoire dans chaque colonne
    for (let col = 0; col < computedColumns; col++) {
      // Délai de base pour chaque colonne (progression séquentielle)
      const columnDelay = col * 150;
      
      // Pour chaque ligne dans cette colonne
      for (let row = 0; row < rows; row++) {
        // Clignotement aléatoire pour ce point spécifique
        const randomStartDelay = Math.random() * 100; // Variation aléatoire du début
        const blinkCount = 2 + Math.floor(Math.random() * 3); // 2 à 4 clignotements
        const blinkSpeed = 80 + Math.random() * 60; // Vitesse aléatoire
        const onDuration = 60 + Math.random() * 40; // Durée d'allumage aléatoire
        
        // Séquence de clignotements aléatoires pour ce point
        for (let blink = 0; blink < blinkCount; blink++) {
          const randomBlinkDelay = Math.random() * 30; // Variation aléatoire entre clignotements
          const totalDelay = columnDelay + randomStartDelay + (blink * blinkSpeed * 2) + randomBlinkDelay;
          
          // Allumer le point
          const onTimeout = setTimeout(() => {
            setDotStates(prev => {
              const newStates = prev.map(r => [...r]);
              if (newStates[row] && newStates[row][col] !== undefined) {
                newStates[row][col] = true;
              }
              return newStates;
            });
          }, totalDelay);

          // Éteindre le point
          const offTimeout = setTimeout(() => {
            setDotStates(prev => {
              const newStates = prev.map(r => [...r]);
              if (newStates[row] && newStates[row][col] !== undefined) {
                newStates[row][col] = false;
              }
              return newStates;
            });
          }, totalDelay + onDuration);

          blinkTimeouts.current.push(onTimeout, offTimeout);
        }

        // État final : le point reste allumé
        const finalDelay = columnDelay + randomStartDelay + (blinkCount * blinkSpeed * 2) + 50;
        
        const finalTimeout = setTimeout(() => {
          setDotStates(prev => {
            const newStates = prev.map(r => [...r]);
            if (newStates[row] && newStates[row][col] !== undefined) {
              newStates[row][col] = true;
            }
            return newStates;
          });
        }, finalDelay);

        blinkTimeouts.current.push(finalTimeout);
      }
    }

    // Calculer le temps total et passer à la phase suivante
    const totalBlinkTime = (computedColumns - 1) * 150 + 300;
    phaseTimeout.current = setTimeout(() => setPhase('pause'), totalBlinkTime);

    return () => {
      blinkTimeouts.current.forEach(clearTimeout);
      if (phaseTimeout.current) clearTimeout(phaseTimeout.current);
    };
  }, [phase, blinkDuration, rows, computedColumns, dotStates.length]);

  // Gérer la phase de pause
  useEffect(() => {
    if (phase !== 'pause') return;
    
    // Pendant la pause, tous les points sont allumés
    setDotStates(prev => prev.map(row => row.map(() => true)));
    
    phaseTimeout.current = setTimeout(() => setPhase('loading'), pauseDuration);
    return () => {
      if (phaseTimeout.current) clearTimeout(phaseTimeout.current);
    };
  }, [phase, pauseDuration, rows, computedColumns]);

  // Gérer la phase de chargement
  useEffect(() => {
    if (phase !== 'loading') return;

    // Réinitialiser le temps de début pour la phase de loading
    startTime.current = null;

    const animate = (time: number) => {
      if (startTime.current === null) startTime.current = time;
      const elapsed = time - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setPercent(Math.round(progress * 100));

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTime.current = null;
    };
  }, [duration, onComplete, phase]);

  const getLineDuration = (row: number) => {
    const min = 0.7, max = 1.3;
    return duration * (min + ((max - min) * row) / (rows - 1));
  };

  const getEasing = (row: number) => {
    if (row % 3 === 0) return (t: number) => t;
    if (row % 3 === 1) return (t: number) => t * t;
    return (t: number) => 1 - Math.pow(1 - t, 2);
  };

  const getDotFilled = (col: number, row: number) => {
    if (phase !== 'loading') return false;
    const lineDuration = getLineDuration(row);
    const rawProgress = Math.min(1, (percent / 100) * (duration / lineDuration));
    const easing = getEasing(row);
    const lineProgress = easing(rawProgress);
    return col <= Math.floor(lineProgress * computedColumns);
  };

  const getDotColor = (col: number, row: number) => {
    if (phase === 'blinking') {
      return dotStates[row]?.[col]
        ? "text-blue-500"
        : "text-neutral-400 dark:text-neutral-600";
    }
    if (phase === 'pause') return "text-blue-500";
    
   
    return getDotFilled(col, row)
      ? "text-blue-500"
      : "text-neutral-400 dark:text-neutral-600";
  };

  return (
    <div className="flex flex-col items-center px-4 gap-2 w-full">
      <div
        style={{ fontFamily: 'Consolas, monospace' }}
        className="text-lg font-mono text-neutral-800 uppercase dark:text-white"
      >
        {title}: {Math.round(getTotalProgress())}%
      </div>
      <div
        ref={containerRef}
        className="flex flex-col gap-0 w-full items-center"
        style={{ minHeight: rows * 10 }}
      >
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex flex-row gap-0.5 w-full justify-center">
            {Array.from({ length: computedColumns }).map((_, col) => (
              <span
                key={col}
                className={`text-[8px] transition-colors duration-100 ${getDotColor(col, row)}`}
                style={{ display: "inline-block", lineHeight: 1 }}
              >
                •
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentAnimation;
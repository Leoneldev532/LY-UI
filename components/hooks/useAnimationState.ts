"use client"

import { useEffect, useRef, useState } from "react";

export interface AnimationState {
  phase: 'idle' | 'blinking' | 'pause' | 'stopped' | 'completed';
  displayPercent: number;
  elapsedTime: number;
  dotStates: boolean[][];
  isAnimationComplete: boolean;
}

interface UseAnimationStateProps {
  rows: number;
  columns: number;
  duration: number;
  pauseDuration: number;
  isRunning: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onComplete?: () => void;
}

export const useAnimationState = ({
  rows,
  columns,
  duration,
  pauseDuration,
  isRunning,
  onStart,
  onStop,
  onReset,
  onComplete
}: UseAnimationStateProps): AnimationState => {
  const [phase, setPhase] = useState<'idle' | 'blinking' | 'pause' | 'stopped' | 'completed'>('idle');
  const [displayPercent, setDisplayPercent] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dotStates, setDotStates] = useState<boolean[][]>([]);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const globalStartTime = useRef<number | null>(null);
  const pausedTime = useRef<number>(0);
  const lastPauseStart = useRef<number | null>(null);
  const blinkTimeouts = useRef<NodeJS.Timeout[]>([]);
  const phaseTimeout = useRef<NodeJS.Timeout | null>(null);
  const percentAnimationRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const savedAnimationState = useRef<{
    dotStates: boolean[][];
    currentColumn: number;
    elapsedTime: number;
  } | null>(null);


  useEffect(() => {
    const initialStates = Array(rows).fill(null).map(() => Array(columns).fill(false));
    setDotStates(initialStates);
  }, [rows, columns]);

  useEffect(() => {
    if ((phase === 'blinking' || phase === 'pause') && isRunning) {
      const updateTimer = () => {
        if (globalStartTime.current) {
          const currentElapsed = (Date.now() - globalStartTime.current - pausedTime.current) / 1000;
          setElapsedTime(Math.max(0, currentElapsed));
        }
        timerRef.current = requestAnimationFrame(updateTimer);
      };
      timerRef.current = requestAnimationFrame(updateTimer);
    } else if (phase === 'stopped' && globalStartTime.current && lastPauseStart.current) {
      const stoppedElapsed = (lastPauseStart.current - globalStartTime.current - pausedTime.current) / 1000;
      setElapsedTime(Math.max(0, stoppedElapsed));
    } else if (phase === 'completed' && globalStartTime.current) {
      const totalTime = duration / 1000;
      setElapsedTime(totalTime);
    } else if (phase === 'idle') {
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [phase, isRunning, duration]);

  // Utility functions
  const saveAnimationState = () => {
    if (globalStartTime.current) {
      const elapsedTime = Date.now() - globalStartTime.current - pausedTime.current;
      const currentColumn = Math.floor(elapsedTime / 150);
      
      savedAnimationState.current = {
        dotStates: dotStates.map(row => [...row]),
        currentColumn: Math.min(currentColumn, columns - 1),
        elapsedTime
      };
    }
  };

  const restoreAnimationState = () => {
    if (savedAnimationState.current) {
      setDotStates(savedAnimationState.current.dotStates);
      setAnimationProgress(savedAnimationState.current.elapsedTime);
    }
  };

  const resetAnimation = () => {
    blinkTimeouts.current.forEach(clearTimeout);
    blinkTimeouts.current = [];
    if (phaseTimeout.current) clearTimeout(phaseTimeout.current);
    if (percentAnimationRef.current) cancelAnimationFrame(percentAnimationRef.current);
    if (timerRef.current) cancelAnimationFrame(timerRef.current);

    setPhase('idle');
    setDisplayPercent(0);
    setIsAnimationComplete(false);
    setAnimationProgress(0);
    setElapsedTime(0);
    setDotStates(Array(rows).fill(null).map(() => Array(columns).fill(false)));
    
    globalStartTime.current = null;
    pausedTime.current = 0;
    lastPauseStart.current = null;
    savedAnimationState.current = null;

    onReset?.();
  };

  // Handle external animation control
  useEffect(() => {
    if (isRunning && (phase === 'idle' || phase === 'stopped')) {
      if (!globalStartTime.current) {
        globalStartTime.current = Date.now();
        savedAnimationState.current = null;
      } else if (lastPauseStart.current) {
        pausedTime.current += Date.now() - lastPauseStart.current;
        lastPauseStart.current = null;
        restoreAnimationState();
      }
      setPhase('blinking');
      setIsAnimationComplete(false);
      onStart?.();
    } else if (!isRunning && (phase === 'blinking' || phase === 'pause')) {
      saveAnimationState();
      lastPauseStart.current = Date.now();
      setPhase('stopped');
      
      blinkTimeouts.current.forEach(clearTimeout);
      blinkTimeouts.current = [];
      if (phaseTimeout.current) clearTimeout(phaseTimeout.current);
      
      onStop?.();
    }
  }, [isRunning, phase, onStart, onStop, dotStates, columns]);

  // Animation fluide du pourcentage
  useEffect(() => {
    if (phase === 'idle' || phase === 'stopped') return;

    const animatePercent = () => {
      if (!globalStartTime.current) return;

      // Use the total requested duration (duration + pauseDuration)
      const totalAnimationTime = duration + pauseDuration;
      let elapsed = Date.now() - globalStartTime.current - pausedTime.current;
      
      if (savedAnimationState.current && animationProgress > 0) {
        elapsed = Math.max(elapsed, animationProgress);
      }
      
      const targetPercent = Math.min(100, (elapsed / totalAnimationTime) * 100);
      
      setDisplayPercent(prev => {
        const diff = targetPercent - prev;
        if (Math.abs(diff) < 0.1) return targetPercent;
        return prev + diff * 0.15;
      });

      if (targetPercent < 100 && isRunning && phase !== 'completed') {
        percentAnimationRef.current = requestAnimationFrame(animatePercent);
      }
    };

    if (isRunning) {
      percentAnimationRef.current = requestAnimationFrame(animatePercent);
    }

    return () => {
      if (percentAnimationRef.current) {
        cancelAnimationFrame(percentAnimationRef.current);
      }
    };
  }, [duration, pauseDuration, phase, isRunning, animationProgress]);

  // Blinking phase with more randomness
  useEffect(() => {
    if (phase !== 'blinking' || dotStates.length === 0 || !isRunning) return;

    blinkTimeouts.current.forEach(clearTimeout);
    blinkTimeouts.current = [];

    // Calculate column duration based on total requested duration
    const blinkingDuration = duration; // Blinking phase duration
    const baseColumnDelay = columns > 1 ? blinkingDuration / columns : 0;

    let timeOffset = 0;
    let startColumn = 0;
    
    if (savedAnimationState.current && animationProgress > 0) {
      timeOffset = animationProgress;
      startColumn = Math.max(0, Math.floor(animationProgress / baseColumnDelay));
    }

    for (let col = startColumn; col < columns; col++) {
      // Add more variation in column timing
      const columnRandomness = (Math.random() - 0.5) * baseColumnDelay * 0.4; // ±20% variation
      const columnDelay = Math.max(0, col * baseColumnDelay + columnRandomness - timeOffset);
      
      for (let row = 0; row < rows; row++) {
        // Increase random variation for each dot
        const randomStartDelay = Math.random() * (baseColumnDelay * 0.6); // 60% variation (instead of 10%)
        
        // Vary the number of blinks more randomly
        const blinkCount = 1 + Math.floor(Math.random() * 5); // 1 to 5 blinks
        
        // More variable blinking speed
        const baseBlinkSpeed = Math.max(50, baseColumnDelay * 0.08);
        const blinkSpeedVariation = Math.random() * baseBlinkSpeed * 0.8; // ±80% variation
        const blinkSpeed = Math.max(30, baseBlinkSpeed + blinkSpeedVariation);
        
        const onDuration = Math.max(20, blinkSpeed * (0.4 + Math.random() * 0.4)); // 40-80% of time
        
        for (let blink = 0; blink < blinkCount; blink++) {
          // More variation in timing between blinks
          const randomBlinkDelay = Math.random() * (blinkSpeed * 0.8); // Increased from 30% to 80%
          const blinkInterval = blinkSpeed * (1.5 + Math.random()); // More variable interval
          const totalDelay = columnDelay + randomStartDelay + (blink * blinkInterval) + randomBlinkDelay;
          
          if (totalDelay >= 0 && totalDelay < blinkingDuration) {
            const onTimeout = setTimeout(() => {
              if (!isRunning) return;
              setDotStates(prev => {
                const newStates = prev.map(r => [...r]);
                if (newStates[row] && newStates[row][col] !== undefined) {
                  newStates[row][col] = true;
                }
                return newStates;
              });
            }, totalDelay);

            const offTimeout = setTimeout(() => {
              if (!isRunning) return;
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
        }

        // Final state with more temporal variation
        const finalRandomDelay = Math.random() * (baseColumnDelay * 0.3);
        const finalDelay = Math.max(0, columnDelay + randomStartDelay + (blinkCount * blinkSpeed * 1.8) + finalRandomDelay);
        
        // Ensure final state is always before the end of blinking phase
        const safeFinalDelay = Math.min(finalDelay, blinkingDuration - 100); // 100ms before end
        
        if (safeFinalDelay >= 0) {
          const finalTimeout = setTimeout(() => {
            if (!isRunning) return;
            setDotStates(prev => {
              const newStates = prev.map(r => [...r]);
              if (newStates[row] && newStates[row][col] !== undefined) {
                newStates[row][col] = true;
              }
              return newStates;
            });
          }, safeFinalDelay);

          blinkTimeouts.current.push(finalTimeout);
        }
      }
    }

    const remainingTime = Math.max(0, blinkingDuration - timeOffset);
    
    // Add a safety timeout to ensure all dots are lit
    const safetyTimeout = setTimeout(() => {
      if (!isRunning) return;
      setDotStates(prev => prev.map(row => row.map(() => true)));
    }, Math.max(0, blinkingDuration - timeOffset - 50)); // 50ms before end
    
    blinkTimeouts.current.push(safetyTimeout);
    
    phaseTimeout.current = setTimeout(() => {
      if (isRunning) setPhase('pause');
    }, remainingTime);

    return () => {
      blinkTimeouts.current.forEach(clearTimeout);
      if (phaseTimeout.current) clearTimeout(phaseTimeout.current);
    };
  }, [phase, rows, columns, dotStates.length, isRunning, animationProgress, duration]);

  // Pause phase
  useEffect(() => {
    if (phase !== 'pause' || !isRunning) return;
    
    // Don't force all dots to true, keep current state
    setDisplayPercent(100);
    
    phaseTimeout.current = setTimeout(() => {
      if (isRunning) {
        setPhase('completed');
        setIsAnimationComplete(true);
        onComplete?.();
      }
    }, pauseDuration);
    
    return () => {
      if (phaseTimeout.current) clearTimeout(phaseTimeout.current);
    };
  }, [phase, pauseDuration, onComplete, isRunning]);

  return {
    phase,
    displayPercent,
    elapsedTime,
    dotStates,
    isAnimationComplete
  };
};
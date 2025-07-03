"use client"

import React, { useRef, useState, useEffect } from 'react';
import { Circle, Pause, Play } from 'lucide-react';
import ParticleAnimation, { ParticleAnimationHandle } from './particleAnimation';
import { Button } from '@/components/ui/button';

type AudioInteractionProps = {
  onAudioStart?: () => void;
  onAudioStop?: () => void;
  onAudioPause?: () => void;
  onAudioResume?: () => void;
};

type Status = 'idle' | 'playing' | 'paused';

const AudioInteraction: React.FC<AudioInteractionProps> = ({
  onAudioStart,
  onAudioStop,
  onAudioPause,
  onAudioResume,
}) => {
  const RefParticularAnimation = useRef<ParticleAnimationHandle>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gestion du timer pour le temps d'animation
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  // Formater le temps en MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (RefParticularAnimation.current) {
      RefParticularAnimation.current.startAnimation();
      setStatus('playing');
      setTimeElapsed(0);
      onAudioStart?.();
    }
  };

  const handlePause = () => {
    if (RefParticularAnimation.current) {
      RefParticularAnimation.current.pauseAnimation();
      setStatus('paused');
      onAudioPause?.();
    }
  };

  const handleResume = () => {
    if (RefParticularAnimation.current) {
      // Use resumeAnimation to continue particles on their current trajectories
      RefParticularAnimation.current.resumeAnimation();
      setStatus('playing');
      onAudioResume?.();
    }
  };

  const handleStop = () => {
    if (RefParticularAnimation.current) {
      RefParticularAnimation.current.stopAnimation();
      setStatus('idle');
      setTimeElapsed(0);
      onAudioStop?.();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <ParticleAnimation ref={RefParticularAnimation} />
      <div className="flex gap-2 justify-center items-center gap-x-4">
        {status === 'idle' && (
          <Button onClick={handleStart} variant="default">
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
        )}
        {status === 'playing' && (
          <Button onClick={handlePause} variant="default">
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
        )}
        {status === 'paused' && (
          <Button onClick={handleResume} variant="default">
            <Play className="mr-2 h-4 w-4" /> Resume
          </Button>
        )}
        <div className="text-lg font-mono">{formatTime(timeElapsed)}</div>
        <Button onClick={handleStop} variant="default">
          <Circle className="mr-2 h-4 w-4" /> Stop
        </Button>
      </div>
    </div>
  );
};

export default AudioInteraction;
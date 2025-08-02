"use client"

/**
 * @author: @lyui
 * @description: Particle Animation component for creating animated particle systems with configurable circular patterns and dispersion effects
 * @version: 1.0.0
 * @date: 2024-12-19
 * @license: MIT
 * @website: https://ly-ui.dev
 */
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Interface to define particle properties
interface Particle {
  id: number;
  angle: number;
  radius: number;
  startRadius: number; // Rayon initial pour l'animation de dispersion
  speed: number;
  radiusSpeed: number;
  baseRadius: number;
  radiusAmplitude: number;
  opacity: number;
  size: number;
  isBright: boolean;
  pulsePhase: number;
  pulseSpeed: number;
  transitionProgress: number; // Progress of dispersion animation (0 to 1)
  isInitialAnimation: boolean; // Indicates if it's the initial animation (dispersion)
}

// Interface pour les props du composant
interface ParticleAnimationProps {
  width?: number;
  height?: number;
  numParticles?: number;
  minRadius?: number;
  maxRadius?: number;
  backgroundColor?: string;
  particleColor?: string;
  brightParticleColor?: string;
  showCenter?: boolean;
  showBorders?: boolean;
  className?: string;
}

// Interface for functions exposed via ref
export interface ParticleAnimationHandle {
  startAnimation: () => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  stopAnimation: () => void;
}

// Fonction d'interpolation easeOutQuad pour une transition fluide
const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);

// Reusable particle animation component
const ParticleAnimation = forwardRef<ParticleAnimationHandle, ParticleAnimationProps>(
  (
    {
      width = 300,
      height = 300,
      numParticles = 120,
      minRadius = 80,
      maxRadius = 140,
      backgroundColor = 'transparent',
      particleColor = '#9CA3AF',
      brightParticleColor = '#FFFFFF',
      showCenter = false,
      showBorders = false,
      className = '',
    },
    ref
  ) => {
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [, setRender] = useState<object>({});

    const baseRadius: number = (minRadius + maxRadius) / 2;

    // Fonction pour initialiser les particules
    const initializeParticles = () => {
      particlesRef.current = Array.from({ length: numParticles }, (_, i) => {
        const angle: number = (i / numParticles) * 2 * Math.PI;
        const radiusVariation: number = Math.random() * (maxRadius - minRadius) + minRadius;

        return {
          id: i,
          angle,
          radius: 0, // Particles start at center
          startRadius: 0, // Initial radius for animation
          speed: 0.008 + Math.random() * 0.015,
          radiusSpeed: 0.0008 + Math.random() * 0.0015,
          baseRadius: radiusVariation,
          radiusAmplitude: 25 + Math.random() * 35,
          opacity: 0.4 + Math.random() * 0.6,
          size: 1.5 + Math.random() * 2.5,
          isBright: Math.random() < 0.12,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          transitionProgress: 0, // Progression initiale de l'animation de dispersion --------------------
          isInitialAnimation: true, // Activer la dispersion pour les nouvelles particules
        };
      });

      setRender({});
    };

    // Function to reset initial animation on existing particles
    const resetToInitialAnimation = () => {
      particlesRef.current.forEach((particle: Particle) => {
        particle.radius = 0; // Remettre au centre
        particle.startRadius = 0;
        particle.transitionProgress = 0;
        particle.isInitialAnimation = true; // Reactivate dispersion animation
      });
      setRender({});
    };

    // Initialiser les particules au montage
    useEffect(() => {
      initializeParticles();
    }, [numParticles, minRadius, maxRadius]);

    // Animation loop
    useEffect(() => {
      const animate = (currentTime: number) => {
        if (!isRunning) return;

        const elapsedTime: number = currentTime * 0.001;

        particlesRef.current.forEach((particle: Particle) => {
          // Animation de dispersion (uniquement pour l'animation initiale)
          if (particle.isInitialAnimation && particle.transitionProgress < 1) {
            particle.transitionProgress = Math.min(particle.transitionProgress + 0.016 / 0.5, 1); // 0.5s duration
            const easedProgress = easeOutQuad(particle.transitionProgress);
            particle.radius = particle.startRadius + (particle.baseRadius - particle.startRadius) * easedProgress;
            if (particle.transitionProgress >= 1) {
              particle.isInitialAnimation = false; // Disable dispersion after completion
            }
          } else {
            // Animation normale (rotation et oscillation)
            particle.angle += particle.speed;
            const radiusOscillation: number = Math.sin(elapsedTime * particle.radiusSpeed) * particle.radiusAmplitude;
            particle.radius = particle.baseRadius + radiusOscillation;
            particle.radius = Math.max(minRadius, Math.min(maxRadius, particle.radius));
          }
          particle.pulsePhase += particle.pulseSpeed;
        });

        setRender({});
        animationRef.current = requestAnimationFrame(animate);
      };

      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate);
      }

      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    }, [isRunning, minRadius, maxRadius]);

    // Animation control functions
    const startAnimation = () => {
      if (particlesRef.current.length === 0) {
        initializeParticles(); // Create new particles with dispersion
      } else {
        resetToInitialAnimation(); // Reset initial animation on existing particles
      }
      setIsRunning(true);
    };

    const pauseAnimation = () => {
      setIsRunning(false);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const resumeAnimation = () => {
      setIsRunning(true);
    };

    const stopAnimation = () => {
      setIsRunning(false);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      particlesRef.current = []; // Reset particles
      setRender({});
    };

    // Expose control functions via ref
    useImperativeHandle(ref, () => ({
      startAnimation,
      pauseAnimation,
      resumeAnimation,
      stopAnimation,
    }));

    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor,
        }}
      >
        {/* Cercles de référence optionnels */}
        {showBorders && (
          <>
            <div
              className="absolute border border-gray-700 rounded-full opacity-10"
              style={{
                width: `${minRadius * 2}px`,
                height: `${minRadius * 2}px`,
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="absolute border border-gray-600 rounded-full opacity-15"
              style={{
                width: `${maxRadius * 2}px`,
                height: `${maxRadius * 2}px`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </>
        )}

        {particlesRef.current.map((particle: Particle) => {
          const x: number = Math.cos(particle.angle) * particle.radius;
          const y: number = Math.sin(particle.angle) * particle.radius;
          const pulseScale: number = 1 + Math.sin(particle.pulsePhase) * 0.3;
          const pulseOpacity: number = particle.opacity + Math.sin(particle.pulsePhase) * 0.25;

          return (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                width: `${particle.size * pulseScale}px`,
                height: `${particle.size * pulseScale}px`,
                backgroundColor: particle.isBright ? brightParticleColor : particleColor,
                opacity: Math.max(0.2, Math.min(1, pulseOpacity)),
                transform: 'translate(-50%, -50%)',
                boxShadow: particle.isBright
                  ? `0 0 ${4 * pulseScale}px ${brightParticleColor}80`
                  : 'none',
              }}
            />
          );
        })}

        {showCenter && (
          <div
            className="absolute w-1 h-1 rounded-full opacity-30"
            style={{
              backgroundColor: particleColor,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
    );
  }
);

ParticleAnimation.displayName = 'ParticleAnimation';

export default ParticleAnimation;

"use client"
import { Loader } from "lucide-react"
import type React from "react"
import { useState, useEffect, useRef, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface LineListItemProps {
  numberOfLine: number
  contenu: string
  loading?: boolean
}

interface AnimatedProcessListProps {
  title?: string
  lignes?: string[]
  className?: string
  scrollDirection?: "up" | "down"
  animationSpeed?: "slow" | "normal" | "fast"
  onAnimationEnd?: () => void
  skeletonDuration?: number
  lineRevealDelay?: number
}

const SkeletonItem: React.FC = () => (
  <div className="flex items-center justify-start gap-2 p-4 h-8 w-full rounded-lg">
    <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-10 animate-pulse"></div>
    <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-4/6 animate-pulse"></div>
  </div>
)

const LineListItem: React.FC<LineListItemProps> = ({ numberOfLine, contenu, loading = false }) => {
  if (loading) {
    return <SkeletonItem />
  }

  return (
    <li className="flex items-center justify-start gap-2 py-4 h-12 px-2 w-full rounded-lg hover:bg-neutral-300/30 dark:hover:bg-neutral-700/30">
      <div className="text-sm font-mono text-red-800 dark:text-neutral-400 min-w-[2rem]">{numberOfLine}</div>
      <p className="text-sm line-clamp-1 overflow-hidden text-ellipsis text-neutral-800 dark:text-gray-200">
        {contenu}
      </p>
    </li>
  )
}

const AnimatedProcessList = forwardRef<HTMLDivElement, AnimatedProcessListProps>(({
  title = "Génération d'éléments pour votre page web",
  lignes = [
    "Initialisation du composant principal",
    "Configuration des styles Tailwind",
    "Création de la structure HTML",
    "Ajout des animations CSS",
    "Intégration des icônes Lucide",
    "Configuration du mode sombre",
    "Optimisation des performances",
    "Tests de responsivité",
    "Validation de l'accessibilité",
    "Finalisation du composant",
  ],
  className,
  scrollDirection = "up",
  animationSpeed = "normal",
  onAnimationEnd,
  skeletonDuration = 2000,
  lineRevealDelay = 150,
  ...props
}, ref) => {
  const [revealedLines, setRevealedLines] = useState<boolean[]>([])
  const [isSkeletonPhase, setIsSkeletonPhase] = useState(true)
  const [startAnimation, setStartAnimation] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Animation speed mapping
  const speedMap = {
    slow: "8s",
    normal: "5s",
    fast: "3s",
  }

  // Initialisation et gestion du skeleton/révélation
  useEffect(() => {
    setRevealedLines(new Array(lignes.length).fill(false))
    setIsSkeletonPhase(true)
    setStartAnimation(false)

    const skeletonTimer = setTimeout(() => {
      setIsSkeletonPhase(false)

      // Révélation progressive des lignes
      const interval = setInterval(() => {
        setRevealedLines((prev) => {
          const nextIndex = prev.findIndex((revealed) => !revealed)
          if (nextIndex === -1) {
            clearInterval(interval)
            // Démarrer l'animation après révélation complète
            setTimeout(() => setStartAnimation(true), 500)
            onAnimationEnd?.()
            return prev
          }
          const newState = [...prev]
          newState[nextIndex] = true
          return newState
        })
      }, lineRevealDelay)

      return () => clearInterval(interval)
    }, skeletonDuration)

    return () => clearTimeout(skeletonTimer)
  }, [lignes.length, skeletonDuration, lineRevealDelay, onAnimationEnd])

  // Dupliquer les lignes pour l'animation infinie
  const duplicatedLines = [...lignes, ...lignes]

  return (
    <>
      <style>{`
        @keyframes scrollUp {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }

        @keyframes scrollDown {
          from {
            transform: translateY(-50%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes fadeInLine {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .line-reveal {
          animation: fadeInLine 0.3s ease-out forwards;
        }

        .scroll-animation-up {
          animation: scrollUp ${speedMap[animationSpeed]} linear infinite;
        }

        .scroll-animation-down {
          animation: scrollDown ${speedMap[animationSpeed]} linear infinite;
        }
      `}</style>

      <div
        ref={ref}
        className={cn(
          "flex flex-col max-w-xl justify-start items-center gap-2 bg-transparent rounded-xl p-4",
          className,
        )}
        {...props}
      >
        <div className="flex gap-2 justify-start items-center w-full">
          <Loader className="animate-spin w-5 h-5 text-black dark:text-white" />
          <h2 className="text-xl font-semibold py-2 text-center text-neutral-700 dark:text-gray-200">{title}</h2>
        </div>

        <div className="relative w-full max-w-xl h-72 overflow-hidden rounded-lg">
          {/* Gradients de masquage */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white dark:from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-black to-transparent"></div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-black to-transparent"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-black to-transparent"></div>
          </div>

          {/* Contenu animé */}
          <div
            ref={contentRef}
            className={cn(
              "absolute top-0 left-0 w-full",
              startAnimation &&
                !isSkeletonPhase &&
                (scrollDirection === "up" ? "scroll-animation-up" : "scroll-animation-down"),
            )}
          >
            <ul className="space-y-1 px-4">
              {(startAnimation ? duplicatedLines : lignes).map((contenu, idx) => {
                const originalIndex = idx % lignes.length
                const isRevealed = startAnimation || revealedLines[originalIndex]

                return (
                  <div key={`line-container-${idx}`} className={isRevealed && !isSkeletonPhase ? "line-reveal" : ""}>
                    <LineListItem
                      numberOfLine={originalIndex + 112}
                      contenu={contenu}
                      loading={isSkeletonPhase || !isRevealed}
                    />
                  </div>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
});

AnimatedProcessList.displayName = 'AnimatedProcessList';
export default AnimatedProcessList;

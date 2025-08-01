"use client"
import { Loader, CheckCircle, Settings, FileText, Paintbrush, Sparkles, Moon, Gauge, Smartphone, Eye, Star } from "lucide-react"
import type React from "react"
import { useState, useEffect, useRef, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface ProcessLine {
  icon: React.ReactNode
  content: string
}

interface AnimatedProcessList_LovableProps {
  title?: string
  lines?: ProcessLine[]
  className?: string
  scrollDirection?: "up" | "down"
  animationSpeed?: "slow" | "normal" | "fast"
  onAnimationEnd?: () => void
  skeletonDuration?: number
  lineRevealDelay?: number
  stepIcons?: React.ReactNode[]
}



const defaultStepIcons = [
  <CheckCircle key="check" className="w-5 h-5 text-green-600 dark:text-green-400" />,
  <Settings key="settings" className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  <FileText key="file" className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
  <Paintbrush key="paint" className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
  <Sparkles key="sparkles" className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  <Moon key="moon" className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
  <Gauge key="gauge" className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
  <Smartphone key="smartphone" className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
  <Eye key="eye" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
  <Star key="star" className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
]

const LineListItem: React.FC<ProcessLine> = ({ icon, content }) => {
  return (
    <div className="flex items-center text-left justify-start gap-2 py-4 h-12 px-2 w-full rounded-lg">
      <span className="min-w-[2rem] flex items-center justify-center">{icon}</span>
      <p className="text-sm line-clamp-1 overflow-hidden text-ellipsis text-neutral-800 dark:text-gray-200">
        {content}
      </p>
    </div>
  )
}

/**
 * AnimatedProcessList_Lovable component.
 * Displays a process list with icons, animated reveal, and customizable step icons.
 *
 * Props:
 * @prop title - Title displayed at the top of the component.
 * @prop lines - Array of line items with icons and content.
 * @prop className - Additional CSS classes for styling.
 * @prop scrollDirection - Direction of the scrolling animation ("up" or "down").
 * @prop animationSpeed - Speed of the animation ("slow", "normal", or "fast").
 * @prop onAnimationEnd - Callback when the reveal animation ends.
 * @prop skeletonDuration - Duration in milliseconds of the skeleton phase.
 * @prop lineRevealDelay - Delay in milliseconds between each line reveal.
 * @prop stepIcons - Custom icons for each step (optional).
 */
const AnimatedProcessList_Lovable = forwardRef<HTMLDivElement, AnimatedProcessList_LovableProps>(({
  title = "Spinning up preview...",
  lines,
  className,
  scrollDirection = "up",
  animationSpeed = "normal",
  onAnimationEnd,
  skeletonDuration = 2000,
  lineRevealDelay = 150,
  stepIcons,
  ...props
}, ref) => {
  const icons = stepIcons && stepIcons.length > 0 ? stepIcons : defaultStepIcons
  const defaultLines: ProcessLine[] = [
    { icon: icons[0 % icons.length], content: "Analyse de la question" },
    { icon: icons[1 % icons.length], content: "Recherche de sources" },
    { icon: icons[2 % icons.length], content: "Synthèse des infos" },
    { icon: icons[3 % icons.length], content: "Vérification de la réponse" },
    { icon: icons[4 % icons.length], content: "Affichage de la réponse" },
    { icon: icons[5 % icons.length], content: "Suggestions utiles" },
    { icon: icons[6 % icons.length], content: "Collecte de feedback" },
  ]
  const normalizedLines: ProcessLine[] = (lines && lines.length > 0
    ? lines.map((line, idx) => ({
      icon: line.icon ?? icons[idx % icons.length],
      content: line.content,
    }))
    : defaultLines
  )

  const [revealedLines, setRevealedLines] = useState<boolean[]>([])
  const [isSkeletonPhase, setIsSkeletonPhase] = useState(true)
  const [startAnimation, setStartAnimation] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const speedMap = {
    slow: "8s",
    normal: "5s",
    fast: "3s",
  }

  useEffect(() => {
    setRevealedLines(new Array(normalizedLines.length).fill(false))
    setIsSkeletonPhase(true)
    setStartAnimation(false)

    const skeletonTimer = setTimeout(() => {
      setIsSkeletonPhase(false)
      const interval = setInterval(() => {
        setRevealedLines((prev) => {
          const nextIndex = prev.findIndex((revealed) => !revealed)
          if (nextIndex === -1) {
            clearInterval(interval)
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
  }, [normalizedLines.length, skeletonDuration, lineRevealDelay, onAnimationEnd])

  const duplicatedLines = [...normalizedLines, ...normalizedLines]
  const skeletonLineCount = 6

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
           width: 100%;
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
          "flex flex-col justify-start items-center rounded-xl p-4",
          className,
        )}
        {...props}
      >
        <div className="flex gap-2 justify-start items-center py-2 w-full max-w-xl mx-auto">
          <Loader className="animate-spin min-w-5 min-h-5 text-black dark:text-white" />
          <h2 className="text-lg md:text-xl line-clamp-1 font-semibold py-2 text-left text-neutral-700 dark:text-gray-200 w-full">{title}</h2>
        </div>

        <div className="relative w-full   h-72 overflow-hidden ">


          <div className="pointer-events-none absolute inset-0 z-10">
            <div
              className="
                absolute top-0 left-0 w-full h-4
                pointer-events-none
                bg-gradient-to-b
                from-[rgba(255,255,255,1)]/90
                via-[rgba(255,255,255,0.7)]/70
                to-transparent
                dark:from-neutral-900
                dark:via-neutral-900
                dark:to-transparent
              "
              style={{ zIndex: 11 }}
            />
            <div
              className="
                absolute bottom-0 left-0 w-full h-4
                pointer-events-none
                bg-gradient-to-t
                from-[rgba(255,255,255,1)]/90
                via-[rgba(255,255,255,0.7)]/70
                to-transparent
                dark:from-neutral-900
                dark:via-neutral-900
                dark:to-transparent
              "
              style={{ zIndex: 11 }}
            />
          </div>

          <div
            ref={contentRef}
            className={cn(
              "absolute top-0 left-0 w-full",
              startAnimation &&
              !isSkeletonPhase &&
              (scrollDirection === "up" ? "scroll-animation-up" : "scroll-animation-down"),
            )}
          >
            <ul className="space-y-1 px-4 flex flex-col w-full justify-center items-center h-full">
              {
                (startAnimation ? duplicatedLines : normalizedLines).map((line, idx) => {
                  const originalIndex = idx % normalizedLines.length
                  const isRevealed = startAnimation || revealedLines[originalIndex]
                  return (
                    <li
                      key={`line-container-${idx}`}
                      className={isRevealed && !isSkeletonPhase ? "line-reveal" : ""}
                    >
                      <LineListItem
                        icon={line.icon}
                        content={line.content}
                      />
                    </li>
                  )
                })}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
});

AnimatedProcessList_Lovable.displayName = "AnimatedProcessList_Lovable"
export default AnimatedProcessList_Lovable

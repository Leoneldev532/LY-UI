"use client"
import { Loader, CheckCircle, Settings, FileText, Paintbrush, Sparkles, Moon, Gauge, Smartphone, Eye, Star } from "lucide-react"
import type React from "react"
import { useState, useEffect, useRef } from "react"
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

const LineListItem: React.FC<ProcessLine> = ({ icon, content}) => {
  return (
    <li className="flex items-center justify-start gap-2 py-4 h-12 px-2 w-full rounded-lg">
      <span className="min-w-[2rem] flex items-center justify-center">{icon}</span>
      <p className="text-sm line-clamp-1 overflow-hidden text-ellipsis text-neutral-800 dark:text-gray-200">
        {content}
      </p>
    </li>
  )
}

const AnimatedProcessList_Lovable: React.FC<AnimatedProcessList_LovableProps> = ({
  title = "Spinning up preview...",
  lines,
  className,
  scrollDirection = "up",
  animationSpeed = "normal",
  onAnimationEnd,
  skeletonDuration = 2000,
  lineRevealDelay = 150,
  stepIcons,
}) => {
  const icons = stepIcons && stepIcons.length > 0 ? stepIcons : defaultStepIcons
  const defaultLines: ProcessLine[] = [
    { icon: icons[0 % icons.length], content: "We analyze your question to understand the context and intent." },
    { icon: icons[1 % icons.length], content: "We search reliable databases and relevant resources." },
    { icon: icons[2 % icons.length], content: "We compile the collected information to generate a clear and concise answer." },
    { icon: icons[3 % icons.length], content: "We validate the answer to ensure its relevance and reliability." },
    { icon: icons[4 % icons.length], content: "Your personalized answer is ready to be displayed." },
    { icon: icons[5 % icons.length], content: "We suggest additional resources or directions to deepen your understanding." },
    { icon: icons[6 % icons.length], content: "Your feedback helps us improve the quality of future answers." },
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
        className={cn(
          "flex flex-col justify-start items-center rounded-xl p-4",
          className,
        )}
      >
        <div className="flex gap-2 justify-start items-center py-4 w-full max-w-xl mx-auto">
          <Loader className="animate-spin min-w-5 min-h-5 text-black dark:text-white" />
          <h2 className="text-xl font-semibold py-2 text-center text-neutral-700 dark:text-gray-200 w-full">{title}</h2>
        </div>

        <div className="relative w-full max-w-xl h-72 overflow-hidden rounded-lg">
         
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
}

AnimatedProcessList_Lovable.displayName = "AnimatedProcessList_Lovable"
export default AnimatedProcessList_Lovable
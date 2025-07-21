"use client"
import React, { useState, useRef, useEffect } from 'react'
import AiSearchBar from './LY UI/AI/ai-searchbar'
import EditableQuestion from './LY UI/AI/editableQuestion'
import GeneratedAnswer from './LY UI/AI/generatedAnswer'
import ThinkingSearchAnimation from './LY UI/AI/thinkingSearchAnimation'
import GeneratedImageCard from './LY UI/AI/generatedImageCard'
import car from "@/public/car.jpg";

type QA = {
  question: string
  answer: string
  showAnswer: boolean
  isImage?: boolean // Ajout d'un flag pour savoir si c'est une génération d'image
}

const ChatbotIA = () => {
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [history, setHistory] = useState<QA[]>([])
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false)
  const [showThinking, setShowThinking] = useState<boolean>(false)
  const [listToolsId, setListToolsId] = useState<number[]>([])
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Nettoyage des timeouts à l'unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current = []
    }
  }, [])

  // Génère une réponse factice
  const generateAnswer = (question: string): string => {
    return `Réponse générée pour: "${question}"`
  }

  // Affiche la réponse après un délai (ex: 2 secondes)
  const revealAnswer = (idx: number) => {
    setHistory(prev =>
      prev.map((qa, i) =>
        i === idx ? { ...qa, showAnswer: true } : qa
      )
    )
    setLoadingIdx(null)
  }

  // Sépare la logique de soumission pour la réutiliser
  const proceedSubmit = (value: string, isImage: boolean) => {
    if (isImage) {
      // Pour une génération d'image, on ajoute juste l'entrée avec isImage
      setHistory(prev => [
        ...prev,
        { question: value, answer: "", showAnswer: true, isImage: true }
      ])
      setLoadingIdx(null)
    } else {
      const answer = generateAnswer(value)
      setHistory(prev => {
        const idx = prev.length
        setLoadingIdx(idx)
        // On stocke le timeout pour pouvoir le nettoyer si besoin
        const timeout = setTimeout(() => {
          revealAnswer(idx)
        }, 2000)
        timeoutsRef.current.push(timeout)
        return [
          ...prev,
          { question: value, answer, showAnswer: false, isImage: false }
        ]
      })
    }
  }

  // Gère la soumission d'une question
  const handleSubmit = (value: string) => {
    setCurrentQuestion(value)
    const isImage = listToolsId.includes(1)
    if (isThinkingMode || isImage) {
      setShowThinking(true)
      setTimeout(() => {
        setShowThinking(false)
        proceedSubmit(value, isImage)
      }, 1000) // 1 seconde d'animation "thinking"
    } else {
      proceedSubmit(value, isImage)
    }
  }

  // Gère la modification d'une question (retry)
  const handleRetry = (value: string) => {
    setCurrentQuestion(value)
    const isImage = listToolsId.includes(1)
    proceedSubmit(value, isImage)
  }

  // Option pour afficher la réponse manuellement (événement bouton)
  const handleRevealClick = (idx: number) => {
    if (history[idx]?.showAnswer) return
    setLoadingIdx(null)
    revealAnswer(idx)
  }

  return (
    <div className="flex w-full flex-col max-w-xl justify-center items-center">
      <div className="w-full mb-4">
        {history.length > 0 && (
          <div className="flex flex-col gap-4 w-full max-w-xl">
            {history.map((qa, idx) => (
              <div key={idx} className="">
                <EditableQuestion onQuestionChange={handleRetry} question={qa.question} />
                {/* Si c'est une génération d'image, on n'affiche PAS GeneratedAnswer */}
                {qa.isImage ? (
                  <div className="w-full mt-4">
                    <GeneratedImageCard
                      src={car}
                      className='h-72'
                      timestamp="00:00"
                      prompt="generate bird image"
                      imageTitle="AI Generated Image"
                    />
                  </div>
                ) : (
                  <GeneratedAnswer
                    className=''
                    content={qa.answer}
                    LoaderComponent={
                      <div>
                        {loadingIdx === idx && !qa.showAnswer ? (
                          <div className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></span>
                            <span>Réponse en cours...</span>
                          </div>
                        ) : (
                          !qa.showAnswer && (
                            <button
                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              onClick={() => handleRevealClick(idx)}
                            >
                              Afficher la réponse
                            </button>
                          )
                        )}
                      </div>
                    }
                    isLoading={!qa.showAnswer && loadingIdx === idx}
                    timestamp={"12:00"}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>


      {showThinking && (
        <div className="w-full mb-4">
          <ThinkingSearchAnimation
            minParagraphLength={230}
            streamingText={`Maintenant, lors du submit, si le mode "thinking" est activé, le composant ThinkingSearchAnimation s'affiche pendant 1 seconde avant de lancer la génération de la réponse. L'animation ne s'affiche qu'une seule fois par question.
Tu peux ajuster la durée (ici 1 seconde) en modifiant la valeur dans le setTimeout si besoin.
Dis-moi si tu veux personnaliser davantage le comportement ou l'apparence !`}
          />
        </div>
      )}

      <div className="w-full mb-4">
        <AiSearchBar
          className='mb-3'
          onToolsChange={setListToolsId}
          onThinkModeChange={setIsThinkingMode}
          submitLoaderComponent={
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></span>
          }
          submitLoading={loadingIdx !== null || showThinking}
          onSubmit={handleSubmit}
          variant='default'
          placeholder='Pose ta question à l’IA !'
        />
      </div>
    </div>
  )
}

export default ChatbotIA

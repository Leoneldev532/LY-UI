"use client"
import React, { useState, useRef, useEffect } from 'react'
import AiSearchBar from './LY UI/AI/ai-searchbar'
import EditableQuestion from './LY UI/AI/editableQuestion'
import GeneratedAnswer from './LY UI/AI/generatedAnswer'
import ThinkingSearchAnimation from './LY UI/AI/thinkingSearchAnimation'
import GeneratedImageCard from './LY UI/AI/generatedImageCard'
import car from "@/public/car.jpg";
import AiAgentAnimation from './LY UI/AI/AiAgentAnimation'
import { ProgressiveContentList, renderContentSequentially } from './LY UI/AI/RenderContentItem';

import { z } from "zod";

/**
 * Type for a single content item in the AI's answer.
 * @prop type - The type of content ("text", "code", "image", etc.)
 * @prop content - The actual content (string, base64, etc.)
 * @prop metadata - Metadata about the content (e.g., "markdown", "JavaScript", "base64")
 */
type LiaContentItem = {
  type: string;
  content: any;
  metadata?: any;
};

// Schéma Zod précis pour la réponse attendue
const LiaContentItemSchema = z.object({
  type: z.string(),
  content: z.any(),
  metadata: z.any().optional(),
});
const LiaContentArraySchema = z.array(LiaContentItemSchema);

/**
 * Type for a single question/answer entry in the chat history.
 * @prop question - The user's question.
 * @prop answer - The AI's answer as an array of LiaContentItem.
 * @prop showAnswer - Whether to show the answer.
 * @prop isImage - Whether the answer is an image.
 * @prop endTime - The time the answer was completed.
 * @prop isStopped - Whether the answer generation was stopped.
 */
type QA = {
  question: string
  answer: LiaContentItem[]
  showAnswer: boolean
  isImage?: boolean
  endTime?: string
  isStopped?: boolean
}

// Nouvelle fonction utilisant Together AI avec Mistral - VERSION CORRIGÉE
async function callTogetherMistralAPI(prompt: string, signal?: AbortSignal): Promise<LiaContentItem[]> {
  const apiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY || "";
  const endpoint = "https://api.together.xyz/v1/chat/completions";

  // Fonction utilitaire pour créer une réponse d'erreur
  const createErrorResponse = (message: string): LiaContentItem[] => {
    return [{ type: 'text', content: message, metadata: 'markdown' }];
  };

  // Fonction utilitaire pour parser et valider la réponse JSON - CORRIGÉE
  const parseAIResponse = (rawContent: string): LiaContentItem[] => {
    try {
      let cleaned = rawContent.trim();

      // Nettoyer les blocs de code markdown
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');

      console.log("Contenu à parser:", cleaned);

      // CORRECTION PRINCIPALE: Gérer les guillemets multiples dans le contenu
      const parsed = JSON.parse(cleaned, (key, value) => {
        if (typeof value === 'string') {
          // Nettoyer les guillemets multiples au début et à la fin
          value = value.replace(/^"+"/, '"').replace(/"+"$/, '"');
          // Supprimer les guillemets en trop à l'intérieur du contenu
          value = value.replace(/""""/g, '"');
          value = value.replace(/"""/g, '"');
          value = value.replace(/""/g, '"');
        }
        return value;
      });

      // Validation stricte avec Zod
      const validated = LiaContentArraySchema.safeParse(parsed);
      if (!validated.success) {
        console.error("Zod validation failed:", validated.error);
        return createErrorResponse("Réponse de l'IA mal formatée (schéma non respecté)");
      }

      if (validated.data.length === 0) {
        return createErrorResponse("Réponse vide de l'IA");
      }

      // Post-traitement pour nettoyer le contenu des éléments
      const cleanedData = validated.data.map(item => {
        if (typeof item.content === 'string') {
          // Nettoyer le contenu des guillemets multiples
          let content = item.content;

          // Supprimer les préfixes de langue mal formatés comme "javascript\n
          content = content.replace(/^"([a-zA-Z]+)\\n/, '$1\n');

          // Nettoyer les échappements de nouvelles lignes
          content = content.replace(/\\n/g, '\n');
          content = content.replace(/\\t/g, '\t');
          content = content.replace(/\\"/g, '"');

          // Supprimer les guillemets en trop au début et à la fin
          if (content.startsWith('"""') && content.endsWith('"""')) {
            content = content.slice(3, -3);
          } else if (content.startsWith('""') && content.endsWith('""')) {
            content = content.slice(2, -2);
          }

          return { ...item, content };
        }
        return item;
      });

      return cleanedData;

    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content that failed to parse:", rawContent);

      // Tentative de réparation plus robuste
      try {
        let fixedJson = rawContent.trim();

        // Méthode alternative: parser manuellement chaque objet
        const items: LiaContentItem[] = [];

        // Chercher tous les objets JSON dans la réponse
        const objectRegex = /\{\s*"type"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*"metadata"\s*:\s*"([^"]*)"\s*\}/g;
        let match;

        while ((match = objectRegex.exec(fixedJson)) !== null) {
          const [, type, content, metadata] = match;

          // Nettoyer le contenu
          const cleanContent = content
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/""""/g, '"')
            .replace(/"""/g, '"');

          items.push({
            type,
            content: cleanContent,
            metadata
          });
        }

        if (items.length > 0) {
          const validated = LiaContentArraySchema.safeParse(items);
          if (validated.success) {
            return validated.data;
          }
        }
      } catch (fixError) {
        console.error("Failed to fix JSON:", fixError);
      }

      // Fallback: retourner le contenu brut comme texte
      return [{
        type: 'text',
        content: rawContent || "Réponse vide de l'IA",
        metadata: 'markdown'
      }];
    }
  };

  // Instruction pour forcer le format de réponse - AMÉLIORÉE
  const markdownInstruction = `You are an expert in programming. Answer all questions. Respond strictly in the following JSON array format (no prose, no explanation, just the array):

[
  {
    "type": "text|code|image|...",
    "content": "...",
    "metadata": "markdown|javascript|base64|..."
  }
]

IMPORTANT:
- If you return code, set type to "code" and metadata to the language name
- If you return text, set type to "text" and metadata to "markdown"
- Escape all quotes and newlines properly in the JSON
- Use single backslash for escaping (not double)
- Do not use triple or quadruple quotes`;

  const promptWithMarkdown = `${prompt}\n\n${markdownInstruction}`;

  try {
    const body = {
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        {
          role: "user",
          content: promptWithMarkdown,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024, // Augmenté pour des réponses plus complètes
      tools: [
        {
          "type": "function",
          "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
              "type": "object",
              "properties": {
                "location": {
                  "type": "string",
                  "description": "The city and state, e.g. San Francisco, CA"
                },
                "unit": {
                  "type": "string",
                  "enum": [
                    "celsius",
                    "fahrenheit"
                  ]
                }
              }
            }
          }
        }
      ]
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return createErrorResponse('Erreur : Clé API Together manquante ou invalide.');
      }
      return createErrorResponse(`Erreur API Together : ${response.statusText}`);
    }

    const data = await response.json();
    let rawContent = data.choices?.[0]?.message?.content || "";

    console.log("Raw AI response:", rawContent);

    if (!rawContent.trim()) {
      return createErrorResponse("Réponse vide de l'IA");
    }

    // Utiliser la fonction de parsing corrigée
    return parseAIResponse(rawContent);

  } catch (fetchError) {
    console.error("Fetch error:", fetchError);
    if (signal?.aborted) {
      return [{ type: 'text', content: "Requête annulée par l'utilisateur", metadata: 'markdown' }];
    }
    return [{ type: 'text', content: `Erreur de connexion : ${fetchError}`, metadata: 'markdown' }];
  }
}

function getCurrentTimeString(): string {
  const now = new Date();
  return now
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const ChatbotIA = () => {
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [history, setHistory] = useState<QA[]>([])
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false)
  const [showThinking, setShowThinking] = useState<boolean>(false)
  const [listToolsId, setListToolsId] = useState<number[]>([])
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const [showAgentAnimation, setShowAgentAnimation] = useState<boolean>(false)
  const abortControllersRef = useRef<{ [key: number]: AbortController }>({})

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current = []
      Object.values(abortControllersRef.current).forEach(controller => controller.abort())
      abortControllersRef.current = {}
    }
  }, [])

  const generateAnswer = async (question: string, idx: number): Promise<LiaContentItem[]> => {
    try {
      const controller = new AbortController()
      abortControllersRef.current[idx] = controller
      const answer = await callTogetherMistralAPI(question, controller.signal)
      console.log("Generated answer:", answer)
      delete abortControllersRef.current[idx]
      return answer
    } catch (error) {
      console.error("Error generating answer:", error);
      delete abortControllersRef.current[idx]
      // Toujours retourner un tableau valide même en cas d'erreur
      return [{ type: 'text', content: `Erreur lors de la génération : ${error}`, metadata: 'markdown' }];
    }
  }

  const revealAnswer = (idx: number) => {
    setHistory(prev =>
      prev.map((qa, i) =>
        i === idx
          ? { ...qa, showAnswer: true, endTime: getCurrentTimeString() }
          : qa
      )
    )
    setLoadingIdx(null)
  }

  const proceedSubmit = async (value: string, isImage: boolean) => {
    if (isImage) {
      setHistory(prev => [
        ...prev,
        {
          question: value,
          answer: [{ type: 'image', content: 'test', metadata: 'base64' }],
          showAnswer: true,
          isImage: true,
          endTime: getCurrentTimeString()
        }
      ])
      setLoadingIdx(null)
    } else {
      // Créer l'entrée dans l'historique avec answer initialisé
      const currentIdx = history.length;
      setHistory(prev => [
        ...prev,
        {
          question: value,
          answer: [], // Toujours initialiser answer comme tableau vide
          showAnswer: false,
          isImage: false
        }
      ])
      setLoadingIdx(currentIdx)

      const answerArr = await generateAnswer(value, currentIdx)

      // S'assurer que answerArr est toujours un tableau valide
      const validAnswerArr = Array.isArray(answerArr) && answerArr.length > 0
        ? answerArr
        : [{ type: 'text', content: 'Réponse invalide ou vide', metadata: 'markdown' }];

      setHistory(prev =>
        prev.map((qa, i) =>
          i === currentIdx ? { ...qa, answer: validAnswerArr } : qa
        )
      )
      const timeout = setTimeout(() => {
        revealAnswer(currentIdx)
      }, 1000)
      timeoutsRef.current.push(timeout)
    }
  }

  const handleSubmit = async (value: string) => {
    setCurrentQuestion(value)
    const isImage = listToolsId.includes(1)
    const isAgent = listToolsId.includes(4)
    if (isAgent) {
      setShowAgentAnimation(true)
      setTimeout(async () => {
        setShowAgentAnimation(false)
        if (isThinkingMode || isImage) {
          setShowThinking(true)
          setTimeout(async () => {
            setShowThinking(false)
            await proceedSubmit(value, isImage)
          }, 800)
        } else {
          await proceedSubmit(value, isImage)
        }
      }, 1200)
    } else if (isThinkingMode || isImage) {
      setShowThinking(true)
      setTimeout(async () => {
        setShowThinking(false)
        await proceedSubmit(value, isImage)
      }, 800)
    } else {
      await proceedSubmit(value, isImage)
    }
  }

  const handleRetry = async (value: string) => {
    setCurrentQuestion(value)
    const isImage = listToolsId.includes(1)
    await proceedSubmit(value, isImage)
  }

  const handleRevealClick = (idx: number) => {
    if (history[idx]?.showAnswer) return
    setLoadingIdx(null)
    revealAnswer(idx)
  }

  const handleStopClick = (idx: number) => {
    const controller = abortControllersRef.current[idx]
    if (controller) {
      controller.abort()
      setHistory(prev =>
        prev.map((qa, i) =>
          i === idx ? {
            ...qa,
            isStopped: true,
            showAnswer: true,
            endTime: getCurrentTimeString(),
            answer: qa.answer.length > 0 ? qa.answer : [{ type: 'text', content: 'Génération interrompue', metadata: 'markdown' }]
          } : qa
        )
      )
      setLoadingIdx(null)
      delete abortControllersRef.current[idx]
    }
  }

  console.log("Current history:", history)

  return (
    <div className="flex w-full flex-col max-w-3xl p-4 justify-center items-center">
      <div className="w-full mb-4">
        {history.length > 0 && (
          <div className="flex flex-col gap-4 w-full ">
            {history.map((qa, idx) => (
              <div key={idx} className="">
                <EditableQuestion onQuestionChange={handleRetry} question={qa.question} />
                <div className='max-w-full text-left'>
                  {/* {Array.isArray(qa.answer) && qa.answer.length > 0 && qa.showAnswer ? (
                    renderContentSequentially(qa.answer)
                  ) : qa.showAnswer ? (
                    <div className="text-gray-500 italic">Aucune réponse disponible</div>
                  ) : null} */}
                  {/* {Array.isArray(qa.answer) && qa.answer.length > 0 && qa.showAnswer ? (
                    <ProgressiveContentList
                      items={qa.answer}
                      delay={800}
                      showLoadingIndicator={true}
                      onComplete={() => console.log(`Question ${idx} terminée`)}
                      className="max-w-full"
                    />
                  ) : qa.showAnswer ? (
                    <div className="text-gray-500 italic">Aucune réponse disponible</div>
                  ) : null} */}

                  {Array.isArray(qa.answer) && qa.answer.length > 0 && qa.showAnswer ? (
                    renderContentSequentially(qa.answer, 1000) // 1 seconde entre chaque élément
                  ) : qa.showAnswer ? (
                    <div className="text-gray-500 italic">Aucune réponse disponible</div>
                  ) : null}
                  <div>
                    {loadingIdx === idx && !qa.showAnswer ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></span>
                        <span>Answer in progress...</span>
                        <button
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
                          onClick={() => handleStopClick(idx)}
                        >
                          Stop
                        </button>
                      </div>
                    ) : (
                      !qa.showAnswer && (
                        <button
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => handleRevealClick(idx)}
                        >
                          Show answer
                        </button>
                      )
                    )}
                    {qa.isStopped && (
                      <div className="text-xs text-red-500 mt-1">Réponse stoppée par l'utilisateur.</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showAgentAnimation && (
        <div className="w-full mb-4">
          <AiAgentAnimation isRunning={true} duration={2000} />
        </div>
      )}

      {showThinking && (
        <div className="w-full mb-4">
          <ThinkingSearchAnimation
            minParagraphLength={230}
            className='max-w-full'
            streamingText={`The AI is thinking...`}
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
          placeholder='Ask your question to the AI!'
        />
      </div>
    </div>
  )
}

export default ChatbotIA

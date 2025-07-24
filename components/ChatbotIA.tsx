"use client"
import React, { useState, useRef, useEffect } from 'react'
import AiSearchBar from './LY UI/AI/ai-searchbar'
import EditableQuestion from './LY UI/AI/editableQuestion'
import GeneratedAnswer from './LY UI/AI/generatedAnswer'
import ThinkingSearchAnimation from './LY UI/AI/thinkingSearchAnimation'
import GeneratedImageCard from './LY UI/AI/generatedImageCard'
import car from "@/public/car.jpg";
import AiAgentAnimation from './LY UI/AI/AiAgentAnimation'
import { renderContentComponent, RenderContentItem } from './LY UI/AI/RenderContentItem';
import UnifiedContent from './LY UI/AI/UnifiedContent'

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

async function callMistralAPI(prompt: string, signal?: AbortSignal): Promise<LiaContentItem[]> {
  const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || "";
  const endpoint = "https://api.mistral.ai/v1/chat/completions";

  // Fonction utilitaire pour créer une réponse d'erreur
  const createErrorResponse = (message: string): LiaContentItem[] => {
    return [{ type: 'text', content: message, metadata: 'markdown' }];
  };

  // Fonction utilitaire pour nettoyer et parser la réponse JSON
  const parseAIResponse = (rawContent: string): LiaContentItem[] => {
    try {
      // Nettoyer la réponse en supprimant les markdown code blocks si présents
      let cleaned = rawContent.trim();
      
      // Supprimer les blocs de code markdown
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      // Détecter si l'IA a retourné le JSON sous forme de string dans un objet text
      // Chercher des patterns comme [{"type": ou {"type":
      const jsonPattern = /\[\s*\{\s*["']type["']\s*:/;
      const hasJsonContent = jsonPattern.test(cleaned);
      
      if (hasJsonContent) {
        // Extraire le JSON du contenu
        const jsonMatch = cleaned.match(/(\[[\s\S]*\])/);
        if (jsonMatch) {
          cleaned = jsonMatch[1];
        }
      }
      
      // Assurer que c'est un tableau JSON valide
      if (!cleaned.startsWith('[')) {
        cleaned = '[' + cleaned;
      }
      if (!cleaned.endsWith(']')) {
        cleaned = cleaned + ']';
      }
      
      // Fusionner les tableaux séparés s'il y en a plusieurs
      cleaned = cleaned.replace(/\]\s*\[/g, ',');
      
      // Nettoyer les template literals malformés
      cleaned = cleaned.replace(/`([^`]+)`/g, '"$1"');
      
   
      
      const parsed = JSON.parse(cleaned);
      
      // Vérifier que c'est un tableau
      if (!Array.isArray(parsed)) {
        return createErrorResponse("Réponse de l'IA mal formatée (pas un tableau)");
      }
      
      // Vérifier que chaque élément a les bonnes propriétés
      const validatedItems: LiaContentItem[] = parsed.map((item: any, index: number) => {
        if (!item || typeof item !== 'object') {
          console.error(`Item ${index} is not an object:`, item);
          return { type: 'text', content: 'Élément invalide dans la réponse', metadata: 'markdown' };
        }
        
        return {
          type: item.type || 'text',
          content: item.content || 'Contenu manquant',
          metadata: item.metadata || 'markdown'
        };
      });
      
      // S'assurer qu'il y a au moins un élément
      if (validatedItems.length === 0) {
        return createErrorResponse("Réponse vide de l'IA");
      }
      
      return validatedItems;
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content that failed to parse:", rawContent);
      
      // Essayer de détecter si c'est du JSON mal formaté dans le contenu
      const jsonPattern = /\[\s*\{\s*["']type["']\s*:/;
      if (jsonPattern.test(rawContent)) {
        // C'est probablement du JSON mal formaté, essayer de le corriger
        try {
          const jsonMatch = rawContent.match(/(\[[\s\S]*\])/);
          if (jsonMatch) {
            let fixedJson = jsonMatch[1]
              .replace(/`([^`]+)`/g, '"$1"')  // Remplacer les template literals
              .replace(/(\w+):/g, '"$1":')    // Ajouter des guillemets aux clés
              .replace(/'/g, '"');           // Remplacer simple quotes par double
            
            const parsedFixed = JSON.parse(fixedJson);
            if (Array.isArray(parsedFixed)) {
              return parsedFixed.map(item => ({
                type: item.type || 'text',
                content: item.content || 'Contenu mal formaté',
                metadata: item.metadata || 'markdown'
              }));
            }
          }
        } catch (fixError) {
          console.error("Failed to fix JSON:", fixError);
        }
      }
      
      // En cas d'erreur de parsing, créer une réponse avec le contenu brut
      return [{
        type: 'text',
        content: rawContent || "Réponse vide de l'IA",
        metadata: 'markdown'
      }];
    }
  };

  const markdownInstruction = `ATTENTION : Tu dois IMPÉRATIVEMENT répondre UNIQUEMENT avec un tableau JSON au format EXACT suivant, sans aucun texte avant ou après, ni explication, ni retour à la ligne supplémentaire :

[
  {
    "type": "code" | "text" | "image",
    "content": "...",
    "metadata": "JavaScript" // ou "markdown" si c'est du texte, ou "base64" si c'est une image
  }
]

- Ta réponse DOIT TOUJOURS être un tableau de ce type, même s'il n'y a qu'un seul élément, et NE DOIT JAMAIS être vide.
- Si c'est du texte, "type" = "text", "metadata" = "markdown" et "content" contient du markdown VALIDE.
- Si c'est une image, "type" = "image", "metadata" = "base64" et "content" contient l'image encodée en base64.
- Si c'est du code, "type" = "code", "metadata" = le langage (ex: "JavaScript"), et "content" contient le code.
- NE FOURNIS RIEN D'AUTRE que ce tableau JSON STRICTEMENT conforme, sinon ta réponse sera rejetée.`;

  const promptWithMarkdown = `${prompt}\n\n${markdownInstruction}`;

  try {
    const body = {
      model: "mistral-tiny",
      messages: [
        {
          role: "user",
          content: promptWithMarkdown,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
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
        return createErrorResponse('Erreur : Clé API Mistral manquante ou invalide.');
      }
      return createErrorResponse(`Erreur API Mistral : ${response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    
    console.log("Raw AI response:", rawContent);
    
    if (!rawContent.trim()) {
      return createErrorResponse("Réponse vide de l'IA");
    }
    
    // Première tentative : parser directement comme JSON
    try {
      const directParsed = JSON.parse(rawContent);
      if (Array.isArray(directParsed)) {
        const validatedItems = directParsed.map(item => ({
          type: item.type || 'text',
          content: item.content || 'Contenu manquant',
          metadata: item.metadata || 'markdown'
        }));
        console.log("Direct JSON parse successful:", validatedItems);
        return validatedItems;
      }
    } catch (e) {
      // Continue avec le parsing complexe
    }
    
    return parseAIResponse(rawContent);
    
  } catch (fetchError) {
    console.error("Fetch error:", fetchError);
    if (signal?.aborted) {
      return createErrorResponse("Requête annulée par l'utilisateur");
    }
    return createErrorResponse(`Erreur de connexion : ${fetchError}`);
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
      const answer = await callMistralAPI(question, controller.signal)
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
                  {Array.isArray(qa.answer) && qa.answer.length > 0 && qa.showAnswer
                    ? renderContentComponent({ items: qa.answer })
                    : qa.showAnswer && (
                        <div className="text-gray-500 italic">Aucune réponse disponible</div>
                      )
                  }
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
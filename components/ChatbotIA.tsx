import React, { useRef, useState } from "react";
import AiSearchBar from "./LY UI/AI/ai-searchbar";
import { z } from "zod";
import EditableQuestion from "./LY UI/AI/editableQuestion";
import { renderContentSequentially } from "./LY UI/AI/RenderContentItem";

type LiaContentItem = {
  type: string;
  content: any;
  metadata?: any;
};

const LiaContentItemSchema = z.object({
  type: z.string().min(1, "Le type ne peut pas être vide"),
  content: z.any(),
  metadata: z.any().optional(),
});

const LiaContentArraySchema = z
  .array(LiaContentItemSchema)
  .min(1, "La réponse doit contenir au moins un élément");

type QA = {
  question: string;
  answer: LiaContentItem[];
  showAnswer: boolean;
  isImage?: boolean;
  isAgent?: boolean;
  isThinking?: boolean;
  startTime?: string;
  endTime?: string;
  isStopped?: boolean;
  status: "pending" | "generating" | "completed" | "stopped" | "error";
};

const ChatbotIA = () => {
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [history, setHistory] = useState<QA[]>([]);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);
  const [showThinking, setShowThinking] = useState<boolean>(false);
  const [listToolsId, setListToolsId] = useState<number[]>([]);
  const [showAgentAnimation, setShowAgentAnimation] = useState<boolean>(false);

  const abortControllersRef = useRef<Record<number, AbortController>>({});

  function buildSystemInstructionForNativeJSON(
    isImage: boolean,
    isAgent: boolean,
    isThinking: boolean
  ): string {

    let instruction = `### RÈGLE ABSOLUE - NE JAMAIS VIOLER ###
[VOTRE RÉPONSE DOIT ÊTRE UN TABLEAU JSON PUR SANS AUCUN CARACTÈRE AVANT/APRÈS.
TOUTE DÉVIATION RENDRA LA RÉPONSE INUTILISABLE. CONFIRMEZ INTERIEUREMENT "OK_JSON".]

## FORMAT OBLIGATOIRE - COPIEZ EXACTEMENT ##
[
  {
    "type": "text|code|image",
    "content": "contenu ici",
    "metadata": "markdown|langage|url"
  }
]

### DIRECTIVES NON-NÉGOCIABLES ###
1. [ TOUJOURS ] COMMENCER DIRECTEMENT PAR [
2. [ TOUJOURS ] TERMINER PAR ]
3. Types VALIDES UNIQUEMENT : "text", "code", "image"
4. Pour "text" : metadata = "markdown" [ SANS EXCEPTION ]
5. Pour "code" : metadata = langage ("javascript", "python", ...)
6. Pour "image" : metadata = "url" [ OBLIGATOIRE ]
7. Échappement DES GUILLEMETS : \\" [ JAMAIS " ]
8. [ TOUJOURS ] UTILISER UN TABLEAU MÊME POUR 1 ÉLÉMENT
9. [ INTERDICTION TOTALE ] DE TEXTE AVANT/AFTRÈS
10. [ PRIORITÉ ABSOLUE ] : FORMER UN JSON VALIDE
11. EN CAS D'ÉCHEC : [ TOUJOURS ] RETOURNER [ ] (tableau vide)
12. [ TOUJOURS ] TIENT COMPTE DES RÈGLES PRÉCÉDENTES
13. [ TOUJOURS ] TIENT COMPTE DES RÈGLES PRÉCÉDENTES
14. [TOUJOURS] POUR TOUTES DEMANDES TRADUIT D'ABORD ANGLAIS AVANT DE FAIRE LA RECHERCHE PUIS TU RETOURNE EN LA LANGUE DU CLIENT
15. [ TOUJOURS ] TU DOIS TOUJOURS EXPLIQUER CE QUE TU FAIS ET POURQUOI TU FAIS CA
16. [TOUJOURS] TIENT COMPTE DU NOMBRE DE TEXTE QUE TU PEUX GENERER A L'AVANCE POUR EVITER L'ERREUR DE TOKEN ET DES REPONSE NON TERMINE
17. [TOUJOURS] TIENT COMPTE DU NOMBRE DE TEXTE QUE TU PEUX GENERER A L'AVANCE POUR EVITER L'ERREUR DE TOKEN ET DES REPONSE NON TERMINE
18. [TOUJOURS] TIENT COMPTE DU NOMBRE DE TEXTE QUE TU PEUX GENERER A L'AVANCE POUR EVITER L'ERREUR DE TOKEN ET DES REPONSE NON TERMINE DANS LE CAS DES IMAGES EN URL
19. [TOUJOURS] PREND DES IMAGES LIBRES DE DROIT ET VRAIMENT EXISTANTES ET NE PREND PAS DES IMAGES CHEZ placekitten et des sites inaccessibles
20. [TOUJOURS] POUR LES IMAGES GENERE DES IMAGES AVEC LES LIENS PRESENTS EN LIGNES
21. [TOUJOURS] PREND DES IMAGES SUR LES SITES RECENTS (5 DERNIERES ANNEES)
22. [TOUJOURS] TA SOURCE PRINCIPALE POUR LES IMAGES C EST LE SITE D IMAGE unsplash.com , pexels.com , pixabay.com
23. [ TOUJOURS ] TIENT COMPTE DES RÈGLES PRÉCÉDENTES

### SANCTIONS ###
VIOLATION = ERREUR CRITIQUE + ARRÊT IMMÉDIAT DU PROCESSUS`;

    // Ajout des modes
    if (isImage) {
      instruction += `\n\n### 🎨 MODE IMAGE (RÈGLES RENFORCÉES) ###
- [ TOUJOURS ] Utiliser type: "image" ET metadata: "url"
- [ INTERDIT ] Tout autre format pour les images`;
      - "[TOUJOURS] TIENT COMPTE DU NOMBRE DE TEXTE QUE TU PEUX GENERER A L AVANCE POUR EVITER L'ERREUR DE TOKEN ET DES REPONSE NON TERMINE "
    }

    if (isAgent) {
      instruction += `\n\n### 🤖 MODE AGENT (CONTRAINTES STRICTES) ###
- [ OBLIGATOIRE ] Raisonnement en 3 étapes minimum
- [ AUTORISÉ ] Multiples éléments MAIS [ INTERDIT ] texte hors JSON`;
    }

    if (isThinking) {
      instruction += `\n\n### � MODE RÉFLEXION (DANS LE JSON UNIQUEMENT) ###
- [ TOUJOURS ] Afficher les étapes dans content (type:"text")
- [ INTERDIT ] Explications hors structure JSON`;
    }

    instruction += `\n\n### EXEMPLES VALIDES (COPIEZ LA STRUCTURE) ###

✅ Correct (simple):
[{"type":"text","content":"Bonjour","metadata":"markdown"}]

✅ Correct (complexe):
[
  {"type":"text","content":"**Explication**:","metadata":"markdown"},
  {"type":"code","content":"function() {}", "metadata":"javascript"},
  {"type":"image","content":"iVBOR...","metadata":"url"}
]

❌ INTERDIT (sanctionné):
"Voici votre réponse :" [ ... ]
{
  "réponse": [ ... ]
}
/* Commentaire */ [ ... ]
`;

    return instruction;
  }


  async function callTogetherMistralAPI(
    prompt: string,
    options: {
      isImage?: boolean;
      isAgent?: boolean;
      isThinking?: boolean;
      signal?: AbortSignal;
    } = {}
  ): Promise<LiaContentItem[]> {
    const {
      isImage = false,
      isAgent = false,
      isThinking = false,
      signal,
    } = options;

    const apiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY || "";
    const endpoint = "https://api.together.xyz/v1/chat/completions";

    const systemInstruction = buildSystemInstructionForNativeJSON(
      isImage,
      isAgent,
      isThinking
    );
    const enhancedPrompt = `${prompt}\n\n${systemInstruction}`;

    try {
      const body = {
        // model: "moonshotai/Kimi-K2-Instruct",
        model: "deepseek-ai/DeepSeek-V3",
        // model: "meta-llama/Llama-3.3-70B-Instcruct-Turbo-Free",
        messages: [
          {
            role: "system",
            content:
              `Tu es un assistant expert qui répond au format Tableau  [  { "type": "text|code|image",  "content": "votre contenu ici",
        "metadata": "markdown|javascript|python|url|..."
      }
    ] `,
          },
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        // temperature: isThinking ? 0.1 : 0.3,
        // max_tokens: isAgent ? 2048 : 1024,
        // top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: {
          type: "json_object",
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: signal,
      });



      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Clé API Together manquante ou invalide.");
        }
        throw new Error(`Erreur API Together : ${response.statusText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || ""?.trim();


      if (!rawContent.trim()) {
        throw new Error("Réponse vide de l'IA");
      }
      console.log(rawContent, "rawContent")
      return rawContent

    } catch (error) {
      console.error("Error calling Together API:", error);
      throw error;
    }
  }

  const generateAnswer = async (
    question: string,
    idx: number,
    options: {
      isImage?: boolean;
      isAgent?: boolean;
      isThinking?: boolean;
    } = {}
  ): Promise<LiaContentItem[]> => {
    try {
      const controller = new AbortController();
      abortControllersRef.current[idx] = controller;

      setHistory((prev) =>
        prev.map((qa, i) => (i === idx ? { ...qa, status: "generating" } : qa))
      );
      console.log(controller.signal, "controller.signal")
      const answer = await callTogetherMistralAPI(question, {
        ...options,
        signal: controller.signal,
      });


      const answerArr: LiaContentItem[] = JSON.parse(answer as unknown as string) as LiaContentItem[];


      const validationResult = LiaContentArraySchema.safeParse(answerArr);

      delete abortControllersRef.current[idx];
      console.log(validationResult.data, "validationResult");

      setLoadingIdx(null);
      return validationResult.data as LiaContentItem[];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error generating answer:", errorMsg);
      delete abortControllersRef.current[idx];

      setHistory((prev) =>
        prev.map((qa, i) => (i === idx ? { ...qa, status: "error" } : qa))
      );
      setLoadingIdx(null);
      return [
        { type: "text", content: "hello", metadata: "markdown" },
      ] as LiaContentItem[];
    }
  };

  function getCurrentTimeString(): string {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }



  const proceedSubmit = async (
    value: string,
    toolsConfig: {
      isImage: boolean;
      isAgent: boolean;
      isThinking: boolean;
    }
  ) => {
    const { isImage, isAgent, isThinking } = toolsConfig;

    const currentIdx = history.length;

    const startTime = getCurrentTimeString();

    if (isImage) {
      setHistory((prev) => [
        ...prev,
        {
          question: value,
          answer: [
            {
              type: "image",
              content: "Image générée (simulation)",
              metadata: "url",
            },
          ],
          showAnswer: true,
          isImage: true,
          isAgent,
          isThinking,
          startTime,
          endTime: getCurrentTimeString(),
          status: "completed",
        },
      ]);
      setLoadingIdx(null);
    } else {
      setHistory((prev) => [
        ...prev,
        {
          question: value,
          answer: [],
          showAnswer: false,
          isImage,
          isAgent,
          isThinking,
          startTime,
          status: "pending",
        },
      ]);
      setLoadingIdx(currentIdx);

      const answerArr = await generateAnswer(value, currentIdx, {
        isImage,
        isAgent,
        isThinking,
      });

      setHistory((prev) =>
        prev.map((qa, i) =>
          i === currentIdx
            ? {
              ...qa,
              answer: answerArr,
              showAnswer: true,
              endTime: getCurrentTimeString(),
              status: "completed",
            }
            : qa
        )
      );
    }
  };

  console.log(history, "history");

  const handleSubmit = async (value: string) => {
    const isImage = listToolsId.includes(1);
    const isAgent = listToolsId.includes(4);
    const isThinking = isThinkingMode;
    const toolsConfig = { isImage, isAgent, isThinking };

    if (isAgent) {
      setShowAgentAnimation(true);
      setTimeout(async () => {
        setShowAgentAnimation(false);
        if (isThinking || isImage) {
          setShowThinking(true);
          setTimeout(async () => {
            setShowThinking(false);
            await proceedSubmit(value, toolsConfig);
          }, 800);
        } else {
          await proceedSubmit(value, toolsConfig);
        }
      }, 1200);
    } else if (isThinking || isImage) {
      setShowThinking(true);
      setTimeout(async () => {
        setShowThinking(false);
        await proceedSubmit(value, toolsConfig);
      }, 800);
    } else {
      await proceedSubmit(value, toolsConfig);
    }
  };

  return (
    <div className="px-4 max-w-3xl space-y-4 mt-4 w-full">
      {history.map((qa, idx) => {
        return (
          <div key={idx} className="">
            <EditableQuestion question={qa.question} />
            {Array.isArray(qa.answer) &&
              qa.answer.length > 0 &&
              qa.showAnswer ? (
              renderContentSequentially(qa.answer, { useSafeMode: true })
            ) : qa.showAnswer ? (
              <div className="text-gray-500 italic">
                Aucune réponse disponible
              </div>
            ) : null}
          </div>
        );
      })}

      <AiSearchBar
        className="mb-3 "
        onToolsChange={setListToolsId}
        onThinkModeChange={setIsThinkingMode}
        submitLoaderComponent={
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></span>
        }
        submitLoading={
          loadingIdx !== null || showThinking || showAgentAnimation
        }
        onSubmit={handleSubmit}
        variant="default"
        placeholder={"Posez votre question à l'IA!"}
      />
    </div>
  );
};

export default ChatbotIA;

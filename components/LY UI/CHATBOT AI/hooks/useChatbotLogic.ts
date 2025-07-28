import { useState, useCallback } from "react";

import { useAnswerGeneration } from "./useAnswerGeneration";
import { useAnimationControl } from "./useAnimationControl";
import { useAbortController } from "./useAbortController";
import { useTimeUtils } from "./useTimeUtils";
import { QA, ToolsConfig } from "../utils";

export const useChatbotLogic = () => {
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [history, setHistory] = useState<QA[]>([]);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);
  const [listToolsId, setListToolsId] = useState<number[]>([]);

  const { generateAnswer } = useAnswerGeneration(setHistory, setLoadingIdx);
  const {
    showThinking,
    setShowThinking,
    showAgentAnimation,
    setShowAgentAnimation,
    clearTimeouts,
  } = useAnimationControl();
  const { abortAllControllers } = useAbortController();
  const { getCurrentTimeString } = useTimeUtils();

  const proceedSubmit = useCallback(async (
    value: string,
    toolsConfig: ToolsConfig
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
          status: "generated",
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
          isStopped: false,
        },
      ]);
      setLoadingIdx(currentIdx);

      try {
        const answerArr = await generateAnswer(value, currentIdx, {
          isImage,
          isAgent,
          isThinking,
        });

        // Additional logic handled in generateAnswer
      } catch (error) {
        console.log("Erreur dans proceedSubmit:", error);
      }
    }
  }, [history, generateAnswer, getCurrentTimeString, setHistory, setLoadingIdx]);

  const handleSubmit = useCallback(async (value: string) => {
    const isImage = listToolsId.includes(1);
    const isAgent = listToolsId.includes(4);
    const isThinking = isThinkingMode;
    const toolsConfig = { isImage, isAgent, isThinking };

    if (isAgent) {
      setShowAgentAnimation(true);
      const agentTimeout = setTimeout(async () => {
        setShowAgentAnimation(false);
        if (isThinking || isImage) {
          setShowThinking(true);
          const thinkingTimeout = setTimeout(async () => {
            setShowThinking(false);
            await proceedSubmit(value, toolsConfig);
          }, 800);
          (window as any).thinkingTimeout = thinkingTimeout;
        } else {
          await proceedSubmit(value, toolsConfig);
        }
      }, 1200);
      (window as any).agentTimeout = agentTimeout;
    } else if (isThinking || isImage) {
      setShowThinking(true);
      const thinkingTimeout = setTimeout(async () => {
        setShowThinking(false);
        await proceedSubmit(value, toolsConfig);
      }, 800);
      (window as any).thinkingTimeout = thinkingTimeout;
    } else {
      await proceedSubmit(value, toolsConfig);
    }
  }, [listToolsId, isThinkingMode, proceedSubmit, setShowAgentAnimation, setShowThinking]);

  const handleStop = useCallback(() => {
    console.log("🛑 STOP CLICKED - Starting handleStop");

    abortAllControllers();
    clearTimeouts();

    setLoadingIdx(null);
    setShowThinking(false);
    setShowAgentAnimation(false);

    setHistory((prev) => {
      return prev.map((qa) => {
        if (qa.status === "pending" || qa.status === "generating") {
          console.log(`🛑 Stopping item with status: ${qa.status} -> stopped`);
          return {
            ...qa,
            status: "stopped" as const,
            showAnswer: true,
            endTime: getCurrentTimeString(),
          };
        }
        return qa;
      });
    });

    console.log("🛑 handleStop completed");
  }, [abortAllControllers, clearTimeouts, getCurrentTimeString, setLoadingIdx, setShowThinking, setShowAgentAnimation, setHistory]);

  return {
    currentQuestion,
    setCurrentQuestion,
    history,
    setHistory,
    loadingIdx,
    setLoadingIdx,
    isThinkingMode,
    setIsThinkingMode,
    listToolsId,
    setListToolsId,
    showThinking,
    showAgentAnimation,
    handleSubmit,
    handleStop,
  };
};

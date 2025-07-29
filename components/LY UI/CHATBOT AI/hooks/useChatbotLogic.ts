import { useState, useCallback } from "react";
import { useAnswerGeneration } from "./useAnswerGeneration";
import { useAnimationControl } from "./useAnimationControl";
import { useAbortController } from "./useAbortController";
import { useTimeUtils } from "./useTimeUtils";
import { AnimationExecutor, QA, ToolsConfig } from "../utils";

interface ChatState {
  currentQuestion: string;
  history: QA[];
  loadingIdx: number | null;
  isThinkingMode: boolean;
  listToolsId: number[];
}

interface AnimationConfig {
  showAgent: boolean;
  showThinking: boolean;
  agentDuration: number;
  thinkingDuration: number;
}

const TOOL_CONFIG = {
  TOOLS: {
    IMAGE: 1,
    AGENT: 4,
  },
  ANIMATIONS: {
    AGENT_DURATION: 1200,
    THINKING_DURATION: 800,
  },
  STATUSES: {
    PENDING: "pending" as const,
    GENERATING: "generating" as const,
    GENERATED: "generated" as const,
    STOPPED: "stopped" as const,
  },
} as const;

const createToolsConfig = (toolIds: number[], isThinkingMode: boolean): ToolsConfig => ({
  isImage: toolIds.includes(TOOL_CONFIG.TOOLS.IMAGE),
  isAgent: toolIds.includes(TOOL_CONFIG.TOOLS.AGENT),
  isThinking: isThinkingMode,
});

const createAnimationConfig = (toolsConfig: ToolsConfig): AnimationConfig => ({
  showAgent: toolsConfig.isAgent,
  showThinking: toolsConfig.isThinking || toolsConfig.isImage,
  agentDuration: TOOL_CONFIG.ANIMATIONS.AGENT_DURATION,
  thinkingDuration: TOOL_CONFIG.ANIMATIONS.THINKING_DURATION,
});

const createImageEntry = (
  question: string,
  toolsConfig: ToolsConfig,
  startTime: string,
  endTime: string
): QA => ({
  question,
  answer: [{
    type: "image",
    content: "Image générée (simulation)",
    metadata: "url",
  }],
  showAnswer: true,
  isImage: true,
  isAgent: toolsConfig.isAgent,
  isThinking: toolsConfig.isThinking,
  startTime,
  endTime,
  status: TOOL_CONFIG.STATUSES.GENERATED,
});

const createPendingEntry = (
  question: string,
  toolsConfig: ToolsConfig,
  startTime: string
): QA => ({
  question,
  answer: [],
  showAnswer: false,
  isImage: toolsConfig.isImage,
  isAgent: toolsConfig.isAgent,
  isThinking: toolsConfig.isThinking,
  startTime,
  status: TOOL_CONFIG.STATUSES.PENDING,
  isStopped: false,
});

const addEntryToHistory = (history: QA[], entry: QA): QA[] => [...history, entry];

const updateHistoryStatus = (
  history: QA[],
  newStatus: QA['status'],
  endTime: string
): QA[] =>
  history.map(qa => {
    const isPending = qa.status === TOOL_CONFIG.STATUSES.PENDING ||
      qa.status === TOOL_CONFIG.STATUSES.GENERATING;

    return isPending ? {
      ...qa,
      status: newStatus,
      showAnswer: true,
      endTime,
    } : qa;
  });

const executeAgentAnimation: AnimationExecutor = (animationControl, onComplete) => {
  animationControl.setShowAgentAnimation(true);

  // Don't set a timeout - let the animation run until the request completes
  // The animation will be stopped when the request finishes
  onComplete().finally(() => {
    animationControl.setShowAgentAnimation(false);
  });
};

const executeThinkingAnimation: AnimationExecutor = (animationControl, onComplete) => {
  animationControl.setShowThinking(true);

  const timeout = setTimeout(async () => {
    animationControl.setShowThinking(false);
    await onComplete();
  }, TOOL_CONFIG.ANIMATIONS.THINKING_DURATION);

  (window as any).thinkingTimeout = timeout;
};

const executeSequentialAnimation: AnimationExecutor = (animationControl, onComplete) => {
  executeAgentAnimation(animationControl, async () => {
    executeThinkingAnimation(animationControl, onComplete);
  });
};

const getAnimationExecutor = (config: AnimationConfig): AnimationExecutor | null => {
  if (config.showAgent && config.showThinking) {
    return executeSequentialAnimation;
  } else if (config.showAgent) {
    return executeAgentAnimation;
  } else if (config.showThinking) {
    return executeThinkingAnimation;
  }

  return null;
};

const useChatState = () => {
  const [state, setState] = useState<ChatState>({
    currentQuestion: "",
    history: [],
    loadingIdx: null,
    isThinkingMode: false,
    listToolsId: [],
  });

  const updateState = useCallback(<K extends keyof ChatState>(
    key: K,
    value: ChatState[K] | ((prev: ChatState[K]) => ChatState[K])
  ) => {
    setState(prev => ({
      ...prev,
      [key]: typeof value === 'function' ? (value as Function)(prev[key]) : value,
    }));
  }, []);

  return { state, setState, updateState };
};

const useSubmissionHandlers = (
  state: ChatState,
  setState: React.Dispatch<React.SetStateAction<ChatState>>,
  generateAnswer: ReturnType<typeof useAnswerGeneration>['generateAnswer'],
  getCurrentTimeString: () => string
) => {
  const handleImageSubmission = useCallback((
    question: string,
    toolsConfig: ToolsConfig
  ) => {
    const startTime = getCurrentTimeString();
    const endTime = getCurrentTimeString();
    const imageEntry = createImageEntry(question, toolsConfig, startTime, endTime);

    setState(prev => ({
      ...prev,
      history: addEntryToHistory(prev.history, imageEntry),
      loadingIdx: null,
    }));
  }, [getCurrentTimeString, setState]);

  const handleTextSubmission = useCallback(async (
    question: string,
    toolsConfig: ToolsConfig
  ) => {
    const currentIdx = state.history.length;
    const startTime = getCurrentTimeString();
    const pendingEntry = createPendingEntry(question, toolsConfig, startTime);

    setState(prev => ({
      ...prev,
      history: addEntryToHistory(prev.history, pendingEntry),
      loadingIdx: currentIdx,
    }));

    try {
      await generateAnswer(question, currentIdx, toolsConfig);
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      const endTime = getCurrentTimeString();
      setState(prev => ({
        ...prev,
        history: updateHistoryStatus(prev.history, TOOL_CONFIG.STATUSES.STOPPED, endTime),
      }));
    }
  }, [state.history.length, getCurrentTimeString, generateAnswer, setState]);

  const executeSubmission = useCallback(async (
    question: string,
    toolsConfig: ToolsConfig
  ) => {
    if (toolsConfig.isImage) {
      handleImageSubmission(question, toolsConfig);
    } else {
      await handleTextSubmission(question, toolsConfig);
    }
  }, [handleImageSubmission, handleTextSubmission]);

  return { executeSubmission };
};

export const useChatbotLogic = () => {
  // Centralized state with custom hook
  const { state, setState, updateState } = useChatState();

  // Dependency Inversion: depends on abstractions (hooks)
  const animationControl = useAnimationControl();
  const { abortAllControllers } = useAbortController();
  const { getCurrentTimeString } = useTimeUtils();

  // --- FIX: Provide correct updater for useAnswerGeneration ---

  // Instead of passing a function that takes (updateFn: (prev: QA[]) => QA[]),
  // we pass a function that matches Dispatch<SetStateAction<QA[]>>.
  // This means: (value: QA[] | ((prev: QA[]) => QA[])) => void

  // We'll use setState to update only the history property.
  const historyUpdater = useCallback(
    (value: QA[] | ((prev: QA[]) => QA[])) => {
      setState(prev => ({
        ...prev,
        history: typeof value === "function" ? (value as (prev: QA[]) => QA[])(prev.history) : value,
      }));
    },
    [setState]
  );

  const loadingUpdater = useCallback(
    (value: number | null | ((prev: number | null) => number | null)) => {
      setState(prev => ({ 
        ...prev, 
        loadingIdx: typeof value === 'function' ? value(prev.loadingIdx) : value 
      }));
    },
    [setState]
  );

  const { generateAnswer } = useAnswerGeneration(historyUpdater, loadingUpdater);

  // Submission handlers with custom hook
  const { executeSubmission } = useSubmissionHandlers(
    state,
    setState,
    generateAnswer,
    getCurrentTimeString
  );

  const executeWithAnimation = useCallback(async (
    question: string,
    toolsConfig: ToolsConfig
  ) => {
    const animationConfig = createAnimationConfig(toolsConfig);
    const animationExecutor = getAnimationExecutor(animationConfig);

    const submitAction = () => executeSubmission(question, toolsConfig);

    if (animationExecutor) {
      animationExecutor(animationControl, submitAction);
    } else {
      await submitAction();
    }
  }, [executeSubmission, animationControl]);

  const handleSubmit = useCallback(async (value: string) => {
    const toolsConfig = createToolsConfig(state.listToolsId, state.isThinkingMode);
    await executeWithAnimation(value, toolsConfig);
  }, [state.listToolsId, state.isThinkingMode, executeWithAnimation]);

  const handleStop = useCallback(() => {
    console.log("🛑 Arrêt en cours...");

    // Clean up resources
    abortAllControllers();
    animationControl.clearTimeouts();

    // Reset animations
    animationControl.setShowThinking(false);
    animationControl.setShowAgentAnimation(false);

    // Update state
    const endTime = getCurrentTimeString();
    setState(prev => ({
      ...prev,
      loadingIdx: null,
      history: updateHistoryStatus(prev.history, TOOL_CONFIG.STATUSES.STOPPED, endTime),
    }));

    console.log("🛑 Arrêt terminé");
  }, [abortAllControllers, animationControl, getCurrentTimeString, setState]);

  const currentQuestion = state.currentQuestion;
  const history = state.history;
  const loadingIdx = state.loadingIdx;
  const isThinkingMode = state.isThinkingMode;
  const listToolsId = state.listToolsId;
  const showThinking = animationControl.showThinking;
  const showAgentAnimation = animationControl.showAgentAnimation;

  const setCurrentQuestion = useCallback(
    (value: string) => updateState('currentQuestion', value),
    [updateState]
  );

  const setHistory = useCallback(
    (value: QA[] | ((prev: QA[]) => QA[])) => updateState('history', value),
    [updateState]
  );

  const setLoadingIdx = useCallback(
    (value: number | null) => updateState('loadingIdx', value),
    [updateState]
  );

  const setIsThinkingMode = useCallback(
    (value: boolean) => updateState('isThinkingMode', value),
    [updateState]
  );

  const setListToolsId = useCallback(
    (value: number[]) => updateState('listToolsId', value),
    [updateState]
  );

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
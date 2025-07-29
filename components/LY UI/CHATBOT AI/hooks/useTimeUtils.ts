import { useCallback } from "react";

export const useTimeUtils = () => {
  const getCurrentTimeString = useCallback((): string => {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  return { getCurrentTimeString };
};



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

interface ChatActions {
  handleSubmit: (value: string) => Promise<void>;
  handleStop: () => void;
  setCurrentQuestion: (value: string) => void;
  setHistory: (value: QA[] | ((prev: QA[]) => QA[])) => void;
  setLoadingIdx: (value: number | null) => void;
  setIsThinkingMode: (value: boolean) => void;
  setListToolsId: (value: number[]) => void;
}

interface ChatComputedValues {
  isLoading: boolean;
  hasHistory: boolean;
  currentToolsConfig: ToolsConfig;
}

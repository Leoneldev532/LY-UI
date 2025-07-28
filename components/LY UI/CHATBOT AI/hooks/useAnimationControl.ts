import { useState, useCallback } from "react";

export const useAnimationControl = () => {
  const [showThinking, setShowThinking] = useState<boolean>(false);
  const [showAgentAnimation, setShowAgentAnimation] = useState<boolean>(false);

  const clearTimeouts = useCallback(() => {
    if ((window as any).agentTimeout) {
      clearTimeout((window as any).agentTimeout);
      (window as any).agentTimeout = null;
    }
    if ((window as any).thinkingTimeout) {
      clearTimeout((window as any).thinkingTimeout);
      (window as any).thinkingTimeout = null;
    }
  }, []);

  return {
    showThinking,
    setShowThinking,
    showAgentAnimation,
    setShowAgentAnimation,
    clearTimeouts,
  };
};
import { useCallback } from "react";
import { QA, ToolsConfig } from "../utils";

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




// ------------------------- //
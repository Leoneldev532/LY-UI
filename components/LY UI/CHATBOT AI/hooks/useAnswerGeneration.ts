import { useCallback } from "react";

import { useApiCall } from "./useApiCall";
import { useAbortController } from "./useAbortController";
import { useTimeUtils } from "./useTimeUtils";
import { LiaContentArraySchema, LiaContentItem, QA, ToolsConfig } from "../utils";

export const useAnswerGeneration = (
  setHistory: React.Dispatch<React.SetStateAction<QA[]>>,
  setLoadingIdx: React.Dispatch<React.SetStateAction<number | null>>
) => {
  const { callTogetherMistralAPI } = useApiCall();
  const { createController, abortController, hasController } = useAbortController();
  const { getCurrentTimeString } = useTimeUtils();

  const generateAnswer = useCallback(
    async (
      question: string,
      idx: number,
      options: ToolsConfig = { isImage: false, isAgent: false, isThinking: false }
    ): Promise<LiaContentItem[]> => {
      try {
        const controller = createController(idx);

        setHistory((prev: QA[]) =>
          prev.map((qa, i) => (i === idx ? { ...qa, status: "generating" } : qa))
        );

        const answer = await callTogetherMistralAPI(question, {
          ...options,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          throw new Error("Request was aborted");
        }

        const answerArr: LiaContentItem[] = JSON.parse(
          answer as unknown as string
        ) as LiaContentItem[];
        const validationResult = LiaContentArraySchema.safeParse(answerArr);

        abortController(idx);
        setLoadingIdx(() => null);

        setHistory((prev: QA[]) =>
          prev.map((qa, i) =>
            i === idx
              ? {
                  ...qa,
                  answer: validationResult.data as LiaContentItem[],
                  status: "generated",
                  showAnswer: true,
                  endTime: getCurrentTimeString(),
                }
              : qa
          )
        );

        return validationResult.data as LiaContentItem[];
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        abortController(idx);

        if (errorMsg.includes("aborted") || errorMsg.includes("AbortError")) {
          console.log(
            `🔄 generateAnswer caught abort for idx ${idx} - State already handled by handleStop`
          );
        } else {
          console.log(
            `❌ generateAnswer caught error for idx ${idx}: ${errorMsg}`
          );
          setHistory((prev: QA[]) =>
            prev.map((qa, i) =>
              i === idx
                ? {
                    ...qa,
                    status: "error",
                    showAnswer: true,
                    endTime: getCurrentTimeString(),
                  }
                : qa
            )
          );
        }

        setLoadingIdx(() => null);
        return [];
      }
    },
    [
      callTogetherMistralAPI,
      createController,
      abortController,
      setHistory,
      setLoadingIdx,
      getCurrentTimeString,
    ]
  );

  return { generateAnswer };
};

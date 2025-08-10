// File: hooks/useApiCall.ts
import { useCallback } from "react";
import { LiaContentItem, ToolsConfig } from "../utils";
import { useSystemInstruction } from "./useSystemInstruction";

export const useApiCall = () => {
  const { buildSystemInstructionForNativeJSON } = useSystemInstruction();

  const callTogetherMistralAPI = useCallback(
    async (
      prompt: string,
      options: ToolsConfig & { signal?: AbortSignal } = {
        isImage: false,
        isAgent: false,
        isThinking: false,
      }
    ): Promise<LiaContentItem[]> => {
      const { isImage = false, isAgent = false, isThinking = false, signal } = options;

      const systemInstruction = buildSystemInstructionForNativeJSON(
        isImage,
        isAgent,
        isThinking
      );

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            options: { isImage, isAgent, isThinking },
          }),
          signal,
        });


        if (!response.ok) {
          throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        const rawContent = data?.content?.choices?.[0]?.message?.content || ""?.trim()
        ;

        if (!rawContent) {
          throw new Error("No content received from API");
        }

        return rawContent;
      } catch (error) {
        console.error("Error calling API:", error);
        throw error;
      }
    },
    [buildSystemInstructionForNativeJSON]
  );


  return { callTogetherMistralAPI };
};

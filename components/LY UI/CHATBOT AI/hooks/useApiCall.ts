import { useCallback } from "react";

import { LiaContentItem, ToolsConfig } from "../utils";
import { useSystemInstruction } from "./useSystemInstruction";

export const useApiCall = () => {
  const { buildSystemInstructionForNativeJSON } = useSystemInstruction();

  const callTogetherMistralAPI = useCallback(async (
    prompt: string,
    options: ToolsConfig & { signal?: AbortSignal } = { isImage: false, isAgent: false, isThinking: false }
  ): Promise<LiaContentItem[]> => {
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
      if (signal?.aborted) {
        throw new Error("Request was aborted");
      }

      const body = {
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          {
            role: "system",
            content: `You are an expert assistant who answers in the array format [  { "type": "text|code|image",  "content": "your content here",
        "metadata": "markdown|javascript|python|url|..."
      }
    ] `,
          },
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
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

      if (signal?.aborted) {
        throw new Error("Request was aborted");
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Missing or invalid Together API key.");
        }
        throw new Error(`Together API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || ""?.trim();

      if (!rawContent.trim()) {
        throw new Error("Empty response from AI");
      }

      return rawContent;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.message.includes("aborted"))
      ) {
        throw new Error("Request was aborted");
      }
      console.error("Error calling Together API:", error);
      throw error;
    }
  }, [buildSystemInstructionForNativeJSON]);

  return { callTogetherMistralAPI };
};
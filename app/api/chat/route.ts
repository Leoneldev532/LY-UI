// File: app/api/chat/route.ts
import { useSystemInstructionb } from "@/components/LY UI/CHATBOT AI/hooks/useSystemInstruction";
import { NextResponse } from "next/server";


const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V3";
const API_URL = "https://api.together.xyz/v1/chat/completions";

export async function POST(request: Request) {
  // Handle CORS - these headers should be set via middleware instead
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { prompt, options = {} } = await request.json();

    // Validate request body
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400, headers }
      );
    }

    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error("API configuration error: TOGETHER_API_KEY not set");
    }

    const { buildSystemInstructionForNativeJSON } = useSystemInstructionb();
    const systemInstruction = buildSystemInstructionForNativeJSON(
      options.isImage || false,
      options.isAgent || false,
      options.isThinking || false
    );

    // Prepare API request
    const requestBody = {
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
      frequency_penalty: 0,
      presence_penalty: 0,
      ...(options.apiParams || {}),
    };

    // Configure abort controller for timeout
    const controller = new AbortController();

    // Execute API call
    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });


    // Handle API errors
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => null);
      const statusCode = apiResponse.status;
      let errorMessage = `API request failed (${statusCode})`;
      if (errorData?.error?.message) {
        errorMessage += `: ${errorData.error.message}`;
      }
      return NextResponse.json(
        {
          error: errorMessage,
          ...(process.env.NODE_ENV === "development" && { details: errorData }),
        },
        { status: statusCode, headers }
      );
    }

    // Process successful response
    const responseData = await apiResponse.json();
   
    if (!responseData) {
      throw new Error("Received empty response from AI");
    }


    // Return formatted response
    return NextResponse.json(
      {
        content: responseData,
        usage: responseData.usage,
        model: responseData.model,
        finish_reason: responseData.choices?.[0]?.finish_reason,
      },
      { headers }
    );
  } catch (error) {
    console.error("API processing error:", error);
    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === "AbortError") {
        statusCode = 504;
        errorMessage = "Request timeout";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: statusCode, headers }
    );
  }
}

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(null, { headers });
}
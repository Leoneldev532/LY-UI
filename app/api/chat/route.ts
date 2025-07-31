// File: app/api/chat/route.ts
import { useSystemInstructionb } from "@/components/LY UI/CHATBOT AI/hooks/useSystemInstruction";
import { NextResponse } from "next/server";

// Configuration pour Vercel/Next.js - supprime les timeouts
export const maxDuration = 300; // 5 minutes maximum pour Vercel Pro
export const dynamic = 'force-dynamic';

const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V3";
const API_URL = "https://api.together.xyz/v1/chat/completions";

export async function POST(request: Request) {
  // Handle CORS - ces headers devraient être définis via middleware
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { prompt, options = {} } = await request.json();

    // Valider le body de la requête
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

    // Préparer la requête API
    const requestBody = {
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: options.maxTokens || 4000, // Permet de personnaliser
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: options.stream || false, // Support du streaming pour les longues réponses
      ...(options.apiParams || {}),
    };

    // SUPPRIMÉ: AbortController et timeout
    // Pas de limitation de durée côté client

    // Exécuter l'appel API sans timeout
    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
      // SUPPRIMÉ: signal: controller.signal
    });

    // Gérer les erreurs API
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

    // Traiter la réponse réussie
    const responseData = await apiResponse.json();
   
    if (!responseData) {
      throw new Error("Received empty response from AI");
    }

    // Retourner la réponse formatée
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
      // SUPPRIMÉ: Gestion de AbortError
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

// Gérer la méthode OPTIONS pour CORS preflight
export async function OPTIONS() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(null, { headers });
}
export interface GenerationResult {
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// Imagen 3 — stable image generation model, uses :predict endpoint
const IMAGE_MODEL = "imagen-3.0-generate-002";

interface ImagenResponse {
  predictions?: Array<{
    bytesBase64Encoded?: string;
    mimeType?: string;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Generates an image using the Imagen 3 REST API (:predict endpoint).
 * Uses X-goog-api-key header auth; reads GEMINI_API_KEY from environment.
 * Model: imagen-3.0-generate-002
 */
export async function generateWithGemini(
  prompt: string
): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "GEMINI_API_KEY environment variable is not set." };
  }

  const url = `${GEMINI_BASE_URL}/${IMAGE_MODEL}:predict`;

  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "3:4", // portrait — closest to 8.5x11
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const json = (await response.json()) as ImagenResponse;

    if (!response.ok || json.error) {
      const msg = json.error?.message ?? `HTTP ${response.status}`;
      return { error: `Gemini API error: ${msg}` };
    }

    const prediction = json.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
      return { error: "Imagen returned no image data." };
    }

    return {
      imageBase64: prediction.bytesBase64Encoded,
      mimeType: prediction.mimeType ?? "image/png",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Gemini API error: ${message}` };
  }
}

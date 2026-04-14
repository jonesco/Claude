export interface GenerationResult {
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// gemini-2.5-flash-image — image generation model ("Nano Banana" in AI Studio)
const IMAGE_MODEL = "gemini-2.5-flash-image";

interface GeminiImagePart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiImagePart[];
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export async function generateWithGemini(
  prompt: string
): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "GEMINI_API_KEY environment variable is not set." };
  }

  const url = `${GEMINI_BASE_URL}/${IMAGE_MODEL}:generateContent`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["image"],
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

    const json = (await response.json()) as GeminiResponse;

    if (!response.ok || json.error) {
      const msg = json.error?.message ?? `HTTP ${response.status}`;
      return { error: `Gemini API error: ${msg}` };
    }

    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData) {
      return { error: "Gemini returned no image data." };
    }

    return {
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? "image/png",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Gemini API error: ${message}` };
  }
}

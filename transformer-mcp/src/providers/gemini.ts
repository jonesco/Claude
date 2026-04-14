import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerationResult {
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

/**
 * Generates an image using the Google Gemini Imagen API.
 * Reads GEMINI_API_KEY from environment.
 */
export async function generateWithGemini(
  prompt: string
): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "GEMINI_API_KEY environment variable is not set." };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use the Imagen 3 model for image generation
    const model = genAI.getGenerativeModel({
      model: "imagen-3.0-generate-002",
    });

    // @ts-expect-error - generateImages is available on Imagen models
    const response = await model.generateImages({
      prompt,
      number_of_images: 1,
      aspect_ratio: "3:4",
    });

    // @ts-expect-error - response structure for Imagen
    const image = response?.images?.[0];
    if (!image) {
      return { error: "Gemini returned no images." };
    }

    return {
      imageBase64: image.imageBytes,
      mimeType: image.mimeType ?? "image/png",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Gemini API error: ${message}` };
  }
}

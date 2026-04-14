import OpenAI from "openai";
import { GenerationResult } from "./gemini.js";

export async function generateWithChatGPT(
  prompt: string
): Promise<GenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OPENAI_API_KEY environment variable is not set." };
  }

  const trimmedPrompt =
    prompt.length > 4000 ? prompt.slice(0, 3997) + "..." : prompt;

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: trimmedPrompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
      response_format: "url",
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      return { error: "OpenAI returned no image URL." };
    }

    return { imageUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `OpenAI API error: ${message}` };
  }
}

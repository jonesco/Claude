import { v4 as uuidv4 } from "uuid";
import { assemblePrompt } from "../prompt/base_prompt.js";
import { generateWithGemini } from "../providers/gemini.js";
import { generateWithChatGPT } from "../providers/chatgpt.js";

export type Provider = "gemini" | "chatgpt";
export type Action = "generate" | "refine";

export interface GenerateTransformerInput {
  subject: string;
  provider?: Provider;
  action?: Action;
  feedback?: string;
  session_id?: string;
}

export interface GenerateTransformerOutput {
  session_id: string;
  subject: string;
  provider: Provider;
  action: Action;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

export async function handleGenerateTransformer(
  input: GenerateTransformerInput
): Promise<GenerateTransformerOutput> {
  const provider: Provider = input.provider ?? "gemini";
  const action: Action = input.action ?? "generate";
  const sessionId = input.session_id ?? uuidv4();

  if (action === "refine" && !input.feedback) {
    return {
      session_id: sessionId,
      subject: input.subject,
      provider,
      action,
      error:
        'feedback is required when action is "refine". Describe what needs to be corrected.',
    };
  }

  const prompt = assemblePrompt(
    input.subject,
    action === "refine" ? input.feedback : undefined
  );

  const result =
    provider === "gemini"
      ? await generateWithGemini(prompt)
      : await generateWithChatGPT(prompt);

  return {
    session_id: sessionId,
    subject: input.subject,
    provider,
    action,
    ...result,
  };
}

export const generateTransformerToolDef = {
  name: "generate_transformer",
  description:
    "Generate a retro 1980s-style transforming robot concept sheet image. " +
    "Provide a vehicle or creature type as the subject. The server assembles " +
    "the full detailed art-direction prompt and routes it to Gemini (default) " +
    "or ChatGPT/DALL-E. Use action=refine with a feedback string to correct " +
    "a previous generation.",
  inputSchema: {
    type: "object",
    properties: {
      subject: {
        type: "string",
        description:
          'The vehicle or creature the robot transforms into. E.g. "tank", "stealth jet", "alligator".',
      },
      provider: {
        type: "string",
        enum: ["gemini", "chatgpt"],
        description:
          '"gemini" (default) uses Google Imagen; "chatgpt" uses OpenAI DALL-E 3.',
      },
      action: {
        type: "string",
        enum: ["generate", "refine"],
        description:
          '"generate" (default) creates a new image. "refine" appends correction feedback to the previous prompt.',
      },
      feedback: {
        type: "string",
        description:
          'Required when action is "refine". Describe exactly what to fix in the previous output.',
      },
      session_id: {
        type: "string",
        description:
          "Optional session identifier to group a generation and its refinements.",
      },
    },
    required: ["subject"],
  },
} as const;

import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  generateTransformerToolDef,
  handleGenerateTransformer,
  GenerateTransformerInput,
  Provider,
  Action,
} from "./tools/generate_transformer.js";

const server = new Server(
  {
    name: "transformer-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [generateTransformerToolDef],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "generate_transformer") {
    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${request.params.name}`,
        },
      ],
      isError: true,
    };
  }

  const args = request.params.arguments as Record<string, unknown>;

  const input: GenerateTransformerInput = {
    subject: String(args.subject ?? ""),
    provider: (args.provider as Provider) ?? "gemini",
    action: (args.action as Action) ?? "generate",
    feedback: args.feedback != null ? String(args.feedback) : undefined,
    session_id: args.session_id != null ? String(args.session_id) : undefined,
  };

  if (!input.subject) {
    return {
      content: [
        {
          type: "text",
          text: 'Error: "subject" parameter is required.',
        },
      ],
      isError: true,
    };
  }

  const result = await handleGenerateTransformer(input);

  if (result.error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${result.error}`,
        },
      ],
      isError: true,
    };
  }

  const contentParts: Array<{ type: string; text?: string; data?: string; mimeType?: string }> = [];

  // Session / metadata summary
  contentParts.push({
    type: "text",
    text: [
      `Session: ${result.session_id}`,
      `Subject: ${result.subject}`,
      `Provider: ${result.provider}`,
      `Action: ${result.action}`,
    ].join("\n"),
  });

  // Return image as URL or embedded base64
  if (result.imageUrl) {
    contentParts.push({
      type: "text",
      text: `Image URL: ${result.imageUrl}`,
    });
  } else if (result.imageBase64) {
    contentParts.push({
      type: "image",
      data: result.imageBase64,
      mimeType: result.mimeType ?? "image/png",
    });
  }

  return { content: contentParts };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Transformer MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

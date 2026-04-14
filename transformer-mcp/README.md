# transformer-mcp

MCP server that generates retro 1980s-style transforming robot concept sheet images via a single Claude Code tool call. Supports Google Gemini (Imagen) and OpenAI (DALL-E 3) as backends.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your keys
cp .env.example .env
# edit .env

# 3. Build
npm run build

# 4. Run
npm start
```

## Claude Code Integration

Add to your `~/.claude/claude_desktop_config.json` (or project-level MCP config):

```json
{
  "mcpServers": {
    "transformer": {
      "command": "node",
      "args": ["/path/to/transformer-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your_key_here",
        "OPENAI_API_KEY": "your_key_here"
      }
    }
  }
}
```

## Tool: `generate_transformer`

| Parameter    | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `subject`   | string | Yes      | Vehicle or creature the robot transforms into |
| `provider`  | enum   | No       | `"gemini"` (default) or `"chatgpt"` |
| `action`    | enum   | No       | `"generate"` (default) or `"refine"` |
| `feedback`  | string | No*      | Required when `action="refine"` — what to fix |
| `session_id`| string | No       | Group a generation + refinements together |

## Usage Examples

```
# Generate with default provider (Gemini)
generate_transformer(subject="tank")

# Use ChatGPT/DALL-E 3
generate_transformer(subject="stealth jet", provider="chatgpt")

# Refine a previous result
generate_transformer(
  subject="tank",
  action="refine",
  feedback="The turret should be the robot's head, not a generic helmet"
)
```

## Environment Variables

| Variable        | Description |
|----------------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (Imagen access required) |
| `OPENAI_API_KEY` | OpenAI API key (DALL-E 3 access required) |

## Project Structure

```
transformer-mcp/
├── src/
│   ├── index.ts                        # MCP server entry point
│   ├── tools/
│   │   └── generate_transformer.ts     # Tool definition & handler
│   ├── providers/
│   │   ├── gemini.ts                   # Google Imagen client
│   │   └── chatgpt.ts                  # OpenAI DALL-E 3 client
│   └── prompt/
│       └── base_prompt.ts              # Full prompt template + assembler
├── .env.example
├── package.json
└── tsconfig.json
```

import Anthropic from "@anthropic-ai/sdk"
import { NIKE_SYSTEM_PROMPT } from "./system-prompt"
import { NIKE_TOOLS } from "./tools/schemas"
import { fetchUrl } from "./tools/fetch-url"
import { listItems } from "./tools/list-items"
import { remember } from "./tools/remember"

// Public event type consumed by the frontend via SSE.
export type ChatEvent =
  | { type: "text"; content: string }
  | { type: "tool_start"; name: string; input: unknown; id: string }
  | { type: "tool_result"; id: string; result: unknown }
  | { type: "done" }
  | { type: "error"; message: string }

type HistoryMessage = {
  role: "user" | "assistant"
  // Frontend sends strings; SDK supports string | ContentBlock[].
  content: string | Anthropic.MessageParam["content"]
}

const MODEL = process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929"
const MAX_TURNS = 6
const MAX_TOKENS = 2048

async function executeTool(
  name: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  try {
    if (name === "fetch_url") {
      return await fetchUrl(String(input.url ?? ""))
    }
    if (name === "list_items") {
      return await listItems(
        String(input.category ?? ""),
        typeof input.limit === "number" ? input.limit : 5,
      )
    }
    if (name === "remember") {
      return await remember(
        String(input.topic ?? ""),
        String(input.content ?? ""),
      )
    }
    return { error: `unknown tool: ${name}` }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: message }
  }
}

export async function* runNike(
  apiKey: string,
  userMessage: string,
  history: HistoryMessage[] = [],
): AsyncGenerator<ChatEvent> {
  const client = new Anthropic({ apiKey })

  const messages: Anthropic.MessageParam[] = [
    ...(history as Anthropic.MessageParam[]),
    { role: "user", content: userMessage },
  ]

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    let res: Anthropic.Message
    try {
      res = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: NIKE_SYSTEM_PROMPT,
        tools: NIKE_TOOLS,
        messages,
      })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      yield { type: "error", message }
      return
    }

    // Append assistant turn to running history for the next call.
    messages.push({ role: "assistant", content: res.content })

    // Stream text + tool_start events for this turn.
    for (const block of res.content) {
      if (block.type === "text" && block.text) {
        yield { type: "text", content: block.text }
      } else if (block.type === "tool_use") {
        yield {
          type: "tool_start",
          name: block.name,
          input: block.input,
          id: block.id,
        }
      }
    }

    // If the model is done (not asking for tools), stop.
    if (res.stop_reason !== "tool_use") {
      yield { type: "done" }
      return
    }

    // Execute every tool_use block and stream results back.
    const toolUses = res.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    )
    const toolResultBlocks: Anthropic.ToolResultBlockParam[] = []

    for (const tb of toolUses) {
      const input = (tb.input ?? {}) as Record<string, unknown>
      const result = await executeTool(tb.name, input)
      yield { type: "tool_result", id: tb.id, result }
      toolResultBlocks.push({
        type: "tool_result",
        tool_use_id: tb.id,
        content: JSON.stringify(result),
      })
    }

    // Feed tool results back as the next user turn.
    messages.push({ role: "user", content: toolResultBlocks })
  }

  // Hit the turn cap without a natural stop.
  yield { type: "done" }
}

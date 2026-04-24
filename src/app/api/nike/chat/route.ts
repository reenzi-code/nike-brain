import { NextRequest } from "next/server"
import { runNike, type ChatEvent } from "@/lib/nike-agent"

// Node runtime: SDK is node-first, and the SSE pattern below works here.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  // Client may send their own key via header, or opt into the server-side
  // env var by sending the sentinel "__server__" (or nothing).
  const headerKey = req.headers.get("x-api-key")?.trim() || ""
  const useServerKey =
    headerKey === "" || headerKey === "__server__" || !headerKey.startsWith("sk-ant-")
  const envKey = process.env.ANTHROPIC_API_KEY?.trim() || ""
  const apiKey = useServerKey ? envKey : headerKey

  if (!apiKey) {
    return new Response(
      "missing api key (no valid x-api-key header and no ANTHROPIC_API_KEY env)",
      { status: 401 },
    )
  }

  let body: { message?: string; history?: unknown[] }
  try {
    body = await req.json()
  } catch {
    return new Response("invalid json body", { status: 400 })
  }

  const message = typeof body.message === "string" ? body.message : ""
  if (!message.trim()) {
    return new Response("missing message", { status: 400 })
  }

  const history = Array.isArray(body.history) ? body.history : []
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        )
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for await (const event of runNike(apiKey, message, history as any)) {
          send(event)
        }
      } catch (e: unknown) {
        const errMessage = e instanceof Error ? e.message : String(e)
        send({ type: "error", message: errMessage })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  })
}

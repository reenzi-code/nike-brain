"use client"

import { useCallback, useRef } from "react"
import { useChat } from "@/store/useChat"
import { useGraph } from "@/store/useGraph"
import { storage } from "@/lib/storage"

/* ------------------------------------------------------------------ */
/* Types mirroring the SSE events from /api/nike/chat                  */
/* Keep these loose on the result shape — tools evolve faster than us. */
/* ------------------------------------------------------------------ */
type ChatEvent =
  | { type: "text"; content: string }
  | { type: "tool_start"; name: string; input: unknown; id: string }
  | { type: "tool_result"; id: string; result: unknown }
  | { type: "done" }
  | { type: "error"; message: string }

interface UseNikeApi {
  send: (message: string) => Promise<void>
  initialScan: () => Promise<void>
}

const NIKE_ROOT_ID = "nike-root"

/* ------------------------------------------------------------------ */
/* Mock data for the first-run scan. Mirrors /lib/tools/list-items so  */
/* the graph feels continuous when Nike later calls list_items.        */
/* ------------------------------------------------------------------ */
const INITIAL_MOCKS: Record<string, string[]> = {
  desktop: ["Projeto Alpha.sketch", "notes-2026-04.md", "mockup-v3.fig"],
  documents: [
    "brand-guidelines.pdf",
    "research-nike-brain.md",
    "ideias-produto.md",
  ],
  downloads: [
    "anthropic-docs.pdf",
    "react-flow-examples.zip",
    "podcast.mp3",
  ],
}

export function useNike(): UseNikeApi {
  // Refs track the graph "cursor" across async SSE events.
  // Using refs (not state) avoids re-render churn during streaming.
  const lastActionNodeRef = useRef<string>(NIKE_ROOT_ID)

  const send = useCallback(async (message: string) => {
    const apiKey = storage.getKey()
    if (!apiKey) {
      useChat.getState().addMessage({
        role: "assistant",
        content: "Preciso da sua API key. Volta na home e cola ela.",
      })
      return
    }

    // Snapshot history BEFORE mutating the store — excludes the user
    // turn we're about to send, since that goes in `message`.
    const history = useChat.getState().messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    useChat.getState().addMessage({ role: "user", content: message })
    useChat.getState().setStreaming(true)

    // Reset action anchor at the start of each turn — new tools hang
    // off the nike-root by default, not the previous turn's action.
    lastActionNodeRef.current = NIKE_ROOT_ID

    let res: Response
    try {
      res = await fetch("/api/nike/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ message, history }),
      })
    } catch (e) {
      useChat.getState().setStreaming(false)
      const msg = e instanceof Error ? e.message : "Erro de rede."
      useChat.getState().addMessage({
        role: "assistant",
        content: `Erro de rede: ${msg}`,
      })
      return
    }

    if (!res.ok || !res.body) {
      useChat.getState().setStreaming(false)
      const bodyText = await res.text().catch(() => "")
      const detail = bodyText ? ` (${bodyText})` : ""
      useChat.getState().addMessage({
        role: "assistant",
        content: `Deu ruim no servidor${detail}. Verifica sua API key.`,
      })
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        // SSE frames are separated by blank lines.
        const parts = buf.split("\n\n")
        buf = parts.pop() ?? ""
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith("data:")) continue
          const payload = line.slice(5).trim()
          if (!payload) continue
          try {
            const evt = JSON.parse(payload) as ChatEvent
            handleEvent(evt, lastActionNodeRef)
          } catch {
            // malformed frame — skip
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Stream interrompido."
      useChat.getState().addMessage({
        role: "assistant",
        content: `Stream caiu: ${msg}`,
      })
    } finally {
      useChat.getState().setStreaming(false)
    }
  }, [])

  const initialScan = useCallback(async () => {
    const graph = useGraph.getState()
    // Guard: only run once per session (more than just the Nike root exists).
    if (graph.nodes.length > 1) return

    const { addNode } = graph
    for (const category of Object.keys(INITIAL_MOCKS)) {
      const catId = addNode(
        { type: "file", data: { label: category } },
        NIKE_ROOT_ID,
      )
      for (const file of INITIAL_MOCKS[category]) {
        addNode(
          { type: "file", data: { label: file, folder: category } },
          catId,
        )
      }
    }

    useChat.getState().addMessage({
      role: "assistant",
      content:
        "Oi, sócio. Fiz um scan aqui. Tá tudo no graph. Me pede algo — tipo \"busca a homepage da Anthropic\" ou \"lembra que meu deadline é 2026-05-01\".",
    })
  }, [])

  return { send, initialScan }
}

/* ------------------------------------------------------------------ */
/* Event routing — pure function with a ref for the action anchor.     */
/* ------------------------------------------------------------------ */
function handleEvent(
  evt: ChatEvent,
  lastActionNodeRef: React.MutableRefObject<string>,
) {
  const { appendToLast } = useChat.getState()
  const { addNode } = useGraph.getState()

  switch (evt.type) {
    case "text":
      if (evt.content) appendToLast(evt.content)
      return

    case "tool_start": {
      const actionId = addNode(
        { type: "action", data: { label: evt.name } },
        NIKE_ROOT_ID,
      )
      lastActionNodeRef.current = actionId
      return
    }

    case "tool_result": {
      const parent = lastActionNodeRef.current
      const r = (evt.result ?? {}) as Record<string, unknown>

      // list_items → file nodes for each returned item
      if (Array.isArray((r as { items?: unknown }).items)) {
        const items = (r as { items: unknown[] }).items
        const category = typeof r.category === "string" ? r.category : undefined
        for (const raw of items) {
          const label = String(raw)
          addNode(
            {
              type: "file",
              data: category ? { label, folder: category } : { label },
            },
            parent,
          )
        }
        return
      }

      // fetch_url → single url node
      if (typeof r.url === "string" && typeof r.title === "string") {
        const label = r.title || r.url
        addNode(
          {
            type: "url",
            data: {
              label: String(label),
              url: String(r.url),
              content:
                typeof r.preview === "string" ? r.preview : undefined,
            },
          },
          parent,
        )
        return
      }

      // remember → thought node
      if (r.saved === true && typeof r.topic === "string") {
        addNode(
          {
            type: "thought",
            data: {
              label: String(r.topic),
              content: typeof r.content === "string" ? r.content : "",
            },
          },
          parent,
        )
        return
      }

      // Tool error surface (err path of any tool) — render as a thought
      if (typeof r.error === "string") {
        addNode(
          {
            type: "thought",
            data: { label: "erro", content: String(r.error) },
          },
          parent,
        )
        return
      }
      return
    }

    case "error":
      appendToLast(`\n\n⚠️ ${evt.message}`)
      return

    case "done":
    default:
      return
  }
}

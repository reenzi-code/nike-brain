"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Graph } from "@/components/Graph"
import { Chat } from "@/components/Chat"
import { useApiKeyGuard } from "@/components/ApiKeyGate"
import { useNike } from "@/hooks/useNike"
import { useGraph } from "@/store/useGraph"
import { useChat } from "@/store/useChat"
import { storage } from "@/lib/storage"

export default function AppPage() {
  const router = useRouter()
  const { ready } = useApiKeyGuard()
  const { send, initialScan } = useNike()

  // Guard against React 18 StrictMode double-invocation in dev.
  const bootstrappedRef = useRef(false)

  useEffect(() => {
    if (!ready) return
    if (bootstrappedRef.current) return
    bootstrappedRef.current = true

    useGraph.getState().init()
    void initialScan()
  }, [ready, initialScan])

  function handleLogout() {
    storage.clearKey()
    useChat.getState().reset()
    useGraph.getState().reset()
    router.replace("/")
  }

  if (!ready) {
    // Avoid flashing app shell while ApiKeyGate redirects unauth'd users.
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse-nike" />
      </main>
    )
  }

  return (
    <main className="flex h-screen flex-col bg-[#0a0a0a] text-zinc-100">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#0a0a0a]/90 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-purple-500/30 to-violet-700/30">
            <span className="text-xs font-bold text-gradient-nike">N</span>
          </span>
          <span className="text-sm font-medium tracking-tight text-zinc-100">
            Nike Brain
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
          aria-label="Fazer logout"
        >
          Logout
        </button>
      </header>

      {/* Main grid: graph (flex) + chat (400px) */}
      <section className="grid min-h-0 flex-1 grid-cols-[1fr_400px]">
        <div className="min-h-0 min-w-0">
          <Graph />
        </div>
        <div className="min-h-0">
          <Chat onSend={send} />
        </div>
      </section>
    </main>
  )
}

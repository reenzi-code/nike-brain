"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type ChangeEvent } from "react"
import { Send } from "lucide-react"
import { useChat, type Message } from "@/store/useChat"
import { TypingIndicator } from "@/components/TypingIndicator"

interface ChatProps {
  onSend: (message: string) => void
}

export function Chat({ onSend }: ChatProps) {
  const messages = useChat((s) => s.messages)
  const streaming = useChat((s) => s.streaming)

  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages or streaming updates
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const next = Math.min(el.scrollHeight, 120)
    el.style.height = `${next}px`
  }, [input])

  const canSend = input.trim().length > 0 && !streaming

  function handleSend() {
    const value = input.trim()
    if (!value || streaming) return
    onSend(value)
    setInput("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 shrink-0">
        <span
          className={`h-2 w-2 rounded-full bg-purple-500 ${
            streaming ? "animate-pulse" : "animate-pulse"
          }`}
          aria-hidden
        />
        <span className="text-sm font-medium text-zinc-100">Nike</span>
        <span className="text-xs text-zinc-500 ml-1">
          {streaming ? "pensando..." : "online"}
        </span>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto px-4 py-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-600 text-sm">Oi, sócio. Me pede algo.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {streaming && (
              <li className="flex justify-start">
                <TypingIndicator />
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-800 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Manda ver..."
            rows={1}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 resize-none min-h-[44px] max-h-[120px] text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition-colors"
            aria-label="Mensagem para Nike"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <li className="flex justify-end">
        <div className="max-w-[80%] bg-zinc-800 text-zinc-100 rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </li>
    )
  }

  return (
    <li className="flex justify-start">
      <div className="max-w-[85%] text-sm text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
        <span className="text-purple-400 mr-1.5 select-none">•</span>
        <AssistantContent content={message.content} />
      </div>
    </li>
  )
}

/**
 * Minimal markdown renderer — supports fenced code blocks (``` ... ```)
 * and inline code (`...`). Everything else is plain text, wrapped with
 * whitespace-pre-wrap so newlines are preserved.
 */
function AssistantContent({ content }: { content: string }) {
  if (!content) return null

  // Split on fenced code blocks first.
  const fenceRegex = /```(\w+)?\n?([\s\S]*?)```/g
  const parts: Array<{ type: "text" | "code"; lang?: string; value: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = fenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) })
    }
    parts.push({ type: "code", lang: match[1], value: match[2].replace(/\n$/, "") })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) })
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "code") {
          return (
            <pre
              key={i}
              className="my-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 overflow-auto"
            >
              <code>{part.value}</code>
            </pre>
          )
        }
        return <InlineText key={i} value={part.value} />
      })}
    </>
  )
}

function InlineText({ value }: { value: string }) {
  // Render inline `code` spans.
  const inlineRegex = /`([^`\n]+)`/g
  const chunks: Array<{ type: "text" | "code"; value: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = inlineRegex.exec(value)) !== null) {
    if (match.index > lastIndex) {
      chunks.push({ type: "text", value: value.slice(lastIndex, match.index) })
    }
    chunks.push({ type: "code", value: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < value.length) {
    chunks.push({ type: "text", value: value.slice(lastIndex) })
  }

  return (
    <>
      {chunks.map((c, i) =>
        c.type === "code" ? (
          <code
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-100"
          >
            {c.value}
          </code>
        ) : (
          <span key={i}>{c.value}</span>
        ),
      )}
    </>
  )
}

export default Chat

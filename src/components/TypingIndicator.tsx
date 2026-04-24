"use client"

export function TypingIndicator() {
  return (
    <div
      className="inline-flex items-center gap-1 px-1 py-2"
      aria-label="Nike está pensando"
      role="status"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce" />
    </div>
  )
}

export default TypingIndicator

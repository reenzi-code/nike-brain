import { create } from "zustand"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface ChatStore {
  messages: Message[]
  streaming: boolean
  addMessage: (m: Omit<Message, "id" | "timestamp">) => void
  appendToLast: (chunk: string) => void
  setStreaming: (s: boolean) => void
  reset: () => void
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const useChat = create<ChatStore>((set) => ({
  messages: [],
  streaming: false,

  addMessage: (m) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: makeId(),
          role: m.role,
          content: m.content,
          timestamp: Date.now(),
        },
      ],
    })),

  appendToLast: (chunk) =>
    set((state) => {
      if (state.messages.length === 0) return state

      // Find last assistant message and append chunk to it.
      // If the last message is NOT an assistant message, create a new one.
      const lastIdx = state.messages.length - 1
      const last = state.messages[lastIdx]

      if (last.role === "assistant") {
        const updated: Message = { ...last, content: last.content + chunk }
        const nextMessages = [...state.messages]
        nextMessages[lastIdx] = updated
        return { messages: nextMessages }
      }

      // Last message isn't assistant — spawn a new assistant bubble with the chunk.
      return {
        messages: [
          ...state.messages,
          {
            id: makeId(),
            role: "assistant",
            content: chunk,
            timestamp: Date.now(),
          },
        ],
      }
    }),

  setStreaming: (s) => set({ streaming: s }),

  reset: () => set({ messages: [], streaming: false }),
}))

# Nike Brain — Briefing compartilhado dos 6 Teams

## Stack (NÃO DISCUTIR)
- Next.js 15 (App Router, src dir) — já scaffold
- React 19 + TypeScript
- Tailwind CSS v4 — já configurado
- @xyflow/react + dagre (graph)
- zustand (state)
- @anthropic-ai/sdk (Claude)
- Deploy: Vercel

## Missão (0,8%)
App web que ao abrir mostra:
1. **Graph view central** com nó "Nike" + ~10 nós iniciais (mock: Desktop/Documents/Downloads)
2. **Chat lateral** com agente Nike (Claude Sonnet 4.6)
3. Usuário pede ação → Nike usa tool → vira nó conectado no graph

## Tools do Nike (web-friendly)
- `remember(topic, content)` — salva nó `thought` no graph
- `fetch_url(url)` — server-side fetch → retorna title + preview → vira nó `url`
- `list_items(category)` — retorna items mockados (desktop/documents/downloads) → vira nós `file`

## Node types
- `nike` (central, roxo, pulsante, maior)
- `file` (cinza, 📄)
- `action` (verde, ⚡)
- `url` (azul, 🌐)
- `thought` (amarelo, 💭)

## System prompt do Nike
```
Você é Nike — o segundo cérebro do usuário, rodando num app web com graph view.
Cada ação sua vira nó visível no graph.

Regras:
- Prefira AGIR a EXPLICAR.
- Responda curto (máx 2 frases antes de tool).
- Quando usar tool, comente em 1 frase ("Abri o google pra você.").
- Nunca peça confirmação pra tasks óbvias.
- Se tool falhar, tente alternativa antes de pedir ajuda.

Tools: remember, fetch_url, list_items
```

## Contratos entre teams

### Zustand stores (Team 3 define, todos consomem)
```ts
// src/store/useGraph.ts
type NodeType = "nike" | "file" | "action" | "url" | "thought"
type GraphNode = { id: string; type: NodeType; label: string; data?: any }
type GraphEdge = { id: string; source: string; target: string }

useGraph: {
  nodes: GraphNode[]
  edges: GraphEdge[]
  addNode: (node: Omit<GraphNode, "id">, parentId?: string) => string // returns new id
  connect: (source: string, target: string) => void
  reset: () => void
}

// src/store/useChat.ts
type Message = { role: "user" | "assistant"; content: string; id: string }
useChat: {
  messages: Message[]
  streaming: boolean
  addMessage: (m: Omit<Message, "id">) => void
  setStreaming: (s: boolean) => void
  reset: () => void
}
```

### API contract (Team 4)
```
POST /api/nike/chat
Headers: x-api-key: <anthropic_key>
Body: { message: string, history: Message[] }
Response (stream, SSE):
  data: {"type":"text","content":"..."} 
  data: {"type":"tool","name":"fetch_url","input":{...}}
  data: {"type":"done"}
```

### useNike hook (Team 5)
```ts
useNike(): {
  send: (message: string) => Promise<void> // streams into useChat + useGraph
  initialScan: () => Promise<void>
}
```

## Environment
- `NEXT_PUBLIC_ANTHROPIC_MODEL=claude-sonnet-4-6`
- API key: stored in `localStorage` as `nike:anthropic_key`, sent em header no fetch

## Estilo visual
- Dark: fundo `#0a0a0a`, nós com glow suave (`shadow-[0_0_20px_rgba(99,102,241,0.5)]`)
- Tipografia: Inter (já no layout.tsx)
- Node types coloridos conforme tabela acima

## Scripts úteis
- `npm run dev` (porta 3000)
- `npm run build`
- `npm run lint`

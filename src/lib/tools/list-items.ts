const MOCKS: Record<string, string[]> = {
  desktop: [
    "Projeto Alpha.sketch",
    "notes-2026-04.md",
    "mockup-v3.fig",
    "investor-deck.key",
    "readme.txt",
  ],
  documents: [
    "contrato-socio.pdf",
    "brand-guidelines.pdf",
    "research-nike-brain.md",
    "expenses-q1.xlsx",
    "ideias-produto.md",
  ],
  downloads: [
    "anthropic-docs.pdf",
    "rewind-demo.mp4",
    "react-flow-examples.zip",
    "figma-export.svg",
    "podcast.mp3",
  ],
  bookmarks: [
    "anthropic.com/claude",
    "obsidian.md",
    "reactflow.dev",
    "console.anthropic.com",
    "vercel.com/new",
  ],
}

export type ListItemsResult =
  | { category: string; items: string[]; total: number }
  | { error: string; category: string }

export async function listItems(
  category: string,
  limit = 5,
): Promise<ListItemsResult> {
  const key = (category || "").toLowerCase()
  const source = MOCKS[key]
  if (!source) {
    return {
      error: `unknown category: ${category}. valid: ${Object.keys(MOCKS).join(", ")}`,
      category,
    }
  }
  const safeLimit = Math.max(1, Math.min(Math.floor(limit) || 5, source.length))
  return {
    category: key,
    items: source.slice(0, safeLimit),
    total: source.length,
  }
}

import type Anthropic from "@anthropic-ai/sdk"

export const NIKE_TOOLS: Anthropic.Tool[] = [
  {
    name: "remember",
    description:
      "Salva um pensamento ou informação como nó no graph do usuário. Use quando quiser registrar algo importante que merece virar memória persistente.",
    input_schema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Título curto do pensamento (2-6 palavras)" },
        content: { type: "string", description: "Conteúdo completo a lembrar" },
      },
      required: ["topic", "content"],
    },
  },
  {
    name: "fetch_url",
    description:
      "Busca uma URL e retorna título + primeiros 1500 caracteres do conteúdo. Use para abrir sites, ler páginas, pesquisar.",
    input_schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL a buscar (https:// será prefixado se faltar)" },
      },
      required: ["url"],
    },
  },
  {
    name: "list_items",
    description:
      "Lista itens de uma categoria do usuário (desktop, documents, downloads, bookmarks). Retorna lista mockada por enquanto.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["desktop", "documents", "downloads", "bookmarks"],
        },
        limit: { type: "number", default: 5 },
      },
      required: ["category"],
    },
  },
]

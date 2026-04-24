export type FetchUrlResult =
  | { title: string; preview: string; url: string }
  | { error: string; url?: string }

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!match) return ""
  return match[1].replace(/\s+/g, " ").trim().slice(0, 200)
}

function stripHtml(html: string): string {
  // Drop scripts/styles first, then strip remaining tags, then collapse whitespace.
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
  const text = withoutScripts.replace(/<[^>]+>/g, " ")
  return text.replace(/\s+/g, " ").trim()
}

export async function fetchUrl(rawUrl: string): Promise<FetchUrlResult> {
  const url = normalizeUrl(rawUrl)
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; NikeBrain/1.0; +https://nike-brain.vercel.app)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    })

    if (!res.ok) {
      return { error: `HTTP ${res.status} ${res.statusText}`, url }
    }

    const contentType = res.headers.get("content-type") || ""
    const raw = await res.text()

    if (!contentType.includes("html") && !contentType.includes("text")) {
      return {
        title: url,
        preview: `(${contentType || "binary content"}) — ${raw.slice(0, 200)}`,
        url,
      }
    }

    const title = extractTitle(raw) || url
    const preview = stripHtml(raw).slice(0, 1500)
    return { title, preview, url }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: message, url }
  }
}

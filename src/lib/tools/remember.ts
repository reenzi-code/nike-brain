export type RememberResult = {
  saved: true
  topic: string
  content: string
  timestamp: number
}

export async function remember(
  topic: string,
  content: string,
): Promise<RememberResult> {
  return {
    saved: true,
    topic,
    content,
    timestamp: Date.now(),
  }
}

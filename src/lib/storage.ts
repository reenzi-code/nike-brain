/**
 * Typed localStorage wrapper for Nike Brain.
 * SSR-safe: returns `null` / no-ops when `window` is undefined.
 */

const KEYS = {
  anthropic: "nike:anthropic_key",
} as const

function hasWindow(): boolean {
  return typeof window !== "undefined"
}

export const storage = {
  /** Returns the stored Anthropic API key, or `null` if absent / SSR. */
  getKey(): string | null {
    if (!hasWindow()) return null
    try {
      const v = window.localStorage.getItem(KEYS.anthropic)
      return v && v.trim().length > 0 ? v : null
    } catch {
      return null
    }
  },

  /** Persists the Anthropic API key. Silently no-ops if storage is blocked. */
  setKey(k: string): void {
    if (!hasWindow()) return
    try {
      window.localStorage.setItem(KEYS.anthropic, k)
    } catch {
      // storage blocked — swallow
    }
  },

  /** Removes the stored Anthropic API key. */
  clearKey(): void {
    if (!hasWindow()) return
    try {
      window.localStorage.removeItem(KEYS.anthropic)
    } catch {
      // storage blocked — swallow
    }
  },

  /** Convenience: boolean check for whether a key is stored. */
  hasKey(): boolean {
    return this.getKey() !== null
  },
} as const

export const STORAGE_KEYS = KEYS

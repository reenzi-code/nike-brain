"use client"

import { useEffect, useSyncExternalStore, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"

// No-op subscribe: we don't need live updates — localStorage is only
// written from the landing page, then we route to /app. useSyncExternalStore
// gives us an SSR-safe way to read from the browser without a useEffect
// setState dance (which ESLint's react-hooks plugin flags).
const subscribe = () => () => {}
const getClientSnapshot = () => storage.hasKey()
const getServerSnapshot = () => false

/**
 * Hook: redirects to `/` if no Anthropic API key is stored.
 * Returns `ready` once the client-side check has run, so callers can
 * defer rendering app UI until we're sure the key is present.
 */
export function useApiKeyGuard(): { ready: boolean } {
  const router = useRouter()
  const hasKey = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  )

  useEffect(() => {
    if (!hasKey) router.replace("/")
  }, [hasKey, router])

  return { ready: hasKey }
}

/**
 * Component wrapper: renders children only once the API key gate resolves.
 * If no key is present, redirects to `/` and renders nothing meanwhile.
 */
export function ApiKeyGate({ children }: { children: ReactNode }) {
  const { ready } = useApiKeyGuard()
  if (!ready) return null
  return <>{children}</>
}

export default ApiKeyGate

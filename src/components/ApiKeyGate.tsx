"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"

/**
 * Hook: after hydration, checks localStorage for Anthropic API key.
 * Returns `ready` = true once the check has run AND a key exists
 * (or the sentinel "__server__" is set, meaning the user opted to use
 * the server-side env var).
 */
export function useApiKeyGuard(): { ready: boolean } {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [hasKey, setHasKey] = useState(false)

  useEffect(() => {
    const present = storage.hasKey()
    setHasKey(present)
    setChecked(true)
    if (!present) router.replace("/")
  }, [router])

  return { ready: checked && hasKey }
}

/**
 * Component wrapper: renders children only once the API key gate resolves.
 */
export function ApiKeyGate({ children }: { children: ReactNode }) {
  const { ready } = useApiKeyGuard()
  if (!ready) return null
  return <>{children}</>
}

export default ApiKeyGate

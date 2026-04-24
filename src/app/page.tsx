"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const STORAGE_KEY = "nike:anthropic_key";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Runs only on the client, after hydration — avoids SSR/client mismatch.
  useEffect(() => {
    setMounted(true);
    try {
      const existing = window.localStorage.getItem(STORAGE_KEY);
      if (existing && existing.trim().length > 0) {
        setHasExistingKey(true);
        router.replace("/app");
      }
    } catch {
      // localStorage blocked — continue to show the form.
    }
  }, [router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError("Cole sua API key pra continuar.");
      return;
    }
    if (!trimmed.startsWith("sk-ant-")) {
      setError("Essa key não parece válida. Deve começar com sk-ant-...");
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
      router.replace("/app");
    } catch {
      setError("Não foi possível salvar a key. Verifique o localStorage.");
    }
  }

  function handleUseServerKey() {
    // Server has ANTHROPIC_API_KEY env var — skip local key, go to /app.
    // The app page accepts missing local key; API route uses env fallback.
    try {
      window.localStorage.setItem(STORAGE_KEY, "__server__");
    } catch {}
    router.replace("/app");
  }

  // Pre-hydration: render the same static shell on server + first client render.
  // After useEffect runs, we either redirect (if key exists) or show the form.
  if (!mounted || hasExistingKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse-nike" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-12 overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, rgba(139, 92, 246, 0.15), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-700/20 glow-nike animate-pulse-nike">
            <span className="text-3xl font-bold text-gradient-nike">N</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-gradient-nike">
            Nike Brain
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Seu segundo cérebro, com Nike morando nele.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-4"
          autoComplete="off"
        >
          <div>
            <Input
              type="password"
              placeholder="Cole sua Anthropic API key (sk-ant-...)"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (error) setError(null);
              }}
              autoFocus
              spellCheck={false}
              aria-label="Anthropic API key"
            />
            {error && (
              <p className="mt-2 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" size="lg">
            Entrar
          </Button>

          <div className="relative my-2 flex items-center">
            <div className="flex-1 border-t border-zinc-800" />
            <span className="px-3 text-xs text-zinc-600">ou</span>
            <div className="flex-1 border-t border-zinc-800" />
          </div>

          <button
            type="button"
            onClick={handleUseServerKey}
            className="text-sm text-zinc-400 transition-colors hover:text-purple-300"
          >
            Usar key nativa do servidor →
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-zinc-500">
            A key fica só no seu browser. Não subimos nada.
          </p>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-purple-300 transition-colors"
          >
            Criar key em console.anthropic.com →
          </a>
        </div>
      </div>
    </main>
  );
}

"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Sparkles } from "lucide-react"
import type { GraphNodeData } from "@/types/graph"

function ThoughtNodeImpl({ data }: NodeProps) {
  const d = (data ?? {}) as GraphNodeData
  const body = d.content ?? d.label ?? "…"
  return (
    <div className="flex min-h-[60px] w-[200px] items-start gap-2 rounded-2xl border border-yellow-700 bg-yellow-950/40 px-3 py-2 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.2)] transition hover:border-yellow-500 hover:shadow-[0_0_25px_rgba(234,179,8,0.45)]">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
      <span
        className="text-[11px] leading-snug line-clamp-2 break-words"
        title={body}
      >
        {body}
      </span>

      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-none !bg-yellow-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-yellow-500"
      />
    </div>
  )
}

export const ThoughtNode = memo(ThoughtNodeImpl)
export default ThoughtNode

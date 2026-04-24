"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Globe } from "lucide-react"
import type { GraphNodeData } from "@/types/graph"

function UrlNodeImpl({ data }: NodeProps) {
  const d = (data ?? {}) as GraphNodeData
  return (
    <div className="flex min-h-[60px] w-[180px] flex-col justify-center gap-0.5 rounded-lg border border-blue-700 bg-blue-950/40 px-3 py-2 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.25)] transition hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 shrink-0 text-blue-400" />
        <span className="truncate text-xs font-semibold">{d.label ?? "URL"}</span>
      </div>
      {d.url ? (
        <span className="truncate pl-6 text-[10px] text-blue-300/70">{d.url}</span>
      ) : null}

      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-none !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-blue-500"
      />
    </div>
  )
}

export const UrlNode = memo(UrlNodeImpl)
export default UrlNode

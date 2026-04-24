"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Zap } from "lucide-react"
import type { GraphNodeData } from "@/types/graph"

function ActionNodeImpl({ data }: NodeProps) {
  const d = (data ?? {}) as GraphNodeData
  return (
    <div className="flex h-[60px] w-[160px] items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-950/40 px-3 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
      <Zap className="h-4 w-4 shrink-0 text-emerald-400" />
      <span className="truncate text-xs font-medium">{d.label ?? "Action"}</span>

      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-none !bg-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-emerald-500"
      />
    </div>
  )
}

export const ActionNode = memo(ActionNodeImpl)
export default ActionNode

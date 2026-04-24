"use client"

import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Brain } from "lucide-react"

function NikeNodeImpl() {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="animate-pulse-nike glow-nike flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600 text-white"
      >
        <Brain className="h-10 w-10" strokeWidth={2} />
      </div>
      <span className="mt-2 text-sm font-semibold tracking-wide text-white">
        Nike
      </span>

      {/* 4-sided handles so Nike is a true hub */}
      <Handle
        id="nike-top"
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-none !bg-violet-400/60"
      />
      <Handle
        id="nike-bottom"
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-violet-400/60"
      />
      <Handle
        id="nike-left"
        type="source"
        position={Position.Left}
        className="!h-2 !w-2 !border-none !bg-violet-400/60"
      />
      <Handle
        id="nike-right"
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-none !bg-violet-400/60"
      />
    </div>
  )
}

export const NikeNode = memo(NikeNodeImpl)
export default NikeNode

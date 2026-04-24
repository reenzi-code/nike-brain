"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { File as FileIcon } from "lucide-react"
import type { GraphNodeData } from "@/types/graph"

function FileNodeImpl({ data }: NodeProps) {
  const d = (data ?? {}) as GraphNodeData
  return (
    <div className="glow-file group flex h-[60px] w-[160px] items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-zinc-100 shadow-sm transition hover:border-zinc-600 hover:shadow-[0_0_20px_rgba(161,161,170,0.35)]">
      <FileIcon className="h-4 w-4 shrink-0 text-zinc-400" />
      <span className="truncate text-xs font-medium">{d.label ?? "File"}</span>

      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-none !bg-zinc-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-zinc-500"
      />
    </div>
  )
}

export const FileNode = memo(FileNodeImpl)
export default FileNode

"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { NikeNode } from "./nodes/NikeNode"
import { FileNode } from "./nodes/FileNode"
import { ActionNode } from "./nodes/ActionNode"
import { UrlNode } from "./nodes/UrlNode"
import { ThoughtNode } from "./nodes/ThoughtNode"

import { layoutNodes } from "@/lib/graph-layout"
import type { GraphNode, GraphEdge, RFNode, RFEdge } from "@/types/graph"

/* ------------------------------------------------------------------ */
/* Store shim — Team 3 owns the real `src/store/useGraph.ts`.          */
/* This keeps Graph renderable standalone until Team 3 ships.          */
/* ------------------------------------------------------------------ */
export interface GraphStoreShape {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
type UseGraphHook = <T>(selector: (s: GraphStoreShape) => T) => T

const FALLBACK_STORE: GraphStoreShape = {
  nodes: [
    { id: "nike", type: "nike", label: "Nike" },
    { id: "desktop", type: "file", label: "Desktop" },
    { id: "documents", type: "file", label: "Documents" },
    { id: "downloads", type: "file", label: "Downloads" },
  ],
  edges: [
    { id: "e-nike-desktop", source: "nike", target: "desktop" },
    { id: "e-nike-documents", source: "nike", target: "documents" },
    { id: "e-nike-downloads", source: "nike", target: "downloads" },
  ],
}

function useGraphFallback<T>(selector: (s: GraphStoreShape) => T): T {
  return selector(FALLBACK_STORE)
}

/* ------------------------------------------------------------------ */

const nodeTypes: NodeTypes = {
  nike: NikeNode,
  file: FileNode,
  action: ActionNode,
  url: UrlNode,
  thought: ThoughtNode,
}

function toRFNodes(nodes: GraphNode[]): RFNode[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: 0, y: 0 }, // dagre will overwrite
    data: { label: n.label, ...(n.data ?? {}) },
  }))
}

function toRFEdges(edges: GraphEdge[]): RFEdge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: false,
    style: { stroke: "#52525b", strokeWidth: 1.5 },
  }))
}

export function Graph() {
  // Attempt to bind to the real zustand store (Team 3).
  // If not present yet, fall back to a local mock.
  const [useGraph, setUseGraph] = useState<UseGraphHook | null>(null)

  useEffect(() => {
    let mounted = true
    import("@/store/useGraph")
      .then((m) => {
        const hook = (m as { useGraph?: UseGraphHook }).useGraph
        if (hook && mounted) setUseGraph(() => hook)
      })
      .catch(() => {
        /* store not ready yet — keep fallback */
      })
    return () => {
      mounted = false
    }
  }, [])

  const activeHook: UseGraphHook = useGraph ?? useGraphFallback
  const rawNodes = activeHook((s) => s.nodes)
  const rawEdges = activeHook((s) => s.edges)

  const { nodes, edges } = useMemo(() => {
    const rf = {
      nodes: toRFNodes(rawNodes),
      edges: toRFEdges(rawEdges),
    }
    return layoutNodes(rf.nodes, rf.edges, "TB")
  }, [rawNodes, rawEdges])

  return (
    <div className="h-full w-full bg-[#0a0a0a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        panOnScroll
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="#1a1a1a" gap={24} />
        <Controls
          showInteractive={false}
          className="!bg-zinc-900 !border-zinc-800 [&_button]:!bg-zinc-900 [&_button]:!border-zinc-800 [&_button:hover]:!bg-zinc-800 [&_button_svg]:!fill-zinc-300"
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            switch (n.type) {
              case "nike":
                return "#a78bfa"
              case "action":
                return "#10b981"
              case "url":
                return "#3b82f6"
              case "thought":
                return "#eab308"
              default:
                return "#71717a"
            }
          }}
          maskColor="rgba(10,10,10,0.7)"
          style={{ background: "#0a0a0a", border: "1px solid #27272a" }}
        />
      </ReactFlow>
    </div>
  )
}

export default Graph

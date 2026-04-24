"use client"

import { useMemo } from "react"
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
import { useGraph, type GraphNode, type GraphEdge } from "@/store/useGraph"
import type { RFNode, RFEdge } from "@/types/graph"

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
    position: n.position ?? { x: 0, y: 0 },
    data: { ...(n.data ?? {}), label: n.data?.label ?? n.id },
  }))
}

function toRFEdges(edges: GraphEdge[]): RFEdge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: e.animated ?? false,
    style: { stroke: "#52525b", strokeWidth: 1.5 },
  }))
}

export function Graph() {
  const rawNodes = useGraph((s) => s.nodes)
  const rawEdges = useGraph((s) => s.edges)

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

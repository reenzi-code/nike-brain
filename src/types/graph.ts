import type { Node, Edge } from "@xyflow/react"

export type NodeType = "nike" | "file" | "action" | "url" | "thought"

export interface GraphNodeData {
  label: string
  url?: string
  content?: string
  folder?: string
  [key: string]: unknown
}

export interface GraphNode {
  id: string
  type: NodeType
  label: string
  data?: GraphNodeData
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

// React Flow wire types — used by Graph.tsx / dagre layout
export type RFNode = Node<GraphNodeData>
export type RFEdge = Edge

import { create } from "zustand"
import type { NodeType, GraphNodeData } from "@/types/graph"

export interface GraphNode {
  id: string
  type: NodeType
  data: GraphNodeData
  position: { x: number; y: number }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  animated?: boolean
}

interface GraphStore {
  nodes: GraphNode[]
  edges: GraphEdge[]
  addNode: (node: Omit<GraphNode, "id" | "position">, parentId?: string) => string
  addNodes: (nodes: Array<Omit<GraphNode, "id" | "position">>, parentId?: string) => string[]
  setNodes: (nodes: GraphNode[]) => void
  setEdges: (edges: GraphEdge[]) => void
  reset: () => void
  init: () => void
}

const NIKE_ROOT_ID = "nike-root"

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  // fallback
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function makeEdgeId(source: string, target: string): string {
  return `e-${source}->${target}-${makeId().slice(0, 6)}`
}

export const useGraph = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],

  addNode: (node, parentId) => {
    const id = makeId()
    const newNode: GraphNode = {
      id,
      type: node.type,
      data: node.data,
      position: { x: 0, y: 0 },
    }

    set((state) => {
      const nextNodes = [...state.nodes, newNode]
      const nextEdges = parentId
        ? [
            ...state.edges,
            {
              id: makeEdgeId(parentId, id),
              source: parentId,
              target: id,
              animated: true,
            },
          ]
        : state.edges
      return { nodes: nextNodes, edges: nextEdges }
    })

    return id
  },

  addNodes: (nodesToAdd, parentId) => {
    const ids: string[] = []
    const newNodes: GraphNode[] = nodesToAdd.map((node) => {
      const id = makeId()
      ids.push(id)
      return {
        id,
        type: node.type,
        data: node.data,
        position: { x: 0, y: 0 },
      }
    })

    set((state) => {
      const nextNodes = [...state.nodes, ...newNodes]
      const nextEdges = parentId
        ? [
            ...state.edges,
            ...ids.map((id) => ({
              id: makeEdgeId(parentId, id),
              source: parentId,
              target: id,
              animated: true,
            })),
          ]
        : state.edges
      return { nodes: nextNodes, edges: nextEdges }
    })

    return ids
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  reset: () => set({ nodes: [], edges: [] }),

  init: () => {
    const { nodes } = get()
    if (nodes.length > 0) return

    const nikeRoot: GraphNode = {
      id: NIKE_ROOT_ID,
      type: "nike",
      data: { label: "Nike" },
      position: { x: 0, y: 0 },
    }

    set({ nodes: [nikeRoot], edges: [] })
  },
}))

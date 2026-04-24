import dagre from "dagre"
import { Position } from "@xyflow/react"
import type { RFNode, RFEdge } from "@/types/graph"

const NODE_W_DEFAULT = 160
const NODE_H_DEFAULT = 60
const NIKE_W = 96
const NIKE_H = 96

type Direction = "TB" | "LR" | "BT" | "RL"

/**
 * Runs dagre autolayout on React Flow nodes/edges.
 * Nike node is pinned at rank 0 (top when TB).
 * Returns new nodes array with updated `position`.
 */
export function layoutNodes(
  nodes: RFNode[],
  edges: RFEdge[],
  direction: Direction = "TB"
): { nodes: RFNode[]; edges: RFEdge[] } {
  if (nodes.length === 0) return { nodes, edges }

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 80,
    marginx: 40,
    marginy: 40,
  })

  nodes.forEach((n) => {
    const isNike = n.type === "nike"
    g.setNode(n.id, {
      width: isNike ? NIKE_W : NODE_W_DEFAULT,
      height: isNike ? NIKE_H : NODE_H_DEFAULT,
    })
  })

  edges.forEach((e) => {
    g.setEdge(e.source, e.target)
  })

  dagre.layout(g)

  const laidOut = nodes.map((n) => {
    const p = g.node(n.id)
    if (!p) return n
    const isNike = n.type === "nike"
    const w = isNike ? NIKE_W : NODE_W_DEFAULT
    const h = isNike ? NIKE_H : NODE_H_DEFAULT
    return {
      ...n,
      position: { x: p.x - w / 2, y: p.y - h / 2 },
      // hint source/target positions — improves edge rendering
      sourcePosition: direction === "TB" ? Position.Bottom : Position.Right,
      targetPosition: direction === "TB" ? Position.Top : Position.Left,
    }
  })

  return { nodes: laidOut, edges }
}

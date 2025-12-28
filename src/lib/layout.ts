import { Node, Edge } from "@xyflow/react";
import dagre from "dagre";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60, //horizontal spacing
    ranksep: 120, //depth spacing
  });

  // register nodes
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  // register edges
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const layouted = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: layouted.x - NODE_WIDTH / 2,
        y: layouted.y - NODE_HEIGHT / 2,
      },
    };
  });
}

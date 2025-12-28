import { Edge, MarkerType, Node } from "@xyflow/react";

interface ParserResult {
  nodes: Node[];
  edges: Edge[];
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isPrimitive = (
  value: unknown
): value is string | number | boolean | null => {
  return typeof value !== "object" || value === null;
};

export function transformJsonToFlow(
  data: any,
  parentId: string | null = null,
  keyName: string = "root",
  x = 0,
  y = 0
): ParserResult {
  let nodes: Node[] = [];
  let edges: Edge[] = [];

  const isRootCall = parentId === null;
  const parentNodeId = isRootCall ? "__root__" : parentId;
  const currentId = isRootCall ? "root" : `${parentId}.${keyName}`;

  // hiding the first root object
  if (isRootCall) {
    nodes.push({
      id: "__root__",
      hidden: true,
      position: { x, y },
      data: {},
    });
  }

  // object node
  if (isObject(data)) {
    const rows: { key: string; value: string }[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (isPrimitive(value)) {
        rows.push({ key, value: String(value) });
      } else if (Array.isArray(value)) {
        rows.push({
          key,
          value: `${value.length} items`,
        });
      } else if (isObject(value)) {
        rows.push({
          key,
          value: `${Object.keys(value).length} keys`,
        });
      }
    });

    nodes.push({
      id: currentId,
      type: "object",
      position: { x: 0, y: 0 },
      data: {
        label: keyName,
        rows,
      },
    });

    //connecting main root to next 'data' root object
    if (isRootCall) {
      edges.push({
        id: `e-root-${currentId}`,
        source: "__root__",
        target: currentId,
      });
    } else {
      edges.push({
        id: `e-${parentNodeId}-${currentId}`,
        source: parentNodeId,
        target: currentId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#b1b1b7",
        },
      });
    }

    let childIndex = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // if object item is array -> fan out
        value.forEach((item, index) => {
          if (isPrimitive(item)) {
            const itemId = `${currentId}.${key}[${index}]`;

            nodes.push({
              id: itemId,
              type: "arrayItem",
              position: { x: 0, y: 0 },
              data: {
                index,
                value: String(item),
              },
            });

            edges.push({
              id: `e-${currentId}-${itemId}`,
              source: currentId,
              target: itemId,
              // label: key,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            });
          } else {
            // array item is object -> recursive parsing
            const child = transformJsonToFlow(
              item,
              currentId,
              `${key}[${index}]`
            );
            nodes.push(...child.nodes);
            edges.push(...child.edges);
          }
          childIndex++;
        });
      }

      if (isObject(value)) {
        const child = transformJsonToFlow(value, currentId, key);
        nodes.push(...child.nodes);
        edges.push(...child.edges);
        childIndex++;
      }
    });
  }

  return { nodes, edges };
}

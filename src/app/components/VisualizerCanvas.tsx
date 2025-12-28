"use client";
import { transformJsonToFlow } from "@/lib/parser";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import ObjectNode from "./nodes/ObjectNode";
import ArrayItemNode from "./nodes/ArrayItemNode";
import { applyDagreLayout } from "@/lib/layout";
import { Expand, Github, Search } from "lucide-react";

interface VisualizerCanvasProps {
  data: string;
}

const nodeTypes = {
  object: ObjectNode,
  arrayItem: ArrayItemNode,
};

type MatchInfo = {
  nodeId: string;
  fields: {
    label?: boolean;
    value?: boolean;
    rows?: number[];
  };
};

const VisualizerCanvas = ({ data }: VisualizerCanvasProps) => {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  });
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); //debouncing this query
  const [inputQuery, setInputQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const { setCenter } = useReactFlow();

  //parsing json
  useEffect(() => {
    try {
      const parsed = JSON.parse(data);
      const result = transformJsonToFlow(parsed);
      setGraph(result);
    } catch (e) {
      alert("invalid json");
    }
  }, [data]);

  const rawNodes = graph.nodes;
  const rawEdges = graph.edges;

  //using dagre for spacing
  const layoutedNodes = useMemo(() => {
    return applyDagreLayout(rawNodes, rawEdges, "LR");
  }, [rawNodes, rawEdges]);

  //finding ancestor for highlighting edgs
  const highlightedEdgeIds = useMemo(() => {
    const next = new Set<string>();
    if (!hoverNodeId) return next;

    let current = hoverNodeId;
    while (current) {
      const parentEdge = rawEdges.find((e) => e.target === current);
      if (!parentEdge) break;

      next.add(parentEdge.id);
      current = parentEdge.source;
    }
    return next;
  }, [hoverNodeId, rawEdges]);

  //same above logic, but for copying node path
  function computeNodePath(nodeId: string, edges: Edge[]) {
    let current = nodeId;
    const parts: string[] = [];

    while (current && current !== "__root__") {
      const segment = current.split(".").at(-1);
      if (segment) parts.push(segment);

      const parentEdge = edges.find((e) => e.target === current);
      if (!parentEdge) break;

      current = parentEdge.source;
    }

    return parts.reverse().join(".");
  }

  //styling edgs
  const styledEdges = useMemo(() => {
    return rawEdges.map((edge) => {
      const isHighlighted = highlightedEdgeIds.has(edge.id);
      return {
        ...edge,
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? "#2563EB" : "#b1b1b7",
          strokeWidth: isHighlighted ? 3 : 2,
          transition: "all 0.2s",
        },
      };
    });
  }, [rawEdges, highlightedEdgeIds]);

  //searching query matches
  const matches = useMemo<MatchInfo[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: MatchInfo[] = [];

    rawNodes.forEach((node) => {
      const data = node.data as any;
      const fields: MatchInfo["fields"] = {};

      if (typeof data?.label === "string") {
        if (data.label.toLowerCase().includes(q)) {
          fields.label = true;
        }
      }
      if (typeof data?.value === "string") {
        if (data.value.toLowerCase().includes(q)) {
          fields.value = true;
        }
      }
      if (Array.isArray(data?.rows)) {
        const matchedRows: number[] = [];

        data.rows.forEach((row: any, idx: number) => {
          if (
            row.key.toLowerCase().includes(q) ||
            row.value.toLowerCase().includes(q)
          ) {
            matchedRows.push(idx);
          }
        });

        if (matchedRows.length > 0) {
          fields.rows = matchedRows;
        }
      }

      if (Object.keys(fields).length > 0) {
        results.push({ nodeId: node.id, fields });
      }
    });

    return results;
  }, [searchQuery, rawNodes]);

  const matchMap = useMemo(() => {
    const map = new Map<string, MatchInfo["fields"]>();
    matches.forEach((m) => map.set(m.nodeId, m.fields));
    return map;
  }, [matches]);

  const searchableNodes = useMemo(() => {
    const isSearchActive = !!searchQuery.trim();

    return layoutedNodes.map((node) => {
      const searchHighlight = matchMap.get(node.id);

      return {
        ...node,
        data: {
          ...node.data,
          searchHighlight,
          searchQuery,
        },
        style: {
          ...node.style,
          opacity: isSearchActive && !searchHighlight ? 0.5 : 1,
          transition: "opacity 0.2s",
        },
      };
    });
  }, [layoutedNodes, matchMap, searchQuery]);

  const matchedNodeIds = useMemo(() => matches.map((m) => m.nodeId), [matches]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [searchQuery]);

  //deboyncing query search
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchQuery(inputQuery);
    }, 300);

    return () => clearTimeout(id);
  }, [inputQuery]);

  useEffect(() => {
    if (!matchedNodeIds.length) return;

    const nodeId = matchedNodeIds[activeMatchIndex];
    const node = layoutedNodes.find((n) => n.id === nodeId);
    if (!node) return;

    setCenter(node.position.x, node.position.y, { zoom: 1.1, duration: 400 });
  }, [activeMatchIndex, matchedNodeIds, layoutedNodes, setCenter]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  //copy to clipboard
  async function copyClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert(`Copied node path: \n${text}`);
    } catch {
      alert(`Path:\n${text}\n\n(Could not auto-copy)`);
    }
  }

  return (
    <div className="h-screen w-full bg-slate-50">
      <div className="absolute top-3 right-4 flex gap-2 pointer-events-auto z-10">
        <button
          title="Fullscreen"
          onClick={toggleFullscreen}
          className="cursor-pointer hover:bg-[#ececec] hover:rounded-lg p-2"
        >
          <Expand className="w-5 h-5 " stroke="#3a3a3a" />
        </button>
        <a
          href="https://github.com/vartikajn07/json-lens"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          className="cursor-pointer hover:bg-[#ececec] hover:rounded-lg p-2 inline-flex"
        >
          <Github className="w-5 h-5" stroke="#3a3a3a" />
        </a>
      </div>
      <ReactFlow
        nodes={searchableNodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        className=""
        onNodeMouseEnter={(_, node) => setHoverNodeId(node.id)}
        onNodeMouseLeave={() => setHoverNodeId(null)}
        onNodeClick={(_, node) => {
          const path = computeNodePath(node.id, rawEdges);
          copyClipboard(path);
        }}
      >
        <Background color="#aaa" gap={20} variant={BackgroundVariant.Dots} />
        <Controls orientation="horizontal" />
        <div className="absolute bottom-4 left-34 pointer-events-auto z-10 flex items-center border-b border-[#3a3a3a] ">
          <Search className="w-4 h-4" stroke="#aaa" />
          <input
            placeholder="Search Node"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="p-1 text-sm font-semibold focus:outline-none text-[#3a3a3a] w-32"
            onKeyDown={(e) => {
              if (e.key === "Enter" && matchedNodeIds.length > 0) {
                e.preventDefault();
                setActiveMatchIndex((i) => (i + 1) % matchedNodeIds.length);
              }
            }}
          />
        </div>
      </ReactFlow>
    </div>
  );
};

export default VisualizerCanvas;

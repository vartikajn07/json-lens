"use client";
import { Handle, Position } from "@xyflow/react";

export default function ArrayItemNode({ id, data }: any) {
  const { index, value, searchQuery } = data;
  function highlightText(text: string, query: string) {
    if (!query) return text;

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");

    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-green-400 text-[#3a3a3a] rounded p-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }
  return (
    <div className={`rounded-md border bg-white px-3 py-2 text-sm shadow`}>
      <div className="text-[#3a3a3a] text-xs mb-1 font-mono">
        [{index}] <span className=""> {highlightText(value, searchQuery)}</span>
      </div>
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

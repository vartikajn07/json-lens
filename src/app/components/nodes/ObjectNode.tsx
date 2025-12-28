"use client";

import { Handle, Position } from "@xyflow/react";

export default function ObjectNode({ id, data }: any) {
  const { label, rows, searchQuery } = data;
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
    <div className="rounded-md border bg-white shadow-sm w-fit min-w-10 max-w-75">
      <span className="text-xs pl-3 text-[#761CEB]">
        {" "}
        {highlightText(label, searchQuery)}
      </span>

      <div className="px-3 py-2 space-y-1 text-sm w-full border-t">
        {data.rows.length === 0 && (
          <div className="text-[#898585] italic">{data.rows.length} keys</div>
        )}
        {rows.map((row: any) => {
          return (
            <div key={row.key} className="flex justify-between gap-4">
              <span className=""> {highlightText(row.key, searchQuery)}:</span>
              <span className="text-[#3a3a3a] font-mono truncate">
                {highlightText(row.value, searchQuery)}
              </span>
            </div>
          );
        })}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

"use client";
import { useState } from "react";
import { Group, Panel } from "react-resizable-panels";
import EditorPanel from "./components/EditorPanel";
import VisualizerCanvas from "./components/VisualizerCanvas";
import { DEFAULT_JSON } from "./constants";
import { ReactFlowProvider } from "@xyflow/react";

export default function Home() {
  const [draftJson, setDraftJson] = useState(DEFAULT_JSON);
  const [renderJson, setRenderJson] = useState(DEFAULT_JSON);

  return (
    <div className="relative w-screen h-screen">
      <Group orientation="horizontal">
        <Panel defaultSize={30} minSize={20}>
          <EditorPanel
            value={draftJson}
            onChange={setDraftJson}
            onRender={() => setRenderJson(draftJson)}
          />
        </Panel>

        <Panel defaultSize={75}>
          <ReactFlowProvider>
            <VisualizerCanvas data={renderJson} />
          </ReactFlowProvider>
        </Panel>
      </Group>
    </div>
  );
}

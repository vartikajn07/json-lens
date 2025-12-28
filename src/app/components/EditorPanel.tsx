"use client";
import { Editor } from "@monaco-editor/react";
import Lottie from "lottie-react";
import loaderAnimation from "../Loader.json";

interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  onRender: () => void;
}

const Loader = () => {
  return (
    <Lottie animationData={loaderAnimation} loop={true} className="w-24 h-24" />
  );
};

const EditorPanel = ({ onChange, value, onRender }: EditorPanelProps) => {
  return (
    <div className="h-screen w-full border-r border-border">
      <div className="py-2 px-6 bg-[#ececec] z-10 flex items-center justify-between">
        <h1 className="font-bold text-sm">JSON Lens</h1>
        <button
          onClick={onRender}
          className="bg-[#3a3a3a] text-white font-medium text-xs rounded-lg py-2 px-3 cursor-pointer"
        >
          Render
        </button>
      </div>
      <Editor
        height="100%"
        width="100%"
        language="json"
        // theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          formatOnPaste: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
          },
        }}
        loading={<Loader />}
      />
    </div>
  );
};

export default EditorPanel;

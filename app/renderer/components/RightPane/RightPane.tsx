import React from "react";
import { useUIStore } from "../../state/ui.js";
import { FieldsTree } from "./FieldsTree.js";
import { VizOptions } from "./VizOptions.js";
import { DataOptions } from "./DataOptions.js";

export function RightPane(): JSX.Element {
  const { rightPaneOpen, rightPaneTab, setRightPaneTab, toggleRightPane } = useUIStore();

  if (!rightPaneOpen) {
    return (
      <button
        onClick={toggleRightPane}
        className="w-8 bg-[var(--panel)] border-l border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg)]"
      >
        ▶
      </button>
    );
  }

  return (
    <div className="w-[360px] bg-[var(--panel)] border-l border-[var(--border)] flex flex-col">
      <div className="flex border-b border-[var(--border)]">
        {(["fields", "viz", "data"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setRightPaneTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              rightPaneTab === tab
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button
          onClick={toggleRightPane}
          className="px-2 text-[var(--muted)] hover:text-[var(--text)]"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {rightPaneTab === "fields" && <FieldsTree />}
        {rightPaneTab === "viz" && <VizOptions />}
        {rightPaneTab === "data" && <DataOptions />}
      </div>
    </div>
  );
}


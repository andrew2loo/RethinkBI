import React from "react";
import { useUIStore } from "../state/ui.js";

export function TopBar(): JSX.Element {
  const { nav } = useUIStore();

  return (
    <div className="h-12 bg-[var(--panel)] border-b border-[var(--border)] flex items-center px-4">
      <div className="font-semibold text-lg">RethinkBI</div>
      <div className="ml-4 text-sm text-[var(--muted)]">
        {nav === "report" && "Report"}
        {nav === "data" && "Data"}
        {nav === "model" && "Model"}
      </div>
      <div className="ml-auto flex gap-2">
        <button
          className="px-3 py-1 text-sm hover:bg-[var(--bg)] rounded"
          onClick={async () => {
            await window.api.saveProject();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}


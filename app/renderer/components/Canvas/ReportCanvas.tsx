import React from "react";
import { useModelStore } from "../../state/model.js";
import { VisualCard } from "./VisualCard.js";

export function ReportCanvas(): JSX.Element {
  const { visuals, addVisual } = useModelStore();

  return (
    <div className="bg-[var(--bg)] p-4 h-full overflow-auto">
      {visuals.length === 0 ? (
        <div className="h-full border-2 border-dashed border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--muted)]">
          <div className="text-center">
            <p className="mb-4">Drop visuals here</p>
            <button
              onClick={() => addVisual("bar", "table1")}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90"
            >
              Add Visual
            </button>
          </div>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gridAutoRows: "minmax(100px, auto)"
          }}
        >
          {visuals.map((visual) => (
            <VisualCard key={visual.id} visual={visual} />
          ))}
        </div>
      )}
    </div>
  );
}


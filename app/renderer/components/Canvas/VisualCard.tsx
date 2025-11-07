import React from "react";
import type { VisualSpec } from "../../../../shared/types.js";
import { useModelStore } from "../../state/model.js";

interface VisualCardProps {
  visual: VisualSpec;
}

export function VisualCard({ visual }: VisualCardProps): JSX.Element {
  const { selectVisual, activeVisualId, removeVisual } = useModelStore();
  const isSelected = activeVisualId === visual.id;

  return (
    <div
      className={`bg-[var(--panel)] rounded-2xl shadow p-3 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-[var(--focus)]" : ""
      }`}
      style={{
        gridColumn: `span ${visual.layout.w}`,
        gridRow: `span ${visual.layout.h}`
      }}
      onClick={() => selectVisual(visual.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{visual.title}</h3>
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeVisual(visual.id);
            }}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            ×
          </button>
        )}
      </div>
      <div className="h-full flex items-center justify-center text-[var(--muted)] text-sm">
        {visual.type} chart
      </div>
    </div>
  );
}


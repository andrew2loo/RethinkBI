import React from "react";
import { useModelStore } from "../../state/model.js";
import type { VisualType } from "../../../../shared/types.js";

export function VizOptions(): JSX.Element {
  const { activeVisualId, visuals, updateVisual } = useModelStore();
  const activeVisual = visuals.find((v) => v.id === activeVisualId);

  if (!activeVisual) {
    return <div className="text-[var(--muted)] text-sm">Select a visual to configure</div>;
  }

  const types: VisualType[] = ["bar", "line", "area", "pie", "table"];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Chart Type</label>
        <div className="grid grid-cols-2 gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => updateVisual(activeVisual.id, { type })}
              className={`px-3 py-2 text-sm rounded ${
                activeVisual.type === type
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg)] hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={activeVisual.title}
          onChange={(e) => updateVisual(activeVisual.id, { title: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-[var(--border)] rounded"
        />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Encodings</div>
        <div className="space-y-2 text-xs">
          {activeVisual.encoding.x && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--muted)]">X:</span>
              <span>{activeVisual.encoding.x.name}</span>
            </div>
          )}
          {activeVisual.encoding.y && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--muted)]">Y:</span>
              <span>{activeVisual.encoding.y.name}</span>
            </div>
          )}
          {activeVisual.encoding.color && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--muted)]">Color:</span>
              <span>{activeVisual.encoding.color.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


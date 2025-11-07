import React from "react";
import { useModelStore } from "../../state/model.js";

export function DataOptions(): JSX.Element {
  const { activeVisualId, visuals, setFilters } = useModelStore();
  const activeVisual = visuals.find((v) => v.id === activeVisualId);

  if (!activeVisual) {
    return <div className="text-[var(--muted)] text-sm">Select a visual to configure filters</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Filters</label>
        {activeVisual.filters && activeVisual.filters.length > 0 ? (
          <div className="space-y-2">
            {activeVisual.filters.map((filter, idx) => (
              <div key={idx} className="text-sm p-2 bg-[var(--bg)] rounded">
                {filter.column.name} {filter.op} {String(filter.value)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[var(--muted)] text-xs">No filters applied</div>
        )}
      </div>
    </div>
  );
}


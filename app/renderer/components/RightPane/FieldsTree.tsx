import React, { useEffect, useState } from "react";
import type { TableDef } from "../../../../shared/types.js";
import { useModelStore } from "../../state/model.js";

export function FieldsTree(): JSX.Element {
  const [tables, setTables] = useState<TableDef[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeVisualId, visuals, setEncoding } = useModelStore();
  const activeVisual = visuals.find((v) => v.id === activeVisualId);

  useEffect(() => {
    void (async () => {
      try {
        const schema = await window.api.getSchema();
        setTables(schema.tables);
        useModelStore.getState().setTables(
          schema.tables.map((t) => ({
            name: t.name,
            columns: t.columns.map((c) => ({
              table: t.name,
              name: c.name,
              type: c.type
            }))
          }))
        );
      } catch (err) {
        console.error("Failed to load schema:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-[var(--muted)] text-sm">Loading schema...</div>;
  }

  if (tables.length === 0) {
    return (
      <div className="text-[var(--muted)] text-sm">
        <p className="mb-2">No tables found.</p>
        <p className="text-xs">Import data to get started.</p>
      </div>
    );
  }

  const handleFieldClick = (table: string, column: { name: string; type: string }) => {
    if (!activeVisual) return;

    const colRef = { table, name: column.name, type: column.type };
    
    // Assign to next available encoding slot
    if (!activeVisual.encoding.x) {
      setEncoding(activeVisual.id, { x: colRef });
    } else if (!activeVisual.encoding.y) {
      setEncoding(activeVisual.id, { y: colRef });
    } else if (!activeVisual.encoding.color) {
      setEncoding(activeVisual.id, { color: colRef });
    }
  };

  return (
    <div className="space-y-2">
      {tables.map((table) => (
        <div key={table.name} className="mb-4">
          <div className="font-semibold text-sm mb-1">{table.name}</div>
          <div className="space-y-1">
            {table.columns.map((col) => (
              <button
                key={col.name}
                onClick={() => handleFieldClick(table.name, col)}
                className="w-full text-left px-2 py-1 text-sm hover:bg-[var(--bg)] rounded flex items-center gap-2"
              >
                <span className="text-[var(--muted)] text-xs">{col.type}</span>
                <span>{col.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


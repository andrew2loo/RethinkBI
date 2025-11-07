import React, { useEffect, useState } from "react";
import type { TableDef } from "../../../shared/types.js";

export function Data(): JSX.Element {
  const [tables, setTables] = useState<TableDef[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [data, setData] = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const schema = await window.api.getSchema();
        setTables(schema.tables);
      } catch (err) {
        console.error("Failed to load schema:", err);
      }
    })();
  }, []);

  const loadTableData = async (tableName: string) => {
    setLoading(true);
    try {
      const result = await window.api.runQuery(
        { kind: "sql", sql: `SELECT * FROM ${tableName} LIMIT 100` },
        { arrow: false }
      );
      if ("columns" in result && "rows" in result) {
        setData(result);
      }
    } catch (err) {
      console.error("Failed to load table data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-64 bg-[var(--panel)] border-r border-[var(--border)] p-4 overflow-auto">
        <h2 className="font-semibold mb-4">Tables</h2>
        <div className="space-y-1">
          {tables.map((table) => (
            <button
              key={table.name}
              onClick={() => {
                setSelectedTable(table.name);
                void loadTableData(table.name);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                selectedTable === table.name
                  ? "bg-[var(--accent)] text-white"
                  : "hover:bg-[var(--bg)]"
              }`}
            >
              {table.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="text-[var(--muted)]">Loading...</div>
        ) : data ? (
          <div className="overflow-auto">
            <table className="min-w-full border border-[var(--border)]">
              <thead>
                <tr className="bg-[var(--bg)]">
                  {data.columns.map((col) => (
                    <th key={col} className="px-4 py-2 text-left text-sm font-medium border-b">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, idx) => (
                  <tr key={idx} className="border-b">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-sm">
                        {String(cell ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-[var(--muted)]">Select a table to view data</div>
        )}
      </div>
    </div>
  );
}


import React, { useEffect, useState } from "react";

type AppVersion = { version: string };

export function App(): JSX.Element {
  const [version, setVersion] = useState<string>("");
  const [workspaceDir, setWorkspaceDir] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const v = (await window.api.getVersion()) as AppVersion;
      setVersion(v.version);
      const ws = (await window.api.initWorkspace()) as { workspaceDir: string };
      setWorkspaceDir(ws.workspaceDir);
    })();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateRows: "40px 1fr", height: "100vh", fontFamily: "Inter, system-ui, Arial" }}>
      <header style={{ display: "flex", alignItems: "center", padding: "0 12px", borderBottom: "1px solid #e5e7eb" }}>
        <strong>RethinkBI</strong>
        <span style={{ marginLeft: "auto", color: "#6b7280" }}>Electron {version}</span>
      </header>
      <main style={{ display: "grid", gridTemplateColumns: "260px 1fr 320px" }}>
        <aside style={{ borderRight: "1px solid #e5e7eb", padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Schema</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Workspace: {workspaceDir}</div>
        </aside>
        <section style={{ padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Report Canvas</div>
          <div style={{ height: "100%", border: "1px dashed #d1d5db", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            Drop visuals here
          </div>
        </section>
        <aside style={{ borderLeft: "1px solid #e5e7eb", padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Fields / Visualizations / Data</div>
          <button onClick={() => window.api.importData({ filePath: "sample.csv", type: "csv" })}>
            Import CSV (placeholder)
          </button>
        </aside>
      </main>
    </div>
  );
}



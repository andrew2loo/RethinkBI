# 🧰 BI Tool Developer Guide for Cursor.com

This document instructs **Developer** how to scaffold and maintain the Electron + DuckDB BI Tool. Keep it updated as the source of truth for architecture, coding standards, and task flow.

---

## 🎯 Goal

Deliver a Power BI–style desktop app with:
- Electron 37 (Node 22), Vite/electron‑vite
- React + TypeScript + Tailwind
- DuckDB + Apache Arrow (in‑process OLAP)
- Vega‑Lite / ECharts for charts; AG Grid for tables
- Secure IPC bridge; long tasks in Worker Threads

---

## 🧱 Coding Conventions

- TypeScript **strict** everywhere; ESM modules.
- Renderer has **no Node**; use **preload** (`window.api`) only.
- Validate every IPC payload via `zod`.
- Use **Arrow** as default result format for queries (fast, columnar).
- UI state with Zustand or Redux Toolkit.
- Filenames are **stable** per this guide so Cursor can regenerate safely.

---

## 📁 Folder Structure (authoritative)

```
app/
 ├─ main/
 │   ├─ main.ts
 │   ├─ ipc/handlers.ts
 │   ├─ db/duckdb.ts
 │   ├─ workers/query.worker.ts
 │   ├─ connectors/{csv,parquet,excel,postgres,mssql}.ts
 │   ├─ security/credentials.ts
 │   └─ project/{store.ts,serializer.ts}
 ├─ preload/index.ts
 └─ renderer/
     ├─ main.tsx
     ├─ routes/{Report,Data,Model}.tsx
     ├─ components/
     │   ├─ TopBar.tsx
     │   ├─ NavRail.tsx
     │   ├─ StatusBar.tsx
     │   ├─ Canvas/{ReportCanvas.tsx,VisualCard.tsx,VisualToolbar.tsx}
     │   └─ RightPane/{RightPane.tsx,FieldsTree.tsx,VizOptions.tsx,DataOptions.tsx}
     ├─ state/{model.ts,ui.ts}
     └─ hooks/{useQuery.ts,useSchema.ts}
docs/
 ├─ ui-spec.md
 └─ api-spec.md
```

---

## 🔌 IPC Surfaces (summary)

See `docs/api-spec.md` for types. Renderer can call:

```
getSchema()
runQuery(spec, { arrow?: true, pageSize?: number })
startQuery(spec, { arrow?: true })
getQueryResult(handle)
cancelQuery(handle)
importData(dataset, targetTable?)
listConnections()
createConnection(cfg)
deleteConnection(id)
saveProject()
loadProject(path)
getProjectMeta()
exportAs(format, payload)
getStatus()
```

- Long queries must run in **workers** and support **cancel**.
- Results default to **Arrow IPC** (`ArrayBuffer`), with optional `PagedRows` for grids.

---

## 🧭 Rules

1) **Always specify the file path** and target function signature.  
2) **Reference the spec**: “Follow `docs/api-spec.md` types and validation.”  
3) **State security**: “No Node APIs in renderer; use `window.api` only.”  
4) **Ask for tests**: “Generate Vitest for db/duckdb.ts; Playwright smoke for layout.”  
5) **Idempotence**: “Regenerate only the specified file, keep exports stable.”

**Examples**

- *Backend* — “Create `app/main/db/duckdb.ts` that initializes (if missing) `workspace/data/workspace.duckdb`, exposes `async queryArrow(sql, params?)` returning Arrow IPC buffer, and `getSchema()`.”

- *Worker* — “Implement `app/main/workers/query.worker.ts` using `worker_threads`. Accept EXECUTE_QUERY + CANCEL messages and return RESULT_ARROW | RESULT_PAGED | PROGRESS.”

- *Preload* — “Expose `window.api` in `app/preload/index.ts` for the channels listed in `docs/api-spec.md`, wrapping errors into `{code,message}`.”

- *UI* — “Create `ReportCanvas.tsx` with draggable/resizable `VisualCard` using CSS grid; when selected, call `onSelect(id)` and show toolbar.”

---

## 🧪 Testing

- **Vitest**: unit tests for SQL builder, IPC validators, DuckDB adapter.
- **Playwright**: smoke tests: open app → navigate tabs → add visual → run query → export.
- **ESLint + Prettier**: CI gate.

---

## 📦 Build & Release

- `electron-builder` config: appId, artifactName, mac/win targets, auto‑update via `electron-updater` (later).
- Code signing placeholders; release notes template.

---

## 🧱 Tasks (suggested order)

1. **Bootstrap Electron + React + Tailwind** (window + preload).  
2. **DuckDB adapter** (`db/duckdb.ts`) + **schema introspection**.  
3. **IPC handlers** (`ipc/handlers.ts`) with `zod` validators.  
4. **Worker** for long queries + cancellation.  
5. **Import connectors** (CSV, Parquet, Excel).  
6. **UI skeleton** (TopBar, NavRail, StatusBar, RightPane, ReportCanvas).  
7. **Visual pipeline** (encoding → QuerySpec → runQuery → Arrow → chart).  
8. **Data view** (schema tree + AG Grid preview).  
9. **Export** (PNG/PDF/CSV/Parquet).  
10. **Project save/load** (JSON + `.duckdb`).

Keep PRs small; ensure each task compiles and has tests.

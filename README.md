# RethinkBI
A modern, open-source BI tool built with Electron, React, and DuckDB. Create interactive dashboards and visual analytics—offline, fast, and privacy-first.

# 🧠 Electron + DuckDB BI Tool

An open‑source, Power BI–style desktop analytics app that runs **entirely on your machine**. Build interactive dashboards, slice & dice data, and export results — **no server required**.

**Tech stack**
- Electron 37 + Node 22 + Vite
- React + TypeScript + Tailwind
- DuckDB (embedded OLAP engine) + Apache Arrow
- Vega‑Lite / ECharts (charts) + AG Grid (tables)

> Why this project? You get the convenience of a desktop BI tool with the openness of web tech and the performance of DuckDB’s columnar engine.

---

## 🚀 Features

- **Import**: CSV, Excel, Parquet, JSON; connect to PostgreSQL/MSSQL and ingest query results.
- **Model**: Browse schema, define simple measures, (future) relationships.
- **Query**: Visual builder or raw SQL; fast aggregations via DuckDB; large result handling with pagination.
- **Visualize**: Bar/line/area/pie + data table; cross‑filtering foundation; export PNG/PDF/CSV/Parquet.
- **Projects**: Save/load to a local folder: `project.json`, `model.json`, `visuals.json`, and `workspace.duckdb`.
- **Secure**: `contextIsolation`, no Node in renderer, credential vault via `keytar`.
- **Offline‑first**: Everything runs in‑process; ideal for laptops and air‑gapped environments.

---

## 🏗 Architecture

```
Electron Main (Node)
 ├─ IPC handlers (zod‑validated)
 ├─ Worker Threads for long queries
 ├─ DuckDB engine (workspace/data/workspace.duckdb)
 ├─ Connectors (CSV/Parquet/Excel/PG/MSSQL)
 ├─ Credential vault (keytar)
 └─ Preload → window.api ⇄ React Renderer (UI)
```

**Arrow as the wire format** keeps large datasets fast between Main and Renderer.

---

## 📁 Repo Layout

```
app/
 ├─ main/                 # Electron backend: IPC, workers, db, connectors
 ├─ preload/              # Secure bridge, exposes window.api
 └─ renderer/             # React UI: layout, canvas, right pane, data view
docs/
 ├─ bi-tool.md            # Developer guide for Cursor.com
 ├─ ui-spec.md            # Power BI–style UI/UX spec
 └─ api-spec.md           # IPC & data contracts
workspace/
 └─ data/workspace.duckdb # Created on first run
```

---

## 🔧 Development

```bash
npm install
npm run dev      # start Electron + React (hot reload)
npm run build    # build renderer + main
npm run dist     # package app via electron-builder
```

**First run tips**
- Use **Data → Import** to load a CSV/Excel/Parquet file. A table appears in the schema pane.
- Add a **Visual** from the canvas. Set encodings (x/y/color) in the right pane.
- Save the **Project** to persist the visuals and the `.duckdb` database.

---

## 🧩 Docs

- **Developer Guide** → [`docs/bi-tool.md`](docs/bi-tool.md)  
- **UI/UX Spec (Power BI‑style)** → [`docs/ui-spec.md`](docs/ui-spec.md)  
- **API/IPC Spec** → [`docs/api-spec.md`](docs/api-spec.md)

---

## 🛡 Security Defaults

```ts
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  preload: path.join(__dirname, "../preload/index.js"),
}
```

- All renderer calls go through **typed**, **validated** IPC.
- Secrets stored in OS‑keychain via `keytar` (DSNs never exposed to renderer).

---

## ✅ MVP Checklist

- [ ] Import CSV/Excel/Parquet → create table in DuckDB
- [ ] Schema browser + SQL console
- [ ] Report canvas with draggable/resizable **VisualCard**
- [ ] Right pane with **Fields / Visualizations / Data** tabs
- [ ] Chart types: bar/line/area/pie + **Table** (AG Grid)
- [ ] Export PNG/PDF/CSV
- [ ] Save/Load project (JSON + `.duckdb`)
- [ ] Worker threads + cancellation for long queries

---

## 🧠 License

MIT License © 2025

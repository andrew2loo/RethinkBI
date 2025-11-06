# 🔌 IPC & Data Contracts — Renderer ⇄ Preload ⇄ Main

> This is the source of truth for types, channels, error handling, and worker protocol.

---

## 0) Assumptions

- Electron 37+; `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- DuckDB as the query engine; **Arrow** as the default result format.
- Long tasks run in **Worker Threads**.

---

## 1) Shared Types (`shared/types.ts`)

```ts
export type UUID = string;
export type Agg = "sum" | "avg" | "count" | "min" | "max" | "none";
export type OrderDir = "asc" | "desc";

export type ColumnDef = { name: string; type: string; nullable?: boolean };
export type TableDef = { name: string; columns: ColumnDef[] };

export type FilterOp = "=" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "in" | "between" | "is_null" | "is_not_null";
export type Filter = { col: string; op: FilterOp; value?: any | any[] };

export type VisualSelect = { col: string; agg?: Agg; as?: string };

export type QuerySpec =
  | { kind: "sql"; sql: string; params?: Record<string, unknown>; limit?: number }
  | {
      kind: "visual";
      table: string;
      select: VisualSelect[];
      filters?: Filter[];
      groupBy?: string[];
      orderBy?: Array<{ col: string; dir: OrderDir }>;
      limit?: number;
    };

export type ArrowIPC = ArrayBuffer;

export type PagedRows = {
  columns: string[];
  rows: unknown[][];
  nextCursor?: string;
  totalRows?: number;
};

export type QueryHandle = { id: UUID };
export type ImportResult = { table: string; rows: number; schema?: TableDef };

export type SourceDriver = "postgres" | "mssql" | "mysql";
export type ConnectionInfo = { id: UUID; driver: SourceDriver; name: string };

export type ProjectMeta = { name: string; version: number; lastSaved: string; path?: string };

export type ApiError = { code: string; message: string; details?: unknown };
```

Dataset imports:

```ts
export type DatasetImport =
  | { type: "csv"; path: string; options?: { header?: boolean; delim?: string; quote?: string; nullstr?: string } }
  | { type: "parquet"; path: string }
  | { type: "excel"; path: string; sheet?: string; range?: string }
  | { type: "json"; path: string }
  | { type: "database"; driver: SourceDriver; connId: UUID; sql: string };

export type CreateConnectionConfig = {
  driver: SourceDriver;
  name: string;
  dsn?: string;
  host?: string; port?: number; database?: string; user?: string; password?: string; ssl?: boolean;
};
```

---

## 2) Preload Bridge (`window.api`)

```ts
interface Bridge {
  getSchema(): Promise<{ tables: TableDef[] }>;

  runQuery(spec: QuerySpec, opts?: { arrow?: true; pageSize?: number }): Promise<ArrowIPC | PagedRows>;

  startQuery(spec: QuerySpec, opts?: { arrow?: true }): Promise<QueryHandle>;
  getQueryResult(handle: QueryHandle): Promise<ArrowIPC | PagedRows>;
  cancelQuery(handle: QueryHandle): Promise<{ cancelled: true }>;

  importData(ds: DatasetImport, targetTable?: string): Promise<ImportResult>;

  listConnections(): Promise<ConnectionInfo[]>;
  createConnection(cfg: CreateConnectionConfig): Promise<{ id: UUID }>;
  deleteConnection(id: UUID): Promise<{ ok: true }>;

  saveProject(): Promise<ProjectMeta>;
  loadProject(path: string): Promise<ProjectMeta>;
  getProjectMeta(): Promise<ProjectMeta>;

  exportAs(format: "png" | "pdf" | "csv" | "parquet", payload: ExportPayload): Promise<{ path: string }>;
  getStatus(): Promise<{ engine: "duckdb"; version: string; busy: boolean }>;
}
```

Export payload:

```ts
export type ExportPayload =
  | { kind: "visual"; visualId: UUID }
  | { kind: "dataset"; table: string; formatOptions?: { delimiter?: string } }
  | { kind: "report"; page?: number };
```

---

## 3) IPC Channel Names

```
app:getSchema
app:runQuery
app:startQuery
app:getQueryResult
app:cancelQuery
app:importData
app:listConnections
app:createConnection
app:deleteConnection
app:saveProject
app:loadProject
app:getProjectMeta
app:exportAs
app:getStatus
```

Minimal boot IPC (implemented in this scaffold):

```
app:getVersion
workspace:init
data:import
```

Errors are thrown as `ApiError` and normalized by preload.

**Error codes**

```
VALIDATION_ERROR
ENGINE_ERROR
QUERY_CANCELLED
NOT_FOUND
ALREADY_EXISTS
UNAUTHORIZED
IO_ERROR
UNSUPPORTED
INTERNAL
```

---

## 4) Workers Protocol

Main → Worker:
```ts
type WorkMessage =
  | { type: "EXECUTE_QUERY"; id: UUID; spec: QuerySpec; mode: "arrow" | "paged"; pageSize?: number }
  | { type: "CANCEL"; id: UUID };
```

Worker → Main:
```ts
type WorkResult =
  | { type: "PROGRESS"; id: UUID; pct: number; stage?: string }
  | { type: "RESULT_ARROW"; id: UUID; buffer: ArrayBuffer }
  | { type: "RESULT_PAGED"; id: UUID; result: PagedRows }
  | { type: "ERROR"; id: UUID; error: ApiError }
  | { type: "CANCELLED"; id: UUID };
```

Workers hold their own DuckDB connection; clean up on cancel/error.

---

## 5) DuckDB Rules & Imports

- Database file: `workspace/data/workspace.duckdb` (created on demand).
- CSV → `CREATE TABLE t AS SELECT * FROM read_csv_auto(path, ...)`
- Parquet → `CREATE TABLE t AS SELECT * FROM read_parquet(path)`
- Excel → load via Node reader → Arrow/CSV → `CREATE TABLE` in DuckDB
- External DB import: run user SQL on source → stream rows into DuckDB table.

---

## 6) Pagination

If `pageSize` is set, return `PagedRows` with `nextCursor`. Cursor is an opaque token managed by Main (e.g., base64 JSON with temp table + offset).

---

## 7) Project Format

```
workspace/
 ├─ project/
 │   ├─ project.json   # {name, version, createdAt, lastSaved}
 │   ├─ model.json     # tables, relationships, measures (simple)
 │   ├─ visuals.json   # array of VisualSpec
 │   └─ layout.json    # optional UI layout
 └─ data/workspace.duckdb
```

Sample `visuals.json` entry:

```json
{
  "id": "v-001",
  "title": "Sales by Region",
  "type": "bar",
  "table": "sales",
  "encoding": { "x": {"table":"sales","name":"region","type":"VARCHAR"}, "y": {"table":"sales","name":"amount","type":"DOUBLE"} },
  "aggregations": { "amount": "sum" },
  "filters": [],
  "layout": { "x": 0, "y": 0, "w": 6, "h": 4 }
}
```

---

## 8) Validation (zod)

All incoming payloads validated. Example:

```ts
const QuerySpecSchema = z.union([
  z.object({
    kind: z.literal("sql"),
    sql: z.string().min(1),
    params: z.record(z.any()).optional(),
    limit: z.number().int().positive().optional()
  }),
  z.object({
    kind: z.literal("visual"),
    table: z.string().min(1),
    select: z.array(z.object({ col: z.string(), agg: z.enum(["sum","avg","count","min","max","none"]).optional(), as: z.string().optional() })),
    filters: z.array(z.object({ col: z.string(), op: z.string(), value: z.any().optional() })).optional(),
    groupBy: z.array(z.string()).optional(),
    orderBy: z.array(z.object({ col: z.string(), dir: z.enum(["asc","desc"]) })).optional(),
    limit: z.number().int().positive().optional()
  })
]);
```

---

## 9) Acceptance Criteria (API)

- Control calls respond < 20ms.
- Arrow results decode via `apache-arrow` without copy errors.
- Cancelling always stops worker and frees resources.
- Errors use stable codes; stack traces logged only in Main.

import type { IpcMainInvokeEvent } from "electron";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import type {
  QuerySpec,
  ArrowIPC,
  PagedRows,
  QueryHandle,
  ImportResult,
  ConnectionInfo,
  ProjectMeta,
  ApiError,
  DatasetImport,
  CreateConnectionConfig,
  ExportPayload,
  TableDef
} from "../../../shared/types.js";
import { initDuckDB, queryArrow, queryRows, getSchema, getDuckDBConnection } from "../db/duckdb.js";
import { ensureWorkspace } from "../workspace.js";
import { saveProject as saveProjectStore, loadProject as loadProjectStore } from "../project/store.js";
import path from "node:path";
import fs from "node:fs/promises";

// Validation schemas
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
    select: z.array(z.object({
      col: z.string(),
      agg: z.enum(["sum", "avg", "count", "min", "max", "none"]).optional(),
      as: z.string().optional()
    })),
    filters: z.array(z.object({
      col: z.string(),
      op: z.string(),
      value: z.any().optional()
    })).optional(),
    groupBy: z.array(z.string()).optional(),
    orderBy: z.array(z.object({
      col: z.string(),
      dir: z.enum(["asc", "desc"])
    })).optional(),
    limit: z.number().int().positive().optional()
  })
]);

const DatasetImportSchema = z.union([
  z.object({
    type: z.literal("csv"),
    path: z.string(),
    options: z.object({
      header: z.boolean().optional(),
      delim: z.string().optional(),
      quote: z.string().optional(),
      nullstr: z.string().optional()
    }).optional()
  }),
  z.object({
    type: z.literal("parquet"),
    path: z.string()
  }),
  z.object({
    type: z.literal("excel"),
    path: z.string(),
    sheet: z.string().optional(),
    range: z.string().optional()
  }),
  z.object({
    type: z.literal("json"),
    path: z.string()
  }),
  z.object({
    type: z.literal("database"),
    driver: z.enum(["postgres", "mssql", "mysql"]),
    connId: z.string(),
    sql: z.string()
  })
]);

function createError(code: string, message: string, details?: unknown): ApiError {
  return { code, message, details };
}

function normalizeError(err: unknown): ApiError {
  if (err && typeof err === "object" && "code" in err && "message" in err) {
    return err as ApiError;
  }
  return createError("INTERNAL", err instanceof Error ? err.message : String(err));
}

// Query execution helpers
function buildSQLFromVisual(spec: Extract<QuerySpec, { kind: "visual" }>): string {
  const selects = spec.select.map(s => {
    const col = s.col;
    const agg = s.agg && s.agg !== "none" ? `${s.agg.toUpperCase()}(${col})` : col;
    return s.as ? `${agg} AS ${s.as}` : agg;
  }).join(", ");

  let sql = `SELECT ${selects} FROM ${spec.table}`;

  if (spec.filters && spec.filters.length > 0) {
    const conditions = spec.filters.map(f => {
      switch (f.op) {
        case "=": return `${f.col} = ?`;
        case "!=": return `${f.col} != ?`;
        case ">": return `${f.col} > ?`;
        case "<": return `${f.col} < ?`;
        case ">=": return `${f.col} >= ?`;
        case "<=": return `${f.col} <= ?`;
        case "contains": return `${f.col} LIKE ?`;
        case "is_null": return `${f.col} IS NULL`;
        case "is_not_null": return `${f.col} IS NOT NULL`;
        default: return "1=1";
      }
    });
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  if (spec.groupBy && spec.groupBy.length > 0) {
    sql += ` GROUP BY ${spec.groupBy.join(", ")}`;
  }

  if (spec.orderBy && spec.orderBy.length > 0) {
    const orders = spec.orderBy.map(o => `${o.col} ${o.dir.toUpperCase()}`);
    sql += ` ORDER BY ${orders.join(", ")}`;
  }

  if (spec.limit) {
    sql += ` LIMIT ${spec.limit}`;
  }

  return sql;
}

// IPC Handlers
export async function handleGetSchema(): Promise<{ tables: TableDef[] }> {
  try {
    const tables = await getSchema();
    return { tables };
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function handleRunQuery(
  _event: IpcMainInvokeEvent,
  spec: unknown,
  opts?: { arrow?: boolean; pageSize?: number }
): Promise<ArrowIPC | PagedRows> {
  try {
    const validated = QuerySpecSchema.parse(spec);
    
    let sql: string;
    let params: Record<string, unknown> | undefined;

    if (validated.kind === "sql") {
      sql = validated.sql;
      params = validated.params;
    } else {
      sql = buildSQLFromVisual(validated);
    }

    if (opts?.arrow !== false) {
      const buffer = await queryArrow(sql, params);
      return buffer;
    } else {
      const rows = await queryRows(sql, params);
      const columns = validated.kind === "visual"
        ? validated.select.map(s => s.as || s.col)
        : [];
      
      return {
        columns,
        rows,
        totalRows: rows.length
      };
    }
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function handleStartQuery(
  _event: IpcMainInvokeEvent,
  spec: unknown,
  opts?: { arrow?: boolean }
): Promise<QueryHandle> {
  // For MVP, we'll use a simple in-memory store
  // In production, this would use workers
  const id = uuidv4();
  // Store query in a map (in production, use proper worker management)
  return { id };
}

export async function handleGetQueryResult(
  _event: IpcMainInvokeEvent,
  handle: QueryHandle
): Promise<ArrowIPC | PagedRows> {
  // Placeholder - would retrieve from worker
  throw createError("NOT_FOUND", "Query result not found");
}

export async function handleCancelQuery(
  _event: IpcMainInvokeEvent,
  handle: QueryHandle
): Promise<{ cancelled: true }> {
  // Placeholder - would cancel worker
  return { cancelled: true };
}

export async function handleImportData(
  _event: IpcMainInvokeEvent,
  ds: unknown,
  targetTable?: string
): Promise<ImportResult> {
  try {
    const validated = DatasetImportSchema.parse(ds);
    const conn = await getDuckDBConnection();
    const tableName = targetTable || `import_${uuidv4().replace(/-/g, "_")}`;

    let sql: string;

    if (validated.type === "csv") {
      const opts = validated.options || {};
      const header = opts.header !== false ? "HEADER=1" : "";
      const delim = opts.delim ? `DELIMITER='${opts.delim}'` : "";
      sql = `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${validated.path}', ${header} ${delim})`;
    } else if (validated.type === "parquet") {
      sql = `CREATE TABLE ${tableName} AS SELECT * FROM read_parquet('${validated.path}')`;
    } else if (validated.type === "json") {
      sql = `CREATE TABLE ${tableName} AS SELECT * FROM read_json_auto('${validated.path}')`;
    } else {
      throw createError("UNSUPPORTED", `Import type ${validated.type} not yet implemented`);
    }

    return new Promise((resolve, reject) => {
      conn.run(sql, (err) => {
        if (err) {
          reject(normalizeError(err));
          return;
        }
        // Get row count
        conn.all(`SELECT COUNT(*) as cnt FROM ${tableName}`, {}, (err2, rows) => {
          if (err2) {
            reject(normalizeError(err2));
            return;
          }
          const count = (rows as Array<{ cnt: number }>)[0]?.cnt || 0;
          resolve({
            table: tableName,
            rows: count
          });
        });
      });
    });
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function handleListConnections(): Promise<ConnectionInfo[]> {
  // Placeholder - would read from storage
  return [];
}

export async function handleCreateConnection(
  _event: IpcMainInvokeEvent,
  cfg: unknown
): Promise<{ id: string }> {
  const validated = z.object({
    driver: z.enum(["postgres", "mssql", "mysql"]),
    name: z.string(),
    dsn: z.string().optional(),
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
    ssl: z.boolean().optional()
  }).parse(cfg);

  const id = uuidv4();
  // Store connection (placeholder)
  return { id };
}

export async function handleDeleteConnection(
  _event: IpcMainInvokeEvent,
  id: string
): Promise<{ ok: true }> {
  // Placeholder
  return { ok: true };
}

export async function handleSaveProject(): Promise<ProjectMeta> {
  const workspaceDir = await ensureWorkspace();
  const projectDir = path.join(workspaceDir, "project");
  
  // In a real implementation, we'd get the model state from the renderer
  // For now, we'll create a basic project structure
  const meta: ProjectMeta = {
    name: "Untitled Project",
    version: 1,
    lastSaved: new Date().toISOString(),
    path: projectDir
  };

  await saveProjectStore({
    name: meta.name,
    version: meta.version,
    createdAt: meta.lastSaved,
    lastSaved: meta.lastSaved,
    tables: [],
    visuals: []
  });

  return meta;
}

export async function handleLoadProject(
  _event: IpcMainInvokeEvent,
  projectPath: string
): Promise<ProjectMeta> {
  try {
    const store = await loadProjectStore(projectPath);
    return {
      name: store.name,
      version: store.version,
      lastSaved: store.lastSaved,
      path: projectPath
    };
  } catch (err) {
    throw createError("IO_ERROR", "Failed to load project", err);
  }
}

export async function handleGetProjectMeta(): Promise<ProjectMeta> {
  const workspace = await ensureWorkspace();
  const projectPath = path.join(workspace, "project", "project.json");
  
  try {
    const content = await fs.readFile(projectPath, "utf-8");
    return JSON.parse(content) as ProjectMeta;
  } catch {
    return {
      name: "Untitled Project",
      version: 1,
      lastSaved: new Date().toISOString()
    };
  }
}

export async function handleExportAs(
  _event: IpcMainInvokeEvent,
  format: "png" | "pdf" | "csv" | "parquet",
  payload: unknown
): Promise<{ path: string }> {
  // Placeholder
  throw createError("UNSUPPORTED", `Export format ${format} not yet implemented`);
}

export async function handleGetStatus(): Promise<{ engine: "duckdb"; version: string; busy: boolean }> {
  return {
    engine: "duckdb",
    version: "1.0.0",
    busy: false
  };
}

// Initialize DuckDB on module load
export async function initializeDatabase(): Promise<void> {
  const workspaceDir = await ensureWorkspace();
  const dbPath = path.join(workspaceDir, "data", "workspace.duckdb");
  await initDuckDB(dbPath);
}


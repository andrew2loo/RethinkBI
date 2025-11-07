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

export {};

declare global {
  interface Window {
    api: {
      getVersion: () => Promise<{ version: string }>;
      getSchema: () => Promise<{ tables: TableDef[] }>;
      runQuery: (spec: QuerySpec, opts?: { arrow?: boolean; pageSize?: number }) => Promise<ArrowIPC | PagedRows>;
      startQuery: (spec: QuerySpec, opts?: { arrow?: boolean }) => Promise<QueryHandle>;
      getQueryResult: (handle: QueryHandle) => Promise<ArrowIPC | PagedRows>;
      cancelQuery: (handle: QueryHandle) => Promise<{ cancelled: true }>;
      importData: (ds: DatasetImport, targetTable?: string) => Promise<ImportResult>;
      listConnections: () => Promise<ConnectionInfo[]>;
      createConnection: (cfg: CreateConnectionConfig) => Promise<{ id: string }>;
      deleteConnection: (id: string) => Promise<{ ok: true }>;
      saveProject: () => Promise<ProjectMeta>;
      loadProject: (path: string) => Promise<ProjectMeta>;
      getProjectMeta: () => Promise<ProjectMeta>;
      exportAs: (format: "png" | "pdf" | "csv" | "parquet", payload: ExportPayload) => Promise<{ path: string }>;
      getStatus: () => Promise<{ engine: "duckdb"; version: string; busy: boolean }>;
    };
  }
}

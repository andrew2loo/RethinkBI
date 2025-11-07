import { contextBridge, ipcRenderer } from "electron";
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
  ExportPayload
} from "../../shared/types.js";

function wrapError<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((err) => {
    const error: ApiError = err && typeof err === "object" && "code" in err
      ? err as ApiError
      : { code: "INTERNAL", message: err instanceof Error ? err.message : String(err) };
    throw error;
  });
}

const api = {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),

  getSchema: () => wrapError(ipcRenderer.invoke("app:getSchema")),

  runQuery: (spec: QuerySpec, opts?: { arrow?: boolean; pageSize?: number }): Promise<ArrowIPC | PagedRows> =>
    wrapError(ipcRenderer.invoke("app:runQuery", spec, opts)),

  startQuery: (spec: QuerySpec, opts?: { arrow?: boolean }): Promise<QueryHandle> =>
    wrapError(ipcRenderer.invoke("app:startQuery", spec, opts)),

  getQueryResult: (handle: QueryHandle): Promise<ArrowIPC | PagedRows> =>
    wrapError(ipcRenderer.invoke("app:getQueryResult", handle)),

  cancelQuery: (handle: QueryHandle): Promise<{ cancelled: true }> =>
    wrapError(ipcRenderer.invoke("app:cancelQuery", handle)),

  importData: (ds: DatasetImport, targetTable?: string): Promise<ImportResult> =>
    wrapError(ipcRenderer.invoke("app:importData", ds, targetTable)),

  listConnections: (): Promise<ConnectionInfo[]> =>
    wrapError(ipcRenderer.invoke("app:listConnections")),

  createConnection: (cfg: CreateConnectionConfig): Promise<{ id: string }> =>
    wrapError(ipcRenderer.invoke("app:createConnection", cfg)),

  deleteConnection: (id: string): Promise<{ ok: true }> =>
    wrapError(ipcRenderer.invoke("app:deleteConnection", id)),

  saveProject: (): Promise<ProjectMeta> =>
    wrapError(ipcRenderer.invoke("app:saveProject")),

  loadProject: (path: string): Promise<ProjectMeta> =>
    wrapError(ipcRenderer.invoke("app:loadProject", path)),

  getProjectMeta: (): Promise<ProjectMeta> =>
    wrapError(ipcRenderer.invoke("app:getProjectMeta")),

  exportAs: (format: "png" | "pdf" | "csv" | "parquet", payload: ExportPayload): Promise<{ path: string }> =>
    wrapError(ipcRenderer.invoke("app:exportAs", format, payload)),

  getStatus: (): Promise<{ engine: "duckdb"; version: string; busy: boolean }> =>
    wrapError(ipcRenderer.invoke("app:getStatus"))
};

declare global {
  interface Window {
    api: typeof api;
  }
}

contextBridge.exposeInMainWorld("api", api);

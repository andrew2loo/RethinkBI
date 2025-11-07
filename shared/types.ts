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
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
};

export type ExportPayload =
  | { kind: "visual"; visualId: UUID }
  | { kind: "dataset"; table: string; formatOptions?: { delimiter?: string } }
  | { kind: "report"; page?: number };

export type ColumnRef = { table: string; name: string; type: string };

export type VisualType = "bar" | "line" | "area" | "pie" | "table";

export interface VisualSpec {
  id: string;
  title: string;
  type: VisualType;
  table: string;
  encoding: { x?: ColumnRef; y?: ColumnRef; color?: ColumnRef; size?: ColumnRef; detail?: ColumnRef };
  aggregations?: Record<string, Agg>;
  filters?: Array<{ column: ColumnRef; op: "=" | "!=" | ">" | "<" | "contains"; value: any }>;
  layout: { x: number; y: number; w: number; h: number };
}

export interface ProjectModel {
  tables: Array<{ name: string; columns: ColumnRef[] }>;
  visuals: VisualSpec[];
  activeVisualId?: string;
}

export interface UIState {
  nav: "report" | "data" | "model";
  rightPaneOpen: boolean;
  rightPaneTab: "fields" | "viz" | "data";
}


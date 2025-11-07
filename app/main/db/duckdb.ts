import { tableFromArrays, tableToIPC } from "apache-arrow";
import type { ColumnDef, TableDef } from "../../../shared/types.js";
import path from "node:path";
import fs from "node:fs/promises";
let duckdbPkg: any;

async function loadDuckDB(): Promise<any> {
  if (!duckdbPkg) {
    duckdbPkg = await import("duckdb");
  }
  return duckdbPkg;
}

let db: any = null;
let connection: any = null;

export async function initDuckDB(dbPath: string): Promise<void> {
  if (db) return;

  // Ensure directory exists
  const dir = path.dirname(dbPath);
  await fs.mkdir(dir, { recursive: true });

  try {
    const pkg = await loadDuckDB();
    const DatabaseCtor =
      (pkg as any).Database ??
      (pkg as any).default?.Database ??
      (pkg as any).default;

    if (typeof DatabaseCtor !== "function") {
      throw new Error("DuckDB module missing Database export");
    }

    db = new DatabaseCtor(dbPath);
    connection = db.connect();
  } catch (err) {
    // If native module isn't available (packaged without rebuild), leave db null
    // and let callers receive a clear error when they attempt to use it.
    db = null;
    connection = null;
    throw err;
  }
}

export async function getDuckDBConnection(): Promise<any> {
  if (!db || !connection) {
    throw new Error("DuckDB not initialized. Call initDuckDB first.");
  }
  return connection;
}

export async function queryArrow(sql: string, params?: Record<string, unknown>): Promise<ArrayBuffer> {
  const conn = await getDuckDBConnection();
  
  return new Promise((resolve, reject) => {
    conn.all(sql, params || {}, (err: unknown, rows: any) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        if (!rows || rows.length === 0) {
          // Return empty Arrow table with proper schema
          // Create a minimal table structure
          const emptyTable = tableFromArrays({ _empty: [] });
          const buffer = tableToIPC(emptyTable);
          resolve(new Uint8Array(buffer).buffer);
          return;
        }

        // Convert rows to Arrow format
        const firstRow = rows[0] as Record<string, unknown>;
        const columns = Object.keys(firstRow);
        
        // Build arrays for each column
        const columnArrays: Record<string, unknown[]> = {};
        for (const col of columns) {
          columnArrays[col] = (rows as Record<string, unknown>[]).map(row => row[col]);
        }

        const arrowTable = tableFromArrays(columnArrays);
        const buffer = tableToIPC(arrowTable);
        resolve(new Uint8Array(buffer).buffer);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export async function queryRows(sql: string, params?: Record<string, unknown>): Promise<unknown[][]> {
  const conn = await getDuckDBConnection();
  
  return new Promise((resolve, reject) => {
    conn.all(sql, params || {}, (err: unknown, rows: any) => {
      if (err) {
        reject(err);
        return;
      }
      // Convert to array of arrays
      const result = rows as Record<string, unknown>[];
      if (result.length === 0) {
        resolve([]);
        return;
      }
      const columns = Object.keys(result[0]);
      const rowArrays = result.map(row => columns.map(col => row[col]));
      resolve(rowArrays);
    });
  });
}

export async function getSchema(): Promise<TableDef[]> {
  const conn = await getDuckDBConnection();
  
  return new Promise((resolve, reject) => {
    conn.all(
      `SELECT table_name, column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'main'
       ORDER BY table_name, ordinal_position`,
      {},
      (err: unknown, rows: Array<{ table_name: string; column_name: string; data_type: string; is_nullable: string }>) => {
        if (err) {
          reject(err);
          return;
        }
        
        const tables = new Map<string, TableDef>();
        
        for (const row of rows as Array<{ table_name: string; column_name: string; data_type: string; is_nullable: string }>) {
          if (!tables.has(row.table_name)) {
            tables.set(row.table_name, {
              name: row.table_name,
              columns: []
            });
          }
          
          const table = tables.get(row.table_name)!;
          table.columns.push({
            name: row.column_name,
            type: row.data_type,
            nullable: row.is_nullable === "YES"
          });
        }
        
        resolve(Array.from(tables.values()));
      }
    );
  });
}

export async function closeDuckDB(): Promise<void> {
  if (connection) {
    connection.close();
    connection = null;
  }
  if (db) {
    db.close();
    db = null;
  }
}


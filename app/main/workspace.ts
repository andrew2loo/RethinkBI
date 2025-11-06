import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export async function ensureWorkspace(): Promise<string> {
  const base = path.join(process.cwd(), "workspace", "data");
  await fs.mkdir(base, { recursive: true });
  const dbPath = path.join(base, "workspace.duckdb");
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, "");
  }
  return path.join(process.cwd(), "workspace");
}



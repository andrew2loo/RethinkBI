import type { IpcMain } from "electron";
import { z } from "zod";
import { ensureWorkspace } from "./workspace.js";

const ImportRequest = z.object({
  type: z.enum(["csv", "parquet", "excel", "json"]).optional(),
  filePath: z.string()
});

export function registerIpc(ipcMain: IpcMain): void {
  ipcMain.handle("app:getVersion", () => {
    return { version: process.versions.electron };
  });

  ipcMain.handle("workspace:init", async () => {
    const dir = await ensureWorkspace();
    return { workspaceDir: dir };
  });

  ipcMain.handle("data:import", async (_e, raw) => {
    const parsed = ImportRequest.safeParse(raw);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }
    // Placeholder: wire DuckDB ingestion here in future
    return { ok: true } as const;
  });
}



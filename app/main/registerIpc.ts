import type { IpcMain } from "electron";
import {
  handleGetSchema,
  handleRunQuery,
  handleStartQuery,
  handleGetQueryResult,
  handleCancelQuery,
  handleImportData,
  handleListConnections,
  handleCreateConnection,
  handleDeleteConnection,
  handleSaveProject,
  handleLoadProject,
  handleGetProjectMeta,
  handleExportAs,
  handleGetStatus,
  initializeDatabase
} from "./ipc/handlers.js";

export async function registerIpc(ipcMain: IpcMain): Promise<void> {
  // Initialize DuckDB
  await initializeDatabase();

  // Register all IPC handlers
  ipcMain.handle("app:getVersion", () => {
    return { version: process.versions.electron };
  });

  ipcMain.handle("app:getSchema", handleGetSchema);
  ipcMain.handle("app:runQuery", handleRunQuery);
  ipcMain.handle("app:startQuery", handleStartQuery);
  ipcMain.handle("app:getQueryResult", handleGetQueryResult);
  ipcMain.handle("app:cancelQuery", handleCancelQuery);
  ipcMain.handle("app:importData", handleImportData);
  ipcMain.handle("app:listConnections", handleListConnections);
  ipcMain.handle("app:createConnection", handleCreateConnection);
  ipcMain.handle("app:deleteConnection", handleDeleteConnection);
  ipcMain.handle("app:saveProject", handleSaveProject);
  ipcMain.handle("app:loadProject", handleLoadProject);
  ipcMain.handle("app:getProjectMeta", handleGetProjectMeta);
  ipcMain.handle("app:exportAs", handleExportAs);
  ipcMain.handle("app:getStatus", handleGetStatus);
}



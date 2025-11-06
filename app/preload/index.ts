import { contextBridge, ipcRenderer } from "electron";

const api = {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  initWorkspace: () => ipcRenderer.invoke("workspace:init"),
  importData: (req: { type?: "csv" | "parquet" | "excel" | "json"; filePath: string }) =>
    ipcRenderer.invoke("data:import", req)
};

declare global {
  interface Window {
    api: typeof api;
  }
}

contextBridge.exposeInMainWorld("api", api);



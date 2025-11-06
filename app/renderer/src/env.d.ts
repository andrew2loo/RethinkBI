export {};

declare global {
  interface Window {
    api: {
      getVersion: () => Promise<{ version: string }>;
      initWorkspace: () => Promise<{ workspaceDir: string }>;
      importData: (req: { type?: "csv" | "parquet" | "excel" | "json"; filePath: string }) => Promise<{ ok: true }>;
    };
  }
}



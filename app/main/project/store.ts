import fs from "node:fs/promises";
import path from "node:path";
import type { VisualSpec, ProjectModel } from "../../../shared/types.js";
import { ensureWorkspace } from "../workspace.js";

export interface ProjectStore {
  name: string;
  version: number;
  createdAt: string;
  lastSaved: string;
  tables: ProjectModel["tables"];
  visuals: VisualSpec[];
}

export async function saveProject(store: ProjectStore): Promise<void> {
  const workspaceDir = await ensureWorkspace();
  const projectDir = path.join(workspaceDir, "project");
  await fs.mkdir(projectDir, { recursive: true });

  const projectJson = {
    name: store.name,
    version: store.version,
    createdAt: store.createdAt,
    lastSaved: new Date().toISOString()
  };

  const modelJson = {
    tables: store.tables,
    visuals: store.visuals
  };

  await fs.writeFile(
    path.join(projectDir, "project.json"),
    JSON.stringify(projectJson, null, 2)
  );

  await fs.writeFile(
    path.join(projectDir, "model.json"),
    JSON.stringify(modelJson, null, 2)
  );

  await fs.writeFile(
    path.join(projectDir, "visuals.json"),
    JSON.stringify(store.visuals, null, 2)
  );
}

export async function loadProject(projectPath: string): Promise<ProjectStore> {
  const projectJsonPath = path.join(projectPath, "project.json");
  const modelJsonPath = path.join(projectPath, "model.json");
  const visualsJsonPath = path.join(projectPath, "visuals.json");

  const [projectContent, modelContent, visualsContent] = await Promise.all([
    fs.readFile(projectJsonPath, "utf-8"),
    fs.readFile(modelJsonPath, "utf-8"),
    fs.readFile(visualsJsonPath, "utf-8")
  ]);

  const project = JSON.parse(projectContent);
  const model = JSON.parse(modelContent);
  const visuals = JSON.parse(visualsContent);

  return {
    name: project.name,
    version: project.version,
    createdAt: project.createdAt,
    lastSaved: project.lastSaved,
    tables: model.tables,
    visuals
  };
}


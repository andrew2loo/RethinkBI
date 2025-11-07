import { create } from "zustand";
import type { VisualSpec, ProjectModel, ColumnRef, Agg } from "../../../shared/types.js";

interface ModelState extends ProjectModel {
  addVisual: (type: VisualSpec["type"], table: string) => void;
  updateVisual: (id: string, patch: Partial<VisualSpec>) => void;
  selectVisual: (id: string | undefined) => void;
  removeVisual: (id: string) => void;
  setEncoding: (id: string, encoding: Partial<VisualSpec["encoding"]>) => void;
  setFilters: (id: string, filters: VisualSpec["filters"]) => void;
  setLayout: (id: string, layout: VisualSpec["layout"]) => void;
  setTables: (tables: ProjectModel["tables"]) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  tables: [],
  visuals: [],
  activeVisualId: undefined,

  addVisual: (type, table) => {
    const id = `visual-${Date.now()}`;
    const newVisual: VisualSpec = {
      id,
      title: `New ${type}`,
      type,
      table,
      encoding: {},
      layout: { x: 0, y: 0, w: 6, h: 4 }
    };
    set((state) => ({
      visuals: [...state.visuals, newVisual],
      activeVisualId: id
    }));
  },

  updateVisual: (id, patch) => {
    set((state) => ({
      visuals: state.visuals.map((v) => (v.id === id ? { ...v, ...patch } : v))
    }));
  },

  selectVisual: (id) => {
    set({ activeVisualId: id });
  },

  removeVisual: (id) => {
    set((state) => ({
      visuals: state.visuals.filter((v) => v.id !== id),
      activeVisualId: state.activeVisualId === id ? undefined : state.activeVisualId
    }));
  },

  setEncoding: (id, encoding) => {
    set((state) => ({
      visuals: state.visuals.map((v) =>
        v.id === id ? { ...v, encoding: { ...v.encoding, ...encoding } } : v
      )
    }));
  },

  setFilters: (id, filters) => {
    set((state) => ({
      visuals: state.visuals.map((v) => (v.id === id ? { ...v, filters } : v))
    }));
  },

  setLayout: (id, layout) => {
    set((state) => ({
      visuals: state.visuals.map((v) => (v.id === id ? { ...v, layout } : v))
    }));
  },

  setTables: (tables) => {
    set({ tables });
  }
}));


import { create } from "zustand";
import type { UIState } from "../../../shared/types.js";

interface UIStore extends UIState {
  setNav: (nav: UIState["nav"]) => void;
  setRightPaneOpen: (open: boolean) => void;
  setRightPaneTab: (tab: UIState["rightPaneTab"]) => void;
  toggleRightPane: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  nav: "report",
  rightPaneOpen: true,
  rightPaneTab: "fields",

  setNav: (nav) => set({ nav }),
  setRightPaneOpen: (open) => set({ rightPaneOpen: open }),
  setRightPaneTab: (tab) => set({ rightPaneTab: tab }),
  toggleRightPane: () => set((state) => ({ rightPaneOpen: !state.rightPaneOpen }))
}));


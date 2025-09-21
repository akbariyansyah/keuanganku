import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

type UiState = {
  sidebarOpen: boolean;
  theme: Theme;
  chartInterval: string; // days, e.g., "7", "30", "90"
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setChartInterval: (interval: string) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "light",
      chartInterval: "7",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setChartInterval: (chartInterval) => set({ chartInterval }),
    }),
    { name: "ui-store" }
  )
);


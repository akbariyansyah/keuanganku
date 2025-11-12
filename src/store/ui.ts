import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CurrencyCode, DEFAULT_CURRENCY } from "@/utils/currency";
import { DEFAULT_LANGUAGE, LanguageCode } from "@/constant/language";

type Theme = "light" | "dark";

type UiState = {
  // Field
  sidebarOpen: boolean;
  theme: Theme;
  chartInterval: string; // days, e.g., "7", "30", "90"
  currency: CurrencyCode;
  language: LanguageCode;
  // Method
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setChartInterval: (interval: string) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: LanguageCode) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "light",
      chartInterval: "7",
      currency: DEFAULT_CURRENCY,
      language: DEFAULT_LANGUAGE,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setChartInterval: (chartInterval) => set({ chartInterval }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
    }),
    { name: "ui-store" }
  )
);

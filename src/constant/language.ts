export type LanguageCode = "en" | "id";

export type SidebarLinkKey =
  | "dashboard"
  | "transactions"
  | "investment"
  | "investmentCategories"
  | "investmentPortfolio"
  | "investmentPortfolioAdd"
  | "investmentPerformance"
  | "journal"
  | "settings";

type SettingsTranslation = {
  title: string;
  sections: {
    currency: string;
    theme: string;
    language: string;
  };
};

type SidebarTranslation = {
  nav: Record<SidebarLinkKey, string>;
};

type LanguagePack = {
  displayName: string;
  settings: SettingsTranslation;
  sidebar: SidebarTranslation;
};

export const LANGUAGE_MAP: Record<LanguageCode, LanguagePack> = {
  en: {
    displayName: "English",
    settings: {
      title: "Settings",
      sections: {
        currency: "Currency",
        theme: "Theme",
        language: "Language",
      },
    },
    sidebar: {
      nav: {
        dashboard: "Dashboard",
        transactions: "Transactions",
        investment: "Investment",
        investmentCategories: "Categories",
        investmentPortfolio: "Portfolio",
        investmentPortfolioAdd: "Portfolio Add",
        investmentPerformance: "Performance",
        journal: "Journal",
        settings: "Settings",
      },
    },
  },
  id: {
    displayName: "Indonesia",
    settings: {
      title: "Pengaturan",
      sections: {
        currency: "Mata Uang",
        theme: "Tema",
        language: "Bahasa",
      },
    },
    sidebar: {
      nav: {
        dashboard: "Dasbor",
        transactions: "Transaksi",
        investment: "Investasi",
        investmentCategories: "Kategori",
        investmentPortfolio: "Portofolio",
        investmentPortfolioAdd: "Tambah Portofolio",
        investmentPerformance: "Performa",
        journal: "Jurnal",
        settings: "Pengaturan",
      },
    },
  },
};

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const LANGUAGE_OPTIONS = [
  { code: "en", label: LANGUAGE_MAP.en.displayName },
  { code: "id", label: LANGUAGE_MAP.id.displayName },
] as const;

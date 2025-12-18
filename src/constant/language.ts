import { Transaction } from '@/types/transaction';

export type LanguageCode = 'en' | 'id';

export type SidebarLinkKey =
  | 'dashboard'
  | 'transactions'
  | 'transactionList'
  | 'anomaly'
  | 'investment'
  | 'investmentCategories'
  | 'investmentPortfolio'
  | 'investmentPortfolioAdd'
  | 'investmentPerformance'
  | 'journal'
  | 'settings';

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

type TransactionTranslation = {
  modal: {
    addTitle: string;
    editTitle: string;
    transactionType: string;
    amount: string;
    date: string;
    category: string;
    notes: string;
    saveButton: string;
    cancelButton: string;
  };
};

type LanguagePack = {
  displayName: string;
  settings: SettingsTranslation;
  sidebar: SidebarTranslation;
  transactions: TransactionTranslation;
};

export const LANGUAGE_MAP: Record<LanguageCode, LanguagePack> = {
  en: {
    displayName: 'English',
    settings: {
      title: 'Settings',
      sections: {
        currency: 'Currency',
        theme: 'Theme',
        language: 'Language',
      },
    },
    transactions: {
      modal: {
        addTitle: 'Add Transaction',
        editTitle: 'Edit Transaction',
        // Modal fields
        transactionType: 'Type',
        amount: 'Amount',
        date: 'Date',
        category: 'Category',
        notes: 'Notes',
        saveButton: 'Save',
        cancelButton: 'Cancel',
      },
    },
    sidebar: {
      nav: {
        dashboard: 'Dashboard',
        transactions: 'Transactions',
        transactionList: 'Transaction List',
        anomaly: 'Anomaly',
        investment: 'Investment',
        investmentCategories: 'Categories',
        investmentPortfolio: 'Portfolio',
        investmentPortfolioAdd: 'Portfolio Add',
        investmentPerformance: 'Performance',
        journal: 'Journal',
        settings: 'Settings',
      },
    },
  },
  id: {
    displayName: 'Indonesia',
    settings: {
      title: 'Pengaturan',
      sections: {
        currency: 'Mata Uang',
        theme: 'Tema',
        language: 'Bahasa',
      },
    },
    transactions: {
      modal: {
        addTitle: 'Tambah Transaksi',
        editTitle: 'Ubah Transaksi',
        // Modal fields
        transactionType: 'Tipe',
        amount: 'Jumlah',
        date: 'Waktu',
        category: 'Kategori',
        notes: 'Deskripsi',
        saveButton: 'Simpan',
        cancelButton: 'Batal',
      },
    },
    sidebar: {
      nav: {
        dashboard: 'Dasbor',
        transactions: 'Transaksi',
        transactionList: 'Daftar Transaksi',
        investment: 'Investasi',
        anomaly: 'Anomali',
        investmentCategories: 'Kategori',
        investmentPortfolio: 'Portofolio',
        investmentPortfolioAdd: 'Tambah Portofolio',
        investmentPerformance: 'Performa',
        journal: 'Jurnal',
        settings: 'Pengaturan',
      },
    },
  },
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: LANGUAGE_MAP.en.displayName },
  { code: 'id', label: LANGUAGE_MAP.id.displayName },
] as const;

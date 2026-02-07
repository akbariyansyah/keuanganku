export type LanguageCode = 'en' | 'id';

export type SidebarLinkKey =
  | 'dashboard'
  | 'transactions'
  | 'transactionList'
  | 'budget'
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

type AuthTranslation = {
  login: {
    title: string;
    email: string;
    password: string;
    loginButton: string;
    loginSuccess: string;
    loginFailed: string;
    noAccount: string;
    createNow: string;
  };
  register: {
    title: string;
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    registerButton: string;
    registerSuccess: string;
    registerFailed: string;
    haveAccount: string;
    loginNow: string;
    passwordMismatch: string;
  };
};

type ProfileTranslation = {
  editProfile: {
    title: string;
    description: string;
    name: string;
    username: string;
    email: string;
    saveButton: string;
    savingButton: string;
    cancelButton: string;
    updateSuccess: string;
    updateFailed: string;
  };
  account: string;
  logout: string;
};

type TransactionTranslation = {
  modal: {
    addTitle: string;
    editTitle: string;
    description: string;
    transactionType: string;
    amount: string;
    date: string;
    category: string;
    notes: string;
    saveButton: string;
    cancelButton: string;
  };
  table: {
    no: string;
    transactionId: string;
    type: string;
    category: string;
    tags: string;
    description: string;
    createdAt: string;
    amount: string;
    selectAll: string;
    selectRow: string;
    actions: string;
  };
  actions: {
    view: string;
    delete: string;
    deleteConfirm: string;
    deleteSuccess: string;
    deleteFailed: string;
  };
  placeholders: {
    selectType: string;
    selectCategory: string;
    amount: string;
    description: string;
  };
};

type BudgetTranslation = {
  addPage: {
    title: string;
    description: string;
    budgetMonth: string;
    categoryAllocations: string;
    selectCategory: string;
    expenseCategory: string;
    budgetAmount: string;
    addCategory: string;
    saveBudget: string;
    saving: string;
    back: string;
  };
  summary: {
    title: string;
    category: string;
    categories: string;
    totalBudget: string;
    appliedTo: string;
  };
};

type DashboardTranslation = {
  greeting: string;
  metrics: {
    todaySpending: string;
    weekSpending: string;
    monthSpending: string;
    totalTransaction: string;
    yesterday: string;
    lastWeek: string;
    lastMonth: string;
  };
  charts: {
    income: string;
    trueExpenses: string;
    cashflow: string;
    incomeDescription: string;
    expensesDescription: string;
    cashflowDescription: string;
    loadError: string;
    noData: string;
  };
};

type JournalTranslation = {
  title: string;
  description: string;
};

type UnauthorizedTranslation = {
  title: string;
  description: string;
  goToLogin: string;
};

type CommonTranslation = {
  confirmation: {
    areYouSure: string;
    cancel: string;
    yes: string;
    pleaseWait: string;
  };
};

type LanguagePack = {
  displayName: string;
  settings: SettingsTranslation;
  sidebar: SidebarTranslation;
  auth: AuthTranslation;
  profile: ProfileTranslation;
  transactions: TransactionTranslation;
  budget: BudgetTranslation;
  dashboard: DashboardTranslation;
  journal: JournalTranslation;
  unauthorized: UnauthorizedTranslation;
  common: CommonTranslation;
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
    sidebar: {
      nav: {
        dashboard: 'Dashboard',
        transactions: 'Transactions',
        transactionList: 'Transaction List',
        budget: 'Budget',
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
    auth: {
      login: {
        title: 'Sign in to your account',
        email: 'Email',
        password: 'Password',
        loginButton: 'Login',
        loginSuccess: 'Login successful!',
        loginFailed: 'Login failed',
        noAccount: "Don't have an account?",
        createNow: 'Create Now',
      },
      register: {
        title: 'Create new account',
        fullName: 'Full Name',
        email: 'Email',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        registerButton: 'Register',
        registerSuccess: 'Register successful!',
        registerFailed: 'Register failed',
        haveAccount: 'Already have an account?',
        loginNow: 'Login Now',
        passwordMismatch: 'Password and Confirm Password do not match',
      },
    },
    profile: {
      editProfile: {
        title: 'Edit profile',
        description:
          "Make changes to your profile here. Click save when you're done.",
        name: 'Name',
        username: 'Username',
        email: 'Email',
        saveButton: 'Save changes',
        savingButton: 'Saving...',
        cancelButton: 'Cancel',
        updateSuccess: 'Profile updated successfully',
        updateFailed: 'Failed to update profile',
      },
      account: 'Account',
      logout: 'Log out',
    },
    transactions: {
      modal: {
        addTitle: 'Add Transaction',
        editTitle: 'Edit Transaction',
        description: 'Record your transaction here.',
        transactionType: 'Type',
        amount: 'Amount',
        date: 'Transaction Time',
        category: 'Category',
        notes: 'Description',
        saveButton: 'Save',
        cancelButton: 'Cancel',
      },
      table: {
        no: 'No',
        transactionId: 'Transaction ID',
        type: 'Type',
        category: 'Category',
        tags: 'Tags',
        description: 'Description',
        createdAt: 'Created At',
        amount: 'Amount',
        selectAll: 'Select all',
        selectRow: 'Select row',
        actions: 'Open menu',
      },
      actions: {
        view: 'View',
        delete: 'Delete',
        deleteConfirm: 'Are you sure you want to delete this transaction?',
        deleteSuccess: 'Transaction deleted successfully',
        deleteFailed: 'Failed to delete transaction',
      },
      placeholders: {
        selectType: 'Select type',
        selectCategory: 'Select category',
        amount: 'Amount',
        description: 'Description',
      },
    },
    budget: {
      addPage: {
        title: 'Add Budget Allocation',
        description: 'Set your budget limits for each expense category',
        budgetMonth: 'Budget Month',
        categoryAllocations: 'Category Allocations',
        selectCategory: 'Select Category',
        expenseCategory: 'Expense Category',
        budgetAmount: 'Budget Amount',
        addCategory: 'Add Category',
        saveBudget: 'Save Budget',
        saving: 'Saving...',
        back: 'Back',
      },
      summary: {
        title: 'Summary',
        category: 'category',
        categories: 'categories',
        totalBudget: 'Total Budget',
        appliedTo: 'This budget will be applied to',
      },
    },
    dashboard: {
      greeting: 'Hi',
      metrics: {
        todaySpending: "Today's Spending",
        weekSpending: 'This Week Spending',
        monthSpending: 'This Month Spending',
        totalTransaction: 'Total Transaction',
        yesterday: 'yesterday',
        lastWeek: 'last week',
        lastMonth: 'last month',
      },
      charts: {
        income: 'Income',
        trueExpenses: 'True Expenses',
        cashflow: 'Cashflow',
        incomeDescription: 'All incoming transactions per month.',
        expensesDescription: 'Spending excluding saving category.',
        cashflowDescription: 'Income minus true expenses.',
        loadError: 'Failed to load cashflow overtime',
        noData: 'No cashflow activity recorded for the monitored months.',
      },
    },
    journal: {
      title: 'Journal',
      description:
        'Welcome to your journal! Here you can document your thoughts and experiences.',
    },
    unauthorized: {
      title: 'Unauthorized Access',
      description: '401',
      goToLogin: 'Go to Login',
    },
    common: {
      confirmation: {
        areYouSure: 'Are you absolutely sure?',
        cancel: 'Cancel',
        yes: 'Yes',
        pleaseWait: 'please wait...',
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
    sidebar: {
      nav: {
        dashboard: 'Dasbor',
        transactions: 'Transaksi',
        transactionList: 'Daftar Transaksi',
        budget: 'Anggaran',
        anomaly: 'Anomali',
        investment: 'Investasi',
        investmentCategories: 'Kategori',
        investmentPortfolio: 'Portofolio',
        investmentPortfolioAdd: 'Tambah Portofolio',
        investmentPerformance: 'Performa',
        journal: 'Jurnal',
        settings: 'Pengaturan',
      },
    },
    auth: {
      login: {
        title: 'Masuk ke akun Anda',
        email: 'Email',
        password: 'Kata Sandi',
        loginButton: 'Masuk',
        loginSuccess: 'Berhasil masuk!',
        loginFailed: 'Gagal masuk',
        noAccount: 'Belum punya akun?',
        createNow: 'Buat Sekarang',
      },
      register: {
        title: 'Buat akun baru',
        fullName: 'Nama Lengkap',
        email: 'Email',
        username: 'Nama Pengguna',
        password: 'Kata Sandi',
        confirmPassword: 'Konfirmasi Kata Sandi',
        registerButton: 'Daftar',
        registerSuccess: 'Berhasil mendaftar!',
        registerFailed: 'Gagal mendaftar',
        haveAccount: 'Sudah punya akun?',
        loginNow: 'Masuk Sekarang',
        passwordMismatch: 'Kata Sandi dan Konfirmasi Kata Sandi tidak cocok',
      },
    },
    profile: {
      editProfile: {
        title: 'Ubah profil',
        description:
          'Ubah profil Anda di sini. Klik simpan jika sudah selesai.',
        name: 'Nama',
        username: 'Nama Pengguna',
        email: 'Email',
        saveButton: 'Simpan perubahan',
        savingButton: 'Menyimpan...',
        cancelButton: 'Batal',
        updateSuccess: 'Profil berhasil diperbarui',
        updateFailed: 'Gagal memperbarui profil',
      },
      account: 'Akun',
      logout: 'Keluar',
    },
    transactions: {
      modal: {
        addTitle: 'Tambah Transaksi',
        editTitle: 'Ubah Transaksi',
        description: 'Catat transaksi Anda di sini.',
        transactionType: 'Tipe',
        amount: 'Jumlah',
        date: 'Waktu Transaksi',
        category: 'Kategori',
        notes: 'Deskripsi',
        saveButton: 'Simpan',
        cancelButton: 'Batal',
      },
      table: {
        no: 'No',
        transactionId: 'ID Transaksi',
        type: 'Tipe',
        category: 'Kategori',
        tags: 'Tag',
        description: 'Deskripsi',
        createdAt: 'Dibuat Pada',
        amount: 'Jumlah',
        selectAll: 'Pilih semua',
        selectRow: 'Pilih baris',
        actions: 'Buka menu',
      },
      actions: {
        view: 'Lihat',
        delete: 'Hapus',
        deleteConfirm: 'Yakin ingin menghapus transaksi ini?',
        deleteSuccess: 'Transaksi berhasil dihapus',
        deleteFailed: 'Gagal menghapus transaksi',
      },
      placeholders: {
        selectType: 'Pilih tipe',
        selectCategory: 'Pilih kategori',
        amount: 'Jumlah',
        description: 'Deskripsi',
      },
    },
    budget: {
      addPage: {
        title: 'Tambah Alokasi Anggaran',
        description: 'Tetapkan batas anggaran untuk setiap kategori pengeluaran',
        budgetMonth: 'Bulan Anggaran',
        categoryAllocations: 'Alokasi Kategori',
        selectCategory: 'Pilih Kategori',
        expenseCategory: 'Kategori Pengeluaran',
        budgetAmount: 'Jumlah Anggaran',
        addCategory: 'Tambah Kategori',
        saveBudget: 'Simpan Anggaran',
        saving: 'Menyimpan...',
        back: 'Kembali',
      },
      summary: {
        title: 'Ringkasan',
        category: 'kategori',
        categories: 'kategori',
        totalBudget: 'Total Anggaran',
        appliedTo: 'Anggaran ini akan diterapkan pada',
      },
    },
    dashboard: {
      greeting: 'Hai',
      metrics: {
        todaySpending: 'Pengeluaran Hari Ini',
        weekSpending: 'Pengeluaran Minggu Ini',
        monthSpending: 'Pengeluaran Bulan Ini',
        totalTransaction: 'Total Transaksi',
        yesterday: 'kemarin',
        lastWeek: 'minggu lalu',
        lastMonth: 'bulan lalu',
      },
      charts: {
        income: 'Pemasukan',
        trueExpenses: 'Pengeluaran Riil',
        cashflow: 'Arus Kas',
        incomeDescription: 'Semua transaksi masuk per bulan.',
        expensesDescription: 'Pengeluaran tidak termasuk kategori tabungan.',
        cashflowDescription: 'Pemasukan dikurangi pengeluaran riil.',
        loadError: 'Gagal memuat arus kas',
        noData: 'Tidak ada aktivitas arus kas yang tercatat.',
      },
    },
    journal: {
      title: 'Jurnal',
      description:
        'Selamat datang di jurnal Anda! Di sini Anda dapat mendokumentasikan pikiran dan pengalaman Anda.',
    },
    unauthorized: {
      title: 'Akses Tidak Sah',
      description: '401',
      goToLogin: 'Ke Halaman Login',
    },
    common: {
      confirmation: {
        areYouSure: 'Apakah Anda yakin?',
        cancel: 'Batal',
        yes: 'Ya',
        pleaseWait: 'mohon tunggu...',
      },
    },
  },
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: LANGUAGE_MAP.en.displayName },
  { code: 'id', label: LANGUAGE_MAP.id.displayName },
] as const;

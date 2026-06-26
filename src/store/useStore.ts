import { create } from 'zustand';
import type { Transaction, Category, Account, TransactionFormData } from '@/types';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  getCategoriesByType,
  addCategory,
  updateCategory,
  deleteCategory,
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  getAccountBalance,
  getTotalAssets,
} from '@/lib/db';

interface AppState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  initTheme: () => void;

  // Transactions
  transactions: Transaction[];
  loadTransactions: () => void;
  addTransaction: (data: TransactionFormData) => Transaction;
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => Transaction | null;
  deleteTransaction: (id: string) => boolean;

  // Categories
  categories: Category[];
  loadCategories: () => void;
  getExpenseCategories: () => Category[];
  getIncomeCategories: () => Category[];
  addCategory: (data: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => Category | null;
  deleteCategory: (id: string) => boolean;

  // Accounts
  accounts: Account[];
  loadAccounts: () => void;
  addAccount: (data: Omit<Account, 'id'>) => Account;
  updateAccount: (id: string, data: Partial<Omit<Account, 'id'>>) => Account | null;
  deleteAccount: (id: string) => boolean;
  getAccountBalance: (accountId: string) => number;
  getTotalAssets: () => number;

  // UI
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  showTransactionForm: boolean;
  setShowTransactionForm: (show: boolean) => void;
  showVoiceInput: boolean;
  setShowVoiceInput: (show: boolean) => void;
  voiceAutoRecord: boolean;
  setVoiceAutoRecord: (v: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Theme
  darkMode: false,
  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    localStorage.setItem('icost_darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  },
  initTheme: () => {
    const stored = localStorage.getItem('icost_darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored !== null ? stored === 'true' : prefersDark;
    set({ darkMode: dark });
    document.documentElement.classList.toggle('dark', dark);
  },

  // Transactions
  transactions: [],
  loadTransactions: () => set({ transactions: getTransactions() }),
  addTransaction: (data: TransactionFormData) => {
    const t = addTransaction(data);
    get().loadTransactions();
    return t;
  },
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => {
    const result = updateTransaction(id, data);
    if (result) get().loadTransactions();
    return result;
  },
  deleteTransaction: (id: string) => {
    const result = deleteTransaction(id);
    if (result) get().loadTransactions();
    return result;
  },

  // Categories
  categories: [],
  loadCategories: () => set({ categories: getCategories() }),
  getExpenseCategories: () => getCategoriesByType('expense'),
  getIncomeCategories: () => getCategoriesByType('income'),
  addCategory: (data: Omit<Category, 'id'>) => {
    const c = addCategory(data);
    get().loadCategories();
    return c;
  },
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => {
    const result = updateCategory(id, data);
    if (result) get().loadCategories();
    return result;
  },
  deleteCategory: (id: string) => {
    const result = deleteCategory(id);
    if (result) get().loadCategories();
    return result;
  },

  // Accounts
  accounts: [],
  loadAccounts: () => set({ accounts: getAccounts() }),
  addAccount: (data: Omit<Account, 'id'>) => {
    const a = addAccount(data);
    get().loadAccounts();
    return a;
  },
  updateAccount: (id: string, data: Partial<Omit<Account, 'id'>>) => {
    const result = updateAccount(id, data);
    if (result) get().loadAccounts();
    return result;
  },
  deleteAccount: (id: string) => {
    const result = deleteAccount(id);
    if (result) get().loadAccounts();
    return result;
  },
  getAccountBalance: (accountId: string) => getAccountBalance(accountId),
  getTotalAssets: () => getTotalAssets(),

  // UI
  editingTransaction: null,
  setEditingTransaction: (t) => set({ editingTransaction: t }),
  showTransactionForm: false,
  setShowTransactionForm: (show) => set({ showTransactionForm: show }),
  showVoiceInput: false,
  setShowVoiceInput: (show) => set({ showVoiceInput: show }),
  voiceAutoRecord: false,
  setVoiceAutoRecord: (v) => set({ voiceAutoRecord: v }),
}));

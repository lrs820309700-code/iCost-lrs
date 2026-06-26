import type { Transaction, Category, Account, TransactionFormData } from '@/types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/types/categories';
import { DEFAULT_ACCOUNTS } from '@/types/accounts';

const KEYS = {
  transactions: 'icost_transactions',
  categories: 'icost_categories',
  accounts: 'icost_accounts',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getStorageData<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Transactions ---
export function getTransactions(): Transaction[] {
  return getStorageData<Transaction[]>(KEYS.transactions, []);
}

export function addTransaction(data: TransactionFormData): Transaction {
  const transactions = getTransactions();
  const now = new Date().toISOString();
  const transaction: Transaction = {
    ...data,
    id: generateId(),
    createdAt: now,
  };
  transactions.push(transaction);
  setStorageData(KEYS.transactions, transactions);
  return transaction;
}

export function updateTransaction(id: string, data: Partial<TransactionFormData>): Transaction | null {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;
  transactions[index] = { ...transactions[index], ...data };
  setStorageData(KEYS.transactions, transactions);
  return transactions[index];
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  if (filtered.length === transactions.length) return false;
  setStorageData(KEYS.transactions, filtered);
  return true;
}

export function getTransactionsByMonth(year: number, month: number): Transaction[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getTransactions().filter((t) => t.transactionDate.startsWith(prefix));
}

export function getTransactionsByAccount(accountId: string): Transaction[] {
  return getTransactions().filter((t) => t.accountId === accountId);
}

// --- Categories ---
export function getCategories(): Category[] {
  let categories = getStorageData<Category[]>(KEYS.categories, []);
  if (categories.length === 0) {
    const expenseCategories = DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
      ...c,
      id: generateId(),
    }));
    const incomeCategories = DEFAULT_INCOME_CATEGORIES.map((c) => ({
      ...c,
      id: generateId(),
    }));
    categories = [...expenseCategories, ...incomeCategories];
    setStorageData(KEYS.categories, categories);
  }
  return categories;
}

export function getCategoriesByType(type: 'expense' | 'income'): Category[] {
  return getCategories()
    .filter((c) => c.type === type)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function addCategory(data: Omit<Category, 'id'>): Category {
  const categories = getCategories();
  const category: Category = { ...data, id: generateId() };
  categories.push(category);
  setStorageData(KEYS.categories, categories);
  return category;
}

export function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Category | null {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  categories[index] = { ...categories[index], ...data };
  setStorageData(KEYS.categories, categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) return false;
  setStorageData(KEYS.categories, filtered);
  return true;
}

// --- Accounts ---
export function getAccounts(): Account[] {
  let accounts = getStorageData<Account[]>(KEYS.accounts, []);
  if (accounts.length === 0) {
    accounts = DEFAULT_ACCOUNTS.map((a) => ({ ...a, id: generateId() }));
    setStorageData(KEYS.accounts, accounts);
  }
  return accounts;
}

export function addAccount(data: Omit<Account, 'id'>): Account {
  const accounts = getAccounts();
  const account: Account = { ...data, id: generateId() };
  accounts.push(account);
  setStorageData(KEYS.accounts, accounts);
  return account;
}

export function updateAccount(id: string, data: Partial<Omit<Account, 'id'>>): Account | null {
  const accounts = getAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return null;
  accounts[index] = { ...accounts[index], ...data };
  setStorageData(KEYS.accounts, accounts);
  return accounts[index];
}

export function deleteAccount(id: string): boolean {
  const accounts = getAccounts();
  const filtered = accounts.filter((a) => a.id !== id);
  if (filtered.length === accounts.length) return false;
  setStorageData(KEYS.accounts, filtered);
  return true;
}

export function getAccountBalance(accountId: string): number {
  const transactions = getTransactionsByAccount(accountId);
  const balance = transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);
  const account = getAccounts().find((a) => a.id === accountId);
  return (account?.initialBalance || 0) + balance;
}

export function getTotalAssets(): number {
  const accounts = getAccounts();
  return accounts.reduce((sum, a) => sum + getAccountBalance(a.id), 0);
}

// --- Reset all data ---
export function clearAllData(): void {
  localStorage.removeItem(KEYS.transactions);
  localStorage.removeItem(KEYS.categories);
  localStorage.removeItem(KEYS.accounts);
}

// --- CSV Export ---
export function exportToCSV(transactions: Transaction[]): string {
  const accounts = getAccounts();
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const headers = ['日期', '类型', '分类', '账户', '金额', '备注', '创建时间'];
  const rows = transactions.map((t) => [
    t.transactionDate,
    t.type === 'expense' ? '支出' : '收入',
    t.category,
    accountMap.get(t.accountId) || '',
    t.type === 'expense' ? `-${t.amount}` : String(t.amount),
    t.note,
    new Date(t.createdAt).toLocaleString('zh-CN'),
  ]);
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return '﻿' + csvContent;
}

export function downloadCSV(csv: string, filename: string = 'icost_records.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

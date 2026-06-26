export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  accountId: string;
  note: string;
  transactionDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  sortOrder: number;
}

export interface Account {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  initialBalance: number;
}

export type TransactionFormData = Omit<Transaction, 'id' | 'createdAt'>;

export type PageView = 'home' | 'transactions' | 'stats' | 'settings' | 'assets';

export interface MonthlySummary {
  expense: number;
  income: number;
  balance: number;
}

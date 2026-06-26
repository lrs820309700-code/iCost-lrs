import type { Account } from '@/types';

export const DEFAULT_ACCOUNTS: Omit<Account, 'id'>[] = [
  { name: '现金', icon: 'banknote', color: '#22c55e', sortOrder: 1, initialBalance: 0 },
  { name: '银行卡', icon: 'credit-card', color: '#3b82f6', sortOrder: 2, initialBalance: 0 },
  { name: '支付宝', icon: 'smartphone', color: '#06b6d4', sortOrder: 3, initialBalance: 0 },
  { name: '微信', icon: 'message-circle', color: '#22c55e', sortOrder: 4, initialBalance: 0 },
  { name: '其他', icon: 'more-horizontal', color: '#6b7280', sortOrder: 5, initialBalance: 0 },
];

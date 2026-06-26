import type { Category } from '@/types';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: '餐饮', type: 'expense', icon: 'utensils', color: '#ef4444', sortOrder: 1 },
  { name: '交通', type: 'expense', icon: 'car', color: '#f97316', sortOrder: 2 },
  { name: '购物', type: 'expense', icon: 'shopping-bag', color: '#eab308', sortOrder: 3 },
  { name: '学习', type: 'expense', icon: 'book-open', color: '#22c55e', sortOrder: 4 },
  { name: '娱乐', type: 'expense', icon: 'gamepad-2', color: '#06b6d4', sortOrder: 5 },
  { name: '住房', type: 'expense', icon: 'home', color: '#3b82f6', sortOrder: 6 },
  { name: '医疗', type: 'expense', icon: 'heart-pulse', color: '#ec4899', sortOrder: 7 },
  { name: '其他', type: 'expense', icon: 'more-horizontal', color: '#6b7280', sortOrder: 8 },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: '工资', type: 'income', icon: 'wallet', color: '#22c55e', sortOrder: 1 },
  { name: '兼职', type: 'income', icon: 'briefcase', color: '#06b6d4', sortOrder: 2 },
  { name: '奖金', type: 'income', icon: 'gift', color: '#eab308', sortOrder: 3 },
  { name: '其他', type: 'income', icon: 'more-horizontal', color: '#6b7280', sortOrder: 4 },
];

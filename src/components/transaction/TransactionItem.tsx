import { Pencil } from 'lucide-react';
import type { Transaction } from '@/types';
import { formatCurrency, formatTime } from '@/utils/format';
import { useStore } from '@/store/useStore';

interface TransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
  showAccount?: boolean;
  showTime?: boolean;
}

export default function TransactionItem({ transaction, showDate = true, showAccount = false, showTime = false }: TransactionItemProps) {
  const { setEditingTransaction, setShowTransactionForm, accounts } = useStore();
  const { amount, type, category, note, transactionDate, accountId, createdAt } = transaction;

  const isExpense = type === 'expense';
  const account = accounts.find((a) => a.id === accountId);

  const handleEdit = () => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  return (
    <div
      className="flex items-center justify-between py-3 px-1 active:bg-gray-50 dark:active:bg-gray-800 rounded-lg transition-colors cursor-pointer"
      onClick={handleEdit}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
            isExpense ? 'bg-red-100 dark:bg-red-900/40' : 'bg-green-100 dark:bg-green-900/40'
          }`}
        >
          <span className={isExpense ? 'text-red-500' : 'text-green-500'}>
            {isExpense ? '支' : '收'}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {category}
            </span>
            {note && (
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                {note}
              </span>
            )}
          </div>
          {showAccount && account && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: account.color + '20', color: account.color }}
            >
              {account.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <span
            className={`font-semibold text-sm stat-number block ${
              isExpense ? 'text-red-500' : 'text-green-600 dark:text-green-400'
            }`}
          >
            {isExpense ? '-' : '+'}{formatCurrency(amount)}
          </span>
          {showTime && (
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">
              {formatTime(createdAt)}
            </span>
          )}
        </div>
        <Pencil size={14} className="text-gray-300 dark:text-gray-600" />
      </div>
    </div>
  );
}

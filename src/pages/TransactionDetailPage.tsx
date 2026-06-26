import { useState, useMemo } from 'react';
import { Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import TransactionItem from '@/components/transaction/TransactionItem';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, getMonthLabel } from '@/utils/format';

export default function TransactionDetailPage() {
  const navigate = useNavigate();
  const { transactions, getExpenseCategories, getIncomeCategories, setShowTransactionForm } = useStore();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [showFilter, setShowFilter] = useState(false);

  const expenseCategories = getExpenseCategories();
  const incomeCategories = getIncomeCategories();
  const allCategories = [
    { name: '全部', type: 'all' as const },
    ...expenseCategories.map((c) => ({ name: c.name, type: 'expense' as const })),
    ...incomeCategories.map((c) => ({ name: c.name, type: 'income' as const })),
  ];

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({ value, label: getMonthLabel(d.getFullYear(), d.getMonth() + 1) });
    }
    return options;
  }, [now]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    result = result.filter((t) => t.transactionDate.startsWith(selectedMonth));
    if (selectedType !== 'all') {
      result = result.filter((t) => t.type === selectedType);
    }
    if (selectedCategory !== '全部') {
      result = result.filter((t) => t.category === selectedCategory);
    }
    result.sort(
      (a, b) =>
        b.transactionDate.localeCompare(a.transactionDate) ||
        b.createdAt.localeCompare(a.createdAt)
    );
    return result;
  }, [transactions, selectedMonth, selectedType, selectedCategory]);

  const groupedTransactions = useMemo(() => {
    const groups: { date: string; transactions: typeof transactions; totalExpense: number; totalIncome: number }[] = [];
    let currentDate = '';
    let currentGroup: typeof transactions = [];

    filteredTransactions.forEach((t) => {
      if (t.transactionDate !== currentDate) {
        if (currentGroup.length > 0) {
          const totalExpense = currentGroup
            .filter((gt) => gt.type === 'expense')
            .reduce((s, gt) => s + gt.amount, 0);
          const totalIncome = currentGroup
            .filter((gt) => gt.type === 'income')
            .reduce((s, gt) => s + gt.amount, 0);
          groups.push({ date: currentDate, transactions: currentGroup, totalExpense, totalIncome });
        }
        currentDate = t.transactionDate;
        currentGroup = [t];
      } else {
        currentGroup.push(t);
      }
    });

    if (currentGroup.length > 0) {
      const totalExpense = currentGroup
        .filter((gt) => gt.type === 'expense')
        .reduce((s, gt) => s + gt.amount, 0);
      const totalIncome = currentGroup
        .filter((gt) => gt.type === 'income')
        .reduce((s, gt) => s + gt.amount, 0);
      groups.push({ date: currentDate, transactions: currentGroup, totalExpense, totalIncome });
    }

    return groups;
  }, [filteredTransactions]);

  return (
    <div className="page-container">
      {/* Header with Back */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/')} className="p-1 text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex-1">交易记录</h1>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            showFilter || selectedCategory !== '全部' || selectedType !== 'all'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
          }`}
        >
          <Filter size={16} />
          筛选
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="card mb-4 space-y-3">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">月份</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {monthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedMonth(opt.value)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0 ${
                    selectedMonth === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">类型</p>
            <div className="flex gap-2">
              {[
                { value: 'all' as const, label: '全部' },
                { value: 'expense' as const, label: '支出' },
                { value: 'income' as const, label: '收入' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedType(opt.value)}
                  className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedType === opt.value
                      ? opt.value === 'expense'
                        ? 'bg-red-500 text-white'
                        : opt.value === 'income'
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">分类</p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          message="没有找到记录"
          actionLabel="记一笔"
          onAction={() => setShowTransactionForm(true)}
        />
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {formatDate(group.date)}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  {group.totalExpense > 0 && (
                    <span className="text-red-500">
                      支出 ¥{group.totalExpense.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
                    </span>
                  )}
                  {group.totalIncome > 0 && (
                    <span className="text-green-500">
                      收入 ¥{group.totalIncome.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              </div>

              <div className="card divide-y divide-gray-50 dark:divide-gray-700/50">
                {group.transactions.map((t) => (
                  <TransactionItem key={t.id} transaction={t} showDate={false} showAccount />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

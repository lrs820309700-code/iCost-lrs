import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import TransactionItem from '@/components/transaction/TransactionItem';
import EmptyState from '@/components/common/EmptyState';
import { formatCurrency, formatDate } from '@/utils/format';

export default function HomePage() {
  const navigate = useNavigate();
  const { transactions, getExpenseCategories, setShowTransactionForm } = useStore();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const today = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Net assets = total income - total expense (all time)
  const netAssets = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return totalIncome - totalExpense;
  }, [transactions]);

  // This month summary
  const monthExpense = useMemo(() => {
    return transactions
      .filter((t) => t.transactionDate.startsWith(currentMonthStr) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthStr]);

  const monthIncome = useMemo(() => {
    return transactions
      .filter((t) => t.transactionDate.startsWith(currentMonthStr) && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthStr]);

  // Today's expense by category
  const todayExpenseByCategory = useMemo(() => {
    const todayTransactions = transactions.filter(
      (t) => t.transactionDate === today && t.type === 'expense'
    );
    const map = new Map<string, number>();
    todayTransactions.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, today]);

  const todayTotalExpense = todayExpenseByCategory.reduce((s, c) => s + c.amount, 0);

  // Get category colors
  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    getExpenseCategories().forEach((c) => {
      map.set(c.name, c.color);
    });
    return map;
  }, [getExpenseCategories]);

  // Recent 10 transactions grouped by date
  const recentByDate = useMemo(() => {
    const sorted = [...transactions]
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10);
    const groups: { date: string; transactions: typeof sorted }[] = [];
    let currentDate = '';
    let currentGroup: typeof sorted = [];
    sorted.forEach((t) => {
      if (t.transactionDate !== currentDate) {
        if (currentGroup.length > 0) groups.push({ date: currentDate, transactions: currentGroup });
        currentDate = t.transactionDate;
        currentGroup = [t];
      } else {
        currentGroup.push(t);
      }
    });
    if (currentGroup.length > 0) groups.push({ date: currentDate, transactions: currentGroup });
    return groups;
  }, [transactions]);

  return (
    <div className="page-container">
      {/* Net Assets */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {currentYear}年{currentMonth}月
        </p>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 stat-number">
          ¥{netAssets.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          净资产
        </p>
      </div>

      {/* Month summary row */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 card">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">本月支出</p>
          <p className="text-lg font-bold text-red-500 stat-number">{formatCurrency(monthExpense)}</p>
        </div>
        <div className="flex-1 card">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">本月收入</p>
          <p className="text-lg font-bold text-green-500 stat-number">{formatCurrency(monthIncome)}</p>
        </div>
      </div>

      {/* Today's Expense with Category Breakdown */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">今日支出</p>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100 stat-number">
            {formatCurrency(todayTotalExpense)}
          </span>
        </div>
        {todayExpenseByCategory.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-2 text-center">暂无支出</p>
        ) : (
          <div className="space-y-2">
            {todayExpenseByCategory.map((item) => {
              const color = categoryColorMap.get(item.name) || '#6b7280';
              const percentage = todayTotalExpense > 0 ? (item.amount / todayTotalExpense) * 100 : 0;
              return (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12">{item.name}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-300 w-16 text-right stat-number">
                    ¥{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">最近记录</h2>
          {recentByDate.length > 0 && (
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400"
            >
              全部 <ChevronRight size={14} />
            </button>
          )}
        </div>

        {recentByDate.length === 0 ? (
          <EmptyState
            message="还没有记账记录"
            actionLabel="记第一笔"
            onAction={() => setShowTransactionForm(true)}
          />
        ) : (
          <div className="space-y-4">
            {recentByDate.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {formatDate(group.date)}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    {(() => {
                      const exp = group.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                      const inc = group.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                      return <>
                        {exp > 0 && <span className="text-red-500">支出 ¥{exp.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}</span>}
                        {inc > 0 && <span className="text-green-500">收入 ¥{inc.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}</span>}
                      </>;
                    })()}
                  </div>
                </div>
                <div className="card divide-y divide-gray-50 dark:divide-gray-700/50">
                  {group.transactions.map((t) => (
                    <TransactionItem key={t.id} transaction={t} showDate showTime showAccount />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { getMonthLabel, formatDateShort, formatCurrency } from '@/utils/format';

type ChartTab = 'category' | 'daily' | 'compare';

export default function StatsPage() {
  const { transactions, categories } = useStore();
  const [activeTab, setActiveTab] = useState<ChartTab>('category');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.transactionDate.startsWith(currentMonthStr)),
    [transactions, currentMonthStr]
  );

  const expenseTransactions = useMemo(
    () => monthTransactions.filter((t) => t.type === 'expense'),
    [monthTransactions]
  );

  const incomeTransactions = useMemo(
    () => monthTransactions.filter((t) => t.type === 'income'),
    [monthTransactions]
  );

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    const total = [...map.values()].reduce((s, v) => s + v, 0);
    return [...map.entries()]
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseTransactions]);

  // Daily expense data
  const dailyData = useMemo(() => {
    const map = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      const day = parseInt(t.transactionDate.split('-')[2], 10);
      map.set(t.transactionDate, (map.get(t.transactionDate) || 0) + t.amount);
    });
    const data: { day: number; amount: number; date: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonthStr}-${String(d).padStart(2, '0')}`;
      data.push({
        day: d,
        amount: map.get(dateStr) || 0,
        date: dateStr,
      });
    }
    return data;
  }, [expenseTransactions, currentMonthStr, daysInMonth]);

  // Income vs Expense daily comparison
  const compareData = useMemo(() => {
    const expenseMap = new Map<string, number>();
    const incomeMap = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      expenseMap.set(t.transactionDate, (expenseMap.get(t.transactionDate) || 0) + t.amount);
    });
    incomeTransactions.forEach((t) => {
      incomeMap.set(t.transactionDate, (incomeMap.get(t.transactionDate) || 0) + t.amount);
    });
    const data: { day: number; expense: number; income: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonthStr}-${String(d).padStart(2, '0')}`;
      data.push({
        day: d,
        expense: expenseMap.get(dateStr) || 0,
        income: incomeMap.get(dateStr) || 0,
      });
    }
    return data;
  }, [expenseTransactions, incomeTransactions, currentMonthStr, daysInMonth]);

  const totalExpense = expenseTransactions.reduce((s, t) => s + t.amount, 0);
  const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">统计</h1>
        <span className="text-sm text-gray-400 dark:text-gray-500">
          {getMonthLabel(currentYear, currentMonth)}
        </span>
      </div>

      {/* Summary bar */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">支出</p>
            <p className="text-lg font-bold text-red-500 stat-number">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">收入</p>
            <p className="text-lg font-bold text-green-500 stat-number">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full transition-all"
            style={{
              width: `${totalExpense + totalIncome > 0 ? (totalExpense / (totalExpense + totalIncome)) * 100 : 50}%`,
            }}
          />
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
        {[
          { key: 'category' as const, label: '分类' },
          { key: 'daily' as const, label: '每日' },
          { key: 'compare' as const, label: '对比' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart content */}
      {activeTab === 'category' && (
        <CategoryChart data={categoryData} totalExpense={totalExpense} />
      )}
      {activeTab === 'daily' && (
        <DailyChart data={dailyData} />
      )}
      {activeTab === 'compare' && (
        <CompareChart data={compareData} />
      )}
    </div>
  );
}

// --- Pie Chart (Category) ---
function CategoryChart({
  data,
  totalExpense,
}: {
  data: { name: string; amount: number; percentage: number }[];
  totalExpense: number;
}) {
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];
  const cx = 100;
  const cy = 100;
  const r = 80;

  // Generate pie slices
  let currentAngle = -Math.PI / 2;
  const slices = data.map((item, i) => {
    const angle = (item.percentage / 100) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: COLORS[i % COLORS.length],
      ...item,
    };
  });

  if (totalExpense === 0) {
    return (
      <div className="card flex flex-col items-center py-8">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx={100} cy={100} r={80} fill="none" stroke="#e5e7eb" strokeWidth={2} />
          <text x={100} y={105} textAnchor="middle" fill="#9ca3af" fontSize={14}>暂无数据</text>
        </svg>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">本月暂无支出</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-center mb-4">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, i) => (
            <path key={i} d={slice.path} fill={slice.color} opacity={0.9} />
          ))}
          <circle cx={cx} cy={cy} r={40} fill="white" />
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#374151" fontSize={16} fontWeight="bold">
            {totalExpense > 0 ? Math.round((data[0]?.percentage || 0)) : 0}%
          </text>
          <text x={cx} y={cy + 15} textAnchor="middle" fill="#9ca3af" fontSize={10}>
            最大支出
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                ¥{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-gray-400 w-10 text-right">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Daily Bar Chart ---
function DailyChart({ data }: { data: { day: number; amount: number; date: string }[] }) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const barWidth = Math.max(8, Math.min(16, 280 / data.length));
  const gap = Math.max(2, Math.min(4, (300 - barWidth * data.length) / (data.length - 1)));

  if (maxAmount === 0 || data.every((d) => d.amount === 0)) {
    return (
      <div className="card flex flex-col items-center py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500">本月暂无每日支出数据</p>
      </div>
    );
  }

  // Show every Nth label
  const labelStep = Math.max(1, Math.floor(data.length / 7));

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">每日支出趋势</h3>
      <div className="overflow-x-auto scrollbar-hide">
        <svg width={Math.max(300, data.length * (barWidth + gap))} height="180" viewBox={`0 0 ${Math.max(300, data.length * (barWidth + gap))} 180`}>
          {/* Y axis guideline */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <g key={ratio}>
              <line
                x1={30}
                y1={140 - ratio * 120}
                x2={Math.max(270, data.length * (barWidth + gap))}
                y2={140 - ratio * 120}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              <text
                x={28}
                y={143 - ratio * 120}
                textAnchor="end"
                fill="#9ca3af"
                fontSize={8}
              >
                ¥{Math.round(maxAmount * ratio)}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const barHeight = (d.amount / maxAmount) * 110;
            const x = 35 + i * (barWidth + gap);
            const y = 130 - barHeight;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 1)}
                  rx={2}
                  fill={d.amount > 0 ? '#ef4444' : '#f3f4f6'}
                  opacity={d.amount > 0 ? 0.8 : 0.3}
                />
                {/* Label every few days */}
                {(i % labelStep === 0 || i === data.length - 1) && (
                  <text
                    x={x + barWidth / 2}
                    y={145}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={7}
                  >
                    {d.day}
                  </text>
                )}
                {/* Value on hover would need JS - show minimal */}
                {d.amount > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 3}
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize={6}
                    fontWeight="bold"
                  >
                    {d.amount >= 1000 ? `${(d.amount / 1000).toFixed(0)}k` : Math.round(d.amount)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">日（数字为日期）</p>
    </div>
  );
}

// --- Income vs Expense Comparison Chart ---
function CompareChart({ data }: { data: { day: number; expense: number; income: number }[] }) {
  const maxAmount = Math.max(...data.map((d) => Math.max(d.expense, d.income)), 1);
  const barWidth = Math.max(6, Math.min(10, 250 / data.length));

  if (data.every((d) => d.expense === 0 && d.income === 0)) {
    return (
      <div className="card flex flex-col items-center py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500">暂无本月对比数据</p>
      </div>
    );
  }

  const labelStep = Math.max(1, Math.floor(data.length / 7));

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">收支对比</h3>
      <div className="overflow-x-auto scrollbar-hide">
        <svg width={Math.max(300, data.length * (barWidth * 2 + 4))} height="180">
          {/* Legend */}
          <rect x={10} y={0} width={8} height={8} rx={1} fill="#ef4444" />
          <text x={22} y={8} fill="#9ca3af" fontSize={9}>支出</text>
          <rect x={60} y={0} width={8} height={8} rx={1} fill="#22c55e" />
          <text x={72} y={8} fill="#9ca3af" fontSize={9}>收入</text>

          {/* Y axis guideline */}
          {[0, 0.5, 1].map((ratio) => (
            <g key={ratio}>
              <line
                x1={10}
                y1={150 - ratio * 120}
                x2={Math.max(280, data.length * (barWidth * 2 + 4))}
                y2={150 - ratio * 120}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              <text x={8} y={153 - ratio * 120} textAnchor="end" fill="#9ca3af" fontSize={7}>
                ¥{Math.round(maxAmount * ratio)}
              </text>
            </g>
          ))}

          {/* Grouped bars */}
          {data.map((d, i) => {
            const x = 15 + i * (barWidth * 2 + 4);
            const expenseH = (d.expense / maxAmount) * 110;
            const incomeH = (d.income / maxAmount) * 110;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={140 - expenseH}
                  width={barWidth}
                  height={expenseH}
                  rx={2}
                  fill="#ef4444"
                  opacity={d.expense > 0 ? 0.8 : 0.1}
                />
                <rect
                  x={x + barWidth + 1}
                  y={140 - incomeH}
                  width={barWidth}
                  height={incomeH}
                  rx={2}
                  fill="#22c55e"
                  opacity={d.income > 0 ? 0.8 : 0.1}
                />
                {(i % labelStep === 0 || i === data.length - 1) && (
                  <text
                    x={x + barWidth}
                    y={155}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={6}
                  >
                    {d.day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">
        红色 = 支出 · 绿色 = 收入
      </p>
    </div>
  );
}

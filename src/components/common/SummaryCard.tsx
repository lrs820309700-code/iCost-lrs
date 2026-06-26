interface SummaryCardProps {
  title: string;
  amount: number;
  type?: 'expense' | 'income' | 'balance';
  subtitle?: string;
}

export default function SummaryCard({ title, amount, type = 'expense', subtitle }: SummaryCardProps) {
  const colorClass = type === 'income'
    ? 'text-green-600 dark:text-green-400'
    : type === 'balance'
    ? amount >= 0
      ? 'text-gray-800 dark:text-gray-100'
      : 'text-red-500'
    : 'text-red-500 dark:text-red-400';

  const prefix = type === 'balance' ? '' : type === 'income' ? '' : '- ';

  return (
    <div className="card">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold stat-number ${colorClass}`}>
        {prefix}¥{Math.abs(amount).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

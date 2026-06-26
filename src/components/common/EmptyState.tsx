import { ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  message = '暂无记录',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
      <ClipboardList size={48} className="mb-4 opacity-50" />
      <p className="text-base font-medium mb-1">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium active:opacity-70"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

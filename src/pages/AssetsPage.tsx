import { useState } from 'react';
import { Plus, X, Check, Pencil } from 'lucide-react';
import { useStore } from '@/store/useStore';
import EmptyState from '@/components/common/EmptyState';

const ICONS = ['banknote', 'credit-card', 'smartphone', 'message-circle', 'wallet', 'landmark', 'piggy-bank', 'more-horizontal'] as const;
const COLORS = ['#22c55e', '#3b82f6', '#06b6d4', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#6b7280'];

export default function AssetsPage() {
  const { accounts, getAccountBalance, getTotalAssets, addAccount, updateAccount, deleteAccount, setShowTransactionForm } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [initialBalance, setInitialBalance] = useState('');

  const totalAssets = getTotalAssets();

  const accountBalances = accounts.map((a) => ({
    ...a,
    balance: getAccountBalance(a.id),
  }));

  const handleAdd = () => {
    if (!name.trim()) return;
    addAccount({
      name: name.trim(),
      icon: 'wallet',
      color,
      sortOrder: accounts.length + 1,
      initialBalance: parseFloat(initialBalance) || 0,
    });
    resetForm();
  };

  const handleEdit = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    setEditId(id);
    setName(acc.name);
    setColor(acc.color);
    setInitialBalance(String(acc.initialBalance));
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (!editId || !name.trim()) return;
    updateAccount(editId, {
      name: name.trim(),
      color,
      initialBalance: parseFloat(initialBalance) || 0,
    });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (accounts.length <= 1) {
      alert('至少保留一个账户');
      return;
    }
    deleteAccount(id);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setName('');
    setColor(COLORS[0]);
    setInitialBalance('');
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">资产</h1>
        <span className="text-sm text-gray-400 dark:text-gray-500 stat-number">
          总资产 ¥{totalAssets.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
        </span>
      </div>

      {/* Account List */}
      {accountBalances.length === 0 ? (
        <EmptyState message="还没有账户" actionLabel="添加账户" onAction={() => { setShowForm(true); resetForm(); }} />
      ) : (
        <div className="space-y-3 mb-6">
          {accountBalances.map((acc) => (
            <div key={acc.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: acc.color }}
                >
                  {acc.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{acc.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    初始 ¥{(acc.initialBalance || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className={`text-base font-bold stat-number ${
                    acc.balance >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-500'
                  }`}>
                    ¥{acc.balance.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <button
                  onClick={() => handleEdit(acc.id)}
                  className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button + Form */}
      {!showForm ? (
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center gap-1 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
        >
          <Plus size={18} /> 添加账户
        </button>
      ) : (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {editId ? '编辑账户' : '新增账户'}
            </h4>
            <button onClick={resetForm}><X size={18} className="text-blue-400" /></button>
          </div>
          <input
            type="text"
            placeholder="账户名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field text-sm"
            maxLength={10}
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="number"
            placeholder="初始余额（可选）"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className="input-field text-sm"
          />
          <button
            onClick={editId ? handleSaveEdit : handleAdd}
            disabled={!name.trim()}
            className="btn-primary w-full text-sm"
          >
            {editId ? '保存' : '添加'}
          </button>
          {editId && (
            <button
              onClick={() => { handleDelete(editId); resetForm(); }}
              className="w-full py-2 text-sm text-red-500 font-medium rounded-xl border border-red-200 dark:border-red-900/50 active:bg-red-50 transition-colors"
            >
              删除此账户
            </button>
          )}
        </div>
      )}

      {/* Quick tip */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
        记账时选择对应账户，资产余额自动更新
      </p>
    </div>
  );
}

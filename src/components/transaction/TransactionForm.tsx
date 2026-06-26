import { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { TransactionFormData } from '@/types';
import { getToday } from '@/utils/format';

const TYPE_OPTIONS: { value: 'expense' | 'income'; label: string }[] = [
  { value: 'expense', label: '支出' },
  { value: 'income', label: '收入' },
];

export default function TransactionForm() {
  const {
    showTransactionForm,
    setShowTransactionForm,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getExpenseCategories,
    getIncomeCategories,
    accounts,
  } = useStore();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset or populate form when opening
  useEffect(() => {
    if (showTransactionForm) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(String(editingTransaction.amount));
        setCategory(editingTransaction.category);
        setAccountId(editingTransaction.accountId);
        setDate(editingTransaction.transactionDate);
        setNote(editingTransaction.note);
        setIsEditing(true);
      } else {
        setType('expense');
        setAmount('');
        setCategory('');
        setAccountId(accounts.length > 0 ? accounts[0].id : '');
        setDate(getToday());
        setNote('');
        setIsEditing(false);
      }
      // Focus amount input after animation
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [showTransactionForm, editingTransaction, accounts]);

  const categories = type === 'expense' ? getExpenseCategories() : getIncomeCategories();

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!category) return;
    if (!accountId) return;

    const data: TransactionFormData = {
      amount: numAmount,
      type,
      category,
      accountId,
      transactionDate: date,
      note: note.trim(),
    };

    if (isEditing && editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }

    closeForm();
  };

  const handleDelete = () => {
    if (!editingTransaction) return;
    deleteTransaction(editingTransaction.id);
    closeForm();
  };

  const closeForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
      setAmount(val);
    }
  };

  const isFormValid = amount && parseFloat(amount) > 0 && category && accountId;

  if (!showTransactionForm) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeForm}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] flex flex-col animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <button onClick={closeForm} className="btn-ghost p-1">
              <X size={22} />
            </button>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              {isEditing ? '编辑记录' : '记一笔'}
            </h2>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className={`p-1 rounded-xl transition-colors ${
                isFormValid
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              <Check size={22} />
            </button>
          </div>

          {/* Content - scrollable */}
          <div className="overflow-y-auto flex-1 px-5 pb-6">
            {/* Amount */}
            <div className="py-6">
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                className="amount-input"
                autoFocus
              />
            </div>

            {/* Type Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-5">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setType(opt.value);
                    setCategory('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    type === opt.value
                      ? opt.value === 'expense'
                        ? 'bg-white dark:bg-gray-600 text-red-500 shadow-sm'
                        : 'bg-white dark:bg-gray-600 text-green-500 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Account Selector */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">账户</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setAccountId(acc.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                      accountId === acc.id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: acc.color }}
                    />
                    {acc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Grid */}
            <div className="mb-5">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-medium">
                选择分类
              </p>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                      category === cat.name
                        ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700/50 active:bg-gray-100'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.name.slice(0, 1)}
                    </span>
                    <span className={`text-xs ${
                      category === cat.name
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">日期</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Note */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">备注（可选）</p>
              <input
                type="text"
                placeholder="添加备注..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field"
                maxLength={50}
              />
            </div>

            {/* Delete button (edit mode only) */}
            {isEditing && (
              <button
                onClick={handleDelete}
                className="w-full py-3 text-sm text-red-500 font-medium
                  rounded-xl border border-red-200 dark:border-red-900/50
                  active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
              >
                删除此记录
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

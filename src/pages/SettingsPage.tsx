import { useState } from 'react';
import { Sun, Moon, Download, Smartphone, ChevronRight, Plus, X, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { exportToCSV, downloadCSV, getTransactions } from '@/lib/db';
import type { Category } from '@/types';

export default function SettingsPage() {
  const {
    darkMode,
    toggleDarkMode,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'settings' | 'categories'>('settings');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');
  const [editType, setEditType] = useState<'expense' | 'income'>('expense');

  const handleExport = () => {
    const transactions = getTransactions();
    if (transactions.length === 0) {
      alert('没有数据可以导出');
      return;
    }
    const csv = exportToCSV(transactions);
    downloadCSV(csv);
  };

  const handleAddCategory = () => {
    if (!editName.trim()) return;
    addCategory({
      name: editName.trim(),
      type: editType,
      icon: 'other',
      color: editColor,
      sortOrder: categories.filter((c) => c.type === editType).length + 1,
    });
    setEditName('');
    setShowAddCategory(false);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditType(cat.type);
  };

  const handleSaveEdit = () => {
    if (!editingCatId || !editName.trim()) return;
    updateCategory(editingCatId, {
      name: editName.trim(),
      color: editColor,
    });
    setEditingCatId(null);
  };

  const handleDeleteCategory = (cat: Category) => {
    const cats = categories.filter((c) => c.id !== cat.id);
    if (cats.length <= 1) {
      alert('至少保留一个分类');
      return;
    }
    deleteCategory(cat.id);
    if (editingCatId === cat.id) setEditingCatId(null);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

  return (
    <div className="page-container">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">设置</h1>

      {/* Tab bar */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          通用设置
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          分类管理
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  {darkMode ? (
                    <Moon size={20} className="text-amber-500" />
                  ) : (
                    <Sun size={20} className="text-amber-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">深色模式</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {darkMode ? '当前为深色模式' : '当前为浅色模式'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* CSV Export */}
          <div className="card">
            <button
              onClick={handleExport}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <Download size={20} className="text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">导出数据 (CSV)</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">导出所有记录到 CSV 文件</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>

          {/* PWA Info */}
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Smartphone size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">PWA 安装</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  在浏览器菜单中选择「添加到主屏幕」即可像 App 一样使用
                </p>
              </div>
            </div>
          </div>

          {/* Version */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4">
            iCost v1.0.0 · 极简个人记账
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Expense Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">支出分类</h3>
              <button
                onClick={() => {
                  setEditType('expense');
                  setEditName('');
                  setEditColor(COLORS[0]);
                  setShowAddCategory(!showAddCategory);
                }}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} /> 添加
              </button>
            </div>

            <div className="card divide-y divide-gray-50 dark:divide-gray-700/50">
              {expenseCategories.map((cat) => (
                <CategoryEditItem
                  key={cat.id}
                  category={cat}
                  isEditing={editingCatId === cat.id}
                  editName={editName}
                  editColor={editColor}
                  onEdit={() => handleEditCategory(cat)}
                  onSave={handleSaveEdit}
                  onDelete={() => handleDeleteCategory(cat)}
                  onCancel={() => setEditingCatId(null)}
                  onNameChange={setEditName}
                  onColorChange={setEditColor}
                />
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">收入分类</h3>
              <button
                onClick={() => {
                  setEditType('income');
                  setEditName('');
                  setEditColor(COLORS[0]);
                  setShowAddCategory(!showAddCategory);
                }}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} /> 添加
              </button>
            </div>

            <div className="card divide-y divide-gray-50 dark:divide-gray-700/50">
              {incomeCategories.map((cat) => (
                <CategoryEditItem
                  key={cat.id}
                  category={cat}
                  isEditing={editingCatId === cat.id}
                  editName={editName}
                  editColor={editColor}
                  onEdit={() => handleEditCategory(cat)}
                  onSave={handleSaveEdit}
                  onDelete={() => handleDeleteCategory(cat)}
                  onCancel={() => setEditingCatId(null)}
                  onNameChange={setEditName}
                  onColorChange={setEditColor}
                />
              ))}
            </div>
          </div>

          {/* Add Category Form */}
          {showAddCategory && (
            <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  新增{editType === 'expense' ? '支出' : '收入'}分类
                </h4>
                <button onClick={() => setShowAddCategory(false)}>
                  <X size={18} className="text-blue-400" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="分类名称"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  maxLength={10}
                  autoFocus
                />
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        editColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleAddCategory}
                  disabled={!editName.trim()}
                  className="btn-primary w-full text-sm"
                >
                  添加
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Category Edit Item ---
function CategoryEditItem({
  category,
  isEditing,
  editName,
  editColor,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  onNameChange,
  onColorChange,
}: {
  category: Category;
  isEditing: boolean;
  editName: string;
  editColor: string;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
}) {
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

  if (isEditing) {
    return (
      <div className="py-3">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => onNameChange(e.target.value)}
            className="input-field flex-1 text-sm py-2"
            maxLength={10}
            autoFocus
          />
          <button onClick={onSave} className="text-blue-600 p-1">
            <Check size={18} />
          </button>
          <button onClick={onCancel} className="text-gray-400 p-1">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-5 h-5 rounded-full transition-all ${
                editColor === c ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="text-gray-400 hover:text-blue-500 text-xs">
          编辑
        </button>
        {/* 默认分类不能删除，只删除自定义的 */}
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 text-xs">
          删除
        </button>
      </div>
    </div>
  );
}

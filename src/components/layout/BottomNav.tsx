import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, ChartPie, Settings, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/assets', label: '资产', icon: Wallet },
  { path: '/stats', label: '统计', icon: ChartPie },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-lg mx-auto flex items-center justify-around relative h-16">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center w-16 py-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-0.5 font-medium">{label}</span>
            </button>
          );
        })}

        {/* 浮动"记一笔"按钮 */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <FloatingAddButton />
        </div>
      </div>
    </nav>
  );
}

function FloatingAddButton() {
  const { setShowTransactionForm, setShowVoiceInput, setVoiceAutoRecord } = useStore();
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  const LONG_PRESS_MS = 500;

  const handlePointerDown = () => {
    longPressTimer = setTimeout(() => {
      setVoiceAutoRecord(true);
      setShowVoiceInput(true);
      longPressTimer = null;
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
      setShowTransactionForm(true);
    }
  };

  const handlePointerLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full
        shadow-lg shadow-blue-600/30 dark:shadow-blue-500/30
        flex items-center justify-center
        active:scale-90 active:shadow-md
        transition-all duration-150 ease-out
        hover:shadow-xl hover:shadow-blue-600/40
        select-none"
      aria-label="记一笔"
    >
      <Plus size={28} strokeWidth={3} />
    </button>
  );
}

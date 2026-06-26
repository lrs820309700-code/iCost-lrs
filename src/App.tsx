import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import TransactionDetailPage from '@/pages/TransactionDetailPage';
import StatsPage from '@/pages/StatsPage';
import SettingsPage from '@/pages/SettingsPage';
import AssetsPage from '@/pages/AssetsPage';
import TransactionForm from '@/components/transaction/TransactionForm';
import VoiceInput from '@/components/voice/VoiceInput';

function App() {
  const { initTheme, loadTransactions, loadCategories, loadAccounts, showVoiceInput, setShowVoiceInput, voiceAutoRecord, setVoiceAutoRecord } = useStore();

  useEffect(() => {
    initTheme();
    loadTransactions();
    loadCategories();
    loadAccounts();
  }, [initTheme, loadTransactions, loadCategories, loadAccounts]);

  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="transactions" element={<TransactionDetailPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <TransactionForm />
      <VoiceInput
        isOpen={showVoiceInput}
        startRecording={voiceAutoRecord}
        onClose={() => {
          setShowVoiceInput(false);
          setVoiceAutoRecord(false);
        }}
      />
    </>
  );
}

export default App;

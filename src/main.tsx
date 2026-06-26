import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// PWA 更新检测：当新的 Service Worker 接管页面时自动刷新
// 确保加载最新版本资源，避免旧版 JS/CSS 不存在导致白屏
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // 防止重复刷新
    if (refreshing) return;
    refreshing = true;
    console.log('[PWA] 检测到新版本，正在刷新...');
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

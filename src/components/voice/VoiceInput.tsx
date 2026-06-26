import { useState, useEffect, useRef } from 'react';
import { Mic, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { parseWithDeepSeek, parseVoiceExpense, startSpeechRecognition } from '@/lib/voiceService';

interface VoiceInputProps {
  isOpen: boolean;
  onClose: () => void;
  /** 长按触发：打开后立即开始录音 */
  startRecording?: boolean;
}

type Stage = 'idle' | 'listening' | 'processing' | 'result' | 'error';

export default function VoiceInput({ isOpen, onClose, startRecording }: VoiceInputProps) {
  const {
    addTransaction,
    getExpenseCategories,
    getIncomeCategories,
    accounts,
  } = useStore();

  const [stage, setStage] = useState<Stage>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<{ type: string; amount: number; category: string; account: string; note: string } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef('');

  const allExpenseNames = getExpenseCategories().map((c) => c.name);
  const allIncomeNames = getIncomeCategories().map((c) => c.name);
  const accountNames = accounts.map((a) => a.name);

  // 停止录音并处理
  const stopAndProcess = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    const text = transcriptRef.current;
    if (text) {
      processTranscript(text);
    } else {
      setStage('idle');
    }
  };

  // 语音识别回调
  const handleSpeechResult = (text: string) => {
    transcriptRef.current += text;
    setTranscript(transcriptRef.current);
  };

  const handleSpeechError = (error: string) => {
    setErrorMsg(error);
    setStage('error');
  };

  const handleSpeechEnd = () => {
    // 语音自然结束（用户停止说话一段时间后）
    const text = transcriptRef.current;
    if (text) {
      processTranscript(text);
    }
  };

  // 开始录音
  const startListening = () => {
    setTranscript('');
    setErrorMsg('');
    setResult(null);
    transcriptRef.current = '';
    setStage('listening');

    const recognition = startSpeechRecognition(
      handleSpeechResult,
      handleSpeechError,
      handleSpeechEnd
    );

    if (recognition) {
      recognitionRef.current = recognition;
    } else {
      setErrorMsg('语音识别不可用，请使用 Chrome 或 Edge');
      setStage('error');
    }
  };

  // 解析文字
  const processTranscript = async (text: string) => {
    setStage('processing');
    try {
      // 先本地解析（关键词匹配，不需要 API）
      const localResult = parseVoiceExpense(text);
      if (localResult.amount > 0) {
        const account = accounts.find(a =>
          a.name === localResult.account ||
          accountNames.some(n => n.includes(localResult.account))
        );
        setResult({
          type: localResult.type,
          amount: localResult.amount,
          category: localResult.title,
          account: account?.name || localResult.account,
          note: localResult.note,
        });
        setStage('result');
        return;
      }

      // 本地没解析到 → 降级到 DeepSeek
      const allCategories = [...allExpenseNames, ...allIncomeNames];
      const parsed = await parseWithDeepSeek(text, allCategories, accountNames);
      setResult(parsed);
      setStage('result');
    } catch (err: any) {
      setErrorMsg(err.message || '解析失败，请重试');
      setStage('error');
    }
  };

  // 确认保存
  const handleConfirm = () => {
    if (!result) return;
    const account = accounts.find((a) => a.name === result.account);
    if (!account) {
      setErrorMsg(`未找到账户「${result.account}」，请先在资产页添加`);
      setStage('error');
      return;
    }
    addTransaction({
      amount: result.amount,
      type: result.type as 'expense' | 'income',
      category: result.category,
      accountId: account.id,
      note: result.note,
      transactionDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  // 重试
  const handleRetry = () => {
    // 停止旧的录音
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setStage('idle');
    setTranscript('');
    setErrorMsg('');
    setResult(null);
    transcriptRef.current = '';
  };

  // 清理
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // 长按打开 → 自动开始录音
  useEffect(() => {
    if (isOpen && startRecording) {
      const t = setTimeout(() => startListening(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, startRecording]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {stage === 'idle' && '语音记账'}
              {stage === 'listening' && '聆听中...'}
              {stage === 'processing' && '解析中...'}
              {stage === 'result' && '确认记录'}
              {stage === 'error' && '出错了'}
            </h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
          </div>

          {/* ===== 空闲 ===== */}
          {stage === 'idle' && (
            <div className="text-center py-8">
              <Mic size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm text-gray-400">点「开始录音」或长按底部 + 号</p>
              <button
                onClick={startListening}
                className="mt-6 px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium active:bg-blue-700"
              >
                开始录音
              </button>
            </div>
          )}

          {/* ===== 录音中 ===== */}
          {stage === 'listening' && (
            <div className="text-center py-8">
              <div className="relative mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                <div className="absolute inset-0 bg-red-500/30 rounded-full animate-pulse" />
                <Mic size={40} className="relative text-red-500" />
              </div>
              {transcript ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  {transcript}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">正在聆听，请说话...</p>
              )}
              <p className="text-xs text-gray-400 mt-2">说完后点击下方按钮停止</p>
              <button
                onClick={stopAndProcess}
                className="mt-4 px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium active:bg-blue-700"
              >
                完成
              </button>
            </div>
          )}

          {/* ===== 解析中 ===== */}
          {stage === 'processing' && (
            <div className="text-center py-8">
              <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">正在解析...</p>
              {transcript && (
                <p className="text-xs text-gray-400 mt-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                  {transcript}
                </p>
              )}
            </div>
          )}

          {/* ===== 解析结果 ===== */}
          {stage === 'result' && result && (
            <div className="py-4 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-700 dark:text-green-300">解析成功</span>
              </div>
              {transcript && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">你说的是</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{transcript}</p>
                </div>
              )}
              <div className="space-y-3 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">事项</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">{result.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">金额</span>
                  <span className="font-bold text-xl text-red-500">¥{result.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">账户</span>
                  <span className="text-gray-700 dark:text-gray-300">{result.account}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">类型</span>
                  <span className="text-red-500 font-medium">支出</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleRetry} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 active:bg-gray-50">
                  重新录音
                </button>
                <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium active:bg-blue-700">
                  确认保存
                </button>
              </div>
            </div>
          )}

          {/* ===== 错误 ===== */}
          {stage === 'error' && (
            <div className="text-center py-4">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errorMsg}</p>
              <div className="flex gap-3">
                <button onClick={() => startListening()} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium active:bg-blue-700">
                  重试
                </button>
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 active:bg-gray-50">
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-white/60 mt-4 text-center max-w-xs">
          长按底部 + 号直接录音 · 说完点击完成
        </p>
      </div>
    </>
  );
}

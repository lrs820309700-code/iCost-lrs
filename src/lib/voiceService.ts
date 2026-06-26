interface DeepSeekParseResult {
  type: 'expense' | 'income';
  amount: number;
  category: string;
  account: string;
  note: string;
}

export interface VoiceExpenseResult {
  title: string;
  account: string;
  amount: number;
  type: 'expense';
  note: string;
}

const ACCOUNT_KEYWORDS: Record<string, string[]> = {
  "微信支付": ["微信支付", "微信", "wx"],
  "支付宝": ["支付宝", "支付包", "alipay"],
  "银行卡": ["银行卡", "银行", "储蓄卡", "信用卡"],
  "现金": ["现金"],
};

const DEFAULT_ACCOUNT = "微信支付";

/** 用本地关键词匹配解析语音文本，不需要 API */
export function parseVoiceExpense(text: string): VoiceExpenseResult {
  let remaining = text;

  // 1. 提取金额
  const amountRegex = /(\d+(?:\.\d+)?)\s*(?:元|块|分)?/;
  const amountMatch = remaining.match(amountRegex);
  let amount = 0;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
    // 去掉金额及周围的词
    remaining = remaining.replace(/(?:花了|支付了|付了|给了|扣了|用了)?\d+(?:\.\d+)?\s*(?:元|块|分)?/, '').trim();
  }

  // 2. 提取账户
  let account = DEFAULT_ACCOUNT;
  const allKeywords = Object.entries(ACCOUNT_KEYWORDS);
  for (const [accName, keywords] of allKeywords) {
    for (const kw of keywords) {
      const idx = remaining.indexOf(kw);
      if (idx !== -1) {
        account = accName;
        // 去掉账户关键词和旁边的支付动词
        remaining = remaining.replace(new RegExp(`(?:用|通过)?${kw}(?:支付|付了|花了|转了)?`, 'g'), '').trim();
        break;
      }
    }
    if (account !== DEFAULT_ACCOUNT) break;
  }

  // 3. 去掉剩下的支付动词和语气词
  remaining = remaining.replace(/(?:支付了|付了|花了|给了|扣了|用了|了|买)/g, '').trim();
  remaining = remaining.replace(/^(?:买了|购买了|买了|买)/, '').trim();

  // 4. 剩下的就是 title
  const title = remaining || "日常消费";

  return {
    title,
    account,
    amount,
    type: 'expense',
    note: title,
  };
}

// 调用 DeepSeek API 解析语音转文字后的内容
export async function parseWithDeepSeek(
  text: string,
  categories: string[],
  accounts: string[]
): Promise<DeepSeekParseResult> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('请先在 .env 文件中配置 VITE_DEEPSEEK_API_KEY');
  }

  const prompt = `你是一个智能记账助手。请解析用户的语音输入，提取记账信息。

用户可用的支出分类：${categories.join('、')}
用户可用的收入分类：工资、兼职、奖金、其他
用户可用的账户：${accounts.join('、')}

请从以下语音文本中提取：
1. 类型：支出或收入
2. 金额：数字
3. 分类：从可用分类中选择最匹配的
4. 账户：从可用账户中选择最匹配的
5. 备注：简要描述（如果没有可留空）

语音文本："${text}"

请只返回 JSON 格式，不要其他文字：
{"type":"expense 或 income","amount":数字,"category":"分类","account":"账户","note":"备注"}`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 错误: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // 从返回内容中提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('无法解析 DeepSeek 返回结果');
  }

  const result = JSON.parse(jsonMatch[0]) as DeepSeekParseResult;
  return result;
}

// 语音识别（浏览器 Web Speech API）
export function startSpeechRecognition(
  onResult: (text: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
): SpeechRecognition | null {
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    onError('您的浏览器不支持语音识别，请使用 Chrome / Edge');
    return null;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = 'zh-CN';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript;
      }
    }
    if (finalText) {
      onResult(finalText);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    onError(`语音识别错误: ${event.error}`);
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();
  return recognition;
}

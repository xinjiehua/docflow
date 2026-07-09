import { useState, useCallback, useEffect } from 'react';

interface PasswordItem {
  password: string;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

function evaluateStrength(password: string): { strength: PasswordItem['strength']; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password) && password.length >= 12) score++;

  if (score <= 3) return { strength: 'weak', score };
  if (score <= 5) return { strength: 'medium', score };
  if (score <= 7) return { strength: 'strong', score };
  return { strength: 'very-strong', score };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<PasswordItem[]>([]);
  const [customChars, setCustomChars] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const generate = useCallback(() => {
    let chars = '';
    let required: string[] = [];
    if (useLower) { chars += 'abcdefghijklmnopqrstuvwxyz'; required.push('abcdefghijklmnopqrstuvwxyz'); }
    if (useUpper) { chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; required.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); }
    if (useDigits) { chars += '0123456789'; required.push('0123456789'); }
    if (useSymbols) { chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'; required.push('!@#$%^&*()_+-=[]{}|;:,.<>?'); }
    if (customChars) { chars += customChars; }
    if (excludeAmbiguous) {
      chars = chars.replace(/[0OIl1|]/g, '');
      required = required.map(s => s.replace(/[0OIl1|]/g, ''));
    }
    if (!chars) return;

    const items: PasswordItem[] = [];
    const arr = new Uint32Array(length);
    for (let i = 0; i < count; i++) {
      crypto.getRandomValues(arr);
      let password = '';
      for (let j = 0; j < length; j++) {
        password += chars[arr[j] % chars.length];
      }
      // Ensure at least one char from each required set
      required.forEach(req => {
        if (req && !password.split('').some(c => req.includes(c))) {
          const pos = arr[0] % length;
          const rChar = req[Math.floor(arr[1] % req.length)];
          password = password.substring(0, pos) + rChar + password.substring(pos + 1);
        }
      });
      const eval_ = evaluateStrength(password);
      items.push({ password, strength: eval_.strength, score: eval_.score });
    }
    setResults(items);
  }, [length, useLower, useUpper, useDigits, useSymbols, excludeAmbiguous, count, customChars]);

  useEffect(() => { generate(); }, [generate]);

  const copyPassword = (pw: string) => {
    navigator.clipboard.writeText(pw);
    setCopied(pw);
    setTimeout(() => setCopied(null), 2000);
  };

  const strengthConfig = {
    'weak': { label: '弱', color: 'bg-red-500', textColor: 'text-red-600', bg: 'bg-red-50' },
    'medium': { label: '中等', color: 'bg-yellow-500', textColor: 'text-yellow-600', bg: 'bg-yellow-50' },
    'strong': { label: '强', color: 'bg-green-500', textColor: 'text-green-600', bg: 'bg-green-50' },
    'very-strong': { label: '非常强', color: 'bg-blue-500', textColor: 'text-blue-600', bg: 'bg-blue-50' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🔐 密码生成器</h1>
          <p className="text-gray-500 mt-2">自定义长度/字符类型，批量生成，密码强度评估</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">生成设置</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">密码长度</span><span className="text-gray-800 font-bold text-lg">{length}</span></div>
              <input type="range" min={4} max={64} value={length} onChange={e => setLength(+e.target.value)} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400"><span>4</span><span>64</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '小写字母 (a-z)', checked: useLower, set: setUseLower },
                { label: '大写字母 (A-Z)', checked: useUpper, set: setUseUpper },
                { label: '数字 (0-9)', checked: useDigits, set: setUseDigits },
                { label: '特殊符号 (!@#$...)', checked: useSymbols, set: setUseSymbols },
              ].map(item => (
                <label key={item.label} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" checked={item.checked} onChange={e => item.set(e.target.checked)} className="accent-blue-600 w-4 h-4" />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">批量生成数量</label>
                <input type="number" min={1} max={50} value={count} onChange={e => setCount(Math.max(1, Math.min(50, +e.target.value)))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-600">自定义字符（可选）</label>
                <input value={customChars} onChange={e => setCustomChars(e.target.value)} placeholder="追加的字符"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={excludeAmbiguous} onChange={e => setExcludeAmbiguous(e.target.checked)} className="accent-blue-600" />
              排除容易混淆的字符 (0, O, I, l, 1, |)
            </label>

            <button onClick={generate} className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              重新生成
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">生成结果</h3>
          {results.map((item, i) => {
            const sc = strengthConfig[item.strength];
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <code className="flex-1 text-lg font-mono text-gray-800 bg-gray-50 p-3 rounded-lg break-all select-all">{item.password}</code>
                  <button onClick={() => copyPassword(item.password)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                    {copied === item.password ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${sc.color}`} style={{ width: `${(item.score / 8) * 100}%` }} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.textColor}`}>{sc.label}</span>
                  <span className="text-xs text-gray-400">{item.password.length} 字符</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

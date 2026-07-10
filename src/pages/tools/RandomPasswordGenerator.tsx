import { useState, useCallback } from 'react';
import { KeyRound } from 'lucide-react';

export default function RandomPasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [count, setCount] = useState(5);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = useCallback(() => {
    let chars = '';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useDigits) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) return;
    const passwords: string[] = [];
    const arr = new Uint32Array(length);
    for (let i = 0; i < count; i++) {
      crypto.getRandomValues(arr);
      passwords.push([...arr].map(v => chars[v % chars.length]).join(''));
    }
    setResults(passwords);
  }, [length, useLower, useUpper, useDigits, useSymbols, count]);

  const copy = (pw: string) => { navigator.clipboard.writeText(pw); setCopied(pw); setTimeout(() => setCopied(null), 1500); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><KeyRound className="w-5 h-5" /> 随机密码生成器</h2>
        <div><label className="text-sm text-navy-600">密码长度: {length}</label><input type="range" min="4" max="64" value={length} onChange={e => setLength(+e.target.value)} className="w-full" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: '小写字母', val: useLower, set: setUseLower },
            { label: '大写字母', val: useUpper, set: setUseUpper },
            { label: '数字', val: useDigits, set: setUseDigits },
            { label: '特殊字符', val: useSymbols, set: setUseSymbols },
          ].map(({label, val, set}) => (
            <button key={label} onClick={() => set(!val)} className={`px-3 py-2 rounded-lg text-sm ${val ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-500 border border-transparent'}`}>{label}</button>
          ))}
        </div>
        <div><label className="text-sm text-navy-600">生成数量: {count}</label><input type="range" min="1" max="20" value={count} onChange={e => setCount(+e.target.value)} className="w-full" /></div>
        <button onClick={generate} className="btn-primary text-sm">生成密码</button>
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((pw, i) => (
              <div key={i} className="flex items-center justify-between bg-navy-50 rounded-lg px-3 py-2">
                <code className="text-sm text-navy-700 font-mono break-all flex-1 mr-3">{pw}</code>
                <button onClick={() => copy(pw)} className="text-xs text-brand-600 shrink-0">{copied === pw ? '已复制' : '复制'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Code2 } from 'lucide-react';

export default function RegexVisualizer() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('gi');
  const [testStr, setTestStr] = useState('');
  const [matches, setMatches] = useState<{text: string; index: number}[]>([]);
  const [error, setError] = useState('');

  const test = () => {
    setError('');
    setMatches([]);
    if (!pattern) return;
    try {
      const regex = new RegExp(pattern, flags);
      const result: {text: string; index: number}[] = [];
      let m;
      const safeRegex = new RegExp(pattern.replace(/\*/g, '\\*'), flags);
      while ((m = safeRegex.exec(testStr)) !== null) {
        result.push({ text: m[0], index: m.index });
        if (m[0].length === 0) safeRegex.lastIndex++;
        if (result.length > 500) break;
      }
      setMatches(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '无效的正则表达式');
    }
  };

  const highlightText = () => {
    if (!testStr || matches.length === 0) return testStr;
    const parts: {text: string; match: boolean}[] = [];
    let lastIdx = 0;
    matches.forEach(m => {
      if (m.index > lastIdx) parts.push({text: testStr.slice(lastIdx, m.index), match: false});
      parts.push({text: m.text, match: true});
      lastIdx = m.index + m.text.length;
    });
    if (lastIdx < testStr.length) parts.push({text: testStr.slice(lastIdx), match: false});
    return parts.map((p, i) => p.match ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{p.text}</mark> : <span key={i}>{p.text}</span>);
  };

  const CHEATSHEET = [
    { symbol: '.', desc: '任意字符' }, { symbol: '\\d', desc: '数字 [0-9]' }, { symbol: '\\w', desc: '单词字符' },
    { symbol: '\\s', desc: '空白字符' }, { symbol: '^', desc: '行首' }, { symbol: '$', desc: '行尾' },
    { symbol: '*', desc: '0次或多次' }, { symbol: '+', desc: '1次或多次' }, { symbol: '?', desc: '0次或1次' },
    { symbol: '{n,m}', desc: 'n到m次' }, { symbol: '[abc]', desc: '字符集' }, { symbol: '(abc)', desc: '捕获组' },
    { symbol: '(?=)', desc: '前瞻' }, { symbol: '(?<=)', desc: '后顾' }, { symbol: '|', desc: '或' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Code2 className="w-5 h-5" /> 正则表达式可视化测试</h2>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input type="text" value={pattern} onChange={e => setPattern(e.target.value)} placeholder="输入正则表达式" className="px-3 py-2 rounded-lg border border-navy-200 text-sm font-mono" />
          <input type="text" value={flags} onChange={e => setFlags(e.target.value)} className="w-16 px-2 py-2 rounded-lg border border-navy-200 text-sm font-mono text-center" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div><label className="text-sm text-navy-600">测试字符串</label><textarea value={testStr} onChange={e => setTestStr(e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm font-mono resize-y" placeholder="输入要匹配的文本" /></div>
        <button onClick={test} className="btn-primary text-sm">测试匹配</button>
        {matches.length > 0 && (
          <>
            <div><label className="text-sm text-navy-600">匹配结果 ({matches.length}处)</label>
              <div className="bg-navy-50 rounded-lg p-3 mt-1 text-sm font-mono whitespace-pre-wrap break-all">{highlightText()}</div>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {matches.map((m, i) => <div key={i} className="flex gap-2 text-xs"><span className="text-navy-400 w-12"># {i + 1}</span><code className="text-brand-600">"{m.text}"</code><span className="text-navy-400">@ {m.index}</span></div>)}
            </div>
          </>
        )}
      </div>
      <div className="card space-y-3">
        <h3 className="text-sm font-medium text-navy-700">常用语法速查</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CHEATSHEET.map(c => <div key={c.symbol} className="flex gap-2 text-xs bg-navy-50 rounded-lg px-2 py-1.5"><code className="text-brand-600 font-mono">{c.symbol}</code><span className="text-navy-500">{c.desc}</span></div>)}
        </div>
      </div>
    </div>
  );
}

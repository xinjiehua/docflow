import { useState } from 'react';
import { Percent } from 'lucide-react';

export default function PercentageCalculator() {
  const [mode, setMode] = useState<'basic' | 'change' | 'of'>('basic');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [result, setResult] = useState('');

  const calc = () => {
    const a = parseFloat(val1), b = parseFloat(val2);
    if (isNaN(a) || isNaN(b)) return;
    if (mode === 'basic') setResult(`${a} 的 ${b}% = ${(a * b / 100).toFixed(4).replace(/\.?0+$/, '')}`);
    else if (mode === 'change') {
      if (b === 0) { setResult('除数不能为0'); return; }
      const change = ((a - b) / b * 100);
      setResult(`从 ${b} 到 ${a}，变化了 ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`);
    } else {
      if (a === 0) { setResult('除数不能为0'); return; }
      setResult(`${a} 占 ${b} 的 ${(a / b * 100).toFixed(2)}%`);
    }
  };

  const labels = {
    basic: { l1: '数值', l2: '百分比 (%)', title: '数值的百分比' },
    change: { l1: '新值', l2: '旧值', title: '百分比变化' },
    of: { l1: '部分值', l2: '整体值', title: '占比计算' },
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Percent className="w-5 h-5" /> 百分比计算器</h2>
        <div className="flex gap-2">
          {(['basic', 'change', 'of'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(''); }} className={`flex-1 px-3 py-2 rounded-lg text-sm ${mode === m ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>{labels[m].title}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm text-navy-600">{labels[mode].l1}</label><input type="number" value={val1} onChange={e => setVal1(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
          <div><label className="text-sm text-navy-600">{labels[mode].l2}</label><input type="number" value={val2} onChange={e => setVal2(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        </div>
        <button onClick={calc} className="btn-primary w-full">计算</button>
        {result && <div className="bg-brand-50 rounded-xl p-4"><p className="text-lg font-semibold text-brand-700">{result}</p></div>}
      </div>
    </div>
  );
}

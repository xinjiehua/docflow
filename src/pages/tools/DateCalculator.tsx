import { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function DateCalculator() {
  const [mode, setMode] = useState<'diff' | 'add'>('diff');
  const [date1, setDate1] = useState(() => new Date().toISOString().slice(0, 10));
  const [date2, setDate2] = useState('');
  const [addDays, setAddDays] = useState('30');
  const [addMonths, setAddMonths] = useState('0');
  const [addYears, setAddYears] = useState('0');
  const [result, setResult] = useState<string[]>([]);

  const calcDiff = () => {
    if (!date2) return;
    const d1 = new Date(date1), d2 = new Date(date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.floor(diffMs / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.abs((d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth());
    const years = Math.floor(months / 12);
    const hours = days * 24;
    const mins = hours * 60;
    setResult([
      `相差 ${days} 天`,
      `约 ${weeks} 周 ${days % 7} 天`,
      `约 ${months} 个月`,
      `约 ${years} 年 ${months % 12} 个月`,
      `= ${hours.toLocaleString()} 小时`,
      `= ${mins.toLocaleString()} 分钟`,
    ]);
  };

  const calcAdd = () => {
    const d = new Date(date1);
    d.setDate(d.getDate() + parseInt(addDays || '0'));
    d.setMonth(d.getMonth() + parseInt(addMonths || '0'));
    d.setFullYear(d.getFullYear() + parseInt(addYears || '0'));
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    setResult([
      `结果日期: ${d.toISOString().slice(0, 10)}`,
      `星期${weekDays[d.getDay()]}`,
      `距今 ${date1 === new Date().toISOString().slice(0, 10) ? '' : '从起始日'} ${Math.ceil((d.getTime() - new Date(date1).getTime()) / 86400000)} 天`,
    ]);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Calendar className="w-5 h-5" /> 日期计算器</h2>
        <div className="flex gap-2">
          <button onClick={() => setMode('diff')} className={`flex-1 px-3 py-2 rounded-lg text-sm ${mode === 'diff' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>日期差计算</button>
          <button onClick={() => setMode('add')} className={`flex-1 px-3 py-2 rounded-lg text-sm ${mode === 'add' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>日期推算</button>
        </div>
        <div>
          <label className="text-sm text-navy-600">起始日期</label>
          <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" />
        </div>
        {mode === 'diff' ? (
          <div>
            <label className="text-sm text-navy-600">结束日期</label>
            <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" />
            <button onClick={calcDiff} disabled={!date2} className="btn-primary w-full mt-3">计算差值</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs text-navy-500">天</label><input type="number" value={addDays} onChange={e => setAddDays(e.target.value)} className="w-full px-2 py-2 rounded-lg border border-navy-200 text-sm" /></div>
              <div><label className="text-xs text-navy-500">月</label><input type="number" value={addMonths} onChange={e => setAddMonths(e.target.value)} className="w-full px-2 py-2 rounded-lg border border-navy-200 text-sm" /></div>
              <div><label className="text-xs text-navy-500">年</label><input type="number" value={addYears} onChange={e => setAddYears(e.target.value)} className="w-full px-2 py-2 rounded-lg border border-navy-200 text-sm" /></div>
            </div>
            <button onClick={calcAdd} className="btn-primary w-full">推算日期</button>
          </div>
        )}
        {result.length > 0 && (
          <div className="bg-green-50 rounded-xl p-4 space-y-1">
            {result.map((r, i) => <p key={i} className="text-sm text-green-700">{r}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

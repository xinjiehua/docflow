import { useState, useMemo } from 'react';
import { Banknote } from 'lucide-react';

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('1000000');
  const [rate, setRate] = useState('4.2');
  const [years, setYears] = useState('30');
  const [method, setMethod] = useState<'equal' | 'principal'>('equal');

  const result = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = (parseInt(years) || 0) * 12;
    if (P <= 0 || r <= 0 || n <= 0) return null;

    if (method === 'equal') {
      const monthly = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const total = monthly * n;
      const interest = total - P;
      return { monthly, total, interest, method: '等额本息' };
    } else {
      const monthlyPrincipal = P / n;
      const firstMonth = monthlyPrincipal + P * r;
      const lastMonth = monthlyPrincipal + monthlyPrincipal * r;
      const totalInterest = (n + 1) * P * r / 2;
      const total = P + totalInterest;
      return { monthly: firstMonth, total, interest: totalInterest, method: '等额本金', lastMonth, monthlyPrincipal };
    }
  }, [principal, rate, years, method]);

  const fmt = (n: number) => n.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Banknote className="w-5 h-5" /> 贷款计算器</h2>
        <div className="flex gap-2">
          <button onClick={() => setMethod('equal')} className={`flex-1 px-3 py-2 rounded-lg text-sm ${method === 'equal' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600'}`}>等额本息</button>
          <button onClick={() => setMethod('principal')} className={`flex-1 px-3 py-2 rounded-lg text-sm ${method === 'principal' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600'}`}>等额本金</button>
        </div>
        <div><label className="text-sm text-navy-600">贷款金额 (元)</label><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div><label className="text-sm text-navy-600">年利率 (%)</label><input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div><label className="text-sm text-navy-600">贷款年限</label><input type="number" min="1" max="50" value={years} onChange={e => setYears(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        {result && (
          <div className="bg-navy-50 rounded-xl p-4 space-y-3">
            <div className="text-center text-sm text-navy-500">{result.method}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center"><div className="text-2xl font-bold text-brand-600">{fmt(result.monthly)}</div><div className="text-xs text-navy-400">{method === 'principal' ? '首月月供' : '月供'}</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-navy-700">{fmt(result.interest)}</div><div className="text-xs text-navy-400">总利息</div></div>
            </div>
            <div className="text-center"><div className="text-lg font-medium text-navy-700">还款总额: {fmt(result.total)} 元</div></div>
            {method === 'principal' && 'lastMonth' in result && (
              <div className="text-center text-sm text-navy-500">末月月供: {fmt((result as {lastMonth: number}).lastMonth)} 元</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

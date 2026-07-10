import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

const rates: Record<string, number> = {
  'CNY': 1, 'USD': 0.1389, 'EUR': 0.1277, 'GBP': 0.1092, 'JPY': 21.37,
  'KRW': 190.14, 'HKD': 1.082, 'TWD': 4.444, 'SGD': 0.1873, 'AUD': 0.2134,
  'CAD': 0.1912, 'CHF': 0.1234, 'THB': 4.835, 'MYR': 0.6152, 'RUB': 13.56,
  'INR': 11.63, 'BRL': 0.7708, 'MXN': 2.698, 'PHP': 7.921, 'VND': 3470,
};

const names: Record<string, string> = {
  'CNY': '人民币', 'USD': '美元', 'EUR': '欧元', 'GBP': '英镑', 'JPY': '日元',
  'KRW': '韩元', 'HKD': '港币', 'TWD': '新台币', 'SGD': '新加坡元', 'AUD': '澳元',
  'CAD': '加元', 'CHF': '瑞士法郎', 'THB': '泰铢', 'MYR': '马来西亚令吉', 'RUB': '卢布',
  'INR': '印度卢比', 'BRL': '巴西雷亚尔', 'MXN': '墨西哥比索', 'PHP': '菲律宾比索', 'VND': '越南盾',
};

const currencyList = Object.keys(rates);

export default function ExchangeRateCalculator() {
  const [from, setFrom] = useState('CNY');
  const [to, setTo] = useState('USD');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState('');

  const convert = () => {
    const a = parseFloat(amount);
    if (isNaN(a)) return;
    const cny = a / rates[from];
    const res = cny * rates[to];
    setResult(res.toFixed(4).replace(/\.?0+$/, ''));
  };

  const swap = () => {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
    setResult('');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> 汇率计算器</h2>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
          <div>
            <label className="text-sm text-navy-600">从</label>
            <select value={from} onChange={e => { setFrom(e.target.value); setResult(''); }} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm mt-1">
              {currencyList.map(c => <option key={c} value={c}>{c} - {names[c]}</option>)}
            </select>
          </div>
          <button onClick={swap} className="btn-secondary text-sm px-3 py-2 mb-0.5">⇄</button>
          <div>
            <label className="text-sm text-navy-600">到</label>
            <select value={to} onChange={e => { setTo(e.target.value); setResult(''); }} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm mt-1">
              {currencyList.map(c => <option key={c} value={c}>{c} - {names[c]}</option>)}
            </select>
          </div>
        </div>
        <div><label className="text-sm text-navy-600">金额</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <button onClick={convert} className="btn-primary w-full">换算</button>
        {result && (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-green-600">{amount} {names[from]} =</p>
            <p className="text-2xl font-bold text-green-700">{result} {names[to]}</p>
            <p className="text-xs text-green-500 mt-1">参考汇率 (仅供参考，非实时)</p>
          </div>
        )}
      </div>
    </div>
  );
}

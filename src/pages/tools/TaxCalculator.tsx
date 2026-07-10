import { useState, useMemo } from 'react';
import { Banknote } from 'lucide-react';

const TAX_BRACKETS_2024 = [
  { min: 0, max: 36000, rate: 0.03, deduction: 0 },
  { min: 36000, max: 144000, rate: 0.10, deduction: 2520 },
  { min: 144000, max: 300000, rate: 0.20, deduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, deduction: 31920 },
  { min: 420000, max: 660000, rate: 0.30, deduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, deduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, deduction: 181920 },
];

function calcTax(taxableIncome: number): number {
  for (const b of TAX_BRACKETS_2024) {
    if (taxableIncome <= b.max) return taxableIncome * b.rate - b.deduction;
  }
  return 0;
}

export default function TaxCalculator() {
  const [monthlySalary, setMonthlySalary] = useState('15000');
  const [threshold, setThreshold] = useState('5000');
  const [insurance, setInsurance] = useState('2000');
  const [specialDeduction, setSpecialDeduction] = useState('0');
  const [bonus, setBonus] = useState('0');

  const result = useMemo(() => {
    const salary = parseFloat(monthlySalary) || 0;
    const t = parseFloat(threshold) || 0;
    const ins = parseFloat(insurance) || 0;
    const special = parseFloat(specialDeduction) || 0;
    const b = parseFloat(bonus) || 0;

    const monthlyTaxable = Math.max(0, salary - t - ins - special);
    const annualTaxable = monthlyTaxable * 12 + b;
    const annualTax = calcTax(annualTaxable);
    const monthlyTaxNoBonus = calcTax(monthlyTaxable * 12) / 12;

    return {
      monthlyTaxable,
      annualTaxable,
      annualTax,
      monthlyTaxNoBonus,
      monthlyIncome: salary - ins - monthlyTaxNoBonus,
      effectiveRate: annualTaxable > 0 ? (annualTax / (salary * 12 + b) * 100) : 0,
    };
  }, [monthlySalary, threshold, insurance, specialDeduction, bonus]);

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Banknote className="w-5 h-5" /> 个税计算器 (2024)</h2>
        <div><label className="text-sm text-navy-600">月薪 (税前)</label><input type="number" value={monthlySalary} onChange={e => setMonthlySalary(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div><label className="text-sm text-navy-600">起征点</label><input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div><label className="text-sm text-navy-600">五险一金 (个人缴纳)</label><input type="number" value={insurance} onChange={e => setInsurance(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div><label className="text-sm text-navy-600">专项附加扣除 (月)</label><input type="number" value={specialDeduction} onChange={e => setSpecialDeduction(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div><label className="text-sm text-navy-600">年终奖 (单独计税)</label><input type="number" value={bonus} onChange={e => setBonus(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div className="bg-navy-50 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center"><div className="text-xl font-bold text-brand-600">{fmt(result.monthlyTaxNoBonus)}</div><div className="text-xs text-navy-400">月缴个税</div></div>
            <div className="text-center"><div className="text-xl font-bold text-green-600">{fmt(result.monthlyIncome)}</div><div className="text-xs text-navy-400">月到手</div></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-navy-500 mt-2 pt-2 border-t border-navy-100">
            <div>月应纳税所得额: {fmt(result.monthlyTaxable)}</div>
            <div>年应纳税所得额: {fmt(result.annualTaxable)}</div>
            <div>年缴个税: {fmt(result.annualTax)}</div>
            <div>有效税率: {result.effectiveRate.toFixed(2)}%</div>
          </div>
        </div>
      </div>
      <div className="card !p-4 text-xs text-navy-400">
        <p>基于2024年个人所得税税率表计算，仅供参考。专项附加扣除包括子女教育、继续教育、大病医疗、住房贷款利息、住房租金、赡养老人等。</p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function BmiCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [result, setResult] = useState<{bmi: number; cat: string; color: string} | null>(null);

  const calc = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return;
    const bmi = w / (h * h);
    let cat: string, color: string;
    if (bmi < 18.5) { cat = '偏瘦'; color = 'text-blue-600'; }
    else if (bmi < 24) { cat = '正常'; color = 'text-green-600'; }
    else if (bmi < 28) { cat = '偏胖'; color = 'text-yellow-600'; }
    else { cat = '肥胖'; color = 'text-red-600'; }
    setResult({ bmi, cat, color });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Heart className="w-5 h-5" /> BMI 计算器</h2>
        <div><label className="text-sm text-navy-600">性别</label>
          <div className="flex gap-2 mt-1">
            <button onClick={() => setGender('male')} className={`px-4 py-2 rounded-lg text-sm ${gender === 'male' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>男</button>
            <button onClick={() => setGender('female')} className={`px-4 py-2 rounded-lg text-sm ${gender === 'female' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>女</button>
          </div>
        </div>
        <div><label className="text-sm text-navy-600">身高 (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div><label className="text-sm text-navy-600">体重 (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <div><label className="text-sm text-navy-600">年龄 (岁)</label><input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        <button onClick={calc} className="btn-primary w-full">计算 BMI</button>
        {result && (
          <div className="bg-navy-50 rounded-xl p-6 text-center space-y-2">
            <div className={`text-4xl font-bold ${result.color}`}>{result.bmi.toFixed(1)}</div>
            <div className={`text-lg font-medium ${result.color}`}>{result.cat}</div>
            <div className="w-full bg-navy-200 rounded-full h-3 mt-4">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-blue-400 flex-1" /><div className="bg-green-400 flex-1" /><div className="bg-yellow-400 flex-1" /><div className="bg-red-400 flex-1" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-navy-400 mt-1"><span>偏瘦 &lt;18.5</span><span>正常</span><span>偏胖</span><span>肥胖 &ge;28</span></div>
          </div>
        )}
      </div>
      <div className="card !p-4 text-xs text-navy-400">
        <p>BMI = 体重(kg) / 身高(m)²。中国标准：&lt;18.5偏瘦，18.5-24正常，24-28偏胖，&ge;28肥胖。</p>
      </div>
    </div>
  );
}

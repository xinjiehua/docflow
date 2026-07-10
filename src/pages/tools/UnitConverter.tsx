import { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const units: Record<string, Record<string, number>> = {
  '长度': { '米': 1, '千米': 0.001, '厘米': 100, '毫米': 1000, '英里': 0.000621371, '英尺': 3.28084, '英寸': 39.3701, '码': 1.09361 },
  '重量': { '千克': 1, '克': 1000, '毫克': 1000000, '磅': 2.20462, '盎司': 35.274, '吨': 0.001, '斤': 2, '两': 20 },
  '面积': { '平方米': 1, '平方千米': 0.000001, '公顷': 0.0001, '亩': 0.0015, '平方英尺': 10.7639, '平方英里': 3.861e-7, '英亩': 0.000247105 },
  '体积': { '升': 1, '毫升': 1000, '立方米': 0.001, '加仑': 0.264172, '品脱': 2.11338, '杯': 4.22675 },
  '温度': {},
  '速度': { '米/秒': 1, '千米/时': 3.6, '英里/时': 2.23694, '节': 1.94384, '马赫': 0.00293858 },
  '数据': { '字节': 1, 'KB': 0.000976563, 'MB': 9.53674e-7, 'GB': 9.31323e-10, 'TB': 9.09495e-13, '比特': 8 },
  '时间': { '秒': 1, '毫秒': 1000, '分钟': 1/60, '小时': 1/3600, '天': 1/86400, '周': 1/604800, '月': 1/2592000, '年': 1/31536000 },
};

const catKeys = Object.keys(units);

export default function UnitConverter() {
  const [cat, setCat] = useState('长度');
  const [fromUnit, setFromUnit] = useState('米');
  const [toUnit, setToUnit] = useState('千米');
  const [fromVal, setFromVal] = useState('1');
  const [toVal, setToVal] = useState('');

  const currentUnits = units[cat];
  const unitList = cat === '温度' ? ['摄氏度', '华氏度', '开尔文'] : Object.keys(currentUnits);

  const convert = (val: string, from: string, to: string) => {
    const v = parseFloat(val);
    if (isNaN(v)) return '';
    if (cat === '温度') {
      let celsius = v;
      if (from === '华氏度') celsius = (v - 32) * 5/9;
      else if (from === '开尔文') celsius = v - 273.15;
      if (to === '摄氏度') return celsius.toFixed(4);
      if (to === '华氏度') return (celsius * 9/5 + 32).toFixed(4);
      return (celsius + 273.15).toFixed(4);
    }
    const base = v * currentUnits[from];
    return (base / currentUnits[to]).toFixed(6).replace(/\.?0+$/, '');
  };

  const handleFrom = (val: string) => {
    setFromVal(val);
    setToVal(convert(val, fromUnit, toUnit));
  };

  const handleSwap = () => {
    const oldFrom = fromUnit, oldTo = toUnit;
    setFromUnit(oldTo);
    setToUnit(oldFrom);
    const newToVal = convert(fromVal, oldTo, oldFrom);
    setToVal(newToVal);
    const tmp = fromVal;
    setFromVal(toVal);
    setToVal(tmp);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> 单位转换器</h2>
        <div className="flex gap-1.5 flex-wrap">
          {catKeys.map(k => <button key={k} onClick={() => { setCat(k); setFromUnit(unitList[0] || ''); setToUnit(unitList[1] || unitList[0] || ''); setFromVal('1'); setToVal(''); }} className={`px-3 py-1.5 rounded-lg text-xs ${cat === k ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-500 border border-transparent'}`}>{k}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <select value={fromUnit} onChange={e => { setFromUnit(e.target.value); setToVal(convert(fromVal, e.target.value, toUnit)); }} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm mb-2">
              {unitList.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={fromVal} onChange={e => handleFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm" placeholder="输入数值" />
          </div>
          <div>
            <select value={toUnit} onChange={e => { setToUnit(e.target.value); setToVal(convert(fromVal, fromUnit, e.target.value)); }} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm mb-2">
              {unitList.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="text" value={toVal} readOnly className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm bg-navy-50" />
          </div>
        </div>
        <button onClick={handleSwap} className="btn-secondary text-sm mx-auto flex items-center gap-1"><ArrowRightLeft className="w-4 h-4" /> 交换</button>
      </div>
    </div>
  );
}

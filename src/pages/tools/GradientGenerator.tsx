import { useState } from 'react';
import { Paintbrush } from 'lucide-react';

export default function GradientGenerator() {
  const [colors, setColors] = useState(['#3b82f6', '#8b5cf6', '#ec4899']);
  const [angle, setAngle] = useState('135');
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [copied, setCopied] = useState('');

  const gradientCSS = type === 'linear'
    ? `linear-gradient(${angle}deg, ${colors.join(', ')})`
    : `radial-gradient(circle, ${colors.join(', ')})`;

  const addColor = () => { setColors([...colors, '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')]); };
  const removeColor = (i: number) => { if (colors.length > 2) setColors(colors.filter((_, idx) => idx !== i)); };
  const updateColor = (i: number, color: string) => { const newC = [...colors]; newC[i] = color; setColors(newC); };

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(''), 1500); };

  const presets = [
    ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#a18cd1', '#fbc2eb'],
    ['#fccb90', '#d57eeb'], ['#e0c3fc', '#8ec5fc'],
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Paintbrush className="w-5 h-5" /> 渐变色生成器</h2>
        <div className="h-48 rounded-xl border border-navy-200" style={{background: gradientCSS}} />
        <div className="flex gap-2">
          <button onClick={() => setType('linear')} className={`px-3 py-1.5 rounded-lg text-sm ${type === 'linear' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600'}`}>线性渐变</button>
          <button onClick={() => setType('radial')} className={`px-3 py-1.5 rounded-lg text-sm ${type === 'radial' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600'}`}>径向渐变</button>
          {type === 'linear' && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-navy-600">角度</span>
              <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(e.target.value)} className="w-24" />
              <span className="text-xs text-navy-500">{angle}°</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1 bg-navy-50 rounded-lg p-1">
              <input type="color" value={c} onChange={e => updateColor(i, e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <input type="text" value={c} onChange={e => updateColor(i, e.target.value)} className="w-20 px-1 py-0.5 rounded border border-navy-200 text-xs font-mono" />
              {colors.length > 2 && <button onClick={() => removeColor(i)} className="text-red-400 text-xs px-1">×</button>}
            </div>
          ))}
          <button onClick={addColor} className="px-2 py-1 text-xs bg-brand-50 text-brand-600 rounded-lg">+ 添加颜色</button>
        </div>
        <div className="bg-navy-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center"><code className="text-xs font-mono text-navy-700">{`background: ${gradientCSS};`}</code><button onClick={() => copy(`background: ${gradientCSS};`)} className="text-xs text-brand-600">{copied.includes('background') ? '已复制' : '复制CSS'}</button></div>
          <div className="flex justify-between items-center"><code className="text-xs font-mono text-navy-700">Tailwind: `bg-gradient-to-br`</code><button onClick={() => copy('bg-gradient-to-br')} className="text-xs text-brand-600">复制</button></div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-navy-700 mb-2">预设渐变</h3>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((p, i) => (
              <div key={i} className="h-12 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" style={{background: `linear-gradient(135deg, ${p.join(', ')})`}} onClick={() => { setColors([...p]); setType('linear'); setAngle('135'); }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Palette } from 'lucide-react';

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function ColorPalette() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [mode, setMode] = useState<'shades' | 'analogous' | 'complementary' | 'triadic'>('shades');
  const [copied, setCopied] = useState('');

  const hex = baseColor.startsWith('#') ? baseColor : '#' + baseColor;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 510;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (510 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }

  const getColors = (): { color: string; label: string }[] => {
    if (mode === 'shades') return [10, 25, 40, 55, 70, 85, 95].map(l => ({ color: hslToHex(h, s * 100, l), label: `L${l}` }));
    if (mode === 'analogous') return [-30, -15, 0, 15, 30].map(offset => ({ color: hslToHex((h + offset + 360) % 360, s * 100, l * 100), label: `${offset}°` }));
    if (mode === 'complementary') return [-10, 0, 10, 180 - 10, 180, 180 + 10].map(offset => ({ color: hslToHex((h + offset + 360) % 360, s * 100, l * 100), label: `${offset}°` }));
    return [0, 120, 240].map(offset => ({ color: hslToHex((h + offset) % 360, s * 100, l * 100), label: `${offset}°` }));
  };

  const colors = getColors();

  const copy = (color: string) => { navigator.clipboard.writeText(color); setCopied(color); setTimeout(() => setCopied(''), 1500); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Palette className="w-5 h-5" /> 配色方案生成器</h2>
        <div className="flex items-center gap-3">
          <input type="color" value={hex} onChange={e => setBaseColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0" />
          <input type="text" value={hex} onChange={e => setBaseColor(e.target.value)} className="px-3 py-2 rounded-lg border border-navy-200 text-sm w-32 font-mono" />
          <span className="text-sm text-navy-500">{hexToRgb(hex)}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'shades' as const, label: '明暗渐变' },
            { id: 'analogous' as const, label: '类似色' },
            { id: 'complementary' as const, label: '互补色' },
            { id: 'triadic' as const, label: '三角色' },
          ].map(m => <button key={m.id} onClick={() => setMode(m.id)} className={`px-3 py-2 rounded-lg text-sm ${mode === m.id ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>{m.label}</button>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {colors.map(({color, label}) => (
            <div key={color + label} className="rounded-xl overflow-hidden cursor-pointer group" onClick={() => copy(color)}>
              <div className="h-24" style={{backgroundColor: color}} />
              <div className="p-2 bg-white border border-t-0 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-navy-600">{color.toUpperCase()}</span>
                  <span className="text-[10px] text-navy-400">{copied === color ? '已复制' : label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

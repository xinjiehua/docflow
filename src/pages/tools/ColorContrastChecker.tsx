import { useState } from 'react';
import { ScanLine } from 'lucide-react';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export default function ColorContrastChecker() {
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#3b82f6');
  const [copied, setCopied] = useState('');

  const [fr, fgr, fb] = hexToRgb(fg);
  const [br, bgr, bb] = hexToRgb(bg);
  const l1 = relativeLuminance(fr, fgr, fb);
  const l2 = relativeLuminance(br, bgr, bb);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  const wcagAA = ratio >= 4.5;
  const wcagAALarge = ratio >= 3;
  const wcagAAA = ratio >= 7;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><ScanLine className="w-5 h-5" /> 颜色对比度检测</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-navy-600">前景色 (文字)</label><input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-full h-10 mt-1 rounded-lg cursor-pointer" /><input type="text" value={fg} onChange={e => setFg(e.target.value)} className="w-full mt-1 px-2 py-1 rounded border border-navy-200 text-xs font-mono" /></div>
          <div><label className="text-sm text-navy-600">背景色</label><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-full h-10 mt-1 rounded-lg cursor-pointer" /><input type="text" value={bg} onChange={e => setBg(e.target.value)} className="w-full mt-1 px-2 py-1 rounded border border-navy-200 text-xs font-mono" /></div>
        </div>
        <div className="rounded-xl p-6 text-center" style={{backgroundColor: bg, color: fg}}>
          <p className="text-2xl font-bold">示例文字 AaBb</p>
          <p className="text-base mt-1">小字示例 14px</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">{ratio.toFixed(2)}:1</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`p-2 rounded-lg text-center ${wcagAA ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="font-medium">AA 普通</div><div>{wcagAA ? '通过' : '不通过'}</div>
            </div>
            <div className={`p-2 rounded-lg text-center ${wcagAALarge ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="font-medium">AA 大字</div><div>{wcagAALarge ? '通过' : '不通过'}</div>
            </div>
            <div className={`p-2 rounded-lg text-center ${wcagAAA ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="font-medium">AAA</div><div>{wcagAAA ? '通过' : '不通过'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

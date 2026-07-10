import { useState } from 'react';
import { Layers } from 'lucide-react';

export default function GlassmorphismGenerator() {
  const [bgColor, setBgColor] = useState('#667eea');
  const [blur, setBlur] = useState('10');
  const [opacity, setOpacity] = useState('20');
  const [borderOpacity, setBorderOpacity] = useState('30');
  const [saturation, setSaturation] = useState('180');
  const [copied, setCopied] = useState('');

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(''), 1500); };

  const cssCode = `.glass {\n  background: rgba(255, 255, 255, ${parseInt(opacity) / 100});\n  backdrop-filter: blur(${blur}px);\n  -webkit-backdrop-filter: blur(${blur}px);\n  border: 1px solid rgba(255, 255, 255, ${parseInt(borderOpacity) / 100});\n  border-radius: 16px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);\n}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Layers className="w-5 h-5" /> 毛玻璃效果生成器</h2>
        <div className="rounded-xl p-8 relative overflow-hidden" style={{background: `linear-gradient(135deg, ${bgColor}, #764ba2)`, minHeight: 200}}>
          <div className="grid grid-cols-2 gap-4 absolute inset-4">
            <div className="rounded-full w-24 h-24 bg-white/20 blur-xl absolute top-8 left-16" />
            <div className="rounded-full w-32 h-32 bg-pink-400/30 blur-xl absolute bottom-8 right-8" />
          </div>
          <div className="relative z-10 p-6 rounded-2xl text-center text-white" style={{background: `rgba(255,255,255,${parseInt(opacity) / 100})`, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, border: `1px solid rgba(255,255,255,${parseInt(borderOpacity) / 100})`}}>
            <p className="text-lg font-semibold">Glassmorphism</p>
            <p className="text-sm opacity-80">毛玻璃效果预览</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-navy-600">背景色</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-8 mt-1 rounded cursor-pointer" /></div>
          <div><label className="text-sm text-navy-600">模糊程度: {blur}px</label><input type="range" min="0" max="30" value={blur} onChange={e => setBlur(e.target.value)} className="w-full mt-2" /></div>
          <div><label className="text-sm text-navy-600">透明度: {opacity}%</label><input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(e.target.value)} className="w-full mt-2" /></div>
          <div><label className="text-sm text-navy-600">边框透明度: {borderOpacity}%</label><input type="range" min="0" max="100" value={borderOpacity} onChange={e => setBorderOpacity(e.target.value)} className="w-full mt-2" /></div>
        </div>
        <div className="bg-navy-50 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <pre className="text-xs font-mono text-navy-700 whitespace-pre-wrap">{cssCode}</pre>
            <button onClick={() => copy(cssCode)} className="text-xs text-brand-600 shrink-0 ml-2">{copied === cssCode ? '已复制' : '复制CSS'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

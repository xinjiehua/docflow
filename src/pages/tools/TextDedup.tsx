import { useState } from 'react';
import { Eraser } from 'lucide-react';
export default function TextDedup() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{o:number;u:number} | null>(null);
  const go = () => { const lines=input.split('\n').filter(l=>l.trim()); const u=[...new Set(lines.map(l=>l.trim()))]; setOutput(u.join('\n')); setStats({o:lines.length,u:u.length}); };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8"><div className="card !p-8">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><Eraser className="w-6 h-6" /></div><div><h1 className="text-2xl font-bold text-navy-800">文本去重</h1><p className="text-sm text-navy-400">去除重复行</p></div></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="输入需要去重的文本，每行一条..." rows={10} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm resize-none" /></div>
        <div><textarea value={output} readOnly rows={10} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 bg-navy-50 text-sm resize-none" /></div>
      </div>
      {stats && <div className="mt-4 grid grid-cols-2 gap-3"><div className="bg-navy-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-navy-700">{stats.o}</div><div className="text-xs text-navy-400">原始</div></div><div className="bg-brand-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-brand-600">{stats.u}</div><div className="text-xs text-navy-400">去重后</div></div></div>}
      <div className="flex gap-3 mt-4">
        <button onClick={go} className="btn-primary">去重</button>
        <button onClick={()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="btn-secondary" disabled={!output}>{copied?'已复制':'复制结果'}</button>
        <button onClick={()=>{setInput('');setOutput('');setStats(null)}} className="btn-secondary !text-navy-400">清空</button>
      </div>
    </div></div>
  );
}
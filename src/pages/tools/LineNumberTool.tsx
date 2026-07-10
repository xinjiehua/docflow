import { useState } from 'react';
import { Hash } from 'lucide-react';
export default function LineNumberTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('add');
  const [startNum, setStartNum] = useState(1);
  const [copied, setCopied] = useState(false);
  const go = () => { if(mode==='add'){const lines=input.split('\n');setOutput(lines.map((l,i)=>`${String(i+startNum).padStart(String(lines.length+startNum-1).length,' ')}. ${l}`).join('\n'))}else{setOutput(input.split('\n').map(l=>l.replace(/^\s*\d+[.、)）]\s*/,'')).join('\n'))} };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8"><div className="card !p-8">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><Hash className="w-6 h-6" /></div><div><h1 className="text-2xl font-bold text-navy-800">行号工具</h1><p className="text-sm text-navy-400">为文本添加或去除行号</p></div></div>
      <div className="flex gap-2 mb-4 items-center">
        <button onClick={()=>setMode('add')} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode==='add'?'bg-brand-50 text-brand-700 border border-brand-200':'bg-navy-50 text-navy-500'}`}>添加行号</button>
        <button onClick={()=>setMode('remove')} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode==='remove'?'bg-brand-50 text-brand-700 border border-brand-200':'bg-navy-50 text-navy-500'}`}>去除行号</button>
        {mode==='add' && <span className="text-sm text-navy-600 ml-2">起始: <input type="number" value={startNum} onChange={e=>setStartNum(+e.target.value||1)} className="w-16 px-2 py-1 rounded border border-navy-200 text-sm" min={1} /></span>}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="输入文本..." rows={10} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm resize-none" /></div>
        <div><textarea value={output} readOnly rows={10} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 bg-navy-50 text-sm resize-none font-mono" /></div>
      </div>
      <div className="flex gap-3 mt-4"><button onClick={go} className="btn-primary">{mode==='add'?'添加行号':'去除行号'}</button><button onClick={()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="btn-secondary" disabled={!output}>{copied?'已复制':'复制'}</button></div>
    </div></div>
  );
}
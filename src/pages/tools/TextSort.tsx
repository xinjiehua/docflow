import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
export default function TextSort() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [sortType, setSortType] = useState('asc');
  const [copied, setCopied] = useState(false);
  const go = () => { const lines=input.split('\n').filter(l=>l.trim()); let s; if(sortType==='random'){s=[...lines].sort(()=>Math.random()-0.5)}else{s=[...lines].sort((a,b)=>sortType==='asc'?a.localeCompare(b,'zh'):b.localeCompare(a,'zh'))} setOutput(s.join('\n')); };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8"><div className="card !p-8">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><ArrowUpDown className="w-6 h-6" /></div><div><h1 className="text-2xl font-bold text-navy-800">文本排序</h1><p className="text-sm text-navy-400">按行对文本进行排序</p></div></div>
      <div className="flex gap-2 mb-4">
        {[['asc','升序'],['desc','降序'],['random','随机']].map(([k,l])=><button key={k} onClick={()=>setSortType(k)} className={`px-4 py-2 rounded-lg text-sm font-medium ${sortType===k?'bg-brand-50 text-brand-700 border border-brand-200':'bg-navy-50 text-navy-500'}`}>{l}</button>)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="每行一条内容..." rows={10} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm resize-none" /></div>
        <div><textarea value={output} readOnly rows={10} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 bg-navy-50 text-sm resize-none" /></div>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={go} className="btn-primary">排序</button>
        <button onClick={()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="btn-secondary" disabled={!output}>{copied?'已复制':'复制'}</button>
      </div>
    </div></div>
  );
}
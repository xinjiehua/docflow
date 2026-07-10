import { useState } from 'react';
import { PenTool } from 'lucide-react';
export default function TextReplace() {
  const [input, setInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [output, setOutput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const go = () => { if(!searchText){setOutput(input);setCount(0);return} try{const flags=caseSensitive?'g':'gi';const p=searchText.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const r=new RegExp(p,flags);const m=(input.match(r)||[]).length;setCount(m);setOutput(input.replace(r,replaceText))}catch{setOutput('正则表达式错误')} };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8"><div className="card !p-8">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><PenTool className="w-6 h-6" /></div><div><h1 className="text-2xl font-bold text-navy-800">批量替换</h1><p className="text-sm text-navy-400">查找并替换文本内容</p></div></div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div><label className="block text-sm font-medium text-navy-600 mb-2">查找内容</label><input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="要查找的文本..." className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm" /></div>
        <div><label className="block text-sm font-medium text-navy-600 mb-2">替换为</label><input value={replaceText} onChange={e=>setReplaceText(e.target.value)} placeholder="替换后的文本..." className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm" /></div>
      </div>
      <label className="flex items-center gap-2 text-sm text-navy-600 mb-4"><input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)} className="rounded" />区分大小写</label>
      <div className="grid md:grid-cols-2 gap-4">
        <div><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="原始文本..." rows={8} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm resize-none" /></div>
        <div><textarea value={output} readOnly rows={8} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 bg-navy-50 text-sm resize-none" /></div>
      </div>
      {count>0 && <p className="mt-2 text-sm text-brand-600">共替换 {count} 处</p>}
      <div className="flex gap-3 mt-4"><button onClick={go} className="btn-primary">替换</button><button onClick={()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="btn-secondary" disabled={!output}>{copied?'已复制':'复制'}</button></div>
    </div></div>
  );
}
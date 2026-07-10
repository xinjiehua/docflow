import { useState } from 'react';
import { Type } from 'lucide-react';
export default function CaseConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [caseType, setCaseType] = useState('upper');
  const [copied, setCopied] = useState(false);
  const cases = [{key:'upper',label:'全部大写'},{key:'lower',label:'全部小写'},{key:'title',label:'首字母大写'},{key:'sentence',label:'句首大写'},{key:'camel',label:'驼峰命名'},{key:'snake',label:'下划线命名'}];
  const go = () => { let r=input; switch(caseType){case'upper':r=input.toUpperCase();break;case'lower':r=input.toLowerCase();break;case'title':r=input.replace(/\b\w/g,c=>c.toUpperCase());break;case'sentence':r=input.toLowerCase().replace(/(^|\. )\w/g,c=>c.toUpperCase());break;case'camel':r=input.toLowerCase().replace(/[-_\s](.)/g,(_,c)=>c.toUpperCase());break;case'snake':r=input.replace(/\s+/g,'_').replace(/([A-Z])/g,'_$1').toLowerCase().replace(/^_/,'');break;} setOutput(r); };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8"><div className="card !p-8">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><Type className="w-6 h-6" /></div><div><h1 className="text-2xl font-bold text-navy-800">大小写转换</h1><p className="text-sm text-navy-400">英文字母大小写与命名风格转换</p></div></div>
      <div className="flex flex-wrap gap-2 mb-4">{cases.map(c=><button key={c.key} onClick={()=>setCaseType(c.key)} className={`px-4 py-2 rounded-lg text-sm font-medium ${caseType===c.key?'bg-brand-50 text-brand-700 border border-brand-200':'bg-navy-50 text-navy-500'}`}>{c.label}</button>)}</div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="输入英文文本..." rows={8} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm resize-none" /></div>
        <div><textarea value={output} readOnly rows={8} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 bg-navy-50 text-sm resize-none" /></div>
      </div>
      <div className="flex gap-3 mt-4"><button onClick={go} className="btn-primary">转换</button><button onClick={()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="btn-secondary" disabled={!output}>{copied?'已复制':'复制'}</button></div>
    </div></div>
  );
}
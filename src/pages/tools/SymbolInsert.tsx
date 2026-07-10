import { useState } from 'react';
import { HashIcon } from 'lucide-react';
export default function SymbolInsert() {
  const [copied, setCopied] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const cats = [
    {name:"数学符号",symbols:["±","×","÷","≈","≠","≤","≥","∞","∑","∏","√","∫","∂","∈","∩","∪","⊂","⊃","∧","∨","¬","⊕","⊗"]},
    {name:"货币符号",symbols:["¥","$","€","£","₩","₹","₽","₫","¢","₱"]},
    {name:"箭头符号",symbols:["→","←","↑","↓","↗","↘","⇒","⇐","⇑","⇓","➜","➤","➡","⬅","⬆","⬇"]},
    {name:"特殊符号",symbols:["★","☆","✦","✧","✿","❀","✪","✫","⚡","💡","🎯","©","®","™","§","¶","†","‡","•","◦","▪","▫","▬","▲","▼","◄","►","◆","◇","○"]},
    {name:"希腊字母",symbols:["α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","π","ρ","σ","τ","φ","χ","ψ","ω","Δ","Σ","Ω"]},
    {name:"中文标点",symbols:["、","。","，","；","：","？","！","「","」","『","』","【","】","〈","〉","《","》","—","……"]},
    {name:"单位符号",symbols:["℃","℉","°","′","″","㎡","㎝","㎜","㎞","μ","Ω","‰","‱"]},
    {name:"制表符号",symbols:["─","│","┌","┐","└","┘","├","┤","┬","┴","┼","━","┃","┏","┓","┗","┛","┣","┫","╋"]},
  ];
  const filtered = cats.map(c=>({...c,symbols:c.symbols.filter(s=>!searchQuery||s.includes(searchQuery))})).filter(c=>c.symbols.length>0);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8"><div className="card !p-8">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><HashIcon className="w-6 h-6" /></div><div><h1 className="text-2xl font-bold text-navy-800">特殊符号</h1><p className="text-sm text-navy-400">点击符号即可复制到剪贴板</p></div></div>
      <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="搜索符号..." className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm mb-6" />
      {filtered.map(cat=>(<div key={cat.name} className="mb-6"><h3 className="text-sm font-medium text-navy-600 mb-2">{cat.name}</h3><div className="flex flex-wrap gap-2">{cat.symbols.map(s=>(<button key={s} onClick={()=>{navigator.clipboard.writeText(s);setCopied(s);setTimeout(()=>setCopied(''),1500)}} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-colors ${copied===s?'border-brand-500 bg-brand-50 text-brand-700':'border-navy-200 hover:border-brand-300 hover:bg-navy-50'}`}>{s}</button>))}</div></div>))}
    </div></div>
  );
}
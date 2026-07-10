import { useState } from 'react';
import { Fingerprint } from 'lucide-react';

function genUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function genShortId(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function genNanoId(len: number): string {
  const chars = '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<'uuid' | 'short' | 'nano' | 'uppercase'>('uuid');
  const [length, setLength] = useState(8);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = () => {
    const items: string[] = [];
    for (let i = 0; i < count; i++) {
      if (format === 'uuid') items.push(genUUID());
      else if (format === 'short') items.push(genShortId(length));
      else if (format === 'nano') items.push(genNanoId(length));
      else items.push(genUUID().toUpperCase());
    }
    setResults(items);
  };

  const copy = (val: string) => { navigator.clipboard.writeText(val); setCopied(val); setTimeout(() => setCopied(null), 1500); };
  const copyAll = () => { navigator.clipboard.writeText(results.join('\n')); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Fingerprint className="w-5 h-5" /> UUID/ID 生成器</h2>
        <div className="flex gap-2 flex-wrap">
          {([{id: 'uuid' as const, label: 'UUID v4'}, {id: 'short' as const, label: '短ID'}, {id: 'nano' as const, label: 'NanoID'}, {id: 'uppercase' as const, label: '大写UUID'}]).map(f => (
            <button key={f.id} onClick={() => setFormat(f.id)} className={`px-3 py-2 rounded-lg text-sm ${format === f.id ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>{f.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm text-navy-600">生成数量: {count}</label><input type="range" min="1" max="50" value={count} onChange={e => setCount(+e.target.value)} className="w-full" /></div>
          {(format === 'short' || format === 'nano') && <div><label className="text-sm text-navy-600">长度: {length}</label><input type="range" min="4" max="32" value={length} onChange={e => setLength(+e.target.value)} className="w-full" /></div>}
        </div>
        <div className="flex gap-2"><button onClick={generate} className="btn-primary text-sm">生成</button>{results.length > 0 && <button onClick={copyAll} className="btn-secondary text-sm">复制全部</button>}</div>
        {results.length > 0 && (
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-navy-50 rounded-lg px-3 py-1.5">
                <code className="text-sm font-mono text-navy-700">{r}</code>
                <button onClick={() => copy(r)} className="text-xs text-brand-600 shrink-0 ml-2">{copied === r ? '已复制' : '复制'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

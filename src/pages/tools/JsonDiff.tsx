import { useState } from 'react';
import { GitCompare } from 'lucide-react';

export default function JsonDiff() {
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [diff, setDiff] = useState<{path: string; type: string; old?: string; new?: string}[]>([]);
  const [error, setError] = useState('');

  const compare = () => {
    setError(''); setDiff([]);
    try {
      const obj1 = JSON.parse(json1);
      const obj2 = JSON.parse(json2);
      const diffs: {path: string; type: string; old?: string; new?: string}[] = [];
      const compareValues = (a: unknown, b: unknown, path: string) => {
        if (a === b) return;
        if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') {
          diffs.push({ path: path || '.', type: 'changed', old: JSON.stringify(a), new: JSON.stringify(b) });
          return;
        }
        if (Array.isArray(a) !== Array.isArray(b)) {
          diffs.push({ path, type: 'changed', old: JSON.stringify(a), new: JSON.stringify(b) });
          return;
        }
        const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
        for (const key of keys) {
          const ap = (a as Record<string, unknown>)[key];
          const bp = (b as Record<string, unknown>)[key];
          const cp = path ? `${path}.${key}` : key;
          if (!(key in (a as object))) diffs.push({ path: cp, type: 'added', new: JSON.stringify(bp) });
          else if (!(key in (b as object))) diffs.push({ path: cp, type: 'removed', old: JSON.stringify(ap) });
          else compareValues(ap, bp, cp);
        }
      };
      compareValues(obj1, obj2, '');
      setDiff(diffs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'JSON解析错误');
    }
  };

  const formatJson = (set: (v: string) => void, text: string) => {
    try { set(JSON.stringify(JSON.parse(text), null, 2)); } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><GitCompare className="w-5 h-5" /> JSON 对比</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between items-center mb-1"><label className="text-sm text-navy-600">JSON A</label><button onClick={() => formatJson(setJson1, json1)} className="text-xs text-brand-600">格式化</button></div>
            <textarea value={json1} onChange={e => setJson1(e.target.value)} rows={8} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm font-mono resize-y" placeholder='{"key": "value"}' />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1"><label className="text-sm text-navy-600">JSON B</label><button onClick={() => formatJson(setJson2, json2)} className="text-xs text-brand-600">格式化</button></div>
            <textarea value={json2} onChange={e => setJson2(e.target.value)} rows={8} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm font-mono resize-y" placeholder='{"key": "value"}' />
          </div>
        </div>
        <button onClick={compare} className="btn-primary text-sm">对比</button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {diff.length > 0 && (
          <div className="bg-navy-50 rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-navy-100 text-xs text-navy-500">找到 {diff.length} 处差异</div>
            {diff.map((d, i) => (
              <div key={i} className="flex border-b border-navy-100 last:border-0 text-xs">
                <span className={`w-16 px-2 py-1.5 font-medium shrink-0 ${d.type === 'added' ? 'bg-green-50 text-green-600' : d.type === 'removed' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>{d.type === 'added' ? '+新增' : d.type === 'removed' ? '-删除' : '~修改'}</span>
                <span className="px-2 py-1.5 font-mono text-navy-600 w-40 shrink-0">{d.path}</span>
                {d.old !== undefined && <span className="px-2 py-1.5 font-mono text-red-500 line-through flex-1 truncate">{d.old}</span>}
                {d.new !== undefined && <span className="px-2 py-1.5 font-mono text-green-600 flex-1 truncate">{d.new}</span>}
              </div>
            ))}
          </div>
        )}
        {diff.length === 0 && !error && json1 && json2 && <p className="text-sm text-green-600 text-center">两个JSON完全相同</p>}
      </div>
    </div>
  );
}

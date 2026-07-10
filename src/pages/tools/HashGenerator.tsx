import { useState } from 'react';
import { Fingerprint } from 'lucide-react';

async function sha(algo: string, msg: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(msg);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    const results: Record<string, string> = {};
    for (const algo of algos) {
      results[algo] = await sha(algo, text);
    }
    setHashes(results);
    setLoading(false);
  };

  const copy = (val: string) => { navigator.clipboard.writeText(val); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Fingerprint className="w-5 h-5" /> 哈希值生成器</h2>
        <div><label className="text-sm text-navy-600">输入文本</label><textarea value={text} onChange={e => setText(e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm resize-y" placeholder="输入要生成哈希值的文本" /></div>
        <button onClick={generate} disabled={!text || loading} className="btn-primary text-sm">{loading ? '生成中...' : '生成哈希'}</button>
        {Object.keys(hashes).length > 0 && (
          <div className="space-y-3">
            {Object.entries(hashes).map(([algo, hash]) => (
              <div key={algo} className="bg-navy-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-navy-700">{algo}</span>
                  <button onClick={() => copy(hash)} className="text-xs text-brand-600 hover:text-brand-700">复制</button>
                </div>
                <code className="text-xs text-navy-600 break-all">{hash}</code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

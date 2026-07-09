import { useState } from 'react';
import { Send, Copy, Clock } from 'lucide-react';

interface Header { key: string; value: string; }

export default function HttpRequestTest() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [respHeaders, setRespHeaders] = useState('');

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (idx: number) => setHeaders(headers.filter((_, i) => i !== idx));
  const updateHeader = (idx: number, field: 'key' | 'value', val: string) => {
    setHeaders(headers.map((h, i) => i === idx ? { ...h, [field]: val } : h));
  };

  const handleSend = async () => {
    if (!url) return;
    setLoading(true);
    const start = performance.now();
    try {
      const opts: RequestInit = {
        method,
        headers: Object.fromEntries(headers.filter(h => h.key).map(h => [h.key, h.value])),
      };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        opts.body = body;
        if (!headers.some(h => h.key.toLowerCase() === 'content-type')) {
          (opts.headers as Record<string, string>)['Content-Type'] = 'application/json';
        }
      }
      const res = await fetch(url, opts);
      const elapsed = Math.round(performance.now() - start);
      setTime(elapsed);
      setStatus(`${res.status} ${res.statusText}`);
      const respH: string[] = [];
      res.headers.forEach((v, k) => respH.push(`${k}: ${v}`));
      setRespHeaders(respH.join('\n'));
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponse(JSON.stringify(json, null, 2));
      } catch {
        setResponse(text);
      }
    } catch (err) {
      setStatus('Error');
      setResponse((err as Error).message);
      setTime(Math.round(performance.now() - start));
    }
    setLoading(false);
  };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">HTTP请求测试</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <select value={method} onChange={e => setMethod(e.target.value)} className="border rounded-lg px-3 py-2 font-mono font-bold">
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="输入URL..." className="flex-1 border rounded-lg px-3 py-2 font-mono" />
          <button onClick={handleSend} disabled={loading || !url} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Send size={18} />{loading ? '发送中...' : '发送'}
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">请求头</span>
            <button onClick={addHeader} className="text-blue-600 text-sm">+ 添加</button>
          </div>
          {headers.map((h, idx) => (
            <div key={idx} className="flex gap-2 mb-1">
              <input value={h.key} onChange={e => updateHeader(idx, 'key', e.target.value)} placeholder="Key" className="flex-1 border rounded px-2 py-1 text-sm font-mono" />
              <input value={h.value} onChange={e => updateHeader(idx, 'value', e.target.value)} placeholder="Value" className="flex-1 border rounded px-2 py-1 text-sm font-mono" />
              <button onClick={() => removeHeader(idx)} className="text-red-500 text-sm">删除</button>
            </div>
          ))}
        </div>
        {['POST', 'PUT', 'PATCH'].includes(method) && (
          <div>
            <span className="text-sm font-medium">请求体</span>
            <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full h-32 border rounded-lg px-3 py-2 font-mono text-sm mt-1" placeholder='{"key": "value"}' />
          </div>
        )}
        {status && (
          <div className="flex items-center gap-4 text-sm">
            <span className={`font-bold ${status.startsWith('2') ? 'text-green-600' : status.startsWith('4') || status.startsWith('5') ? 'text-red-600' : 'text-blue-600'}`}>
              {status}
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock size={14} />{time}ms
            </span>
          </div>
        )}
        {response && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">响应内容</span>
              <button onClick={() => navigator.clipboard.writeText(response)} className="text-blue-600 text-sm flex items-center gap-1">
                <Copy size={14} />复制
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">{response}</pre>
            {respHeaders && (
              <details className="mt-2">
                <summary className="text-sm text-gray-500 cursor-pointer">响应头</summary>
                <pre className="bg-gray-100 p-3 rounded text-xs font-mono mt-1">{respHeaders}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

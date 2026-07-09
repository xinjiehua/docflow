import { useState, useCallback } from 'react';

const COMMON_ENCODINGS = [
  { label: '空格', char: ' ', encoded: '%20' },
  { label: '中文', char: '你好', encoded: '%E4%BD%A0%E5%A5%BD' },
  { label: '&', char: '&', encoded: '%26' },
  { label: '=', char: '=', encoded: '%3D' },
  { label: '?', char: '?', encoded: '%3F' },
  { label: '/', char: '/', encoded: '%2F' },
  { label: '#', char: '#', encoded: '%23' },
  { label: '%', char: '%', encoded: '%25' },
];

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeComponent, setEncodeComponent] = useState(true);
  const [history, setHistory] = useState<{ input: string; output: string; mode: string }[]>([]);

  const process = useCallback((text: string, m?: 'encode' | 'decode') => {
    const currentMode = m || mode;
    if (!text) { setOutput(''); return; }
    try {
      let result: string;
      if (currentMode === 'encode') {
        result = encodeComponent ? encodeURIComponent(text) : encodeURI(text);
      } else {
        result = encodeComponent ? decodeURIComponent(text) : decodeURI(text);
      }
      setOutput(result);
    } catch (e: any) {
      setOutput(`错误: ${e.message}`);
    }
  }, [mode, encodeComponent]);

  const handleProcess = () => {
    process(input);
    setHistory(prev => [{ input, output, mode: mode === 'encode' ? '编码' : '解码' }, ...prev.slice(0, 19)]);
  };

  const handleBatchProcess = () => {
    const lines = input.split('\n').filter(l => l.trim());
    const results = lines.map(line => {
      try {
        return mode === 'encode'
          ? (encodeComponent ? encodeURIComponent(line) : encodeURI(line))
          : (encodeComponent ? decodeURIComponent(line) : decodeURI(line));
      } catch (e: any) { return `错误: ${e.message}`; }
    });
    setOutput(results.join('\n'));
    setHistory(prev => [{ input: lines.join(', '), output: results.join(', '), mode: `批量${mode === 'encode' ? '编码' : '解码'}` }, ...prev.slice(0, 19)]);
  };

  const handleSwap = () => {
    setInput(output);
    setMode(m => m === 'encode' ? 'decode' : 'encode');
    process(output, mode === 'encode' ? 'decode' : 'encode');
  };

  const copy = () => navigator.clipboard.writeText(output);
  const clear = () => { setInput(''); setOutput(''); };

  const parseUrl = (url: string) => {
    try {
      const u = new URL(url);
      const parts = [
        { label: '协议', value: u.protocol },
        { label: '主机', value: u.hostname },
        { label: '端口', value: u.port || '(默认)' },
        { label: '路径', value: u.pathname },
        { label: '查询', value: u.search || '(无)' },
        { label: '哈希', value: u.hash || '(无)' },
      ];
      const params = new URLSearchParams(u.search);
      return { parts, params: Array.from(params.entries()) };
    } catch {
      return null;
    }
  };

  const parsed = input.startsWith('http') ? parseUrl(input) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🔗 URL 编解码</h1>
          <p className="text-gray-500 mt-2">URL编码/解码，支持批量处理</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          {(['encode', 'decode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {m === 'encode' ? 'URL 编码' : 'URL 解码'}
            </button>
          ))}
          <label className="flex items-center gap-2 ml-4 text-sm text-gray-600">
            <input type="checkbox" checked={encodeComponent} onChange={e => setEncodeComponent(e.target.checked)} className="accent-blue-600" />
            编码特殊字符 (&, =, +等)
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">{mode === 'encode' ? '原始文本' : '编码文本'}</label>
              <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600">清空</button>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} placeholder="输入文本..."
              className="w-full p-3 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">{mode === 'encode' ? '编码结果' : '解码结果'}</label>
              <div className="flex gap-2">
                <button onClick={handleSwap} className="text-xs text-blue-500 hover:underline">⇄ 交换</button>
                <button onClick={copy} className="text-xs text-blue-500 hover:underline">复制</button>
              </div>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm min-h-[156px] whitespace-pre-wrap break-all">{output || <span className="text-gray-400">结果将显示在这里</span>}</div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={handleProcess} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            {mode === 'encode' ? '编码' : '解码'}
          </button>
          <button onClick={handleBatchProcess} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
            批量处理(按行)
          </button>
        </div>

        {/* URL Parse */}
        {parsed && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">URL 结构解析</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {parsed.parts.map(p => (
                <div key={p.label} className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">{p.label}</span>
                  <p className="font-mono text-sm text-gray-800 mt-1">{p.value}</p>
                </div>
              ))}
            </div>
            {parsed.params.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">查询参数</h4>
                <div className="space-y-1">
                  {parsed.params.map(([k, v], i) => (
                    <div key={i} className="flex gap-2 text-sm font-mono bg-gray-50 rounded-lg p-2">
                      <span className="text-blue-600">{k}</span>
                      <span className="text-gray-400">=</span>
                      <span className="text-gray-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reference Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">常用字符编码参考</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COMMON_ENCODINGS.map(e => (
              <div key={e.label} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{e.char}</span>
                <code className="text-sm text-blue-600">{e.encoded}</code>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-700 mb-3">操作历史</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">{h.mode}</span>
                  <span className="font-mono text-gray-600 truncate flex-1">{h.input.substring(0, 50)}{h.input.length > 50 ? '...' : ''}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-mono text-gray-700 truncate max-w-[200px]">{h.output.substring(0, 40)}{h.output.length > 40 ? '...' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

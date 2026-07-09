import { useState, useEffect } from 'react';

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [msTimestamp, setMsTimestamp] = useState(Date.now().toString());
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 19).replace('T', ' '));
  const [currentTs, setCurrentTs] = useState(Math.floor(Date.now() / 1000));
  const [unit, setUnit] = useState<'s' | 'ms'>('s');
  const [relativeTime, setRelativeTime] = useState('');
  const [history, setHistory] = useState<{ ts: number; date: string }[]>([]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const tsToDate = (ts: number, isMs: boolean) => {
    const ms = isMs ? ts : ts * 1000;
    return new Date(ms);
  };

  const handleTsConvert = () => {
    const numTs = parseInt(timestamp);
    if (isNaN(numTs)) return;
    const isMs = numTs > 1e12;
    const d = tsToDate(numTs, isMs);
    setDateInput(d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0'));
    setRelativeTime(getRelativeTime(d));
    setHistory(prev => [{ ts: numTs, date: d.toLocaleString('zh-CN') }, ...prev.slice(0, 9)]);
  };

  const handleDateConvert = () => {
    const d = new Date(dateInput.replace(' ', 'T'));
    if (isNaN(d.getTime())) return;
    const s = Math.floor(d.getTime() / 1000);
    const ms = d.getTime();
    setTimestamp(s.toString());
    setMsTimestamp(ms.toString());
    setRelativeTime(getRelativeTime(d));
    setHistory(prev => [{ ts: s, date: d.toLocaleString('zh-CN') }, ...prev.slice(0, 9)]);
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const abs = Math.abs(diff);
    const prefix = diff > 0 ? '' : '';
    const suffix = diff > 0 ? '前' : '后';
    if (abs < 60000) return `${prefix}${Math.floor(abs / 1000)}秒${suffix}`;
    if (abs < 3600000) return `${prefix}${Math.floor(abs / 60000)}分钟${suffix}`;
    if (abs < 86400000) return `${prefix}${Math.floor(abs / 3600000)}小时${suffix}`;
    if (abs < 2592000000) return `${prefix}${Math.floor(abs / 86400000)}天${suffix}`;
    if (abs < 31536000000) return `${prefix}${Math.floor(abs / 2592000000)}个月${suffix}`;
    return `${prefix}${(abs / 31536000000).toFixed(1)}年${suffix}`;
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const presets = [
    { label: '1小时前', offset: -3600000 },
    { label: '1天前', offset: -86400000 },
    { label: '7天前', offset: -604800000 },
    { label: '30天前', offset: -2592000000 },
    { label: '1年后', offset: 31536000000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">⏱️ 时间戳转换器</h1>
          <p className="text-gray-500 mt-2">Unix时间戳与日期时间互转，支持秒/毫秒</p>
        </div>

        {/* Live Timestamp */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">当前 Unix 时间戳</p>
              <p className="text-4xl font-mono font-bold mt-1">{currentTs}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">当前时间</p>
              <p className="text-xl font-mono mt-1">{new Date().toLocaleString('zh-CN')}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => copyToClipboard(currentTs.toString())} className="px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
              复制秒级时间戳
            </button>
            <button onClick={() => copyToClipboard(Date.now().toString())} className="px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
              复制毫秒时间戳
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Timestamp to Date */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-4">时间戳 → 日期时间</h3>
            <div className="space-y-3">
              <input value={timestamp} onChange={e => setTimestamp(e.target.value)} placeholder="输入时间戳（秒或毫秒自动识别）"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleTsConvert} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                转换为日期
              </button>
              {dateInput && relativeTime && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">日期时间</span>
                    <button onClick={() => copyToClipboard(dateInput)} className="text-blue-500 text-xs hover:underline">复制</button>
                  </div>
                  <p className="text-lg font-mono text-gray-800">{dateInput}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ISO 8601</span>
                    <button onClick={() => copyToClipboard(new Date(dateInput.replace(' ', 'T')).toISOString())} className="text-blue-500 text-xs hover:underline">复制</button>
                  </div>
                  <p className="text-sm font-mono text-gray-600">{new Date(dateInput.replace(' ', 'T')).toISOString()}</p>
                  <p className="text-sm text-gray-500">相对时间: <span className="font-medium text-gray-700">{relativeTime}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Date to Timestamp */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-4">日期时间 → 时间戳</h3>
            <div className="space-y-3">
              <input type="datetime-local" value={dateInput.replace(' ', 'T')} onChange={e => setDateInput(e.target.value.replace('T', ' '))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleDateConvert} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                转换为时间戳
              </button>
              {timestamp && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">秒级时间戳</span>
                    <button onClick={() => copyToClipboard(timestamp)} className="text-blue-500 text-xs hover:underline">复制</button>
                  </div>
                  <p className="text-lg font-mono text-gray-800">{timestamp}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">毫秒时间戳</span>
                    <button onClick={() => copyToClipboard(msTimestamp)} className="text-blue-500 text-xs hover:underline">复制</button>
                  </div>
                  <p className="text-lg font-mono text-gray-800">{msTimestamp}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">快速预设</h3>
          <div className="flex flex-wrap gap-2">
            {presets.map(p => {
              const d = new Date(Date.now() + p.offset);
              return (
                <button key={p.label} onClick={() => {
                  setTimestamp(Math.floor(d.getTime() / 1000).toString());
                  setDateInput(d.toISOString().slice(0, 19).replace('T', ' '));
                  handleTsConvert();
                }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  {p.label} ({Math.floor(d.getTime() / 1000)})
                </button>
              );
            })}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-700 mb-3">转换历史</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="font-mono text-gray-600">{h.ts}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-700">{h.date}</span>
                  <button onClick={() => copyToClipboard(h.ts.toString())} className="text-blue-500 text-xs hover:underline">复制</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

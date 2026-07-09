import { useState, useCallback } from 'react';

type Base = 2 | 8 | 10 | 16;

const BASE_CONFIG: { base: Base; label: string; prefix: string }[] = [
  { base: 2, label: '二进制 (BIN)', prefix: '0b' },
  { base: 8, label: '八进制 (OCT)', prefix: '0o' },
  { base: 10, label: '十进制 (DEC)', prefix: '' },
  { base: 16, label: '十六进制 (HEX)', prefix: '0x' },
];

function convertBase(value: string, fromBase: Base): Record<Base, string> {
  const result: Record<Base, string> = { 2: '', 8: '', 10: '', 16: '' };
  try {
    const dec = parseInt(value, fromBase);
    if (isNaN(dec)) return result;
    result[2] = dec.toString(2);
    result[8] = dec.toString(8);
    result[10] = dec.toString(10);
    result[16] = dec.toString(16).toUpperCase();
  } catch {}
  return result;
}

const ASCII_RANGE = [
  { label: '常用标点', range: '33-47' },
  { label: '数字 0-9', range: '48-57' },
  { label: '大写字母 A-Z', range: '65-90' },
  { label: '小写字母 a-z', range: '97-122' },
];

export default function BaseConverter() {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState<Base>(10);
  const [results, setResults] = useState<Record<Base, string>>({ 2: '', 8: '', 10: '', 16: '' });
  const [bitWidth, setBitWidth] = useState<0 | 8 | 16 | 32 | 64>(0);
  const [groupBits, setGroupBits] = useState(4);
  const [asciiText, setAsciiText] = useState('');
  const [charCode, setCharCode] = useState('');
  const [history, setHistory] = useState<{ from: string; to: Record<Base, string> }[]>([]);

  const handleConvert = useCallback((value?: string, fromBase?: Base) => {
    const v = value ?? inputValue;
    const b = fromBase ?? inputBase;
    if (!v.trim()) return;
    const r = convertBase(v.trim(), b);
    setResults(r);
    setHistory(prev => [{ from: `${v.trim()} (${BASE_CONFIG.find(c => c.base === b)?.label})`, to: r }, ...prev.slice(0, 19)]);
  }, [inputValue, inputBase]);

  const handleKeyPress = (key: string) => {
    let filtered = '';
    if (inputBase === 2) filtered = key.replace(/[^01]/g, '');
    else if (inputBase === 8) filtered = key.replace(/[^0-7]/g, '');
    else if (inputBase === 10) filtered = key.replace(/[^0-9\-]/g, '');
    else if (inputBase === 16) filtered = key.replace(/[^0-9a-fA-F\-]/g, '');
    setInputValue(filtered);
  };

  const formatResult = (value: string, base: Base): string => {
    if (!value) return '';
    if (base === 2 && groupBits > 0) {
      const neg = value.startsWith('-') ? '-' : '';
      const abs = value.replace('-', '');
      return neg + abs.replace(new RegExp(`(.{${groupBits}})`, 'g'), '$1 ').trim();
    }
    if (base === 16) return value.replace(/(.{2})/g, '$1 ').trim();
    if (base === 8 && value.length > 3) return value.replace(/(.{3})/g, '$1 ').trim();
    return value;
  };

  const padWith = (value: string, base: Base): string => {
    if (bitWidth === 0 || !value) return value;
    let abs = value.replace('-', '');
    let bits = base === 2 ? parseInt(value.replace('-', ''), base) : parseInt(value, base);
    if (isNaN(bits)) return value;
    let totalBits = bitWidth;
    if (base === 2) return (value.startsWith('-') ? '1' : '0').repeat(Math.max(0, totalBits - abs.length)) + abs;
    const binStr = (bits >>> 0).toString(2).padStart(totalBits, '0');
    if (base === 8) return parseInt(binStr, 2).toString(8).padStart(Math.ceil(totalBits / 3), '0');
    if (base === 16) return parseInt(binStr, 2).toString(16).toUpperCase().padStart(totalBits / 4, '0');
    return value;
  };

  const handleAsciiConvert = () => {
    if (!asciiText.trim()) return;
    const codes = asciiText.split('').map(c => c.charCodeAt(0));
    setCharCode(codes.join(', '));
    setInputValue(codes.map(c => c.toString(10)).join(' '));
    setInputBase(10);
    handleConvert(codes[0].toString(10), 10);
  };

  const handleCharCodeConvert = () => {
    const codes = charCode.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const text = codes.map(n => String.fromCharCode(n)).join('');
    setAsciiText(text);
    setInputValue(codes[0].toString(10));
    setInputBase(10);
    handleConvert(codes[0].toString(10), 10);
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🔢 进制转换器</h1>
          <p className="text-gray-500 mt-2">二进制/八进制/十进制/十六进制互转，支持大数和负数</p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-600">输入进制:</span>
            <div className="flex gap-2">
              {BASE_CONFIG.map(c => (
                <button key={c.base} onClick={() => setInputBase(c.base)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inputBase === c.base ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <input value={inputValue} onChange={e => handleKeyPress(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleConvert()}
              placeholder={`输入${BASE_CONFIG.find(c => c.base === inputBase)?.label}数值`}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-mono text-lg focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => handleConvert()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              转换
            </button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-gray-600">位宽:</span>
            <div className="flex gap-2">
              {([0, 8, 16, 32, 64] as const).map(w => (
                <button key={w} onClick={() => setBitWidth(w)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${bitWidth === w ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {w === 0 ? '自动' : `${w}位`}
                </button>
              ))}
            </div>
            {inputBase === 2 && (
              <>
                <span className="text-sm text-gray-600 ml-4">分组:</span>
                <select value={groupBits} onChange={e => setGroupBits(+e.target.value)} className="px-2 py-1 border border-gray-200 rounded-lg text-sm">
                  <option value={4}>4位</option>
                  <option value={8}>8位</option>
                  <option value={0}>不分组</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {BASE_CONFIG.map(c => (
            <div key={c.base} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700 text-sm">{c.label}</h3>
                <button onClick={() => copy(c.prefix + padWith(results[c.base], c.base))} className="text-xs text-blue-500 hover:underline">复制</button>
              </div>
              <div className={`p-3 rounded-lg font-mono text-lg break-all ${inputBase === c.base ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-800'}`}>
                {c.prefix}{formatResult(padWith(results[c.base], c.base), c.base) || '-'}
              </div>
            </div>
          ))}
        </div>

        {/* ASCII Converter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">ASCII 字符转换</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">字符 → 编码</label>
              <div className="flex gap-2">
                <input value={asciiText} onChange={e => setAsciiText(e.target.value)} placeholder="输入字符"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <button onClick={handleAsciiConvert} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">转换</button>
              </div>
              {charCode && <p className="mt-2 text-sm font-mono text-gray-600">{charCode}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">编码 → 字符</label>
              <div className="flex gap-2">
                <input value={charCode} onChange={e => setCharCode(e.target.value)} placeholder="如: 72,101,108,108,111"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
                <button onClick={handleCharCodeConvert} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">转换</button>
              </div>
              {asciiText && <p className="mt-2 text-sm text-gray-600">"{asciiText}"</p>}
            </div>
          </div>
        </div>

        {/* ASCII Reference */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">ASCII 常用范围</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ASCII_RANGE.map(r => (
              <div key={r.label} className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">{r.label}</p>
                <p className="font-mono text-sm text-gray-700">{r.range}</p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-700 mb-3">转换历史</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg flex-wrap">
                  <span className="text-gray-500">{h.from}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-mono text-gray-700">BIN: {h.to[2]}</span>
                  <span className="font-mono text-gray-700">OCT: {h.to[8]}</span>
                  <span className="font-mono text-gray-700">DEC: {h.to[10]}</span>
                  <span className="font-mono text-gray-700">HEX: {h.to[16]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

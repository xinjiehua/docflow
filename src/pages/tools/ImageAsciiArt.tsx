import { useState, useRef, useEffect, useCallback } from 'react';

const CHAR_SETS: Record<string, string> = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  simple: ' .+*#',
  detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  binary: '01',
  braille: '⠀⠁⠃⠇⡇⣇⣧⣷⣿',
};

const PRESETS = {
  standard: { width: 120, invert: false, charSet: 'standard', colored: false },
  blocks: { width: 80, invert: false, charSet: 'blocks', colored: false },
  detailed: { width: 160, invert: false, charSet: 'detailed', colored: false },
  neon: { width: 100, invert: true, charSet: 'simple', colored: true },
};

export default function ImageAsciiArt() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(120);
  const [invert, setInvert] = useState(false);
  const [charSet, setCharSet] = useState('standard');
  const [colored, setColored] = useState(false);
  const [fontSize, setFontSize] = useState(6);
  const [asciiResult, setAsciiResult] = useState('');
  const [coloredResult, setColoredResult] = useState<string[]>([]);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLPreElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = URL.createObjectURL(f);
  }, []);

  const generate = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    const scale = width / img.width;
    const h = Math.round(img.height * scale * 0.5); // ASCII chars are ~2x taller than wide
    canvas.width = width;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, h);
    const data = ctx.getImageData(0, 0, width, h).data;

    const chars = CHAR_SETS[charSet] || CHAR_SETS.standard;
    const lines: string[] = [];
    const coloredLines: string[] = [];

    for (let y = 0; y < h; y++) {
      let line = '';
      let coloredLine = '';
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const val = invert ? brightness : 1 - brightness;
        const charIdx = Math.min(Math.floor(val * chars.length), chars.length - 1);
        line += chars[charIdx];
        coloredLine += chars[charIdx] === ' ' ? ' ' : `<span style="color:rgb(${r},${g},${b})">${chars[charIdx]}</span>`;
      }
      lines.push(line);
      coloredLines.push(coloredLine);
    }
    setAsciiResult(lines.join('\n'));
    setColoredResult(coloredLines);
  }, [width, invert, charSet]);

  useEffect(() => {
    if (imgRef.current) generate();
  }, [generate]);

  const downloadTxt = () => {
    const blob = new Blob([asciiResult], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ascii_${file?.name || 'image'}.txt`;
    a.click();
  };

  const downloadPng = () => {
    if (!asciiResult || !canvasRef.current) return;
    const lines = asciiResult.split('\n');
    const fSize = Math.max(fontSize, 4);
    const charW = fSize * 0.6, charH = fSize;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = Math.max(...lines.map(l => l.length)) * charW + 40;
    canvas.height = lines.length * charH + 40;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = `${fSize}px monospace`;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => ctx.fillText(line, 20, 20 + i * charH));
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `ascii_${file?.name || 'image'}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🔤 图片转 ASCII 艺术</h1>
          <p className="text-gray-500 mt-2">将图片转为ASCII字符画，自定义宽度和字符集</p>
        </div>

        {!file ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <label className="inline-flex flex-col items-center gap-4 cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center"><span className="text-4xl">🖼️</span></div>
              <p className="text-lg font-medium text-gray-700">点击上传图片</p>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-3">预设</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRESETS).map(([name, p]) => (
                    <button key={name} onClick={() => { setWidth(p.width); setInvert(p.invert); setCharSet(p.charSet); setColored(p.colored); }}
                      className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors capitalize">{name}</button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
                <h3 className="font-semibold text-gray-700">参数</h3>
                <div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">宽度(字符)</span><span className="text-gray-400">{width}</span></div>
                  <input type="range" min={20} max={300} value={width} onChange={e => setWidth(+e.target.value)} className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">字符集</label>
                  <select value={charSet} onChange={e => setCharSet(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1">
                    {Object.entries(CHAR_SETS).map(([k, v]) => <option key={k} value={k}>{k} ({v.length}级)</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">预览字号</span><span className="text-gray-400">{fontSize}px</span></div>
                  <input type="range" min={2} max={14} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-blue-600" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={invert} onChange={e => setInvert(e.target.checked)} className="accent-blue-600" />
                  反转亮度
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={colored} onChange={e => setColored(e.target.checked)} className="accent-blue-600" />
                  彩色输出
                </label>
              </div>

              <button onClick={downloadTxt} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">下载 TXT</button>
              <button onClick={downloadPng} className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">下载 PNG</button>
              <button onClick={() => { setFile(null); setAsciiResult(''); setColoredResult([]); imgRef.current = null; }}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors">重新上传</button>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">ASCII 预览</h3>
              {colored ? (
                <pre ref={previewRef} className="overflow-auto bg-black rounded-lg p-2 max-h-[700px] leading-none"
                  style={{ fontSize: `${fontSize}px`, fontFamily: 'monospace' }}>
                  <code dangerouslySetInnerHTML={{ __html: coloredResult.join('\n') }} />
                </pre>
              ) : (
                <pre className="overflow-auto bg-black text-green-400 rounded-lg p-2 max-h-[700px] leading-none whitespace-pre"
                  style={{ fontSize: `${fontSize}px`, fontFamily: 'monospace' }}>
                  {asciiResult}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

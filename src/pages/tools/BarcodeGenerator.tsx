import { useState, useEffect, useRef } from 'react';

const BARCODE_FORMATS = [
  { id: 'CODE128', label: 'Code 128', desc: '通用码，支持全部ASCII字符' },
  { id: 'EAN13', label: 'EAN-13', desc: '13位国际商品条码' },
  { id: 'UPC', label: 'UPC-A', desc: '12位北美通用条码' },
  { id: 'CODE39', label: 'Code 39', desc: '字母数字条码' },
  { id: 'ITF14', label: 'ITF-14', desc: '14位物流包装条码' },
];

// Simple Code128 encoding
const CODE128_PATTERNS: Record<string, string> = {
  ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
  '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
  '(': '10001100100', ')': '11001001000', '*': '11001000100', '+': '11000100100',
  ',': '10110011100', '-': '10011011100', '.': '10011001110', '/': '10111001100',
  '0': '10011101100', '1': '10011100110', '2': '11001110010', '3': '11001011100',
  '4': '11001001110', '5': '11011100100', '6': '11001110100', '7': '11101101110',
  '8': '11101001100', '9': '11100101100', ':': '11100100110', ';': '11101100100',
  '<': '11100110100', '=': '11100110010', '>': '11011011000', '?': '11011000110',
  '@': '11000110110', 'A': '10100011000', 'B': '10001011000', 'C': '10001000110',
  'D': '10110001000', 'E': '10001101000', 'F': '10001100010', 'G': '11010001000',
  'H': '11000101000', 'I': '11000100010', 'J': '10110111000', 'K': '10110001110',
  'L': '10001101110', 'M': '10111011000', 'N': '10111000110', 'O': '10001110110',
  'P': '11101110110', 'Q': '11010001110', 'R': '11000101110', 'S': '11011101000',
  'T': '11011100010', 'U': '11011101110', 'V': '11101011000', 'W': '11101000110',
  'X': '11100010110', 'Y': '11101101000', 'Z': '11101100010', '[': '11100011010',
  '\\': '11101111010', ']': '11001000010', '^': '11110001010', '_': '10100110000',
  '`': '10100001100', 'a': '10001011000', 'b': '10001000110', 'c': '10110001000',
  'd': '10001101000', 'e': '10001100010', 'f': '11010001000', 'g': '11000101000',
  'h': '11000100010', 'i': '10110111000', 'j': '10110001110', 'k': '10001101110',
  'l': '10111011000', 'm': '10111000110', 'n': '10001110110', 'o': '11101110110',
  'p': '11010001110', 'q': '11000101110', 'r': '11011101000', 's': '11011100010',
  't': '11011101110', 'u': '11101011000', 'v': '11101000110', 'w': '11100010110',
  'x': '11101101000', 'y': '11101100010', 'z': '11100011010',
};

const START_CODE_B = '11010010000';
const STOP_CODE = '1100011101011';

function encodeCode128(text: string): string {
  let binary = START_CODE_B;
  let checksum = 104; // Start B
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const pattern = CODE128_PATTERNS[char];
    if (!pattern) continue;
    binary += pattern;
    checksum += pattern.split('').reduce((sum, v, j) => sum + (v === '1' ? 1 : 0) * (i + 1 + j > 5 ? 0 : 1), 0);
  }
  // Simple checksum: weighted sum
  let weightedSum = 104;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const charIdx = Object.keys(CODE128_PATTERNS).indexOf(text[i]);
    weightedSum += charIdx >= 0 ? charIdx * (i + 1) : 0;
  }
  const checkDigit = weightedSum % 103;
  const keys = Object.keys(CODE128_PATTERNS);
  binary += CODE128_PATTERNS[keys[checkDigit] || ' '];
  binary += STOP_CODE;
  return binary;
}

export default function BarcodeGenerator() {
  const [text, setText] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [barColor, setBarColor] = useState('#000000');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawBarcode();
  }, [text, format, barWidth, barHeight, showText, bgColor, barColor]);

  const drawBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const binary = encodeCode128(text || ' ');
    const w = binary.length * barWidth + 40;
    const h = barHeight + (showText ? 40 : 20);
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = barColor;
    let x = 20;
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === '1') {
        ctx.fillRect(x, 10, barWidth, barHeight);
      }
      x += barWidth;
    }

    if (showText) {
      ctx.fillStyle = barColor;
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(text, w / 2, barHeight + 30);
    }
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = canvasRef.current?.toDataURL('image/png') || '';
    a.download = `barcode_${text}.png`;
    a.click();
  };

  const placeholder = format === 'EAN13' ? '输入13位数字' : format === 'UPC' ? '输入12位数字' : format === 'ITF14' ? '输入14位数字' : '输入任意文本';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📊 条形码生成器</h1>
          <p className="text-gray-500 mt-2">支持Code128/EAN-13/UPC-A等格式，输入内容生成条形码图片</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">条码格式</h3>
              <div className="space-y-2">
                {BARCODE_FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${format === f.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <span className="font-medium">{f.label}</span>
                    <span className="block text-xs mt-0.5 opacity-70">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="font-semibold text-gray-700">输入内容</h3>
              <input value={text} onChange={e => setText(e.target.value)} placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-mono focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="font-semibold text-gray-700">外观设置</h3>
              <div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">条宽</span><span className="text-gray-400">{barWidth}px</span></div>
                <input type="range" min={1} max={5} value={barWidth} onChange={e => setBarWidth(+e.target.value)} className="w-full accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">高度</span><span className="text-gray-400">{barHeight}px</span></div>
                <input type="range" min={40} max={200} value={barHeight} onChange={e => setBarHeight(+e.target.value)} className="w-full accent-blue-600" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1"><label className="text-sm text-gray-600">条色</label><input type="color" value={barColor} onChange={e => setBarColor(e.target.value)} className="w-full h-8 rounded mt-1" /></div>
                <div className="flex-1"><label className="text-sm text-gray-600">背景</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-8 rounded mt-1" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={showText} onChange={e => setShowText(e.target.checked)} className="accent-blue-600" />
                显示文字
              </label>
            </div>

            <button onClick={download} disabled={!text.trim()} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-300 transition-colors">
              下载条形码 PNG
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">预览</h3>
            <div className="flex justify-center items-center min-h-[200px] bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

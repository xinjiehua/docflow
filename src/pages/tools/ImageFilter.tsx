import { useState, useRef, useCallback, useEffect } from 'react';

const FILTERS = [
  { name: '原图', id: 'none' },
  { name: '黑白', id: 'grayscale', css: 'grayscale(100%)' },
  { name: '复古', id: 'sepia', css: 'sepia(80%)' },
  { name: '暖色', id: 'warm', css: 'sepia(30%) saturate(140%) brightness(105%)' },
  { name: '冷色', id: 'cool', css: 'saturate(80%) hue-rotate(20deg) brightness(105%)' },
  { name: '高对比', id: 'contrast', css: 'contrast(150%) brightness(95%)' },
  { name: '柔焦', id: 'blur', css: 'blur(2px) brightness(105%)' },
  { name: '锐化', id: 'sharp', css: 'contrast(110%) saturate(110%)' },
  { name: '反转', id: 'invert', css: 'invert(100%)' },
  { name: '亮度+', id: 'bright', css: 'brightness(130%)' },
  { name: '暗调', id: 'dark', css: 'brightness(70%)' },
  { name: '饱和+', id: 'saturate', css: 'saturate(180%)' },
  { name: '素描', id: 'sketch' },
  { name: '怀旧', id: 'vintage', css: 'sepia(50%) contrast(90%) brightness(90%) saturate(80%)' },
];

export default function ImageFilter() {
  const [file, setFile] = useState<File | null>(null);
  const [originalImg, setOriginalImg] = useState<HTMLImageElement | null>(null);
  const [activeFilter, setActiveFilter] = useState('none');
  const [intensity, setIntensity] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalDataRef = useRef<ImageData | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const img = new Image();
    img.onload = () => setOriginalImg(img);
    img.src = URL.createObjectURL(f);
  }, []);

  useEffect(() => {
    if (!originalImg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const maxW = 800, maxH = 600;
    const scale = Math.min(maxW / originalImg.width, maxH / originalImg.height, 1);
    canvas.width = originalImg.width * scale;
    canvas.height = originalImg.height * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    originalDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, [originalImg]);

  useEffect(() => {
    if (!originalDataRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const srcData = originalDataRef.current;
    const imgData = ctx.createImageData(srcData.width, srcData.height);
    const d = imgData.data, s = srcData.data;
    const factor = intensity / 100;

    if (activeFilter === 'sketch') {
      // Sketch effect: edge detection
      for (let i = 0; i < s.length; i += 4) {
        const idx = i / 4;
        const x = idx % srcData.width, y = Math.floor(idx / srcData.width);
        if (x === 0 || y === 0 || x === srcData.width - 1 || y === srcData.height - 1) {
          d[i] = d[i + 1] = d[i + 2] = 255;
        } else {
          const neighbors = [s[((y - 1) * srcData.width + x) * 4], s[(y * srcData.width + x - 1) * 4],
            s[(y * srcData.width + x + 1) * 4], s[((y + 1) * srcData.width + x) * 4]];
          const avg = neighbors.reduce((a, b) => a + b, 0) / 4;
          const edge = Math.abs(s[i] - avg);
          const v = 255 - Math.min(255, edge * factor * 3);
          d[i] = d[i + 1] = d[i + 2] = v;
        }
        d[i + 3] = 255;
      }
    } else {
      for (let i = 0; i < s.length; i += 4) {
        let r = s[i], g = s[i + 1], b = s[i + 2];
        // Basic CSS filter simulation
        if (activeFilter === 'grayscale') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = r + (gray - r) * factor; g = g + (gray - g) * factor; b = b + (gray - b) * factor;
        } else if (activeFilter === 'sepia') {
          const sr = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
          const sg = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
          const sb = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
          r = r + (sr - r) * factor; g = g + (sg - g) * factor; b = b + (sb - b) * factor;
        } else if (activeFilter === 'invert') {
          r = r + ((255 - r) - r) * factor;
          g = g + ((255 - g) - g) * factor;
          b = b + ((255 - b) - b) * factor;
        }
        // Apply brightness/contrast/saturation
        r *= brightness / 100; g *= brightness / 100; b *= brightness / 100;
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * saturation / 100;
        g = gray + (g - gray) * saturation / 100;
        b = gray + (b - gray) * saturation / 100;
        const cf = (contrast / 100 - 0.5) * 2;
        r = 128 + (r - 128) * (1 + cf); g = 128 + (g - 128) * (1 + cf); b = 128 + (b - 128) * (1 + cf);
        d[i] = Math.max(0, Math.min(255, r));
        d[i + 1] = Math.max(0, Math.min(255, g));
        d[i + 2] = Math.max(0, Math.min(255, b));
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [activeFilter, intensity, brightness, contrast, saturation, originalImg]);

  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = `filtered_${file?.name || 'image.png'}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🎨 图片滤镜特效</h1>
          <p className="text-gray-500 mt-2">黑白/复古/暖色/冷色/模糊/锐化/素描等14种滤镜</p>
        </div>

        {!originalImg ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <label className="inline-flex flex-col items-center gap-4 cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <span className="text-4xl">🖼️</span>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">点击上传图片</p>
                <p className="text-sm text-gray-400">支持 PNG, JPG, WebP 格式</p>
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-3">滤镜效果</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FILTERS.map(f => (
                    <button key={f.id} onClick={() => setActiveFilter(f.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === f.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h3 className="font-semibold text-gray-700">参数调节</h3>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">滤镜强度</span>
                    <span className="text-gray-400">{intensity}%</span>
                  </div>
                  <input type="range" min={0} max={200} value={intensity} onChange={e => setIntensity(+e.target.value)} className="w-full accent-blue-600" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">亮度</span>
                    <span className="text-gray-400">{brightness}%</span>
                  </div>
                  <input type="range" min={20} max={200} value={brightness} onChange={e => setBrightness(+e.target.value)} className="w-full accent-blue-600" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">对比度</span>
                    <span className="text-gray-400">{contrast}%</span>
                  </div>
                  <input type="range" min={20} max={200} value={contrast} onChange={e => setContrast(+e.target.value)} className="w-full accent-blue-600" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">饱和度</span>
                    <span className="text-gray-400">{saturation}%</span>
                  </div>
                  <input type="range" min={0} max={300} value={saturation} onChange={e => setSaturation(+e.target.value)} className="w-full accent-blue-600" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={download} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                  下载图片
                </button>
                <button onClick={() => { setOriginalImg(null); setFile(null); setActiveFilter('none'); setIntensity(100); setBrightness(100); setContrast(100); setSaturation(100); }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  重新上传
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">预览效果</h3>
              <div className="flex justify-center">
                <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-sm" />
              </div>
              {file && <p className="mt-3 text-xs text-gray-400 text-center">{file.name}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

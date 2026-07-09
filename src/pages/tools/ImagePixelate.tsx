import { useState, useRef } from 'react';
import { Upload, Download, Grid3x3 } from 'lucide-react';

export default function ImagePixelate() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [pixelSize, setPixelSize] = useState(10);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl('');
  };

  const handleProcess = () => {
    if (!originalUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const size = pixelSize;
      for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
          const [r, g, b] = getBlockColor(ctx, x, y, Math.min(size, canvas.width - x), Math.min(size, canvas.height - y));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, Math.min(size, canvas.width - x), Math.min(size, canvas.height - y));
        }
      }
      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = originalUrl;
  };

  const getBlockColor = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): [number, number, number] => {
    const data = ctx.getImageData(x, y, w, h).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    }
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'pixelated.png';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">图片像素化</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Grid3x3 className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择图片</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="font-medium">像素块大小：</label>
          <input type="range" min="2" max="50" value={pixelSize} onChange={e => setPixelSize(Number(e.target.value))} className="flex-1 max-w-xs" />
          <span className="w-16 text-center">{pixelSize}px</span>
        </div>
        <button onClick={handleProcess} disabled={!originalUrl} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          像素化
        </button>
        {originalUrl && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">原图</p>
              <img src={originalUrl} alt="原图" className="max-w-full rounded-lg" />
            </div>
            {resultUrl && (
              <div>
                <p className="font-medium mb-2">像素化效果</p>
                <img src={resultUrl} alt="效果" className="max-w-full rounded-lg" />
              </div>
            )}
          </div>
        )}
        {resultUrl && (
          <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            <Download size={20} />
            下载图片
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Upload, Download, Grid } from 'lucide-react';

export default function ImageMosaic() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [blockSize, setBlockSize] = useState(10);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setResultUrl('');
  };

  const handleMosaic = () => {
    if (!originalUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const size = blockSize;
      for (let y = 0; y < img.height; y += size) {
        for (let x = 0; x < img.width; x += size) {
          const [r, g, b] = getAverageColor(ctx, x, y, Math.min(size, img.width - x), Math.min(size, img.height - y));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, Math.min(size, img.width - x), Math.min(size, img.height - y));
        }
      }
      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = originalUrl;
  };

  const getAverageColor = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): [number, number, number] => {
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
    a.download = 'mosaic.png';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">图片马赛克</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择图片</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="font-medium">马赛克块大小：</label>
          <input type="range" min="4" max="40" value={blockSize} onChange={e => setBlockSize(Number(e.target.value))} className="flex-1" />
          <span className="w-16 text-center">{blockSize}px</span>
        </div>
        <button onClick={handleMosaic} disabled={!originalUrl} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          生成马赛克
        </button>
        <canvas ref={canvasRef} className="hidden" />
        {originalUrl && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">原图</p>
              <img src={originalUrl} alt="原图" className="max-w-full rounded-lg" />
            </div>
            {resultUrl && (
              <div>
                <p className="font-medium mb-2">马赛克效果</p>
                <img src={resultUrl} alt="马赛克" className="max-w-full rounded-lg" />
              </div>
            )}
          </div>
        )}
        {resultUrl && (
          <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            <Download size={20} />
            下载马赛克图片
          </button>
        )}
      </div>
    </div>
  );
}

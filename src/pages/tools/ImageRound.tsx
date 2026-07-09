import { useState, useRef } from 'react';
import { Upload, Download, Circle } from 'lucide-react';

export default function ImageRound() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [radius, setRadius] = useState(50);
  const [mode, setMode] = useState<'round' | 'circle'>('round');

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
      const size = mode === 'circle' ? Math.min(img.width, img.height) : img.width;
      canvas.width = mode === 'circle' ? size : img.width;
      canvas.height = mode === 'circle' ? size : img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const r = mode === 'circle'
        ? size / 2
        : Math.min(canvas.width, canvas.height) * (radius / 100) * (1 / 2);

      ctx.beginPath();
      if (mode === 'circle') {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else {
        ctx.roundRect(0, 0, canvas.width, canvas.height, r);
      }
      ctx.clip();

      if (mode === 'circle') {
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      } else {
        ctx.drawImage(img, 0, 0);
      }

      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = originalUrl;
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = mode === 'circle' ? 'circle.png' : 'rounded.png';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">圆角/圆形裁剪</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Circle className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择图片</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="mode" value="round" checked={mode === 'round'} onChange={() => setMode('round')} />
              <span>圆角</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="mode" value="circle" checked={mode === 'circle'} onChange={() => setMode('circle')} />
              <span>圆形</span>
            </label>
          </div>
          {mode === 'round' && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm">圆角半径：</span>
              <input type="range" min="0" max="50" value={radius} onChange={e => setRadius(Number(e.target.value))} className="flex-1 max-w-xs" />
              <span className="w-16 text-center">{radius}%</span>
            </div>
          )}
        </div>
        <button onClick={handleProcess} disabled={!originalUrl} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          处理图片
        </button>
        {originalUrl && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">原图</p>
              <img src={originalUrl} alt="原图" className="max-w-full rounded-lg" />
            </div>
            {resultUrl && (
              <div>
                <p className="font-medium mb-2">效果预览</p>
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

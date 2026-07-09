import { useState, useRef } from 'react';
import { Upload, Download, Droplets } from 'lucide-react';

export default function ImageBlurBg() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [blur, setBlur] = useState(10);
  const [brightness, setBrightness] = useState(100);

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
      ctx.filter = `blur(${blur}px) brightness(${brightness}%)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';
      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = originalUrl;
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'blurred.png';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">模糊背景</h2>
      <p className="text-gray-500 mb-4">对图片进行高斯模糊处理，适合制作背景图或隐私保护。</p>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Droplets className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择图片</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm font-medium">模糊强度：</label>
            <input type="range" min="1" max="50" value={blur} onChange={e => setBlur(Number(e.target.value))} className="flex-1" />
            <span className="w-12 text-center">{blur}px</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm font-medium">亮度：</label>
            <input type="range" min="20" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="flex-1" />
            <span className="w-12 text-center">{brightness}%</span>
          </div>
        </div>
        <button onClick={handleProcess} disabled={!originalUrl} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          应用模糊
        </button>
        {originalUrl && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">原图</p>
              <img src={originalUrl} alt="原图" className="max-w-full rounded-lg" />
            </div>
            {resultUrl && (
              <div>
                <p className="font-medium mb-2">模糊效果</p>
                <img src={resultUrl} alt="效果" className="max-w-full rounded-lg" />
              </div>
            )}
          </div>
        )}
        {resultUrl && (
          <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            <Download size={20} />下载图片
          </button>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Upload, Download, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';

export default function ImageFlip() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl('');
    setFlipH(false);
    setFlipV(false);
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
      ctx.save();
      ctx.translate(flipH ? canvas.width : 0, flipV ? canvas.height : 0);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = originalUrl;
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'flipped.png';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">图片翻转</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择图片</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => setFlipH(!flipH)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${flipH ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}>
            <FlipHorizontal size={20} />
            水平翻转
          </button>
          <button onClick={() => setFlipV(!flipV)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${flipV ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}>
            <FlipVertical size={20} />
            垂直翻转
          </button>
          <button onClick={() => { setFlipH(!flipH); setFlipV(!flipV); }} className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50">
            <RefreshCw size={20} />
            旋转180°
          </button>
        </div>
        <button onClick={handleProcess} disabled={!originalUrl} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          应用翻转
        </button>
        {originalUrl && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">原图</p>
              <img src={originalUrl} alt="原图" className="max-w-full rounded-lg" />
            </div>
            {resultUrl && (
              <div>
                <p className="font-medium mb-2">翻转效果</p>
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

import { useState } from 'react';
import { Film } from 'lucide-react';

export default function GifCompressor() {
  const [original, setOriginal] = useState<{url: string; size: number; name: string} | null>(null);
  const [quality, setQuality] = useState(70);
  const [result, setResult] = useState<{url: string; size: number} | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginal({ url: URL.createObjectURL(file), size: file.size, name: file.name });
    setResult(null);
  };

  const compress = () => {
    if (!original) return;
    setProcessing(true);
    const img = new Image();
    img.onload = () => {
      const scale = quality / 100;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        if (blob) setResult({ url: URL.createObjectURL(blob), size: blob.size });
        setProcessing(false);
      }, 'image/gif', 0.8);
    };
    img.src = original.url;
  };

  const fmt = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Film className="w-5 h-5" /> GIF 压缩</h2>
        <input type="file" accept="image/gif,image/png,image/jpeg" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {original && (
          <div className="bg-navy-50 rounded-xl p-4">
            <p className="text-sm text-navy-500 mb-2">原始: {original.name} ({fmt(original.size)})</p>
            <img src={original.url} alt="original" className="max-h-64 mx-auto" />
          </div>
        )}
        <div className="flex items-center gap-4">
          <label className="text-sm text-navy-600">压缩质量: {quality}%</label>
          <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(+e.target.value)} className="flex-1" />
        </div>
        <button onClick={compress} disabled={!original || processing} className="btn-primary text-sm">{processing ? '压缩中...' : '开始压缩'}</button>
        {result && (
          <div className="bg-green-50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-green-700">压缩后: {fmt(result.size)} (节省 {((1 - result.size / (original?.size || 1)) * 100).toFixed(1)}%)</p>
            <img src={result.url} alt="compressed" className="max-h-64 mx-auto" />
            <a href={result.url} download="compressed.gif" className="btn-primary text-sm inline-block">下载压缩图片</a>
          </div>
        )}
      </div>
    </div>
  );
}

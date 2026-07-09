import { useState, useRef } from 'react';
import { Upload, Download, Scissors } from 'lucide-react';

export default function ImageSplit() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalUrl(URL.createObjectURL(file));
    setResults([]);
  };

  const handleSplit = () => {
    if (!originalUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cellW = Math.floor(img.width / cols);
      const cellH = Math.floor(img.height / rows);
      const parts: string[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = c === cols - 1 ? img.width - c * cellW : cellW;
          canvas.height = r === rows - 1 ? img.height - r * cellH : cellH;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, c * cellW, r * cellH, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
          parts.push(canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined));
        }
      }
      setResults(parts);
    };
    img.src = originalUrl;
  };

  const handleDownloadAll = () => {
    results.forEach((url, i) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `split_${i + 1}.${format}`;
      a.click();
    });
  };

  const handleDownloadSingle = (idx: number) => {
    const a = document.createElement('a');
    a.href = results[idx];
    a.download = `split_${idx + 1}.${format}`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">图片分割</h2>
      <p className="text-gray-500 mb-4">将图片按网格分割成多张小图。</p>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Scissors className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择图片</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm">行数：</span>
            <input type="number" min="1" max="10" value={rows} onChange={e => setRows(Math.max(1, Math.min(10, Number(e.target.value))))} className="w-16 border rounded px-2 py-1" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">列数：</span>
            <input type="number" min="1" max="10" value={cols} onChange={e => setCols(Math.max(1, Math.min(10, Number(e.target.value))))} className="w-16 border rounded px-2 py-1" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">格式：</span>
            <select value={format} onChange={e => setFormat(e.target.value as 'png' | 'jpeg')} className="border rounded px-2 py-1">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
          <span className="text-sm text-gray-500">共 {rows * cols} 块</span>
        </div>
        <button onClick={handleSplit} disabled={!originalUrl} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          分割图片
        </button>
        {originalUrl && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">原图预览</p>
            <img src={originalUrl} alt="原图" className="max-h-48 rounded" />
          </div>
        )}
        {results.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {results.map((url, idx) => (
                <div key={idx} className="border rounded-lg p-2 bg-white hover:shadow-md">
                  <img src={url} alt={`块${idx + 1}`} className="w-full rounded cursor-pointer" onClick={() => handleDownloadSingle(idx)} />
                  <p className="text-center text-sm text-gray-500 mt-1">块 {idx + 1}</p>
                </div>
              ))}
            </div>
            <button onClick={handleDownloadAll} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              <Download size={20} />下载全部
            </button>
          </>
        )}
      </div>
    </div>
  );
}

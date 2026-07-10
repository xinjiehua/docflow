import { useState } from 'react';
import { Scissors } from 'lucide-react';

export default function GifSplitter() {
  const [file, setFile] = useState<{url: string; name: string; w: number; h: number} | null>(null);
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);
  const [pieces, setPieces] = useState<string[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;
    const img = new Image();
    img.onload = () => setFile({ url: URL.createObjectURL(imgFile), name: imgFile.name, w: img.width, h: img.height });
    img.src = URL.createObjectURL(imgFile);
  };

  const split = () => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const results: string[] = [];
      const pw = Math.floor(img.width / cols);
      const ph = Math.floor(img.height / rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = pw;
          canvas.height = ph;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
          results.push(canvas.toDataURL('image/png'));
        }
      }
      setPieces(results);
    };
    img.src = file.url;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Scissors className="w-5 h-5" /> 图片分割</h2>
        <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && <p className="text-sm text-navy-500">已加载: {file.name} ({file.w}x{file.h})</p>}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-navy-600">列数</label><input type="number" min="1" max="10" value={cols} onChange={e => setCols(+e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
          <div><label className="text-sm text-navy-600">行数</label><input type="number" min="1" max="10" value={rows} onChange={e => setRows(+e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
        </div>
        <button onClick={split} disabled={!file} className="btn-primary text-sm">分割图片</button>
        {pieces.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pieces.map((p, i) => (
              <div key={i} className="bg-navy-50 rounded-lg p-2">
                <img src={p} alt={`piece-${i}`} className="w-full" />
                <a href={p} download={`piece_${i}.png`} className="text-xs text-brand-600 mt-1 inline-block">下载</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

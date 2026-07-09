import { useState, useRef } from 'react';
import { Upload, Download, LayoutGrid } from 'lucide-react';

export default function CollageMaker() {
  const [images, setImages] = useState<string[]>([]);
  const [resultUrl, setResultUrl] = useState('');
  const [layout, setLayout] = useState<'grid2' | 'grid3' | 'grid4' | 'horizontal' | 'vertical'>('grid3');
  const [gap, setGap] = useState(4);
  const [bgColor, setBgColor] = useState('#ffffff');

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setImages(urls);
    setResultUrl('');
  };

  const handleGenerate = () => {
    if (images.length === 0) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const gapPx = gap;
    const padding = gapPx;

    const loadImages = images.map(src => new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(new Image());
      img.src = src;
    }));

    Promise.all(loadImages).then(imgs => {
      const validImgs = imgs.filter(img => img.width > 0);
      if (validImgs.length === 0) return;

      if (layout === 'grid2' || layout === 'grid3' || layout === 'grid4') {
        const cols = layout === 'grid2' ? 2 : layout === 'grid3' ? 3 : 4;
        const cellW = 300;
        const cellH = 300;
        const rows = Math.ceil(validImgs.length / cols);
        canvas.width = cols * cellW + (cols + 1) * gapPx;
        canvas.height = rows * cellH + (rows + 1) * gapPx;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        validImgs.forEach((img, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = gapPx + col * (cellW + gapPx);
          const y = gapPx + row * (cellH + gapPx);
          drawFitImage(ctx, img, x, y, cellW, cellH);
        });
      } else if (layout === 'horizontal') {
        const cellH = 400;
        const cellW = cellH;
        canvas.width = validImgs.length * cellW + (validImgs.length + 1) * gapPx;
        canvas.height = cellH + gapPx * 2;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        validImgs.forEach((img, idx) => {
          const x = gapPx + idx * (cellW + gapPx);
          drawFitImage(ctx, img, x, gapPx, cellW, cellH);
        });
      } else {
        const cellW = 800;
        const cellH = 200;
        canvas.width = cellW + gapPx * 2;
        canvas.height = validImgs.length * cellH + (validImgs.length + 1) * gapPx;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        validImgs.forEach((img, idx) => {
          const y = gapPx + idx * (cellH + gapPx);
          drawFitImage(ctx, img, gapPx, y, cellW, cellH);
        });
      }

      setResultUrl(canvas.toDataURL('image/jpeg', 0.9));
    });
  };

  const drawFitImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
    const scale = Math.min(w / img.width, h / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    const ix = x + (w - iw) / 2;
    const iy = y + (h - ih) / 2;
    ctx.drawImage(img, ix, iy, iw, ih);
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'collage.jpg';
    a.click();
  };

  const layouts = [
    { id: 'grid2' as const, label: '2列' },
    { id: 'grid3' as const, label: '3列' },
    { id: 'grid4' as const, label: '4列' },
    { id: 'horizontal' as const, label: '横向' },
    { id: 'vertical' as const, label: '纵向' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">网格拼图</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <LayoutGrid className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择多张图片</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {layouts.map(l => (
              <button key={l.id} onClick={() => setLayout(l.id)} className={`px-3 py-1.5 rounded-lg border text-sm ${layout === l.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">间距：</span>
            <input type="range" min="0" max="20" value={gap} onChange={e => setGap(Number(e.target.value))} className="w-24" />
            <span className="text-sm">{gap}px</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">背景：</span>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
        </div>
        <p className="text-gray-500">已选 {images.length} 张图片</p>
        <button onClick={handleGenerate} disabled={images.length === 0} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          生成拼图
        </button>
        {resultUrl && (
          <>
            <img src={resultUrl} alt="拼图" className="max-w-full rounded-lg" />
            <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              <Download size={20} />
              下载拼图
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Film } from 'lucide-react';

export default function ImageToGif() {
  const [images, setImages] = useState<{url: string; name: string}[]>([]);
  const [delay, setDelay] = useState(300);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imgs = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }));
    setImages(prev => [...prev, ...imgs]);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  useState(() => {
    if (playing && images.length > 0) {
      timerRef.current = window.setInterval(() => {
        setPreviewIdx(c => (c + 1) % images.length);
      }, delay);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  });

  const exportSprite = () => {
    if (images.length === 0 || !canvasRef.current) return;
    const imgs: HTMLImageElement[] = [];
    let loaded = 0;
    images.forEach(({url}) => {
      const img = new Image();
      img.onload = () => { loaded++; if (loaded === images.length) draw(imgs); };
      img.src = url;
      imgs.push(img);
    });
    const draw = (loadedImgs: HTMLImageElement[]) => {
      const first = loadedImgs[0];
      const canvas = canvasRef.current!;
      canvas.width = first.width;
      canvas.height = first.height * loadedImgs.length;
      const ctx = canvas.getContext('2d')!;
      loadedImgs.forEach((img, i) => ctx.drawImage(img, 0, i * img.height));
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'sprite.png';
      a.click();
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Film className="w-5 h-5" /> 多图合成精灵图</h2>
        <input type="file" accept="image/*" multiple onChange={handleFiles} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        <div className="flex items-center gap-2">
          <label className="text-sm text-navy-600">帧延迟: {delay}ms</label>
          <input type="range" min="50" max="2000" value={delay} onChange={e => setDelay(+e.target.value)} className="w-40" />
        </div>
        {images.length > 0 && (
          <>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setPlaying(!playing)} className="btn-secondary text-sm">{playing ? '暂停预览' : '播放预览'}</button>
              <button onClick={exportSprite} className="btn-primary text-sm">导出精灵图</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.url} alt={img.name} className={`w-full h-20 object-cover rounded-lg border-2 ${i === previewIdx ? 'border-brand-500' : 'border-transparent'}`} />
                  <button onClick={() => removeImage(i)} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </div>
              ))}
            </div>
            <div className="bg-navy-50 rounded-xl p-4 flex justify-center">
              <img src={images[previewIdx]?.url} alt="preview" className="max-h-64" />
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

import { useState, useRef, DragEvent } from 'react';
import { Upload, Download, ImagePlus, Trash2, GripVertical } from 'lucide-react';

interface CollageItem {
  id: string;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ImageFreeCollage() {
  const [items, setItems] = useState<CollageItem[]>([]);
  const [resultUrl, setResultUrl] = useState('');
  const [canvasW, setCanvasW] = useState(1200);
  const [canvasH, setCanvasH] = useState(800);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragId = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(200 / img.width, 200 / img.height);
        setItems(prev => [...prev, {
          id: Date.now() + '_' + idx,
          url,
          x: (prev.length * 50) % canvasW,
          y: (prev.length * 50) % canvasH,
          w: img.width * scale,
          h: img.height * scale,
        }]);
      };
      img.src = url;
    });
  };

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    dragId.current = id;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragId.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.current.x;
    const y = e.clientY - rect.top - dragOffset.current.y;
    setItems(prev => prev.map(item =>
      item.id === dragId.current ? { ...item, x, y } : item
    ));
  };

  const handleMouseUp = () => { dragId.current = null; };

  const resizeItem = (id: string, dw: number, dh: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, w: Math.max(30, item.w + dw), h: Math.max(30, item.h + dh) } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const generateCollage = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);

    for (const item of items) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, item.x, item.y, item.w, item.h);
          resolve();
        };
        img.src = item.url;
      });
    }
    setResultUrl(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'collage.png';
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">自由拼图</h2>
      <p className="text-gray-500 mb-4">添加多张图片，拖拽调整位置和大小，生成拼图。</p>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium">画布宽度：</label>
            <input type="number" value={canvasW} onChange={e => setCanvasW(Number(e.target.value))} className="w-24 border rounded px-2 py-1 ml-1" />
          </div>
          <div>
            <label className="text-sm font-medium">画布高度：</label>
            <input type="number" value={canvasH} onChange={e => setCanvasH(Number(e.target.value))} className="w-24 border rounded px-2 py-1 ml-1" />
          </div>
          <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            <ImagePlus size={20} />
            添加图片
            <input type="file" accept="image/*" multiple onChange={addImages} className="hidden" />
          </label>
        </div>
        {items.length > 0 && (
          <div className="border rounded-lg bg-white shadow" style={{ width: '100%', maxWidth: canvasW, overflow: 'auto' }}>
            <div ref={canvasRef} className="relative" style={{ width: canvasW, height: canvasH, background: '#f9fafb' }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
              {items.map(item => (
                <div key={item.id} className="absolute border-2 border-blue-400 cursor-move select-none" style={{ left: item.x, top: item.y, width: item.w, height: item.h }}>
                  <img src={item.url} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
                  <div className="absolute top-0 left-0 bg-blue-500 text-white p-0.5 cursor-move" onMouseDown={e => handleMouseDown(item.id, e)}>
                    <GripVertical size={14} />
                  </div>
                  <div className="absolute top-0 right-0 flex flex-col">
                    <button onClick={() => resizeItem(item.id, 20, 20)} className="bg-white/80 border px-1 text-xs hover:bg-gray-100">+</button>
                    <button onClick={() => resizeItem(item.id, -20, -20)} className="bg-white/80 border px-1 text-xs hover:bg-gray-100">-</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {items.length > 0 && (
          <button onClick={generateCollage} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            生成拼图
          </button>
        )}
        {resultUrl && (
          <>
            <img src={resultUrl} alt="拼图结果" className="max-w-full rounded-lg border" />
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

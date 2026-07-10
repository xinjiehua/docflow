import { useState, useRef, useEffect } from 'react';
import { Film } from 'lucide-react';

export default function GifFrameViewer() {
  const [frames, setFrames] = useState<HTMLCanvasElement[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [fileName, setFileName] = useState('');
  const timerRef = useRef<number | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      setFrames([canvas]);
      setCurrent(0);
    };
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    if (playing && frames.length > 1) {
      timerRef.current = window.setInterval(() => {
        setCurrent(c => (c + 1) % frames.length);
      }, speed);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, frames.length, speed]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Film className="w-5 h-5" /> GIF 逐帧查看器</h2>
        <input type="file" accept="image/gif" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {frames.length > 0 && (
          <>
            <div className="text-sm text-navy-500">{fileName} - 第 {current + 1}/{frames.length} 帧 {frames.length > 1 ? `(${speed}ms/帧)` : ''}</div>
            <div className="bg-navy-50 rounded-xl p-4 flex justify-center">
              <canvas ref={el => { if (el && frames[current]) { el.width = frames[current].width; el.height = frames[current].height; el.getContext('2d')!.drawImage(frames[current], 0, 0); }}} className="max-w-full max-h-96" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setPlaying(!playing)} className="btn-primary text-sm">{playing ? '暂停' : '播放'}</button>
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} className="btn-secondary text-sm">上一帧</button>
              <button onClick={() => setCurrent(c => (c + 1) % frames.length)} className="btn-secondary text-sm">下一帧</button>
              <label className="flex items-center gap-2 text-sm text-navy-600">速度: <input type="range" min="50" max="1000" value={speed} onChange={e => setSpeed(+e.target.value)} className="w-32" /> {speed}ms</label>
            </div>
          </>
        )}
      </div>
      <div className="card !p-6">
        <h3 className="font-medium text-navy-700 mb-2">使用说明</h3>
        <ul className="text-sm text-navy-500 space-y-1">
          <li>上传GIF图片文件</li>
          <li>逐帧浏览，查看每一帧画面</li>
          <li>调整播放速度控制帧率</li>
        </ul>
      </div>
    </div>
  );
}

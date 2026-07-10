import { useState, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function VideoThumbnail() {
  const [file, setFile] = useState<{url: string; name: string} | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [count, setCount] = useState(4);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFile({url, name: f.name});
    setThumbnails([]);
  };

  const generate = () => {
    if (!file || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const results: string[] = [];
    const duration = video.duration;
    const ctx = canvas.getContext('2d')!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    for (let i = 0; i < count; i++) {
      video.currentTime = (duration / (count + 1)) * (i + 1);
    }

    const capture = () => {
      ctx.drawImage(video, 0, 0);
      results.push(canvas.toDataURL('image/jpeg', 0.8));
      if (results.length < count) {
        const nextTime = (video.duration / (count + 1)) * (results.length + 1);
        video.currentTime = nextTime;
      } else {
        setThumbnails([...results]);
      }
    };

    video.onseeked = capture;
    video.currentTime = (duration / (count + 1)) * 1;
  };

  const downloadAll = () => {
    thumbnails.forEach((url, i) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `thumbnail_${i + 1}.jpg`;
      a.click();
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><ImageIcon className="w-5 h-5" /> 视频缩略图提取</h2>
        <input type="file" accept="video/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && (
          <div className="bg-navy-50 rounded-xl p-4">
            <video ref={videoRef} controls src={file.url} className="w-full max-h-48 rounded-lg" crossOrigin="anonymous" />
            <div className="flex items-center gap-4 mt-3">
              <label className="text-sm text-navy-600">缩略图数量: {count}</label>
              <input type="range" min="1" max="12" value={count} onChange={e => setCount(+e.target.value)} className="w-32" />
              <button onClick={generate} className="btn-primary text-sm">生成</button>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        {thumbnails.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-navy-700">缩略图 ({thumbnails.length}张)</h3>
              <button onClick={downloadAll} className="text-xs text-brand-600">下载全部</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {thumbnails.map((url, i) => (
                <div key={i} className="bg-navy-50 rounded-lg overflow-hidden">
                  <img src={url} alt={`thumb-${i}`} className="w-full" />
                  <div className="p-1.5 flex justify-between items-center">
                    <span className="text-xs text-navy-400">#{i + 1}</span>
                    <a href={url} download={`thumb_${i + 1}.jpg`} className="text-xs text-brand-600">下载</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

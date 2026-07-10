import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

export default function VideoFrameCapture() {
  const [file, setFile] = useState<{url: string; name: string} | null>(null);
  const [captures, setCaptures] = useState<{url: string; time: number}[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({url: URL.createObjectURL(f), name: f.name});
    setCaptures([]);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setCaptures(prev => [...prev, {url: dataUrl, time: currentTime}]);
  };

  const download = (url: string, idx: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `frame_${idx + 1}.png`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Camera className="w-5 h-5" /> 视频截帧</h2>
        <input type="file" accept="video/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && (
          <div className="bg-navy-50 rounded-xl p-4">
            <video ref={videoRef} controls src={file.url} className="w-full max-h-64 rounded-lg" onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)} crossOrigin="anonymous" />
            <div className="flex gap-2 mt-3">
              <button onClick={captureFrame} className="btn-primary text-sm">截取当前帧</button>
              <span className="text-sm text-navy-500 self-center">当前时间: {currentTime.toFixed(2)}s</span>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        {captures.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-navy-700 mb-2">已截取 {captures.length} 帧</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {captures.map((cap, i: number) => (
                <div key={i} className="bg-navy-50 rounded-lg p-2">
                  <img src={cap.url} alt={`frame-${i}`} className="w-full rounded" />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-navy-400">{cap.time.toFixed(2)}s</span>
                    <button onClick={() => download(cap.url, i)} className="text-xs text-brand-600">下载</button>
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

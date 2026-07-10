import { useState, useRef } from 'react';
import { Gauge } from 'lucide-react';

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

export default function VideoSpeedChanger() {
  const [file, setFile] = useState<{url: string; name: string} | null>(null);
  const [speed, setSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({url: URL.createObjectURL(f), name: f.name});
  };

  const changeSpeed = (s: number) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Gauge className="w-5 h-5" /> 视频变速播放</h2>
        <input type="file" accept="video/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && (
          <>
            <video ref={videoRef} controls src={file.url} className="w-full max-h-80 rounded-lg" />
            <div>
              <p className="text-sm text-navy-600 mb-2">播放速度: <span className="font-bold text-brand-600">{speed}x</span></p>
              <div className="flex gap-1.5 flex-wrap">
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => changeSpeed(s)} className={`px-3 py-1.5 rounded-lg text-sm ${speed === s ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>{s}x</button>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-sm text-navy-600">自定义速度: {(speed).toFixed(2)}x</label>
                <input type="range" min="0.25" max="4" step="0.05" value={speed} onChange={e => changeSpeed(parseFloat(e.target.value))} className="w-full" />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="card !p-4 text-xs text-navy-400">
        <p>使用浏览器原生播放速率控制。实际导出变速视频需要 ffmpeg.wasm 库支持。</p>
      </div>
    </div>
  );
}

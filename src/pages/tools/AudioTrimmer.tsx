import { useState, useRef } from 'react';
import { Scissors } from 'lucide-react';

export default function AudioTrimmer() {
  const [file, setFile] = useState<{url: string; name: string} | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trimmedUrl, setTrimmedUrl] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFile({url, name: f.name});
    const audio = new Audio(url);
    audio.onloadedmetadata = () => { setDuration(audio.duration); setEnd(audio.duration); };
    audioRef.current = audio;
  };

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = start;
    audioRef.current.play();
    setPlaying(true);
    const check = () => {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.currentTime >= end) {
        audioRef.current.pause();
        setPlaying(false);
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  };

  const stop = () => { if (audioRef.current) { audioRef.current.pause(); setPlaying(false); }};

  const trim = () => {
    if (!file) return;
    alert('音频裁剪需要使用 Web Audio API 进行离线处理。\n当前浏览器预览模式：已选择 ' + start.toFixed(1) + 's - ' + end.toFixed(1) + 's 区间。\n\n完整功能需要加载 ffmpeg.wasm 库（约25MB），\n在当前版本中暂以预览模式展示。');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Scissors className="w-5 h-5" /> 音频裁剪</h2>
        <input type="file" accept="audio/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && (
          <>
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="text-sm text-navy-600 mb-2">{file.name} (总时长: {fmt(duration)})</p>
              <div className="relative">
                <div className="w-full bg-navy-200 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{width: `${(currentTime / duration) * 100}%`}} />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={playing ? stop : play} className="btn-primary text-sm">{playing ? '停止' : '播放预览'}</button>
                <span className="text-sm text-navy-500 self-center">{fmt(currentTime)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-navy-600">开始时间: {fmt(start)}</label><input type="range" min="0" max={duration} step="0.1" value={start} onChange={e => { setStart(+e.target.value); if (+e.target.value >= end) setEnd(+e.target.value + 1); }} className="w-full" /></div>
              <div><label className="text-sm text-navy-600">结束时间: {fmt(end)}</label><input type="range" min={start} max={duration} step="0.1" value={end} onChange={e => setEnd(+e.target.value)} className="w-full" /></div>
            </div>
            <p className="text-sm text-navy-500">选中区间: {fmt(end - start)}</p>
            <button onClick={trim} className="btn-primary text-sm">裁剪</button>
          </>
        )}
      </div>
    </div>
  );
}

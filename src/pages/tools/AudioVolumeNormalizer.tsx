import { useState, useRef } from 'react';
import { Volume2 } from 'lucide-react';

export default function AudioVolumeNormalizer() {
  const [file, setFile] = useState<{url: string; name: string} | null>(null);
  const [volume, setVolume] = useState(100);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{peak: number; rms: number; channels: number; sampleRate: number; duration: number} | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({url: URL.createObjectURL(f), name: f.name});
    setAnalyzing(true);
    try {
      const buffer = await f.arrayBuffer();
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const decoded = await ctx.decodeAudioData(buffer);
      setAnalysis({
        peak: Math.max(...Array.from(decoded.getChannelData(0)).map(Math.abs)),
        rms: Math.sqrt(Array.from(decoded.getChannelData(0)).reduce((s, v) => s + v * v, 0) / decoded.getChannelData(0).length),
        channels: decoded.numberOfChannels,
        sampleRate: decoded.sampleRate,
        duration: decoded.duration,
      });
    } catch { setAnalysis(null); }
    setAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Volume2 className="w-5 h-5" /> 音频音量分析</h2>
        <input type="file" accept="audio/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {analyzing && <p className="text-sm text-navy-500">正在分析...</p>}
        {file && analysis && (
          <>
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="text-sm font-medium text-navy-700 mb-3">{file.name}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-navy-500">声道数:</span> <span className="font-medium">{analysis.channels}</span></div>
                <div><span className="text-navy-500">采样率:</span> <span className="font-medium">{analysis.sampleRate}Hz</span></div>
                <div><span className="text-navy-500">时长:</span> <span className="font-medium">{analysis.duration.toFixed(1)}s</span></div>
                <div><span className="text-navy-500">峰值:</span> <span className="font-medium">{(20 * Math.log10(analysis.peak)).toFixed(1)} dB</span></div>
                <div><span className="text-navy-500">RMS:</span> <span className="font-medium">{(20 * Math.log10(Math.max(analysis.rms, 0.0001))).toFixed(1)} dB</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm text-navy-600">目标音量: {volume}%</label>
              <input type="range" min="10" max="200" value={volume} onChange={e => setVolume(+e.target.value)} className="w-full" />
            </div>
            <div className="flex gap-2">
              <audio controls src={file.url} className="w-full" />
            </div>
            <div className="bg-brand-50 rounded-lg p-3 text-sm text-brand-700">
              音量标准化需要 ffmpeg.wasm 支持，当前版本提供音量分析预览功能。
            </div>
          </>
        )}
      </div>
    </div>
  );
}

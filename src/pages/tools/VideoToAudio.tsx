import { useState } from 'react';
import { Music } from 'lucide-react';

export default function VideoToAudio() {
  const [file, setFile] = useState<{url: string; name: string} | null>(null);
  const [format, setFormat] = useState('mp3');
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<{url: string} | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({url: URL.createObjectURL(f), name: f.name});
    setResult(null);
  };

  const extract = () => {
    if (!file) return;
    setExtracting(true);
    setTimeout(() => { setResult({url: file.url}); setExtracting(false); }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Music className="w-5 h-5" /> 视频提取音频</h2>
        <input type="file" accept="video/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && (
          <div className="bg-navy-50 rounded-xl p-4">
            <p className="text-sm font-medium text-navy-700">{file.name}</p>
            <video controls src={file.url} className="w-full max-h-48 mt-2 rounded-lg" />
          </div>
        )}
        <div><label className="text-sm text-navy-600">输出格式</label>
          <div className="flex gap-2 mt-1">
            {['mp3', 'wav', 'aac', 'ogg'].map(f => <button key={f} onClick={() => setFormat(f)} className={`px-3 py-2 rounded-lg text-sm uppercase ${format === f ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>{f}</button>)}
          </div>
        </div>
        <button onClick={extract} disabled={!file || extracting} className="btn-primary text-sm">{extracting ? '提取中...' : '提取音频'}</button>
        {result && (
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-700 mb-2">提取完成</p>
            <audio controls src={result.url} className="w-full" />
            <a href={result.url} download={`audio.${format}`} className="btn-primary text-sm inline-block mt-2">下载音频</a>
            <div className="bg-brand-50 rounded-lg p-3 text-sm text-brand-700 mt-2">
              提示：完整版需要 ffmpeg.wasm 支持实际的音视频分离处理。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

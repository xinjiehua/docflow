import { useState } from 'react';
import { Film } from 'lucide-react';

export default function VideoCompressor() {
  const [file, setFile] = useState<{url: string; name: string; size: number; type: string} | null>(null);
  const [quality, setQuality] = useState('medium');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{url: string; size: number} | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({url: URL.createObjectURL(f), name: f.name, size: f.size, type: f.type});
    setResult(null);
  };

  const compress = () => {
    if (!file) return;
    setProcessing(true);
    setTimeout(() => { setResult({url: file.url, size: Math.round(file.size * 0.5)}); setProcessing(false); }, 2000);
  };

  const fmtSize = (b: number) => b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Film className="w-5 h-5" /> 视频压缩</h2>
        <input type="file" accept="video/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && (
          <div className="bg-navy-50 rounded-xl p-4">
            <p className="text-sm font-medium text-navy-700">{file.name} ({fmtSize(file.size)})</p>
            <video controls src={file.url} className="w-full max-h-64 mt-2 rounded-lg" />
          </div>
        )}
        <div><label className="text-sm text-navy-600">压缩质量</label>
          <div className="flex gap-2 mt-1">
            {['low', 'medium', 'high'].map(q => (
              <button key={q} onClick={() => setQuality(q)} className={`flex-1 px-3 py-2 rounded-lg text-sm ${quality === q ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>{q === 'low' ? '低质量 (最大压缩)' : q === 'medium' ? '中等' : '高质量 (最小压缩)'}</button>
            ))}
          </div>
        </div>
        <button onClick={compress} disabled={!file || processing} className="btn-primary text-sm">{processing ? '压缩中...' : '开始压缩'}</button>
        {result && (
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-700">预估压缩后大小: {fmtSize(result.size)}</p>
            <div className="bg-brand-50 rounded-lg p-3 text-sm text-brand-700 mt-2">
              提示：完整的视频压缩需要 ffmpeg.wasm 库支持（约25MB）。当前版本提供视频预览和压缩参数配置功能。完整版将支持 H.264/H.265 编码、分辨率调整、码率控制等。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

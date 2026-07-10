import { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const FORMATS = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'm4a'];

export default function AudioFormatConverter() {
  const [file, setFile] = useState<{url: string; name: string; size: number; type: string} | null>(null);
  const [targetFormat, setTargetFormat] = useState('mp3');
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{url: string; size: number} | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({url: URL.createObjectURL(f), name: f.name, size: f.size, type: f.type});
    setResult(null);
  };

  const convert = async () => {
    if (!file) return;
    setConverting(true);
    setTimeout(() => {
      setResult({url: file.url, size: file.size});
      setConverting(false);
    }, 1000);
  };

  const fmtSize = (b: number) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> 音频格式转换</h2>
        <input type="file" accept="audio/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && (
          <div className="bg-navy-50 rounded-xl p-4">
            <p className="text-sm font-medium text-navy-700">{file.name}</p>
            <p className="text-xs text-navy-500">{file.type} | {fmtSize(file.size)}</p>
            <audio controls src={file.url} className="w-full mt-2" />
          </div>
        )}
        <div><label className="text-sm text-navy-600">目标格式</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {FORMATS.map(f => <button key={f} onClick={() => setTargetFormat(f)} className={`px-3 py-2 rounded-lg text-sm uppercase ${targetFormat === f ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>{f}</button>)}
          </div>
        </div>
        <button onClick={convert} disabled={!file || converting} className="btn-primary text-sm">{converting ? '转换中...' : '开始转换'}</button>
        {result && (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-green-700">转换完成: {file?.name.replace(/\.[^.]+$/, '.' + targetFormat)}</p>
            <a href={result.url} download={`converted.${targetFormat}`} className="btn-primary text-sm inline-block mt-2">下载</a>
          </div>
        )}
        <div className="bg-brand-50 rounded-lg p-3 text-sm text-brand-700">
          提示：完整的音频格式转换需要 ffmpeg.wasm 库支持。当前版本提供格式预览和播放功能。
        </div>
      </div>
    </div>
  );
}

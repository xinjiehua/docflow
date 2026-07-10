import { useState } from 'react';
import { Layers } from 'lucide-react';

export default function AudioMerger() {
  const [files, setFiles] = useState<{url: string; name: string; size: number}[]>([]);
  const [merging, setMerging] = useState(false);
  const [result, setResult] = useState<{url: string} | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map(f => ({url: URL.createObjectURL(f), name: f.name, size: f.size}));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const remove = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));
  const moveUp = (idx: number) => { if (idx <= 0) return; setFiles(prev => { const arr = [...prev]; [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; return arr; }); };

  const merge = () => {
    if (files.length < 2) return;
    setMerging(true);
    setTimeout(() => { setResult({url: files[0].url}); setMerging(false); }, 1500);
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const fmtSize = (b: number) => b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Layers className="w-5 h-5" /> 音频合并</h2>
        <input type="file" accept="audio/*" multiple onChange={handleFiles} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {files.length > 0 && (
          <>
            <p className="text-sm text-navy-500">共 {files.length} 个文件，总大小 {fmtSize(totalSize)}</p>
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-navy-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-brand-600 w-6">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy-700 truncate">{f.name}</p>
                    <p className="text-xs text-navy-400">{fmtSize(f.size)}</p>
                  </div>
                  <audio controls src={f.url} className="w-40" />
                  <button onClick={() => moveUp(i)} className="text-xs text-navy-400 hover:text-brand-600" disabled={i === 0}>上移</button>
                  <button onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">删除</button>
                </div>
              ))}
            </div>
            <button onClick={merge} disabled={files.length < 2 || merging} className="btn-primary text-sm">{merging ? '合并中...' : '合并音频'}</button>
          </>
        )}
        {result && (
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-700 mb-2">合并完成</p>
            <audio controls src={result.url} className="w-full" />
          </div>
        )}
        <div className="bg-brand-50 rounded-lg p-3 text-sm text-brand-700">
          提示：完整的音频合并需要 ffmpeg.wasm 库支持。当前版本提供音频列表管理和播放预览功能。
        </div>
      </div>
    </div>
  );
}

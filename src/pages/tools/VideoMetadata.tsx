import { useState } from 'react';
import { FileText } from 'lucide-react';

export default function VideoMetadata() {
  const [file, setFile] = useState<{url: string; name: string; size: number; type: string; lastModified: number} | null>(null);
  const [videoInfo, setVideoInfo] = useState<{width: number; height: number; duration: number} | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({url: URL.createObjectURL(f), name: f.name, size: f.size, type: f.type, lastModified: f.lastModified});
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      setVideoInfo({width: video.videoWidth, height: video.videoHeight, duration: video.duration});
    };
    video.src = URL.createObjectURL(f);
  };

  const fmtSize = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b < 1073741824 ? (b / 1048576).toFixed(1) + ' MB' : (b / 1073741824).toFixed(2) + ' GB');
  const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const fmtDate = (ts: number) => new Date(ts).toLocaleString('zh-CN');

  const getResolutionName = (w: number, h: number) => {
    if (h >= 2160) return '4K UHD';
    if (h >= 1440) return '2K QHD';
    if (h >= 1080) return '1080p FHD';
    if (h >= 720) return '720p HD';
    if (h >= 480) return '480p SD';
    return h >= 360 ? '360p' : '低分辨率';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><FileText className="w-5 h-5" /> 视频信息查看器</h2>
        <input type="file" accept="video/*" onChange={handleFile} className="block w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
        {file && videoInfo && (
          <>
            <div className="bg-navy-50 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-navy-100 text-sm font-medium text-navy-600">{file.name}</div>
              {[
                ['文件大小', fmtSize(file.size)],
                ['文件类型', file.type || '未知'],
                ['修改日期', fmtDate(file.lastModified)],
                ['视频尺寸', `${videoInfo.width} x ${videoInfo.height} (${getResolutionName(videoInfo.width, videoInfo.height)})`],
                ['宽高比', videoInfo.height > 0 ? (videoInfo.width / videoInfo.height).toFixed(2) : '-'],
                ['时长', fmtDuration(videoInfo.duration)],
                ['比特率 (估算)', fmtSize(Math.round(file.size / videoInfo.duration)) + '/s'],
              ].map(([key, val]) => (
                <div key={key as string} className="flex border-b border-navy-100 last:border-0">
                  <span className="w-32 px-4 py-2 text-xs text-navy-500 bg-navy-50 shrink-0">{key}</span>
                  <span className="px-4 py-2 text-sm text-navy-700">{val}</span>
                </div>
              ))}
            </div>
            <video controls src={file.url} className="w-full max-h-64 rounded-lg" />
          </>
        )}
      </div>
    </div>
  );
}

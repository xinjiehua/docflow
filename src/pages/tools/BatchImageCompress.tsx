import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';

interface ImageItem {
  file: File;
  original: string;
  compressed: string;
  originalSize: number;
  compressedSize: number;
  quality: number;
}

export default function BatchImageCompress() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(70);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [outputFormat, setOutputFormat] = useState<'same' | 'jpeg' | 'png' | 'webp'>('same');
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setProcessing(true);
    const items: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      setProcessingProgress(`压缩中 ${i + 1}/${files.length}...`);
      const f = files[i];
      const originalUrl = URL.createObjectURL(f);
      const compressedUrl = await compressImage(f, quality, maxWidth, maxHeight, outputFormat);
      const compressedBlob = await fetch(compressedUrl).then(r => r.blob());
      items.push({
        file: f, original: originalUrl, compressed: compressedUrl,
        originalSize: f.size, compressedSize: compressedBlob.size,
        quality,
      });
    }
    setImages(items);
    setProcessing(false);
    setProcessingProgress('');
  }, [quality, maxWidth, maxHeight, outputFormat]);

  const compressImage = (file: File, q: number, maxW: number, maxH: number, format: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const scale = Math.min(maxW / w, maxH / h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        let mimeType = 'image/jpeg';
        if (format === 'png') mimeType = 'image/png';
        else if (format === 'webp') mimeType = 'image/webp';
        else if (file.type === 'image/png') mimeType = 'image/png';
        else if (file.type === 'image/webp') mimeType = 'image/webp';
        resolve(canvas.toDataURL(mimeType, q / 100));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const recompressAll = async () => {
    setProcessing(true);
    setProcessingProgress('重新压缩中...');
    const newItems: ImageItem[] = [];
    for (let i = 0; i < images.length; i++) {
      setProcessingProgress(`压缩中 ${i + 1}/${images.length}...`);
      const item = images[i];
      const compressedUrl = await compressImage(item.file, quality, maxWidth, maxHeight, outputFormat);
      const compressedBlob = await fetch(compressedUrl).then(r => r.blob());
      newItems.push({ ...item, compressed: compressedUrl, compressedSize: compressedBlob.size, quality });
    }
    setImages(newItems);
    setProcessing(false);
    setProcessingProgress('');
  };

  const downloadSingle = (item: ImageItem, index: number) => {
    const a = document.createElement('a');
    a.href = item.compressed;
    const ext = outputFormat === 'jpeg' ? '.jpg' : outputFormat === 'same' ? '' : `.${outputFormat}`;
    const baseName = item.file.name.replace(/\.\w+$/, '');
    a.download = `${baseName}_compressed${ext || '.jpg'}`;
    a.click();
  };

  const downloadAllZip = async () => {
    const zip = new JSZip();
    for (const item of images) {
      const response = await fetch(item.compressed);
      const blob = await response.blob();
      const ext = outputFormat === 'jpeg' ? '.jpg' : outputFormat === 'same' ? '' : `.${outputFormat}`;
      const baseName = item.file.name.replace(/\.\w+$/, '');
      zip.file(`${baseName}_compressed${ext || '.jpg'}`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'compressed_images.zip';
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const totalOriginal = images.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = images.reduce((s, i) => s + i.compressedSize, 0);
  const totalSaved = totalOriginal > 0 ? ((1 - totalCompressed / totalOriginal) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📦 批量图片压缩</h1>
          <p className="text-gray-500 mt-2">同时上传多张图片批量压缩，统一设置参数，打包下载</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">上传图片</h3>
              <label className="block w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 transition-colors">
                <span className="text-2xl block mb-1">📁</span>
                <p className="text-sm text-gray-600">点击选择多张图片</p>
                <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
              </label>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="font-semibold text-gray-700">压缩设置</h3>
              <div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">压缩质量</span><span className="text-gray-400">{quality}%</span></div>
                <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(+e.target.value)} className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>小文件</span><span>高质量</span></div>
              </div>
              <div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">最大宽度</span><span className="text-gray-400">{maxWidth}px</span></div>
                <input type="range" min={320} max={3840} step={10} value={maxWidth} onChange={e => setMaxWidth(+e.target.value)} className="w-full accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">最大高度</span><span className="text-gray-400">{maxHeight}px</span></div>
                <input type="range" min={240} max={2160} step={10} value={maxHeight} onChange={e => setMaxHeight(+e.target.value)} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="text-sm text-gray-600">输出格式</label>
                <select value={outputFormat} onChange={e => setOutputFormat(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1">
                  <option value="same">保持原格式</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              {images.length > 0 && (
                <button onClick={recompressAll} disabled={processing}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors">
                  用新参数重新压缩
                </button>
              )}
            </div>

            {images.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-5">
                <h3 className="font-semibold text-blue-700 mb-2">汇总统计</h3>
                <div className="space-y-1 text-sm text-blue-600">
                  <div className="flex justify-between"><span>总文件数</span><span className="font-bold">{images.length}</span></div>
                  <div className="flex justify-between"><span>原始大小</span><span className="font-bold">{formatSize(totalOriginal)}</span></div>
                  <div className="flex justify-between"><span>压缩后</span><span className="font-bold">{formatSize(totalCompressed)}</span></div>
                  <div className="flex justify-between"><span>节省空间</span><span className="font-bold text-green-600">{totalSaved}%</span></div>
                </div>
              </div>
            )}

            {images.length > 0 && (
              <button onClick={downloadAllZip} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                打包下载全部 (ZIP)
              </button>
            )}

            {processing && (
              <div className="bg-yellow-50 rounded-xl p-4 text-center text-sm text-yellow-700">{processingProgress}</div>
            )}
          </div>

          <div className="lg:col-span-2">
            {images.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center text-gray-400">
                <span className="text-5xl block mb-3">📦</span>
                <p>上传图片以开始批量压缩</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-700 mb-4">压缩结果</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {images.map((item, i) => {
                    const saved = ((1 - item.compressedSize / item.originalSize) * 100).toFixed(1);
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <img src={item.compressed} alt="" className="w-16 h-12 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{item.file.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-gray-400">{formatSize(item.originalSize)}</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-gray-600 font-medium">{formatSize(item.compressedSize)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${+saved > 50 ? 'bg-green-100 text-green-700' : +saved > 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {saved > 0 ? '-' : '+'}{Math.abs(+saved)}%
                            </span>
                          </div>
                        </div>
                        <button onClick={() => downloadSingle(item, i)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors">
                          下载
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

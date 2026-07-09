import { useState, useRef } from 'react';
import { Upload, Download, User } from 'lucide-react';

const SIZES = [
  { name: '一寸', w: 295, h: 413, label: '25×35mm' },
  { name: '二寸', w: 413, h: 579, label: '35×49mm' },
  { name: '小二寸', w: 413, h: 531, label: '35×45mm' },
  { name: '大一寸', w: 390, h: 567, label: '33×48mm' },
  { name: '护照', w: 390, h: 567, label: '33×48mm' },
];

const BG_COLORS = [
  { name: '白色', value: '#FFFFFF' },
  { name: '蓝色', value: '#438EDB' },
  { name: '红色', value: '#BE0000' },
];

export default function IdPhotoMaker() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedBg, setSelectedBg] = useState('#438EDB');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl('');
  };

  const handleGenerate = () => {
    if (!originalUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = SIZES[selectedSize];
      const canvas = document.createElement('canvas');
      const resolution = 300;
      canvas.width = size.w;
      canvas.height = size.h;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = selectedBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imgRatio > canvasRatio) {
        sw = img.height * canvasRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / canvasRatio;
        sy = (img.height - sh) * 0.1;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = originalUrl;
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `证件照_${SIZES[selectedSize].name}.png`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">证件照制作</h2>
      <p className="text-gray-500 mb-4">上传照片，选择尺寸和背景色，自动裁剪生成证件照。</p>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <User className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择正面照片</p>
        </div>
        <div>
          <p className="font-medium mb-2">照片尺寸：</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s, i) => (
              <button key={s.name} onClick={() => setSelectedSize(i)} className={`px-4 py-2 rounded-lg border text-sm ${selectedSize === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}>
                {s.name} ({s.label})
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-medium mb-2">背景颜色：</p>
          <div className="flex gap-3">
            {BG_COLORS.map(bg => (
              <button key={bg.name} onClick={() => setSelectedBg(bg.value)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${selectedBg === bg.value ? 'border-blue-600 ring-2 ring-blue-200' : ''}`}>
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: bg.value }} />
                <span className="text-sm">{bg.name}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleGenerate} disabled={!originalUrl} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          生成证件照
        </button>
        {originalUrl && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">原图</p>
              <img src={originalUrl} alt="原图" className="max-w-full rounded-lg" />
            </div>
            {resultUrl && (
              <div>
                <p className="font-medium mb-2">证件照预览</p>
                <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
                  <img src={resultUrl} alt="证件照" className="max-h-80 rounded" />
                </div>
              </div>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        {resultUrl && (
          <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            <Download size={20} />
            下载证件照
          </button>
        )}
      </div>
    </div>
  );
}

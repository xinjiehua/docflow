import { useState, useRef, useCallback, useEffect } from 'react';

export default function ImageBorder() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [borderWidth, setBorderWidth] = useState(10);
  const [borderColor, setBorderColor] = useState('#333333');
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'double' | 'rounded'>('solid');
  const [borderRadius, setBorderRadius] = useState(0);
  const [padding, setPadding] = useState(20);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [shadow, setShadow] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
    const items = list.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews(items);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    if (previews.length === 0 || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => renderPreview(img);
    img.src = previews[selectedIndex].url;
  }, [previews, selectedIndex, borderWidth, borderColor, borderStyle, borderRadius, padding, bgColor, shadow]);

  const renderPreview = (img: HTMLImageElement) => {
    const canvas = canvasRef.current!;
    const p = padding + (borderStyle === 'double' ? borderWidth * 3 : borderWidth);
    const r = borderStyle === 'rounded' ? Math.max(borderRadius, 20) : borderRadius;
    canvas.width = img.width + p * 2;
    canvas.height = img.height + p * 2;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = bgColor;
    if (r > 0) {
      roundRect(ctx, 0, 0, canvas.width, canvas.height, r);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Shadow
    if (shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = bgColor;
      if (r > 0) {
        roundRect(ctx, 0, 0, canvas.width, canvas.height, r);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.shadowColor = 'transparent';
    }

    // Border
    if (borderStyle !== 'solid' && borderStyle !== 'rounded') {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      if (borderStyle === 'dashed') ctx.setLineDash([10, 5]);
      else if (borderStyle === 'double') {
        ctx.strokeRect(p - borderWidth * 2, p - borderWidth * 2, img.width + borderWidth * 4, img.height + borderWidth * 4);
        ctx.strokeRect(p - borderWidth / 2, p - borderWidth / 2, img.width + borderWidth, img.height + borderWidth);
        ctx.setLineDash([]);
      }
      if (borderStyle === 'dashed') {
        ctx.strokeRect(p - borderWidth / 2, p - borderWidth / 2, img.width + borderWidth, img.height + borderWidth);
        ctx.setLineDash([]);
      }
    } else if (borderStyle === 'solid') {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(p - borderWidth / 2, p - borderWidth / 2, img.width + borderWidth, img.height + borderWidth);
    }

    // Image with rounded clip
    ctx.save();
    if (r > 0) {
      const imgR = Math.max(0, r - p);
      roundRect(ctx, p, p, img.width, img.height, imgR);
      ctx.clip();
    }
    ctx.drawImage(img, p, p, img.width, img.height);
    ctx.restore();
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = `bordered_${previews[selectedIndex].file.name.replace(/\.\w+$/, '.png')}`;
    a.click();
  };

  const downloadAll = async () => {
    for (let i = 0; i < previews.length; i++) {
      const img = new Image();
      await new Promise<void>(resolve => {
        img.onload = () => {
          renderPreview(img);
          resolve();
        };
        img.src = previews[i].url;
      });
      const a = document.createElement('a');
      a.href = canvasRef.current!.toDataURL('image/png');
      a.download = `bordered_${previews[i].file.name.replace(/\.\w+$/, '.png')}`;
      a.click();
      await new Promise(r => setTimeout(r, 300));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🖼️ 图片边框/圆角</h1>
          <p className="text-gray-500 mt-2">为图片添加彩色边框、圆角、阴影，支持批量处理</p>
        </div>

        {previews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <label className="inline-flex flex-col items-center gap-4 cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <span className="text-4xl">🖼️</span>
              </div>
              <p className="text-lg font-medium text-gray-700">点击上传图片（可多选）</p>
              <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-3">边框设置</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">边框样式</label>
                    <select value={borderStyle} onChange={e => setBorderStyle(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1">
                      <option value="solid">实线</option>
                      <option value="dashed">虚线</option>
                      <option value="double">双线</option>
                      <option value="rounded">圆角边框</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">边框宽度</span><span className="text-gray-400">{borderWidth}px</span></div>
                    <input type="range" min={0} max={50} value={borderWidth} onChange={e => setBorderWidth(+e.target.value)} className="w-full accent-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">内边距</span><span className="text-gray-400">{padding}px</span></div>
                    <input type="range" min={0} max={60} value={padding} onChange={e => setPadding(+e.target.value)} className="w-full accent-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">圆角半径</span><span className="text-gray-400">{borderRadius}px</span></div>
                    <input type="range" min={0} max={100} value={borderRadius} onChange={e => setBorderRadius(+e.target.value)} className="w-full accent-blue-600" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div><label className="text-sm text-gray-600">边框颜色</label><input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-full h-8 rounded cursor-pointer mt-1" /></div>
                    <div><label className="text-sm text-gray-600">背景颜色</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-8 rounded cursor-pointer mt-1" /></div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={shadow} onChange={e => setShadow(e.target.checked)} className="accent-blue-600" />
                    添加阴影效果
                  </label>
                </div>
              </div>

              {previews.length > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-700 mb-3">选择图片</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {previews.map((p, i) => (
                      <button key={i} onClick={() => setSelectedIndex(i)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${selectedIndex === i ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        {p.file.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={download} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">下载当前</button>
              {previews.length > 1 && (
                <button onClick={downloadAll} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">批量下载全部</button>
              )}
              <button onClick={() => { setPreviews([]); setFiles([]); }}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors">重新上传</button>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">预览</h3>
              <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                <canvas ref={canvasRef} className="max-w-full max-h-[500px] object-contain" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

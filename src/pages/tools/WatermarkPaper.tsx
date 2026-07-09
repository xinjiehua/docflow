import { useState } from 'react';
import { Download, Printer, Droplets } from 'lucide-react';

export default function WatermarkPaper() {
  const [config, setConfig] = useState({
    text: '机密文件',
    fontSize: 60,
    color: '#d0d0d0',
    rotation: -30,
    opacity: 0.15,
    spacingX: 200,
    spacingY: 150,
    paperWidth: 794,
    paperHeight: 1123,
    paperName: 'A4',
  });

  const update = (field: string, value: unknown) => setConfig(prev => ({ ...prev, [field]: value }));

  const paperSizes = [
    { name: 'A4', w: 794, h: 1123 },
    { name: 'A3', w: 1123, h: 1587 },
    { name: 'A5', w: 559, h: 794 },
    { name: 'B5', w: 709, h: 1001 },
    { name: 'Letter', w: 816, h: 1056 },
  ];

  const generateSvg = () => {
    const { text, fontSize, color, rotation, opacity, spacingX, spacingY, paperWidth, paperHeight } = config;
    let watermarks = '';
    for (let y = -paperHeight; y < paperHeight * 2; y += spacingY) {
      for (let x = -paperWidth; x < paperWidth * 2; x += spacingX) {
        watermarks += `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="SimHei,Microsoft YaHei,sans-serif" font-weight="bold" text-anchor="middle" opacity="${opacity}" transform="rotate(${rotation}, ${x}, ${y})">${text}</text>`;
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${paperWidth}" height="${paperHeight}" viewBox="0 0 ${paperWidth} ${paperHeight}">
      <rect width="100%" height="100%" fill="white"/>
      ${watermarks}
    </svg>`;
  };

  const generatePreviewHtml = () => {
    const svg = generateSvg();
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{margin:0;display:flex;justify-content:center;padding:20px;background:#f5f5f5}
      .paper{box-shadow:0 2px 10px rgba(0,0,0,0.1);background:white}
      @media print{body{background:none;padding:0}.paper{box-shadow:none}}
    </style></head><body>
      <div class="paper" style="width:${config.paperWidth * 0.7}px">${svg}</div>
    </body></html>`;
  };

  const handleDownloadPng = () => {
    const svg = generateSvg();
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = config.paperWidth * scale;
    canvas.height = config.paperHeight * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, config.paperWidth, config.paperHeight);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `水印纸_${config.paperName}.png`;
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  };

  const handleDownloadSvg = () => {
    const svg = generateSvg();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `水印纸_${config.paperName}.svg`;
    a.click();
  };

  const handlePrint = () => {
    const html = generatePreviewHtml();
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">水印纸生成器</h2>
      <p className="text-gray-500 mb-4">生成带平铺水印的纸张，用于打印后手写或复印。</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <input value={config.text} onChange={e => update('text', e.target.value)} placeholder="水印文字" className="w-full border rounded-lg px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">纸张大小</label>
              <select value={config.paperName} onChange={e => {
                const s = paperSizes.find(p => p.name === e.target.value)!;
                setConfig(c => ({ ...c, paperName: s.name, paperWidth: s.w, paperHeight: s.h }));
              }} className="w-full border rounded px-2 py-1 mt-1">
                {paperSizes.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm">字号：{config.fontSize}</label>
              <input type="range" min="20" max="120" value={config.fontSize} onChange={e => update('fontSize', Number(e.target.value))} className="w-full mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">颜色</label>
              <input type="color" value={config.color} onChange={e => update('color', e.target.value)} className="w-full h-10 rounded mt-1" />
            </div>
            <div>
              <label className="text-sm">透明度：{(config.opacity * 100).toFixed(0)}%</label>
              <input type="range" min="0.05" max="0.5" step="0.01" value={config.opacity} onChange={e => update('opacity', Number(e.target.value))} className="w-full mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm">旋转角度：{config.rotation}°</label>
              <input type="range" min="-90" max="90" value={config.rotation} onChange={e => update('rotation', Number(e.target.value))} className="w-full mt-1" />
            </div>
            <div>
              <label className="text-sm">水平间距</label>
              <input type="number" min="80" max="500" value={config.spacingX} onChange={e => update('spacingX', Number(e.target.value))} className="w-full border rounded px-2 py-1 mt-1" />
            </div>
            <div>
              <label className="text-sm">垂直间距</label>
              <input type="number" min="60" max="400" value={config.spacingY} onChange={e => update('spacingY', Number(e.target.value))} className="w-full border rounded px-2 py-1 mt-1" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadPng} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
              <Download size={18} />下载PNG
            </button>
            <button onClick={handleDownloadSvg} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
              <Download size={18} />下载SVG
            </button>
            <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">
              <Printer size={18} />打印
            </button>
          </div>
        </div>
        <div className="border rounded-lg overflow-auto bg-white" style={{ height: '70vh' }}>
          <div className="flex justify-center p-4">
            <div dangerouslySetInnerHTML={{ __html: generateSvg() }} style={{ width: config.paperWidth * 0.5, height: 'auto' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Upload, Download, Type } from 'lucide-react';

export default function ImageAddText() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [texts, setTexts] = useState<{ content: string; x: number; y: number; size: number; color: string; font: string; bold: boolean }[]>([
    { content: '示例文字', x: 50, y: 50, size: 32, color: '#ffffff', font: 'Microsoft YaHei', bold: false },
  ]);
  const [selectedText, setSelectedText] = useState(0);

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
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      for (const t of texts) {
        if (!t.content) continue;
        const weight = t.bold ? 'bold' : 'normal';
        ctx.font = `${weight} ${t.size}px ${t.font}`;
        ctx.fillStyle = t.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const px = (t.x / 100) * canvas.width;
        const py = (t.y / 100) * canvas.height;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText(t.content, px, py);
        ctx.shadowColor = 'transparent';
      }
      setResultUrl(canvas.toDataURL('image/png'));
    };
    img.src = originalUrl;
  };

  const addText = () => {
    setTexts([...texts, { content: '', x: 50, y: 50, size: 32, color: '#ffffff', font: 'Microsoft YaHei', bold: false }]);
    setSelectedText(texts.length);
  };

  const removeText = (idx: number) => {
    if (texts.length <= 1) return;
    setTexts(texts.filter((_, i) => i !== idx));
    setSelectedText(Math.min(selectedText, texts.length - 2));
  };

  const updateText = (idx: number, field: string, value: unknown) => {
    setTexts(texts.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'image-with-text.png';
    a.click();
  };

  const t = texts[selectedText];
  const fonts = ['Microsoft YaHei', 'SimHei', 'SimSun', 'KaiTi', 'Arial', 'Times New Roman', 'Courier New'];

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">图片添加文字</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept="image/*" onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择图片</p>
        </div>
        {originalUrl && (
          <>
            <div className="flex gap-2">
              {texts.map((_, idx) => (
                <button key={idx} onClick={() => setSelectedText(idx)} className={`px-3 py-1 rounded border text-sm ${selectedText === idx ? 'bg-blue-600 text-white' : ''}`}>
                  文字{idx + 1}
                </button>
              ))}
              <button onClick={addText} className="text-blue-600 text-sm">+ 添加</button>
              {texts.length > 1 && <button onClick={() => removeText(selectedText)} className="text-red-500 text-sm">删除</button>}
            </div>
            {t && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input value={t.content} onChange={e => updateText(selectedText, 'content', e.target.value)} placeholder="文字内容" className="col-span-2 border rounded px-3 py-2" />
                <input type="number" value={t.size} onChange={e => updateText(selectedText, 'size', Number(e.target.value))} placeholder="字号" className="border rounded px-3 py-2" min="8" max="200" />
                <input type="color" value={t.color} onChange={e => updateText(selectedText, 'color', e.target.value)} className="h-10 border rounded" />
                <select value={t.font} onChange={e => updateText(selectedText, 'font', e.target.value)} className="border rounded px-3 py-2">
                  {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <label className="flex items-center gap-2 col-span-2">
                  <input type="checkbox" checked={t.bold} onChange={e => updateText(selectedText, 'bold', e.target.checked)} />
                  <span className="text-sm">粗体</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">X:</span>
                  <input type="range" min="0" max="100" value={t.x} onChange={e => updateText(selectedText, 'x', Number(e.target.value))} className="flex-1" />
                  <span className="text-sm w-8">{t.x}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Y:</span>
                  <input type="range" min="0" max="100" value={t.y} onChange={e => updateText(selectedText, 'y', Number(e.target.value))} className="flex-1" />
                  <span className="text-sm w-8">{t.y}%</span>
                </div>
              </div>
            )}
            <button onClick={handleGenerate} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
              生成图片
            </button>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-2">原图</p>
                <img src={originalUrl} alt="原图" className="max-w-full rounded-lg" />
              </div>
              {resultUrl && (
                <div>
                  <p className="font-medium mb-2">效果</p>
                  <img src={resultUrl} alt="效果" className="max-w-full rounded-lg" />
                </div>
              )}
            </div>
            {resultUrl && (
              <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                <Download size={20} />下载图片
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

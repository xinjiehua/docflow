import { useState, useRef, useEffect } from 'react';
import * as pdfLib from 'pdf-lib';

export default function PdfSignStamp() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signImage, setSignImage] = useState<string | null>(null);
  const [signName, setSignName] = useState('');
  const [signPos, setSignPos] = useState({ x: 80, y: 80, w: 150, h: 60 });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageCanvas, setPageCanvas] = useState<string>('');
  const [applyAllPages, setApplyAllPages] = useState(false);
  const [processing, setProcessing] = useState(false);
  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const pageImagesRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'sign' | 'stamp'>('sign');
  const [stampText, setStampText] = useState('已审核');
  const [stampColor, setStampColor] = useState('#e53e3e');
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    pdfBytesRef.current = bytes;
    const pdf = await pdfLib.PDFDocument.load(bytes);
    setTotalPages(pdf.getPageCount());
    setCurrentPage(0);
    await renderPage(0, bytes);
  };

  const renderPage = async (pageNum: number, bytes?: Uint8Array) => {
    const data = bytes || pdfBytesRef.current;
    if (!data) return;
    const pdf = await pdfLib.PDFDocument.load(data);
    const page = pdf.getPage(pageNum);
    const { width, height } = page.getSize();
    const scale = 800 / width;
    const canvas = canvasRef.current!;
    canvas.width = 800;
    canvas.height = height * scale;

    // Use pdf.js to render
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDoc = await loadingTask.promise;
    const pdfPage = await pdfDoc.getPage(pageNum + 1);
    const viewport = pdfPage.getViewport({ scale });
    const ctx = canvas.getContext('2d')!;
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
    setPageCanvas(canvas.toDataURL());
  };

  useEffect(() => {
    if (currentPage >= 0 && pdfBytesRef.current) renderPage(currentPage);
  }, [currentPage]);

  const handleSignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSignImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const generateStampImage = (): string => {
    const c = document.createElement('canvas');
    c.width = 200; c.height = 80;
    const ctx = c.getContext('2d')!;
    ctx.strokeStyle = stampColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(100, 40, 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 18px SimSun, serif';
    ctx.fillStyle = stampColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = stampText.split('');
    const startAngle = -Math.PI / 2 + (chars.length - 1) * 0.2;
    chars.forEach((ch, i) => {
      const angle = startAngle - i * 0.4;
      const x = 100 + Math.cos(angle) * 22;
      const y = 40 + Math.sin(angle) * 22;
      ctx.fillText(ch, x, y);
    });
    return c.toDataURL();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x >= signPos.x && x <= signPos.x + signPos.w / 8 && y >= signPos.y && y <= signPos.y + signPos.h / 6) {
      setDragging(true);
      dragOffset.current = { x: x - signPos.x, y: y - signPos.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.current.x;
    const y = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.current.y;
    setSignPos(prev => ({ ...prev, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) }));
  };

  const handleMouseUp = () => setDragging(false);

  const handleApply = async () => {
    if (!pdfBytesRef.current || processing) return;
    setProcessing(true);
    try {
      const pdfDoc = await pdfLib.PDFDocument.load(pdfBytesRef.current);
      const stampImg = mode === 'stamp' ? generateStampImage() : signImage;
      if (!stampImg) { setProcessing(false); return; }
      const imgBytes = Uint8Array.from(atob(stampImg.split(',')[1]), c => c.charCodeAt(0));
      const img = await pdfDoc.embedPng(imgBytes);
      const pages = applyAllPages ? Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i) : [currentPage];
      for (const p of pages) {
        const page = pdfDoc.getPage(p);
        const { width, height } = page.getSize();
        const imgW = (signPos.w / 100) * width;
        const imgH = (signPos.h / 100) * height * 0.5;
        const imgX = (signPos.x / 100) * width;
        const imgY = height - (signPos.y / 100) * height - imgH;
        page.drawImage(img, { x: imgX, y: imgY, width: imgW, height: imgH });
      }
      const resultBytes = await pdfDoc.save();
      const blob = new Blob([resultBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed_${pdfFile?.name || 'document.pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📝 PDF 签名/图章</h1>
          <p className="text-gray-500 mt-2">上传PDF，添加签名图片或盖章，支持拖拽定位</p>
        </div>

        {!pdfFile ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <label className="inline-flex flex-col items-center gap-4 cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <span className="text-4xl">📄</span>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">点击上传 PDF 文件</p>
                <p className="text-sm text-gray-400 mt-1">支持拖拽文件到此处</p>
              </div>
              <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Controls */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-3">模式</h3>
                <div className="flex gap-2">
                  {(['sign', 'stamp'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {m === 'sign' ? '签名图片' : '盖章'}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'sign' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-700 mb-3">签名图片</h3>
                  <input type="file" accept="image/*" onChange={handleSignUpload} className="hidden" id="sign-upload" />
                  <label htmlFor="sign-upload" className="block w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 transition-colors">
                    {signImage ? (
                      <img src={signImage} alt="签名预览" className="max-h-16 mx-auto" />
                    ) : (
                      <p className="text-gray-400">点击上传签名图片</p>
                    )}
                  </label>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-700 mb-3">图章设置</h3>
                  <input value={stampText} onChange={e => setStampText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3" placeholder="图章文字" />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">颜色</label>
                    <input type="color" value={stampColor} onChange={e => setStampColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <span className="text-sm text-gray-400">{stampColor}</span>
                  </div>
                  <button onClick={() => setSignImage(generateStampImage())} className="w-full mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                    生成图章预览
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-3">位置和大小</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">X 位置 (%)</label>
                    <input type="range" min={0} max={90} value={signPos.x} onChange={e => setSignPos(p => ({ ...p, x: +e.target.value }))}
                      className="w-full accent-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Y 位置 (%)</label>
                    <input type="range" min={0} max={90} value={signPos.y} onChange={e => setSignPos(p => ({ ...p, y: +e.target.value }))}
                      className="w-full accent-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">宽度 (%)</label>
                    <input type="range" min={5} max={60} value={signPos.w} onChange={e => setSignPos(p => ({ ...p, w: +e.target.value }))}
                      className="w-full accent-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">高度 (%)</label>
                    <input type="range" min={3} max={40} value={signPos.h} onChange={e => setSignPos(p => ({ ...p, h: +e.target.value }))}
                      className="w-full accent-blue-600" />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <input type="checkbox" checked={applyAllPages} onChange={e => setApplyAllPages(e.target.checked)} className="accent-blue-600" />
                  应用到所有页面
                </label>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-3">页面导航</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm disabled:opacity-40">上一页</button>
                  <span className="flex-1 text-center text-sm text-gray-600">{currentPage + 1} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm disabled:opacity-40">下一页</button>
                </div>
              </div>

              <button onClick={handleApply} disabled={processing || !((mode === 'sign' && signImage) || (mode === 'stamp' && stampText))}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                {processing ? '处理中...' : '应用并下载'}
              </button>
              <button onClick={() => { setPdfFile(null); setSignImage(null); setTotalPages(0); }}
                className="w-full px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                重新上传
              </button>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">预览（拖拽签名位置）</h3>
                <div ref={containerRef}
                  className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                  onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                  <canvas ref={canvasRef} className="w-full h-auto" />
                  {pageCanvas && !canvasRef.current && (
                    <img src={pageCanvas} alt="" className="w-full" />
                  )}
                  {signImage && (
                    <div className="absolute border-2 border-blue-500 border-dashed pointer-events-none"
                      style={{
                        left: `${signPos.x}%`, top: `${signPos.y}%`,
                        width: `${signPos.w}%`, height: `${signPos.h}%`,
                        opacity: 0.8, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                        backgroundImage: `url(${signImage})`,
                      }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

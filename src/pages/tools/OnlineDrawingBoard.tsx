import { useState, useRef, useEffect, useCallback } from 'react';

type Tool = 'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'arrow' | 'text';

export default function OnlineDrawingBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; active: boolean } | null>(null);
  const [textValue, setTextValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const snapshotRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement?.clientWidth || 1200;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, []);

  const saveHistory = () => {
    const data = canvasRef.current?.toDataURL() || '';
    setHistory(prev => {
      const newH = prev.slice(0, historyIdx + 1);
      newH.push(data);
      return newH;
    });
    setHistoryIdx(prev => prev + 1);
  };

  const undo = () => {
    if (historyIdx <= 0) return;
    const idx = historyIdx - 1;
    setHistoryIdx(idx);
    restoreFromHistory(idx);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const idx = historyIdx + 1;
    setHistoryIdx(idx);
    restoreFromHistory(idx);
  };

  const restoreFromHistory = (idx: number) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[idx];
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'text') {
      const pos = getPos(e);
      setTextInput({ x: pos.x, y: pos.y, active: true });
      return;
    }
    setIsDrawing(true);
    const pos = getPos(e);
    setStartPos(pos);
    snapshotRef.current = canvasRef.current?.toDataURL() || '';

    if (tool === 'pen' || tool === 'eraser') {
      const ctx = canvasRef.current?.getContext('2d')!;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d')!;
    const pos = getPos(e);

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      // Restore snapshot for preview
      if (snapshotRef.current) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0);
          drawShape(ctx, startPos!, pos, tool, color, lineWidth);
        };
        img.src = snapshotRef.current;
      }
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    snapshotRef.current = null;
    saveHistory();
  };

  const drawShape = (ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }, t: Tool, c: string, lw: number) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (t === 'line') {
      ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    } else if (t === 'rect') {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (t === 'circle') {
      const rx = Math.abs(end.x - start.x) / 2, ry = Math.abs(end.y - start.y) / 2;
      const cx = (start.x + end.x) / 2, cy = (start.y + end.y) / 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (t === 'arrow') {
      ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = Math.max(lw * 4, 15);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
  };

  const handleTextConfirm = () => {
    if (!textInput || !textValue.trim()) return;
    const ctx = canvasRef.current?.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.font = `${Math.max(lineWidth * 5, 14)}px sans-serif`;
    ctx.fillText(textValue, textInput.x, textInput.y + Math.max(lineWidth * 5, 14));
    setTextInput(null);
    setTextValue('');
    saveHistory();
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    saveHistory();
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = canvasRef.current?.toDataURL('image/png') || '';
    a.download = 'drawing.png';
    a.click();
  };

  const tools: { key: Tool; label: string; icon: string }[] = [
    { key: 'pen', label: '画笔', icon: '✏️' },
    { key: 'eraser', label: '橡皮', icon: '🧹' },
    { key: 'line', label: '直线', icon: '📏' },
    { key: 'rect', label: '矩形', icon: '⬜' },
    { key: 'circle', label: '椭圆', icon: '⭕' },
    { key: 'arrow', label: '箭头', icon: '➡️' },
    { key: 'text', label: '文字', icon: '🔤' },
  ];

  const colors = ['#000000', '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce', '#805ad5', '#d53f8c', '#718096', '#ffffff'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🎨 在线画板</h1>
          <p className="text-gray-500 mt-2">画笔/形状/箭头/文字绘图工具，导出PNG图片</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center flex-wrap gap-4">
            <div className="flex gap-1">
              {tools.map(t => (
                <button key={t.key} onClick={() => setTool(t.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tool === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex gap-1.5">
              {colors.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                  style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e2e8f0' : 'none' }} />
              ))}
            </div>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer" />
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">粗细</span>
              <input type="range" min={1} max={20} value={lineWidth} onChange={e => setLineWidth(+e.target.value)} className="w-24 accent-blue-600" />
              <span className="text-xs text-gray-400">{lineWidth}px</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex gap-2">
              <button onClick={undo} disabled={historyIdx <= 0} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-200">↩ 撤销</button>
              <button onClick={redo} disabled={historyIdx >= history.length - 1} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-200">↪ 重做</button>
              <button onClick={clearCanvas} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">清空</button>
              <button onClick={download} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">下载 PNG</button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg cursor-crosshair border border-gray-200"
            onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
            onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
          />
          {textInput?.active && (
            <div className="absolute" style={{ left: textInput.x + 8, top: textInput.y - 4 }}>
              <input
                autoFocus
                value={textValue}
                onChange={e => setTextValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTextConfirm(); }}
                onBlur={handleTextConfirm}
                className="px-2 py-1 border border-blue-400 rounded text-sm outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="输入文字..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarMaker() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [title, setTitle] = useState('');
  const [startDay, setStartDay] = useState(0);

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m - 1, 1).getDay();
    return (day - startDay + 7) % 7;
  };

  const generateSvgCalendar = () => {
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cellW = 100, cellH = 80;
    const headerH = 60;
    const padding = 40;
    const cols = 7;
    const rows = Math.ceil((firstDay + days) / 7);
    const w = cols * cellW + padding * 2;
    const h = headerH + dayNames.length === 0 ? 0 : 30 + rows * cellH + padding * 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
    svg += `<rect width="${w}" height="${h}" fill="white"/>`;
    svg += `<rect x="0" y="0" width="${w}" height="${headerH}" fill="#2563EB"/>`;
    svg += `<text x="${w / 2}" y="${headerH / 2 + 8}" text-anchor="middle" fill="white" font-size="22" font-weight="bold" font-family="Microsoft YaHei,sans-serif">${title || year + '年' + month + '月'}</text>`;

    const dayY = headerH + 10;
    for (let i = 0; i < 7; i) {
      const idx = (i + startDay) % 7;
      const x = padding + i * cellW + cellW / 2;
      svg += `<text x="${x}" y="${dayY}" text-anchor="middle" fill="#666" font-size="14" font-family="Microsoft YaHei,sans-serif">${dayNames[idx]}</text>`;
      i++;
    }

    const gridTop = dayY + 15;
    for (let d = 1; d <= days; d++) {
      const idx = firstDay + d - 1;
      const col = idx % 7;
      const row = Math.floor(idx / 7);
      const x = padding + col * cellW + cellW / 2;
      const y = gridTop + row * cellH + 25;
      const isWeekend = ((col + startDay) % 7 === 0 || (col + startDay) % 7 === 6);
      svg += `<text x="${x}" y="${y}" text-anchor="middle" fill="${isWeekend ? '#EF4444' : '#333'}" font-size="16" font-family="Arial,sans-serif">${d}</text>`;
      if (d === new Date().getDate() && year === new Date().getFullYear() && month === new Date().getMonth() + 1) {
        svg += `<circle cx="${x}" cy="${y - 12}" r="14" fill="none" stroke="#2563EB" stroke-width="2"/>`;
      }
    }
    svg += `</svg>`;
    return svg;
  };

  const handleDownloadSvg = () => {
    const svg = generateSvgCalendar();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `日历_${year}_${month}.svg`;
    a.click();
  };

  const handleDownloadPng = () => {
    const svg = generateSvgCalendar();
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = 900 * scale;
    canvas.height = 700 * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 900, 700);
      ctx.drawImage(img, 0, 0, 900, 700);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `日历_${year}_${month}.png`;
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">日历生成器</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-2 border rounded-lg hover:bg-gray-50">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2 items-center">
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-24 border rounded px-2 py-1" />
            <span>年</span>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded px-2 py-1">
              {monthNames.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
            </select>
          </div>
          <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-2 border rounded-lg hover:bg-gray-50">
            <ChevronRight size={20} />
          </button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="自定义标题（留空默认显示年月）" className="w-full border rounded-lg px-3 py-2" />
        <div className="flex gap-2">
          <span className="text-sm">每周起始：</span>
          {['周日', '周一'].map((d, i) => (
            <button key={i} onClick={() => setStartDay(i)} className={`px-3 py-1 rounded border text-sm ${startDay === i ? 'bg-blue-600 text-white' : ''}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="border rounded-lg p-4 bg-white shadow" dangerouslySetInnerHTML={{ __html: generateSvgCalendar() }} />
        <div className="flex gap-2">
          <button onClick={handleDownloadSvg} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download size={18} />下载SVG
          </button>
          <button onClick={handleDownloadPng} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Download size={18} />下载PNG
          </button>
        </div>
      </div>
    </div>
  );
}

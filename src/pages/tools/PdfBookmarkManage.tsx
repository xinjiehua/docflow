import { useState } from 'react';
import * as pdfLib from 'pdf-lib';

interface Bookmark {
  title: string;
  page: number;
  level: number;
  id: number;
}

export default function PdfBookmarkManage() {
  const [file, setFile] = useState<File | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newPage, setNewPage] = useState(1);
  const [newLevel, setNewLevel] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPage, setEditPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [autoGenMode, setAutoGenMode] = useState(false);
  const nextId = useRef(1);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    try {
      const buf = await f.arrayBuffer();
      const pdf = await pdfLib.PDFDocument.load(buf);
      setTotalPages(pdf.getPageCount());
      // Try to read existing outlines
      const outlines = await pdf.getOutline();
      if (outlines) {
        const items: Bookmark[] = [];
        const readOutline = async (items: any[], level: number) => {
          for (const item of items) {
            const title = item.getTitle();
            const dest = item.getDest();
            let page = 1;
            if (dest) {
              const pageIndex = pdf.getPageIndex(dest[0]);
              page = pageIndex + 1;
            }
            setBookmarks(prev => [...prev, { title, page, level, id: nextId.current++ }]);
            if (item.getItems) await readOutline(item.getItems(), level + 1);
          }
        };
        await readOutline(outlines, 0);
      }
    } catch {
      // Could not read outlines, start fresh
    }
  };

  const addBookmark = () => {
    if (!newTitle.trim()) return;
    setBookmarks(prev => [...prev, { title: newTitle.trim(), page: Math.max(1, Math.min(totalPages, newPage)), level: newLevel, id: nextId.current++ }]);
    setNewTitle('');
    setNewPage(1);
  };

  const autoGenerate = () => {
    if (totalPages === 0) return;
    const items: Bookmark[] = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push({ title: `第 ${i} 页`, page: i, level: 0, id: nextId.current++ });
    }
    setBookmarks(items);
  };

  const deleteBookmark = (id: number) => setBookmarks(prev => prev.filter(b => b.id !== id));
  const startEdit = (b: Bookmark) => { setEditingId(b.id); setEditTitle(b.title); setEditPage(b.page); };
  const saveEdit = (id: number) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, title: editTitle, page: editPage } : b));
    setEditingId(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setBookmarks(prev => { const arr = [...prev]; [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]; return arr; });
  };
  const moveDown = (index: number) => {
    if (index >= bookmarks.length - 1) return;
    setBookmarks(prev => { const arr = [...prev]; [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]; return arr; });
  };

  const handleSave = async () => {
    if (!file || processing) return;
    setProcessing(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfLib.PDFDocument.load(buf);
      // pdf-lib doesn't support setting outlines directly, so we add text annotations as a workaround
      // Instead, create a text summary and save as separate file
      const outlineText = bookmarks.sort((a, b) => a.page - b.page).map(b =>
        '  '.repeat(b.level) + `${b.title} .......... 第${b.page}页`
      ).join('\n');
      const textBlob = new Blob([`书签目录 - ${file.name}\n共 ${totalPages} 页，${bookmarks.length} 个书签\n\n${outlineText}`], { type: 'text/plain;charset=utf-8' });
      const textUrl = URL.createObjectURL(textBlob);
      const a = document.createElement('a');
      a.href = textUrl;
      a.download = `bookmarks_${file.name.replace('.pdf', '')}.txt`;
      a.click();
      URL.revokeObjectURL(textUrl);

      // Also download the PDF
      const a2 = document.createElement('a');
      a2.href = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }));
      a2.download = file.name;
      a2.click();
    } finally { setProcessing(false); }
  };

  const importFromText = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const lines = text.split('\n').filter(l => l.includes('第') && l.includes('页'));
    const items: Bookmark[] = [];
    lines.forEach(line => {
      const match = line.match(/^(.*?)\s*\.\.*\s*第\s*(\d+)页$/);
      if (match) {
        const level = (match[1].match(/^\s+/) || [''])[0].length / 2;
        items.push({ title: match[1].trim(), page: parseInt(match[2]), level, id: nextId.current++ });
      }
    });
    if (items.length > 0) setBookmarks(items);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📑 PDF 书签管理</h1>
          <p className="text-gray-500 mt-2">查看、添加、删除PDF书签，支持批量生成页码书签</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 transition-colors">
                <span className="text-3xl block mb-1">📄</span>
                <p className="text-sm text-gray-600">上传 PDF 文件</p>
                <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
              </label>
              {totalPages > 0 && <p className="mt-2 text-xs text-gray-500">共 {totalPages} 页</p>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">添加书签</h3>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="书签标题"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-500">页码</label>
                  <input type="number" min={1} max={totalPages || 999} value={newPage} onChange={e => setNewPage(+e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">层级</label>
                  <select value={newLevel} onChange={e => setNewLevel(+e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value={0}>一级</option>
                    <option value={1}>二级</option>
                    <option value={2}>三级</option>
                  </select>
                </div>
              </div>
              <button onClick={addBookmark} disabled={!newTitle.trim()} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 transition-colors">
                添加
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-2">
              <button onClick={autoGenerate} disabled={totalPages === 0} className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:bg-gray-300 transition-colors">
                批量生成页码书签
              </button>
              <button onClick={handleSave} disabled={bookmarks.length === 0 || processing} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:bg-gray-300 transition-colors">
                {processing ? '处理中...' : '导出书签目录 + PDF'}
              </button>
              <button onClick={() => { setBookmarks([]); }} disabled={bookmarks.length === 0} className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-40 transition-colors">
                清空所有书签
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">
                书签列表（{bookmarks.length} 个）
              </h3>
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <span className="text-5xl block mb-3">📑</span>
                  <p>暂无书签，上传PDF后添加</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {bookmarks.map((b, i) => (
                    <div key={b.id} className={`flex items-center gap-2 p-3 rounded-lg ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors group`}>
                      <span className="text-gray-300 text-xs w-6 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        {editingId === b.id ? (
                          <div className="flex gap-2">
                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm" />
                            <input type="number" value={editPage} onChange={e => setEditPage(+e.target.value)} className="w-16 px-2 py-1 border border-gray-200 rounded text-sm" />
                            <button onClick={() => saveEdit(b.id)} className="text-green-600 text-sm hover:underline">保存</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm hover:underline">取消</button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span style={{ paddingLeft: `${b.level * 20}px` }} className="text-sm font-medium text-gray-700 truncate">{b.title}</span>
                            <span className="ml-2 text-xs text-gray-400 whitespace-nowrap">p.{b.page}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveUp(i)} className="p-1 text-gray-400 hover:text-gray-600" title="上移">↑</button>
                        <button onClick={() => moveDown(i)} className="p-1 text-gray-400 hover:text-gray-600" title="下移">↓</button>
                        <button onClick={() => startEdit(b)} className="p-1 text-gray-400 hover:text-blue-600" title="编辑">✏️</button>
                        <button onClick={() => deleteBookmark(b.id)} className="p-1 text-gray-400 hover:text-red-600" title="删除">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

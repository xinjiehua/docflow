import { useState, useEffect, useCallback } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
}

const COLORS = ['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#e0e7ff', '#fef9c3', '#ffedd5', '#f3e8ff'];

const STORAGE_KEY = 'docflow_online_notes';

export default function OnlineNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setNotes(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  const createNote = () => {
    const note: Note = {
      id: Date.now().toString(),
      title: '新便签',
      content: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
    };
    setNotes(prev => [note, ...prev]);
    setActiveId(note.id);
    setShowNew(false);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const duplicateNote = (note: Note) => {
    const newNote: Note = { ...note, id: Date.now().toString(), title: note.title + ' (副本)', createdAt: Date.now(), updatedAt: Date.now() };
    setNotes(prev => [newNote, ...prev]);
    setActiveId(newNote.id);
  };

  const exportNotes = () => {
    const text = notes.map(n => `## ${n.title}\n${n.content}\n\n---\n`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'notes_export.txt';
    a.click();
  };

  const importNotes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const lines = text.split('---').filter(l => l.trim());
    const newNotes: Note[] = lines.map(l => {
      const titleMatch = l.match(/^##\s+(.+)/);
      return {
        id: Date.now().toString() + Math.random(),
        title: titleMatch?.[1] || '导入便签',
        content: l.replace(/^##\s+.+\n/, '').trim(),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
      };
    });
    setNotes(prev => [...newNotes, ...prev]);
  };

  const filtered = search
    ? notes.filter(n => n.title.includes(search) || n.content.includes(search))
    : notes;

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const activeNote = notes.find(n => n.id === activeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📝 在线便签</h1>
            <p className="text-gray-500 mt-1">快速记录，自动保存，支持多条便签管理</p>
          </div>
          <div className="flex gap-2">
            <label className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors">
              导入
              <input type="file" accept=".txt,.md" onChange={importNotes} className="hidden" />
            </label>
            <button onClick={exportNotes} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">导出</button>
            <button onClick={createNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">+ 新建便签</button>
          </div>
        </div>

        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索便签..."
            className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
        </div>

        {notes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <span className="text-6xl block mb-4">📝</span>
            <p className="text-gray-400 text-lg">还没有便签，点击右上角"新建便签"开始记录</p>
          </div>
        ) : activeNote ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {sorted.map(note => (
                <div key={note.id}
                  onClick={() => setActiveId(note.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${activeId === note.id ? 'ring-2 ring-blue-500 shadow-sm' : 'hover:shadow-sm'}`}
                  style={{ backgroundColor: note.color }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {note.pinned && <span className="text-xs">📌</span>}
                        <h3 className="font-medium text-gray-800 text-sm truncate">{note.title || '无标题'}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{note.content || '空白便签'}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(note.updatedAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div className="flex gap-1 ml-2 opacity-0 hover-parent:opacity-100">
                      <button onClick={e => { e.stopPropagation(); updateNote(note.id, { pinned: !note.pinned }); }}
                        className="p-1 text-gray-400 hover:text-gray-600">{note.pinned ? '📌' : '📍'}</button>
                      <button onClick={e => { e.stopPropagation(); duplicateNote(note); }}
                        className="p-1 text-gray-400 hover:text-blue-600">📋</button>
                      <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                        className="p-1 text-gray-400 hover:text-red-600">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" style={{ borderLeft: `4px solid ${activeNote.color}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <input value={activeNote.title} onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                    className="text-xl font-bold text-gray-800 outline-none flex-1" placeholder="便签标题" />
                  <div className="flex gap-1">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => updateNote(activeNote.id, { color: c })}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${activeNote.color === c ? 'border-gray-800 scale-110' : 'border-gray-200'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <textarea value={activeNote.content} onChange={e => updateNote(activeNote.id, { content: e.target.value })}
                  className="w-full h-96 p-4 border border-gray-100 rounded-xl text-gray-700 leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="开始记录..." autoFocus />
                <div className="mt-3 flex justify-between text-xs text-gray-400">
                  <span>创建: {new Date(activeNote.createdAt).toLocaleString('zh-CN')}</span>
                  <span>修改: {new Date(activeNote.updatedAt).toLocaleString('zh-CN')}</span>
                  <span>{activeNote.content.length} 字</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map(note => (
              <div key={note.id} onClick={() => setActiveId(note.id)}
                className="p-4 rounded-xl cursor-pointer hover:shadow-md transition-all min-h-[150px]"
                style={{ backgroundColor: note.color }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {note.pinned && <span className="text-xs">📌</span>}
                    <h3 className="font-medium text-gray-800 text-sm truncate">{note.title || '无标题'}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={e => { e.stopPropagation(); duplicateNote(note); }} className="text-xs text-gray-400 hover:text-blue-600">📋</button>
                    <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }} className="text-xs text-gray-400 hover:text-red-600">🗑️</button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-4">{note.content || '空白便签'}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(note.updatedAt).toLocaleDateString('zh-CN')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

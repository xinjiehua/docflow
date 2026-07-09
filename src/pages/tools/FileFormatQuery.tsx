import { useState } from 'react';
import { Search, FileText, Info } from 'lucide-react';

interface FormatInfo {
  ext: string;
  name: string;
  category: string;
  mime: string;
  description: string;
}

const FORMATS: FormatInfo[] = [
  { ext: '.pdf', name: 'PDF', category: '文档', mime: 'application/pdf', description: 'Adobe便携文档格式，跨平台文档标准' },
  { ext: '.doc', name: 'Word 97-2003', category: '文档', mime: 'application/msword', description: 'Microsoft Word 二进制格式' },
  { ext: '.docx', name: 'Word', category: '文档', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'Microsoft Word Open XML格式' },
  { ext: '.xls', name: 'Excel 97-2003', category: '表格', mime: 'application/vnd.ms-excel', description: 'Microsoft Excel 二进制格式' },
  { ext: '.xlsx', name: 'Excel', category: '表格', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Microsoft Excel Open XML格式' },
  { ext: '.ppt', name: 'PowerPoint 97-2003', category: '演示', mime: 'application/vnd.ms-powerpoint', description: 'Microsoft PowerPoint 二进制格式' },
  { ext: '.pptx', name: 'PowerPoint', category: '演示', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', description: 'Microsoft PowerPoint Open XML格式' },
  { ext: '.txt', name: '纯文本', category: '文档', mime: 'text/plain', description: '无格式纯文本文件' },
  { ext: '.csv', name: 'CSV', category: '表格', mime: 'text/csv', description: '逗号分隔值文件，常用于数据交换' },
  { ext: '.json', name: 'JSON', category: '数据', mime: 'application/json', description: 'JavaScript对象表示法，轻量数据格式' },
  { ext: '.xml', name: 'XML', category: '数据', mime: 'application/xml', description: '可扩展标记语言，结构化数据格式' },
  { ext: '.html', name: 'HTML', category: '网页', mime: 'text/html', description: '超文本标记语言，网页标准格式' },
  { ext: '.css', name: 'CSS', category: '网页', mime: 'text/css', description: '层叠样式表，网页样式定义' },
  { ext: '.js', name: 'JavaScript', category: '代码', mime: 'text/javascript', description: 'JavaScript源代码文件' },
  { ext: '.ts', name: 'TypeScript', category: '代码', mime: 'text/typescript', description: 'TypeScript源代码文件' },
  { ext: '.py', name: 'Python', category: '代码', mime: 'text/x-python', description: 'Python源代码文件' },
  { ext: '.java', name: 'Java', category: '代码', mime: 'text/x-java-source', description: 'Java源代码文件' },
  { ext: '.jpg/.jpeg', name: 'JPEG', category: '图片', mime: 'image/jpeg', description: '有损压缩图片格式，照片常用' },
  { ext: '.png', name: 'PNG', category: '图片', mime: 'image/png', description: '无损压缩图片格式，支持透明' },
  { ext: '.gif', name: 'GIF', category: '图片', mime: 'image/gif', description: '支持动画的图片格式，256色' },
  { ext: '.webp', name: 'WebP', category: '图片', mime: 'image/webp', description: 'Google开发的现代图片格式' },
  { ext: '.svg', name: 'SVG', category: '矢量', mime: 'image/svg+xml', description: '可缩放矢量图形' },
  { ext: '.bmp', name: 'BMP', category: '图片', mime: 'image/bmp', description: '位图格式，无压缩' },
  { ext: '.ico', name: 'ICO', category: '图标', mime: 'image/x-icon', description: '图标文件格式' },
  { ext: '.mp3', name: 'MP3', category: '音频', mime: 'audio/mpeg', description: '有损压缩音频格式' },
  { ext: '.wav', name: 'WAV', category: '音频', mime: 'audio/wav', description: '无损音频格式' },
  { ext: '.mp4', name: 'MP4', category: '视频', mime: 'video/mp4', description: '常用视频封装格式' },
  { ext: '.avi', name: 'AVI', category: '视频', mime: 'video/avi', description: 'Microsoft视频格式' },
  { ext: '.mkv', name: 'MKV', category: '视频', mime: 'video/x-matroska', description: '开源多媒体容器格式' },
  { ext: '.zip', name: 'ZIP', category: '压缩', mime: 'application/zip', description: '通用压缩文件格式' },
  { ext: '.rar', name: 'RAR', category: '压缩', mime: 'application/x-rar-compressed', description: 'WinRAR压缩格式' },
  { ext: '.7z', name: '7Z', category: '压缩', mime: 'application/x-7z-compressed', description: '7-Zip压缩格式' },
  { ext: '.tar', name: 'TAR', category: '压缩', mime: 'application/x-tar', description: 'Unix归档格式' },
  { ext: '.gz', name: 'GZ', category: '压缩', mime: 'application/gzip', description: 'Gzip压缩格式' },
  { ext: '.epub', name: 'EPUB', category: '电子书', mime: 'application/epub+zip', description: '电子书标准格式' },
  { ext: '.md', name: 'Markdown', category: '文档', mime: 'text/markdown', description: '轻量级标记语言' },
  { ext: '.rtf', name: 'RTF', category: '文档', mime: 'application/rtf', description: '富文本格式' },
  { ext: '.odt', name: 'ODT', category: '文档', mime: 'application/vnd.oasis.opendocument.text', description: 'OpenDocument文本格式' },
  { ext: '.tiff/.tif', name: 'TIFF', category: '图片', mime: 'image/tiff', description: '高质量图像格式，印刷常用' },
  { ext: '.psd', name: 'PSD', category: '图片', mime: 'image/vnd.adobe.photoshop', description: 'Adobe Photoshop源文件' },
  { ext: '.ai', name: 'AI', category: '矢量', mime: 'application/postscript', description: 'Adobe Illustrator源文件' },
  { ext: '.exe', name: 'EXE', category: '程序', mime: 'application/octet-stream', description: 'Windows可执行文件' },
  { ext: '.apk', name: 'APK', category: '程序', mime: 'application/vnd.android.package-archive', description: 'Android安装包' },
  { ext: '.db/.sqlite', name: 'SQLite', category: '数据库', mime: 'application/x-sqlite3', description: 'SQLite数据库文件' },
  { ext: '.log', name: 'LOG', category: '日志', mime: 'text/plain', description: '日志文件' },
];

export default function FileFormatQuery() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FormatInfo[]>(FORMATS);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults(FORMATS); return; }
    const lower = q.toLowerCase().replace(/^\./, '');
    setResults(FORMATS.filter(f =>
      f.ext.replace(/^\./, '').includes(lower) ||
      f.name.toLowerCase().includes(lower) ||
      f.category.includes(lower) ||
      f.mime.includes(lower)
    ));
  };

  const categories = [...new Set(FORMATS.map(f => f.category))];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">文件格式查询</h2>
      <p className="text-gray-500 mb-4">输入文件扩展名查询格式信息，共收录 {FORMATS.length} 种常见格式。</p>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="搜索扩展名（如 pdf、docx、mp4）" className="w-full border rounded-lg pl-10 pr-3 py-3" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => handleSearch(cat)} className="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200">
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map(f => (
            <div key={f.ext} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-blue-600" />
                <span className="font-bold">{f.ext}</span>
                <span className="text-gray-600">{f.name}</span>
                <span className="ml-auto px-2 py-0.5 rounded bg-gray-100 text-xs">{f.category}</span>
              </div>
              <p className="text-sm text-gray-600">{f.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                <Info size={12} />MIME: {f.mime}
              </div>
            </div>
          ))}
        </div>
        {results.length === 0 && <p className="text-center text-gray-500 py-8">未找到匹配的文件格式</p>}
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { ArrowUpDown, Upload, Download, Trash2 } from 'lucide-react';

export default function PdfRearrange() {
  const [pages, setPages] = useState<{ num: number; dataUrl: string }[]>([]);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace('.pdf', ''));
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuf = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuf);
    const newPages: { num: number; dataUrl: string }[] = [];
    for (let i = 0; i < pdf.getPageCount(); i++) {
      const newPdf = await PDFDocument.create();
      const [copied] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copied);
      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      newPages.push({ num: i + 1, dataUrl: URL.createObjectURL(blob) });
    }
    setPages(newPages);
  };

  const movePage = (from: number, to: number) => {
    const arr = [...pages];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setPages(arr);
  };

  const handleRearrange = async () => {
    if (pages.length === 0) return;
    const { PDFDocument } = await import('pdf-lib');
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const arrayBuf = await file.arrayBuffer();
    const srcPdf = await PDFDocument.load(arrayBuf);
    const newPdf = await PDFDocument.create();
    for (const page of pages) {
      const [copied] = await newPdf.copyPages(srcPdf, [page.num - 1]);
      newPdf.addPage(copied);
    }
    const bytes = await newPdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'rearranged'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">PDF页面排序</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept=".pdf" ref={fileRef} onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择PDF文件</p>
        </div>
        {pages.length > 0 && (
          <>
            <p className="text-gray-600">拖拽或使用箭头调整页面顺序（共 {pages.length} 页）：</p>
            <div className="grid grid-cols-4 gap-2">
              {pages.map((page, idx) => (
                <div key={page.num} className="relative border rounded-lg p-2 bg-white">
                  <div className="text-xs text-gray-500 mb-1">第 {page.num} 页</div>
                  <iframe src={page.dataUrl} className="w-full h-32 rounded" title={`page-${page.num}`} />
                  <div className="flex justify-center gap-1 mt-1">
                    <button onClick={() => idx > 0 && movePage(idx, idx - 1)} disabled={idx === 0} className="p-1 text-xs hover:bg-gray-100 rounded" title="上移">↑</button>
                    <button onClick={() => idx < pages.length - 1 && movePage(idx, idx + 1)} disabled={idx === pages.length - 1} className="p-1 text-xs hover:bg-gray-100 rounded" title="下移">↓</button>
                    <button onClick={() => setPages(pages.filter((_, i) => i !== idx))} className="p-1 text-xs text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleRearrange} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              <Download size={20} />
              下载排序后的PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';

export default function CsvToExcel() {
  const [preview, setPreview] = useState<string[][]>([]);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.(csv|txt)$/i, ''));
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    const rows = lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"' && !inQuotes) { inQuotes = true; continue; }
        if (ch === '"' && inQuotes) { inQuotes = false; continue; }
        if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
        current += ch;
      }
      result.push(current.trim());
      return result;
    });
    setPreview(rows.slice(0, 20));
  };

  const handleConvert = async () => {
    if (preview.length === 0) return;
    const XLSX = await import('xlsx');
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const text = await file.text();
    const wb = XLSX.read(text, { type: 'string' });
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'converted'}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">CSV转Excel</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileSpreadsheet className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept=".csv,.txt" ref={fileRef} onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择CSV文件</p>
        </div>
        {preview.length > 0 && (
          <>
            <p className="text-gray-600">预览（前20行）：</p>
            <div className="overflow-auto border rounded-lg max-h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {preview[0]?.map((h, i) => <th key={i} className="px-3 py-2 text-left border">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => <td key={ci} className="px-3 py-1 border">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleConvert} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              <Download size={20} />
              下载Excel文件
            </button>
          </>
        )}
      </div>
    </div>
  );
}

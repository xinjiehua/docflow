import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';

export default function ExcelToCsv() {
  const [preview, setPreview] = useState<string[][]>([]);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.(xlsx|xls)$/i, ''));
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
    setPreview(data.slice(0, 20));
  };

  const handleConvert = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    let csv = '';
    for (const sheetName of wb.SheetNames) {
      if (csv) csv += '\n\n';
      const ws = wb.Sheets[sheetName];
      csv += XLSX.utils.sheet_to_csv(ws);
    }
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'converted'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Excel转CSV</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileSpreadsheet className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择Excel文件</p>
        </div>
        {preview.length > 0 && (
          <>
            <p className="text-gray-600">预览（前20行）：</p>
            <div className="overflow-auto border rounded-lg max-h-64">
              <table className="w-full text-sm">
                <tbody>
                  {preview.map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? 'bg-gray-100 font-bold' : ''}>
                      {row.map((cell, ci) => <td key={ci} className="px-3 py-1 border">{String(cell)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleConvert} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              <Download size={20} />
              下载CSV文件
            </button>
          </>
        )}
      </div>
    </div>
  );
}

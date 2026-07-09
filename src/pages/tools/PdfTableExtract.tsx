import { useState } from 'react';
import * as pdfLib from 'pdf-lib';
import * as XLSX from 'xlsx';

interface ExtractedRow { cells: string[] }

export default function PdfTableExtract() {
  const [file, setFile] = useState<File | null>(null);
  const [tables, setTables] = useState<ExtractedRow[][]>([]);
  const [extracting, setExtracting] = useState(false);
  const [selectedTable, setSelectedTable] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setTables([]);
    setSelectedTable(0);
    setStatusMsg('正在提取表格...');
    setExtracting(true);
    try {
      const buf = await f.arrayBuffer();
      const text = await extractTextFromPdf(buf);
      const result = parseTablesFromText(text);
      setTables(result);
      setStatusMsg(result.length > 0 ? `成功提取 ${result.length} 个表格` : '未检测到表格结构，尝试调整后重试');
    } catch {
      setStatusMsg('提取失败，请检查文件是否为有效PDF');
    } finally { setExtracting(false); }
  };

  const extractTextFromPdf = async (buf: ArrayBuffer): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const items = content.items as { str: string; transform: number[] }[];
      // Sort by y (descending) then x
      items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
      let lastY = -999;
      items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (Math.abs(y - lastY) > 5) {
          fullText += '\n';
          lastY = y;
        }
        fullText += item.str + '\t';
      });
      fullText += '\n---PAGE---\n';
    }
    return fullText;
  };

  const parseTablesFromText = (text: string): ExtractedRow[][] => {
    const pages = text.split('---PAGE---');
    const allTables: ExtractedRow[][] = [];
    for (const page of pages) {
      const lines = page.trim().split('\n').filter(l => l.trim());
      let currentTable: ExtractedRow[] = [];
      for (const line of lines) {
        const cells = line.split('\t').filter(c => c.trim().length > 0);
        if (cells.length >= 2) {
          currentTable.push({ cells: cells.map(c => c.trim()) });
        } else {
          if (currentTable.length >= 2) {
            allTables.push(currentTable);
          }
          currentTable = [];
        }
      }
      if (currentTable.length >= 2) allTables.push(currentTable);
    }
    return allTables;
  };

  const exportExcel = () => {
    if (tables.length === 0) return;
    const wb = XLSX.utils.book_new();
    const table = tables[selectedTable];
    const ws = XLSX.utils.aoa_to_sheet(table.map(r => r.cells));
    XLSX.utils.book_append_sheet(wb, ws, `表格${selectedTable + 1}`);
    XLSX.writeFile(wb, `pdf_tables_${selectedTable + 1}.xlsx`);
  };

  const exportAllExcel = () => {
    if (tables.length === 0) return;
    const wb = XLSX.utils.book_new();
    tables.forEach((table, i) => {
      const ws = XLSX.utils.aoa_to_sheet(table.map(r => r.cells));
      XLSX.utils.book_append_sheet(wb, ws, `表格${i + 1}`);
    });
    XLSX.writeFile(wb, `pdf_all_tables.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📋 PDF 表格提取</h1>
          <p className="text-gray-500 mt-2">从PDF中自动识别并提取表格数据，导出为Excel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block w-full py-10 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 transition-colors">
                <span className="text-4xl block mb-2">📄</span>
                <p className="text-gray-600 font-medium">上传 PDF 文件</p>
                <p className="text-xs text-gray-400 mt-1">点击选择文件</p>
                <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
              </label>
              {file && <p className="mt-3 text-sm text-gray-500">已选：{file.name}</p>}
              {statusMsg && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${extracting ? 'bg-yellow-50 text-yellow-700' : tables.length > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                  {statusMsg}
                </div>
              )}
            </div>

            {tables.length > 0 && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-700 mb-3">检测到的表格</h3>
                  <div className="space-y-2">
                    {tables.map((_, i) => (
                      <button key={i} onClick={() => setSelectedTable(i)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedTable === i ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        表格 {i + 1}（{tables[i].length} 行）
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={exportExcel} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                  导出当前表格为 Excel
                </button>
                {tables.length > 1 && (
                  <button onClick={exportAllExcel} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    导出全部表格为 Excel
                  </button>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            {tables.length > 0 && tables[selectedTable] ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-700 mb-4">表格 {selectedTable + 1} 预览</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      {tables[selectedTable].map((row, ri) => (
                        <tr key={ri} className={ri === 0 ? 'bg-blue-50 font-semibold' : ri % 2 === 0 ? 'bg-gray-50' : ''}>
                          {row.cells.map((cell, ci) => (
                            <td key={ci} className="px-3 py-2 border border-gray-200 text-sm text-gray-700 whitespace-nowrap">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-gray-400">共 {tables[selectedTable].length} 行，最大列数 {Math.max(...tables[selectedTable].map(r => r.cells.length))} 列</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                <span className="text-6xl block mb-4">📊</span>
                <p className="text-gray-400">上传PDF文件以提取表格数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

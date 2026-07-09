import { useState } from 'react'
import { Upload, Download, Table, Loader2 } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'

export default function PdfToCsv() {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<string[][]>([])
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const extract = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise
      const rows: string[][] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        // Group text items by Y position to form rows
        const items: { text: string; x: number; y: number }[] = []
        for (const item of textContent.items) {
          if ('str' in item && item.str.trim()) {
            const tx = (item as any).transform
            items.push({ text: item.str.trim(), x: tx[4], y: Math.round(tx[5] * 10) })
          }
        }
        // Group by Y
        const yGroups = new Map<number, { text: string; x: number }[]>()
        for (const item of items) {
          if (!yGroups.has(item.y)) yGroups.set(item.y, [])
          yGroups.get(item.y)!.push({ text: item.text, x: item.x })
        }
        const sortedYs = [...yGroups.keys()].sort((a, b) => b - a)
        for (const y of sortedYs) {
          const row = yGroups.get(y)!.sort((a, b) => a.x - b.x).map((i) => i.text)
          if (row.length > 0) rows.push(row)
        }
      }
      setData(rows)
    } catch (err) {
      alert('提取失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const downloadCsv = () => {
    const csv = data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'pdf-table.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF 转CSV</h1>
      <p className="text-gray-500 mb-6">提取 PDF 表格数据导出为 CSV</p>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PDF'}</span>
          <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        </label>
        <button onClick={extract} disabled={!file || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 提取中...</> : <><Table className="w-4 h-4" /> 提取表格</>}
        </button>
      </div>
      {data.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between mb-3">
            <h2 className="font-semibold">提取结果（{data.length} 行）</h2>
            <button onClick={downloadCsv} className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"><Download className="w-3 h-3 inline" /> 下载 CSV</button>
          </div>
          <div className="overflow-auto max-h-96 border rounded-lg">
            <table className="w-full text-sm">
              <tbody>
                {data.slice(0, 50).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-1.5 border">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 50 && <p className="text-center text-xs text-gray-400 py-2">仅显示前 50 行</p>}
          </div>
        </div>
      )}
    </div>
  )
}

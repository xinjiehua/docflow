import { useState } from 'react'
import { Table, Download, Lock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import * as XLSX from 'xlsx'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function PdfToExcel() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][]; totalRows: number } | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = (newFiles: File[]) => {
    setFile(newFiles[0])
    setStatus('idle')
    setResultBlob(null)
    setPreview(null)
  }

  const handleConvert = async () => {
    if (!file) return
    if (isFreeLimitReached) return
    setStatus('processing')
    setProgress(10)

    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setProgress(30)

      const wb = XLSX.utils.book_new()
      const allTextRows: string[][] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const viewport = page.getViewport({ scale: 1 })

        // Group items by Y position to form rows
        const items = textContent.items
          .filter((item: any) => item.str.trim())
          .map((item: any) => ({
            x: item.transform[4],
            y: viewport.height - item.transform[5],
            w: item.width,
            str: item.str.trim(),
          }))
          .sort((a: any, b: any) => a.y - b.y || a.x - b.x)

        // Cluster by Y proximity
        const rows: string[][] = []
        let currentRow: { x: number; str: string }[] = []
        let lastY = -Infinity

        for (const item of items) {
          if (Math.abs(item.y - lastY) > 5) {
            if (currentRow.length > 0) {
              currentRow.sort((a, b) => a.x - b.x)
              rows.push(currentRow.map(c => c.str))
            }
            currentRow = [{ x: item.x, str: item.str }]
            lastY = item.y
          } else {
            currentRow.push({ x: item.x, str: item.str })
          }
        }
        if (currentRow.length > 0) {
          currentRow.sort((a, b) => a.x - b.x)
          rows.push(currentRow.map(c => c.str))
        }

        allTextRows.push(...rows)
        setProgress(30 + Math.round((i / pdf.numPages) * 50))
      }

      const ws = XLSX.utils.aoa_to_sheet(allTextRows)
      XLSX.utils.book_append_sheet(wb, ws, 'PDF数据')

      setProgress(90)
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      setResultBlob(blob)

      // Preview
      if (allTextRows.length > 0) {
        const headers = allTextRows[0]
        const previewRows = allTextRows.slice(1, 6)
        setPreview({ headers, rows: previewRows, totalRows: allTextRows.length })
      }

      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('convertCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!resultBlob) return
    const url = URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file?.name.replace(/\.[^.]+$/, '') || 'output'}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout title="PDF 转 Excel" description="智能识别PDF中的表格结构，提取数据转为Excel表格。" icon={<Table className="w-7 h-7" />} category="格式转换">
      <div className="space-y-6">
        <FileUploader accept=".pdf" maxSize={isPro() ? 100 : 10} label="选择PDF文件"
          description="适合包含表格数据的PDF文件" onFilesSelected={handleFileSelected}
          files={file ? [file] : []} onRemoveFile={() => { setFile(null); setPreview(null); setStatus('idle') }} />

        {file && status === 'idle' && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">将自动识别PDF中的文字行列结构并转为Excel。表格型PDF效果最佳。</p>
            </div>
          </div>
        )}

        {file && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <Table className="w-5 h-5 mr-2" /> 开始转换
          </button>
        )}

        {isFreeLimitReached && file && status === 'idle' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link></p>
            </div>
          </div>
        )}

        <ProcessingIndicator status={status} progress={progress}
          message={status === 'processing' ? '正在识别PDF内容...' : undefined}
          error={status === 'error' ? '转换失败，请确保PDF文件有效' : undefined} />

        {status === 'done' && resultBlob && preview && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">转换完成!</p>
                <p className="text-brand-600 text-sm mt-0.5">提取 {preview.totalRows} 行数据</p>
              </div>
              <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
                <Download className="w-4 h-4 mr-1.5" /> 下载 Excel
              </button>
            </div>
            <div className="card !p-4 overflow-x-auto">
              <p className="text-sm font-medium text-navy-600 mb-3">数据预览 (前5行)</p>
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b border-navy-200">
                  {preview.headers.map((h, i) => <th key={i} className="py-2 px-3 text-left text-navy-600 font-medium bg-navy-50">{h || `列${i + 1}`}</th>)}
                </tr></thead>
                <tbody>{preview.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-navy-100">{row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-navy-700">{cell}</td>
                  ))}</tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

import { useState } from 'react'
import { Table, Download, Lock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import { formatFileSize } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function WordToExcel() {
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
      setProgress(30)
      const arrayBuffer = await file.arrayBuffer()

      // Extract text with tables
      const result = await mammoth.convertToHtml({ arrayBuffer })
      const html = result.value
      setProgress(50)

      // Parse HTML to extract table data
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const tables = doc.querySelectorAll('table')

      const wb = XLSX.utils.book_new()
      let sheetIdx = 0

      if (tables.length > 0) {
        tables.forEach((table, idx) => {
          const rows: string[][] = []
          table.querySelectorAll('tr').forEach((tr) => {
            const cells: string[] = []
            tr.querySelectorAll('td, th').forEach((cell) => {
              cells.push(cell.textContent?.trim() || '')
            })
            if (cells.length > 0) rows.push(cells)
          })
          if (rows.length > 0) {
            const ws = XLSX.utils.aoa_to_sheet(rows)
            const sheetName = tables.length > 1 ? `表格${idx + 1}` : '表格数据'
            XLSX.utils.book_append_sheet(wb, ws, sheetName)
            sheetIdx++
          }
        })
      }

      // Also add text content as a sheet
      const textResult = await mammoth.extractRawText({ arrayBuffer })
      const textLines = textResult.value.split('\n').map((l) => [l.trim()]).filter((r) => r[0] || r[0] === '')
      if (textLines.length > 0) {
        const ws = XLSX.utils.aoa_to_sheet(textLines)
        XLSX.utils.book_append_sheet(wb, ws, sheetIdx > 0 ? '全文内容' : '文档内容')
      }

      setProgress(80)

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      setResultBlob(blob)

      // Preview first sheet
      const firstSheetName = wb.SheetNames[0]
      if (firstSheetName) {
        const ws = wb.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
        const allRows: string[][] = jsonData.map((r: unknown) =>
          Array.isArray(r) ? r.map(String) : [String(r)]
        )
        const headers = allRows.length > 0 ? allRows[0] : []
        const previewRows = allRows.slice(1, 6)
        setPreview({ headers, rows: previewRows, totalRows: allRows.length })
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
    const baseName = file?.name.replace(/\.[^.]+$/, '') || 'output'
    a.download = `${baseName}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="Word 转 Excel"
      description="提取Word文档中的表格数据和文本内容，转为Excel表格文件。"
      icon={<Table className="w-7 h-7" />}
      category="格式转换"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".docx,.doc"
          maxSize={isPro() ? 100 : 10}
          label="选择Word文件"
          description="支持 .docx 格式（推荐）和 .doc 格式"
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setPreview(null); setStatus('idle') }}
        />

        {file && (
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <Table className="w-4 h-4" />
            {file.name} ({formatFileSize(file.size)})
          </div>
        )}

        {file && status === 'idle' && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                将自动提取Word中的表格为Excel工作表，同时提取全文内容作为额外工作表。
              </p>
            </div>
          </div>
        )}

        {file && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <Table className="w-5 h-5 mr-2" />
            开始转换
          </button>
        )}

        {isFreeLimitReached && file && status === 'idle' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link>
                可无限使用。
              </p>
            </div>
          </div>
        )}

        <ProcessingIndicator
          status={status}
          progress={progress}
          message={status === 'processing' ? '正在提取文档内容...' : undefined}
          error={status === 'error' ? '转换失败，请确保Word文件格式正确' : undefined}
        />

        {status === 'done' && resultBlob && preview && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">转换完成!</p>
                <p className="text-brand-600 text-sm mt-0.5">
                  提取 {preview.totalRows} 行数据
                </p>
              </div>
              <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
                <Download className="w-4 h-4 mr-1.5" />
                下载 Excel
              </button>
            </div>

            {/* Preview table */}
            {preview.headers.length > 0 && (
              <div className="card !p-4 overflow-x-auto">
                <p className="text-sm font-medium text-navy-600 mb-3">数据预览 (前5行)</p>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-navy-200">
                      {preview.headers.map((h, i) => (
                        <th key={i} className="py-2 px-3 text-left text-navy-600 font-medium bg-navy-50 rounded-tl-lg">
                          {h || `列${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-navy-100">
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-2 px-3 text-navy-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.totalRows > 6 && (
                  <p className="text-xs text-navy-400 mt-2 text-center">
                    还有 {preview.totalRows - 6} 行数据未显示
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

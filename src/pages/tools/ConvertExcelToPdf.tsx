import { useState } from 'react'
import { Table } from 'lucide-react'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { excelToJson } from '@/utils/converter'
import { jsPDF } from 'jspdf'
import { downloadUint8Array } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'

export default function ConvertExcelToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<unknown[]>([])
  const [result, setResult] = useState<Uint8Array | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const isFreeLimitReached = totalUsed >= 5

  const handleFileSelected = (files: File[]) => {
    setFile(files[0])
    setStatus('idle')
    setPreview([])
    setResult(null)
  }

  const handleConvert = async () => {
    if (!file) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(20)

    try {
      const data = await excelToJson(file)
      setPreview(data)
      setProgress(50)

      // Create PDF from data
      const pdf = new jsPDF()
      pdf.setFontSize(10)

      const headers = Object.keys(data[0] as Record<string, unknown>)
      const startY = 20

      // Headers
      pdf.setFont(undefined, 'bold')
      headers.forEach((h, i) => {
        pdf.text(String(h), 15 + i * 40, startY)
      })

      // Rows
      pdf.setFont(undefined, 'normal')
      data.forEach((row, rowIdx) => {
        const y = startY + 8 + rowIdx * 7
        if (y > 270) {
          pdf.addPage()
        }
        headers.forEach((h, colIdx) => {
          const val = String((row as Record<string, unknown>)[h] ?? '')
          pdf.text(val.substring(0, 20), 15 + colIdx * 40, y)
        })
      })

      const pdfData = pdf.output('arraybuffer') as Uint8Array
      setResult(pdfData)
      setProgress(100)
      setStatus('done')
      increment('convertCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result || !file) return
    const name = file.name.replace(/\.xlsx?$/i, '.pdf')
    downloadUint8Array(result, name)
  }

  return (
    <ToolLayout
      title="Excel 转 PDF"
      description="将Excel表格(.xlsx)转换为PDF文档，方便打印和归档。"
      icon={<Table className="w-7 h-7" />}
      category="格式转换"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".xlsx,.xls"
          maxSize={10}
          label="选择Excel文件"
          description="支持 .xlsx 和 .xls 格式"
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setPreview([]); setResult(null) }}
        />

        {file && !isFreeLimitReached && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <Table className="w-5 h-5 mr-2" />
            转换为PDF
          </button>
        )}

        {isFreeLimitReached && file && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              免费版每日限用5次。升级到<a href="/pricing" className="underline font-medium">专业版</a>可无限使用。
            </p>
          </div>
        )}

        <ProcessingIndicator
          status={status}
          progress={progress}
          message={status === 'processing' ? '正在转换表格...' : undefined}
          error={status === 'error' ? '转换失败，请确保文件格式正确' : undefined}
        />

        {status === 'done' && result && (
          <div className="space-y-4">
            {preview.length > 0 && (
              <div className="card !p-4 max-h-48 overflow-auto">
                <h3 className="text-sm font-medium text-navy-700 mb-2">数据预览 (前5行)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-navy-200">
                        {Object.keys(preview[0] as Record<string, unknown>).map((h) => (
                          <th key={h} className="text-left py-1.5 px-2 text-navy-500 font-medium">{String(h)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-b border-navy-100">
                          {Object.values(row as Record<string, unknown>).map((v, colIdx) => (
                            <td key={colIdx} className="py-1.5 px-2 text-navy-600">{String(v ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center">
              <p className="text-brand-700 font-medium">转换完成!</p>
              <button onClick={handleDownload} className="btn-primary mt-4">
                下载PDF文件
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

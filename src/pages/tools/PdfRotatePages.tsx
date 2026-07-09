import { useState } from 'react'
import { RotateCw, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

type RotationAngle = 90 | 180 | 270

export default function PdfRotatePages() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [resultName, setResultName] = useState('')
  const [angle, setAngle] = useState<RotationAngle>(90)
  const [scope, setScope] = useState<'all' | 'custom'>('all')
  const [customPages, setCustomPages] = useState('')
  const [pageCount, setPageCount] = useState(0)

  const handleFileSelect = async (files: File[]) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    setResultUrl('')
    try {
      const pdfLib = await import('pdf-lib')
      const buf = await f.arrayBuffer()
      const pdf = await pdfLib.PDFDocument.load(buf)
      setPageCount(pdf.getPageCount())
    } catch { setPageCount(0) }
  }

  const handleRotate = async () => {
    if (!file || !checkUsage()) return
    setProcessing(true)
    try {
      const pdfLib = await import('pdf-lib')
      const { PDFDocument, degrees } = pdfLib
      const buf = await file.arrayBuffer()
      const pdf = await PDFDocument.load(buf)

      let pagesToRotate: number[]
      if (scope === 'all') {
        pagesToRotate = pdf.getPageIndices()
      } else {
        pagesToRotate = parsePages(customPages, pdf.getPageCount())
      }

      pagesToRotate.forEach((idx) => {
        const page = pdf.getPage(idx)
        page.setRotation(degrees((page.getRotation().angle + angle) % 360))
      })

      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      setResultName(file.name.replace('.pdf', '_rotated.pdf'))
    } catch (err: any) {
      alert('旋转失败: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const parsePages = (input: string, max: number): number[] => {
    const pages = new Set<number>()
    input.split(',').forEach(part => {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(max, end); i++) pages.add(i - 1)
        }
      } else {
        const n = Number(trimmed)
        if (!isNaN(n) && n >= 1 && n <= max) pages.add(n - 1)
      }
    })
    return Array.from(pages).sort((a, b) => a - b)
  }

  return (
    <ToolLayout
      title="PDF 旋转页面"
      description="旋转PDF页面的方向，支持指定角度和自定义页码范围"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        <div className="card !p-6">
          <FileUploader accept=".pdf" onFileSelect={handleFileSelect} maxSize={100} />
          {file && pageCount > 0 && (
            <p className="mt-3 text-sm text-navy-500">已选择: {file.name}（{pageCount} 页）</p>
          )}
        </div>

        <div className="card !p-6 space-y-4">
          <h3 className="font-medium text-navy-700">旋转设置</h3>
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-2">旋转角度</label>
            <div className="flex gap-2">
              {([90, 180, 270] as RotationAngle[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAngle(a)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    angle === a
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'border-navy-200 text-navy-600 hover:border-navy-300'
                  }`}
                >
                  顺时针 {a}°
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-2">旋转范围</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setScope('all')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  scope === 'all'
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'border-navy-200 text-navy-600 hover:border-navy-300'
                }`}
              >
                所有页面
              </button>
              <button
                onClick={() => setScope('custom')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  scope === 'custom'
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'border-navy-200 text-navy-600 hover:border-navy-300'
                }`}
              >
                自定义页码
              </button>
            </div>
            {scope === 'custom' && (
              <input
                type="text"
                value={customPages}
                onChange={(e) => setCustomPages(e.target.value)}
                placeholder="例: 1,3,5-8 或 1-3,10"
                className="input"
              />
            )}
          </div>

          <button onClick={handleRotate} className="btn-primary" disabled={!file || processing}>
            <RotateCw className="w-4 h-4 mr-2" />
            {processing ? '处理中...' : '旋转页面'}
          </button>
        </div>

        {processing && <ProcessingIndicator />}

        {resultUrl && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-4">处理完成</h3>
            <a href={resultUrl} download={resultName} className="btn-primary inline-flex">
              <Download className="w-4 h-4 mr-2" />
              下载旋转后的PDF
            </a>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

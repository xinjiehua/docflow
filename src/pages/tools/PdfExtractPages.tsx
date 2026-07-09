import { useState } from 'react'
import { FileOutput, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { PDFDocument } from 'pdf-lib'
import { downloadAsZip, downloadUint8Array } from '@/utils/download'
import { getPDFPageCount } from '@/utils/pdf'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function PdfExtractPages() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [mode, setMode] = useState<'extract' | 'remove'>('extract')
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Uint8Array | null>(null)
  const [pageInput, setPageInput] = useState('')

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = async (newFiles: File[]) => {
    setFile(newFiles[0])
    setStatus('idle')
    setResult(null)
    setSelectedPages(new Set())
    setPageInput('')
    const count = await getPDFPageCount(newFiles[0])
    setPageCount(count)
  }

  const handlePageInput = (value: string) => {
    setPageInput(value)
    const pages = new Set<number>()
    const parts = value.split(',')
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number)
        if (start && end) {
          for (let i = Math.max(1, start); i <= Math.min(pageCount, end); i++) {
            pages.add(i)
          }
        }
      } else {
        const num = Number(trimmed)
        if (num >= 1 && num <= pageCount) pages.add(num)
      }
    }
    setSelectedPages(pages)
  }

  const selectAll = () => {
    const all = new Set<number>()
    for (let i = 1; i <= pageCount; i++) all.add(i)
    setSelectedPages(all)
    setPageInput(`1-${pageCount}`)
  }

  const selectOdd = () => {
    const pages = new Set<number>()
    const nums: string[] = []
    for (let i = 1; i <= pageCount; i += 2) { pages.add(i); nums.push(String(i)) }
    setSelectedPages(pages)
    setPageInput(nums.join(','))
  }

  const selectEven = () => {
    const pages = new Set<number>()
    const nums: string[] = []
    for (let i = 2; i <= pageCount; i += 2) { pages.add(i); nums.push(String(i)) }
    setSelectedPages(pages)
    setPageInput(nums.join(','))
  }

  const handleProcess = async () => {
    if (!file || selectedPages.size === 0) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(20)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const newPdf = await PDFDocument.create()

      const indices = Array.from(selectedPages).sort((a, b) => a - b).map(p => p - 1)

      if (mode === 'extract') {
        const copiedPages = await newPdf.copyPages(pdf, indices)
        copiedPages.forEach(page => newPdf.addPage(page))
      } else {
        const allIndices = pdf.getPageIndices()
        const removeSet = new Set(indices)
        const keepIndices = allIndices.filter(i => !removeSet.has(i))
        const copiedPages = await newPdf.copyPages(pdf, keepIndices)
        copiedPages.forEach(page => newPdf.addPage(page))
      }

      setProgress(80)
      const saved = await newPdf.save()
      setResult(new Uint8Array(saved))
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('pdfToolsCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result) return
    const baseName = file?.name.replace(/\.[^.]+$/, '') || 'output'
    const suffix = mode === 'extract' ? '_extracted' : '_removed'
    downloadUint8Array(result, `${baseName}${suffix}.pdf`)
  }

  return (
    <ToolLayout
      title="PDF 提取页面"
      description="从PDF中提取指定页面或删除指定页面，支持按页码范围选择。"
      icon={<FileOutput className="w-7 h-7" />}
      category="PDF工具箱"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".pdf"
          maxSize={isPro() ? 100 : 10}
          label="选择PDF文件"
          description={`单个文件最大${isPro() ? '100MB' : '10MB'}`}
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setPageCount(0); setSelectedPages(new Set()); setStatus('idle') }}
        />

        {file && pageCount > 0 && (
          <div className="card !p-4 space-y-4">
            <p className="text-sm text-navy-600">共 <span className="font-bold text-brand-600">{pageCount}</span> 页</p>

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('extract')}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${mode === 'extract' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-navy-200 text-navy-600'}`}
              >
                提取选中页面
              </button>
              <button
                onClick={() => setMode('remove')}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${mode === 'remove' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-navy-200 text-navy-600'}`}
              >
                删除选中页面
              </button>
            </div>

            {/* Page input */}
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1.5">选择页码 (如: 1,3,5-8)</label>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => handlePageInput(e.target.value)}
                placeholder="输入页码，如 1,3,5-8"
                className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
              />
            </div>

            {/* Quick select buttons */}
            <div className="flex gap-2">
              <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-navy-50 text-navy-600 text-xs font-medium hover:bg-navy-100 transition-colors">全选</button>
              <button onClick={selectOdd} className="px-3 py-1.5 rounded-lg bg-navy-50 text-navy-600 text-xs font-medium hover:bg-navy-100 transition-colors">奇数页</button>
              <button onClick={selectEven} className="px-3 py-1.5 rounded-lg bg-navy-50 text-navy-600 text-xs font-medium hover:bg-navy-100 transition-colors">偶数页</button>
            </div>

            {selectedPages.size > 0 && (
              <p className="text-sm text-navy-500">
                已选择 <span className="font-bold text-brand-600">{selectedPages.size}</span> 页
                {mode === 'remove' && ` (将删除 ${selectedPages.size} 页，保留 ${pageCount - selectedPages.size} 页)`}
              </p>
            )}
          </div>
        )}

        {file && selectedPages.size > 0 && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleProcess} className="btn-primary w-full !py-3 text-base">
            <FileOutput className="w-5 h-5 mr-2" />
            {mode === 'extract' ? `提取 ${selectedPages.size} 页` : `删除 ${selectedPages.size} 页`}
          </button>
        )}

        {isFreeLimitReached && file && selectedPages.size > 0 && status === 'idle' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link>
              </p>
            </div>
          </div>
        )}

        <ProcessingIndicator status={status} progress={progress}
          message={status === 'processing' ? '正在处理...' : undefined}
          error={status === 'error' ? '处理失败，请确保PDF文件有效' : undefined}
        />

        {status === 'done' && result && (
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
            <div>
              <p className="text-brand-700 font-medium">处理完成!</p>
              <p className="text-brand-600 text-sm mt-0.5">{mode === 'extract' ? '已提取选中页面' : '已删除选中页面'}</p>
            </div>
            <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
              <Download className="w-4 h-4 mr-1.5" />
              下载PDF
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

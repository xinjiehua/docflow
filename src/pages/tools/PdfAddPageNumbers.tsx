import { useState } from 'react'
import { Hash, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { downloadUint8Array } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

type Position = 'bottom-center' | 'bottom-right' | 'top-right' | 'header'
type Format = '{page}' | '{page}/{total}' | '第{page}页' | '- {page} -'

export default function PdfAddPageNumbers() {
  const [file, setFile] = useState<File | null>(null)
  const [position, setPosition] = useState<Position>('bottom-center')
  const [format, setFormat] = useState<Format>('{page}/{total}')
  const [startFrom, setStartFrom] = useState(1)
  const [fontSize, setFontSize] = useState(12)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Uint8Array | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = (newFiles: File[]) => {
    setFile(newFiles[0])
    setStatus('idle')
    setResult(null)
  }

  const handleAdd = async () => {
    if (!file) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(20)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()
      const total = pages.length

      setProgress(40)

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const pageNum = i + startFrom
        const text = format.replace('{page}', String(pageNum)).replace('{total}', String(total))

        const textWidth = font.widthOfTextAtSize(text, fontSize)

        let x: number, y: number
        switch (position) {
          case 'bottom-center':
            x = (width - textWidth) / 2
            y = 30
            break
          case 'bottom-right':
            x = width - textWidth - 40
            y = 30
            break
          case 'top-right':
            x = width - textWidth - 40
            y = height - 30
            break
          case 'header':
          default:
            x = (width - textWidth) / 2
            y = height - 30
            break
        }

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) })
        setProgress(40 + Math.round((i / pages.length) * 50))
      }

      setProgress(90)
      const saved = await pdf.save()
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
    downloadUint8Array(result, `${baseName}_页码.pdf`)
  }

  const positions: { value: Position; label: string }[] = [
    { value: 'bottom-center', label: '底部居中' },
    { value: 'bottom-right', label: '底部右侧' },
    { value: 'top-right', label: '顶部右侧' },
    { value: 'header', label: '顶部居中' },
  ]

  const formats: { value: Format; label: string }[] = [
    { value: '1', label: '1, 2, 3...' },
    { value: '{page}/{total}', label: '1/10, 2/10...' },
    { value: '第{page}页', label: '第1页, 第2页...' },
    { value: '- {page} -', label: '- 1 -, - 2 -...' },
  ]

  return (
    <ToolLayout title="PDF 添加页码" description="为PDF每页自动添加页码，支持多种位置和格式。" icon={<Hash className="w-7 h-7" />} category="PDF工具箱">
      <div className="space-y-6">
        <FileUploader accept=".pdf" maxSize={isPro() ? 100 : 10} label="选择PDF文件" description={`单个文件最大${isPro() ? '100MB' : '10MB'}`}
          onFilesSelected={handleFileSelected} files={file ? [file] : []} onRemoveFile={() => { setFile(null); setResult(null); setStatus('idle') }} />

        {file && status === 'idle' && (
          <div className="card !p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-2">页码位置</label>
              <div className="grid grid-cols-4 gap-2">
                {positions.map(p => (
                  <button key={p.value} onClick={() => setPosition(p.value)}
                    className={`px-2 py-2 rounded-lg border-2 text-xs font-medium transition-all ${position === p.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-navy-200 text-navy-600'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-2">页码格式</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {formats.map(f => (
                  <button key={f.label} onClick={() => setFormat(f.value as Format)}
                    className={`px-2 py-2 rounded-lg border-2 text-xs font-medium transition-all ${format === f.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-navy-200 text-navy-600'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">起始页码</label>
                <input type="number" min={0} value={startFrom} onChange={e => setStartFrom(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">字号</label>
                <select value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm">
                  <option value={8}>8 (小)</option>
                  <option value={10}>10</option>
                  <option value={12}>12 (默认)</option>
                  <option value={14}>14</option>
                  <option value={16}>16 (大)</option>
                  <option value={20}>20 (特大)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {file && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleAdd} className="btn-primary w-full !py-3 text-base">
            <Hash className="w-5 h-5 mr-2" /> 添加页码
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
          message={status === 'processing' ? '正在添加页码...' : undefined}
          error={status === 'error' ? '添加失败' : undefined} />

        {status === 'done' && result && (
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
            <div>
              <p className="text-brand-700 font-medium">页码添加完成!</p>
            </div>
            <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
              <Download className="w-4 h-4 mr-1.5" /> 下载PDF
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

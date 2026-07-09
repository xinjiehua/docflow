import { useState } from 'react'
import { ImageIcon, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { downloadAsZip } from '@/utils/download'
import { pdfToImages } from '@/utils/pdfToImage'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [images, setImages] = useState<{ dataUrl: string; page: number; width: number; height: number }[]>([])
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [scale, setScale] = useState<number>(2)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = (newFiles: File[]) => {
    setFile(newFiles[0])
    setStatus('idle')
    setImages([])
  }

  const handleConvert = async () => {
    if (!file) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(10)

    try {
      const result = await pdfToImages(file, scale, format)
      setProgress(80)
      setImages(result)
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('convertCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownloadAll = async () => {
    if (images.length === 0) return

    const files = await Promise.all(
      images.map(async (img) => {
        const base64 = img.dataUrl.split(',')[1]
        const bytes = new Uint8Array(
          atob(base64).split('').map((c) => c.charCodeAt(0))
        )
        const ext = format === 'png' ? 'png' : 'jpg'
        return { data: bytes, name: `page_${img.page}.${ext}` }
      })
    )
    await downloadAsZip(files, 'pdf_images.zip')
  }

  const handleDownloadSingle = (img: typeof images[0]) => {
    const ext = format === 'png' ? 'png' : 'jpg'
    const a = document.createElement('a')
    a.href = img.dataUrl
    a.download = `page_${img.page}.${ext}`
    a.click()
  }

  return (
    <ToolLayout
      title="PDF 转图片"
      description="将PDF每页导出为高清PNG/JPG图片，支持批量下载。"
      icon={<ImageIcon className="w-7 h-7" />}
      category="格式转换"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".pdf"
          maxSize={isPro() ? 100 : 10}
          label="选择PDF文件"
          description={`单个文件最大${isPro() ? '100MB' : '10MB'}`}
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setImages([]); setStatus('idle') }}
        />

        {/* Options */}
        {file && status === 'idle' && (
          <div className="card !p-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">输出格式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                  className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                >
                  <option value="png">PNG (无损，透明背景)</option>
                  <option value="jpeg">JPG (体积更小)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">清晰度</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                >
                  <option value={1}>标准 (1x)</option>
                  <option value={2}>高清 (2x，推荐)</option>
                  <option value={3}>超清 (3x)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {file && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <ImageIcon className="w-5 h-5 mr-2" />
            开始转换 ({format.toUpperCase()})
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
          message={status === 'processing' ? `正在转换第 ${Math.min(images.length + 1, Math.ceil(progress / (90 / (images.length || 10))))} 页...` : undefined}
          error={status === 'error' ? '转换失败，请确保PDF文件有效' : undefined}
        />

        {status === 'done' && images.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">转换完成!</p>
                <p className="text-brand-600 text-sm mt-0.5">共 {images.length} 页</p>
              </div>
              {images.length > 1 && (
                <button onClick={handleDownloadAll} className="btn-primary !py-2 !px-4 text-sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  打包下载全部
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {images.map((img) => (
                <div key={img.page} className="card !p-3 group">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-navy-100 shrink-0 flex items-center justify-center">
                      <img src={img.dataUrl} alt={`Page ${img.page}`} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-700">第 {img.page} 页</p>
                      <p className="text-xs text-navy-400 mt-0.5">{img.width} x {img.height}px</p>
                      <button
                        onClick={() => handleDownloadSingle(img)}
                        className="text-brand-600 text-xs font-medium mt-1 hover:text-brand-700 transition-colors"
                      >
                        下载此页
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

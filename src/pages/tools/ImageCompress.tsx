import { useState } from 'react'
import { FileDown, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { compressImage } from '@/utils/image'
import { formatFileSize } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

interface CompressedImage {
  name: string
  dataUrl: string
  originalSize: number
  compressedSize: number
}

export default function ImageCompress() {
  const [files, setFiles] = useState<File[]>([])
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([])
  const [quality, setQuality] = useState(70)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    setStatus('idle')
    setCompressedImages([])
  }

  const handleCompress = async () => {
    if (files.length === 0) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(0)
    const results: CompressedImage[] = []

    for (let i = 0; i < files.length; i++) {
      try {
        const { dataUrl, originalSize, compressedSize } = await compressImage(
          files[i],
          quality / 100,
          maxWidth
        )
        results.push({
          name: files[i].name,
          dataUrl,
          originalSize,
          compressedSize,
        })
      } catch {
        // skip failed
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setCompressedImages(results)
    setStatus(results.length > 0 ? 'done' : 'error')
    if (results.length > 0 && !isPro()) increment('compressCount')
  }

  const handleDownload = (ci: CompressedImage) => {
    const a = document.createElement('a')
    a.href = ci.dataUrl
    const ext = ci.name.split('.').pop() || 'jpg'
    a.download = ci.name.replace(`.${ext}`, `_compressed.${ext}`)
    a.click()
  }

  const handleDownloadAll = () => {
    compressedImages.forEach(handleDownload)
  }

  const totalOriginal = compressedImages.reduce((s, c) => s + c.originalSize, 0)
  const totalCompressed = compressedImages.reduce((s, c) => s + c.compressedSize, 0)

  return (
    <ToolLayout
      title="图片压缩"
      description="压缩图片文件大小，支持批量处理，可调节压缩参数保持画质。"
      icon={<FileDown className="w-7 h-7" />}
      category="格式转换"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp,.bmp"
          multiple
          maxSize={isPro() ? 100 : 20}
          label="选择图片"
          description="支持JPG、PNG、WebP、BMP格式，可多选"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
        />

        {/* Options */}
        {files.length > 0 && status === 'idle' && (
          <div className="card !p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1.5">
                压缩强度: {quality === 90 ? '轻度' : quality === 70 ? '中度' : quality === 50 ? '高度' : `${100 - quality}%`}
              </label>
              <input
                type="range"
                min={10}
                max={95}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-navy-400 mt-1">
                <span>体积最小</span>
                <span>画质最好</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1.5">最大宽度 (px)</label>
              <select
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
              >
                <option value={1280}>1280px (适合网页)</option>
                <option value={1920}>1920px (高清，推荐)</option>
                <option value={2560}>2560px (超清)</option>
                <option value={3840}>3840px (4K)</option>
                <option value={9999}>不限制 (仅调质量)</option>
              </select>
            </div>
          </div>
        )}

        {files.length > 0 && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleCompress} className="btn-primary w-full !py-3 text-base">
            <FileDown className="w-5 h-5 mr-2" />
            压缩 {files.length} 张图片
          </button>
        )}

        {isFreeLimitReached && files.length > 0 && status === 'idle' && (
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
          message={status === 'processing' ? `正在压缩 ${compressedImages.length + 1}/${files.length}...` : undefined}
          error={status === 'error' ? '压缩失败，请确保图片格式正确' : undefined}
        />

        {status === 'done' && compressedImages.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">压缩完成!</p>
                <p className="text-brand-600 text-sm mt-0.5">
                  {compressedImages.length} 张图片：
                  {formatFileSize(totalOriginal)} → {formatFileSize(totalCompressed)}
                  <span className="text-green-600 ml-1">
                    (-{Math.round((1 - totalCompressed / totalOriginal) * 100)}%)
                  </span>
                </p>
              </div>
              {compressedImages.length > 1 && (
                <button onClick={handleDownloadAll} className="btn-primary !py-2 !px-4 text-sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  全部下载
                </button>
              )}
            </div>

            <div className="space-y-2">
              {compressedImages.map((ci) => (
                <div key={ci.name} className="card !p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-navy-100 shrink-0">
                      <img src={ci.dataUrl} alt={ci.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-700 truncate">{ci.name}</p>
                      <p className="text-xs text-navy-400">
                        {formatFileSize(ci.originalSize)} → {formatFileSize(ci.compressedSize)}
                        <span className="text-green-600 ml-1">
                          (-{Math.round((1 - ci.compressedSize / ci.originalSize) * 100)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDownload(ci)} className="text-brand-600 hover:text-brand-700 transition-colors shrink-0 ml-2">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

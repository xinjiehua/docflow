import { useState, useRef } from 'react'
import { ArrowRightLeft, Download, Lock, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { convertImageFormat, dataUrlToFile } from '@/utils/image'
import { formatFileSize } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

interface ConvertedFile {
  name: string
  dataUrl: string
  originalSize: number
  convertedSize: number
}

const formatOptions = [
  { value: 'png', label: 'PNG', desc: '无损压缩，支持透明背景' },
  { value: 'jpeg', label: 'JPG', desc: '有损压缩，体积更小' },
  { value: 'webp', label: 'WebP', desc: '新一代格式，体积最小' },
] as const

export default function ImageFormatConvert() {
  const [files, setFiles] = useState<File[]>([])
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [quality, setQuality] = useState(92)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const linkRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({})

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    setStatus('idle')
    setConvertedFiles([])
  }

  const handleConvert = async () => {
    if (files.length === 0) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(0)
    const results: ConvertedFile[] = []

    for (let i = 0; i < files.length; i++) {
      try {
        const { dataUrl, fileName } = await convertImageFormat(files[i], targetFormat, quality / 100)
        const base64Length = dataUrl.split(',')[1].length
        const convertedSize = Math.round((base64Length * 3) / 4)
        results.push({ name: fileName, dataUrl, originalSize: files[i].size, convertedSize })
      } catch {
        // skip failed files
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setConvertedFiles(results)
    setStatus(results.length > 0 ? 'done' : 'error')
    if (results.length > 0 && !isPro()) increment('convertCount')
  }

  const handleDownload = (cf: ConvertedFile) => {
    const a = document.createElement('a')
    a.href = cf.dataUrl
    a.download = cf.name
    a.click()
  }

  const handleDownloadAll = () => {
    convertedFiles.forEach((cf) => handleDownload(cf))
  }

  return (
    <ToolLayout
      title="图片格式转换"
      description="支持PNG、JPG、WebP等常见图片格式互转，可调整压缩质量。"
      icon={<ArrowRightLeft className="w-7 h-7" />}
      category="格式转换"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp,.bmp,.gif"
          multiple
          maxSize={isPro() ? 100 : 20}
          label="选择图片"
          description="支持JPG、PNG、WebP、BMP、GIF格式，可多选"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
        />

        {/* Options */}
        {files.length > 0 && status === 'idle' && (
          <div className="card !p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-2">目标格式</label>
              <div className="grid grid-cols-3 gap-3">
                {formatOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTargetFormat(opt.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      targetFormat === opt.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-navy-200 hover:border-navy-300'
                    }`}
                  >
                    <p className={`font-medium ${targetFormat === opt.value ? 'text-brand-700' : 'text-navy-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-navy-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {targetFormat !== 'png' && (
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">
                  压缩质量: {quality}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-navy-400 mt-1">
                  <span>体积小</span>
                  <span>质量高</span>
                </div>
              </div>
            )}
          </div>
        )}

        {files.length > 0 && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            转换 {files.length} 张图片为 {targetFormat.toUpperCase()}
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
          message={status === 'processing' ? `正在转换 ${convertedFiles.length + 1}/${files.length}...` : undefined}
          error={status === 'error' ? '转换失败，请确保图片格式正确' : undefined}
        />

        {status === 'done' && convertedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">转换完成!</p>
                <p className="text-brand-600 text-sm mt-0.5">
                  {convertedFiles.length} 个文件已转换
                </p>
              </div>
              {convertedFiles.length > 1 && (
                <button onClick={handleDownloadAll} className="btn-primary !py-2 !px-4 text-sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  全部下载
                </button>
              )}
            </div>

            <div className="space-y-2">
              {convertedFiles.map((cf) => (
                <div key={cf.name} className="card !p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-navy-100 shrink-0">
                      <img src={cf.dataUrl} alt={cf.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-700 truncate">{cf.name}</p>
                      <p className="text-xs text-navy-400">
                        {formatFileSize(cf.originalSize)} → {formatFileSize(cf.convertedSize)}
                        {cf.convertedSize < cf.originalSize && (
                          <span className="text-green-600 ml-1">
                            (-{Math.round((1 - cf.convertedSize / cf.originalSize) * 100)}%)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDownload(cf)} className="text-brand-600 hover:text-brand-700 transition-colors shrink-0 ml-2">
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

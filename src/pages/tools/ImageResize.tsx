import { useState } from 'react'
import { Maximize2, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { dataUrlToFile } from '@/utils/image'
import { resizeImage } from '@/utils/tools'
import { formatFileSize } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

interface ResizedImage { name: string; dataUrl: string; originalSize: string; newSize: string; width: number; height: number }

export default function ImageResize() {
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<ResizedImage[]>([])
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [keepAspect, setKeepAspect] = useState(true)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    setStatus('idle')
    setResults([])
  }

  const handleResize = async () => {
    if (files.length === 0) return
    if (isFreeLimitReached) return
    setStatus('processing')
    setProgress(0)

    const res: ResizedImage[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const { dataUrl, newWidth, newHeight } = await resizeImage(files[i], { width, height, maintainAspectRatio: keepAspect })
        res.push({ name: files[i].name, dataUrl, originalSize: formatFileSize(files[i].size), newSize: '', width: newWidth, height: newHeight })
      } catch { /* skip */ }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setResults(res)
    setStatus(res.length > 0 ? 'done' : 'error')
    if (res.length > 0 && !isPro()) increment('imageEditCount')
  }

  const handleDownload = (item: ResizedImage) => {
    const a = document.createElement('a')
    a.href = item.dataUrl
    const baseName = item.name.replace(/\.[^.]+$/, '')
    const ext = item.name.split('.').pop() || 'png'
    a.download = `${baseName}_${item.width}x${item.height}.${ext}`
    a.click()
  }

  const handleDownloadAll = () => results.forEach(handleDownload)

  const presets = [
    { label: '800x600', w: 800, h: 600 },
    { label: '1024x768', w: 1024, h: 768 },
    { label: '1280x720', w: 1280, h: 720 },
    { label: '1920x1080', w: 1920, h: 1080 },
    { label: '自定义', w: width, h: height },
  ]

  return (
    <ToolLayout title="图片调整大小" description="批量调整图片尺寸，支持预设分辨率和自定义尺寸，可锁定宽高比。" icon={<Maximize2 className="w-7 h-7" />} category="图片工具">
      <div className="space-y-6">
        <FileUploader accept=".jpg,.jpeg,.png,.webp,.bmp" multiple maxSize={isPro() ? 100 : 20}
          label="选择图片" description="支持JPG、PNG、WebP、BMP格式，可多选"
          onFilesSelected={handleFilesSelected} files={files}
          onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))} />

        {files.length > 0 && status === 'idle' && (
          <div className="card !p-4 space-y-4">
            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-2">预设尺寸</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {presets.map(p => (
                  <button key={p.label}
                    onClick={() => { setWidth(p.w); setHeight(p.h) }}
                    className={`px-2 py-2 rounded-lg border-2 text-xs font-medium transition-all ${width === p.w && height === p.h ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-navy-200 text-navy-600 hover:border-navy-300'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">宽度 (px)</label>
                <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">高度 (px)</label>
                <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={keepAspect} onChange={e => setKeepAspect(e.target.checked)} className="accent-brand-500" />
              <span className="text-sm text-navy-600">保持宽高比</span>
            </label>
          </div>
        )}

        {files.length > 0 && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleResize} className="btn-primary w-full !py-3 text-base">
            <Maximize2 className="w-5 h-5 mr-2" /> 调整 {files.length} 张图片大小 ({width}x{height})
          </button>
        )}

        {isFreeLimitReached && files.length > 0 && status === 'idle' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link></p>
            </div>
          </div>
        )}

        <ProcessingIndicator status={status} progress={progress}
          message={status === 'processing' ? `正在调整 ${results.length + 1}/${files.length}...` : undefined}
          error={status === 'error' ? '处理失败' : undefined} />

        {status === 'done' && results.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">调整完成!</p>
                <p className="text-brand-600 text-sm mt-0.5">{results.length} 张图片</p>
              </div>
              {results.length > 1 && (
                <button onClick={handleDownloadAll} className="btn-primary !py-2 !px-4 text-sm">
                  <Download className="w-4 h-4 mr-1.5" /> 全部下载
                </button>
              )}
            </div>
            <div className="space-y-2">
              {results.map(item => (
                <div key={item.name} className="card !p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-navy-100 shrink-0">
                      <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-700 truncate">{item.name}</p>
                      <p className="text-xs text-navy-400">{item.width} x {item.height}px</p>
                    </div>
                  </div>
                  <button onClick={() => handleDownload(item)} className="text-brand-600 hover:text-brand-700 shrink-0 ml-2">
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

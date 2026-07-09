import { useState } from 'react'
import { Stamp, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { addImageWatermark } from '@/utils/tools'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

interface WatermarkResult { name: string; dataUrl: string }

export default function ImageWatermark() {
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState('智文办公')
  const [fontSize, setFontSize] = useState(40)
  const [opacity, setOpacity] = useState(30)
  const [position, setPosition] = useState<'center' | 'bottom-right' | 'tile'>('tile')
  const [color, setColor] = useState('#000000')
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<WatermarkResult[]>([])

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    setStatus('idle')
    setResults([])
  }

  const handleAdd = async () => {
    if (files.length === 0 || !text.trim()) return
    if (isFreeLimitReached) return
    setStatus('processing')
    setProgress(0)

    const res: WatermarkResult[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await addImageWatermark(files[i], text, { fontSize, opacity: opacity / 100, color, position })
        res.push({ name: files[i].name, dataUrl })
      } catch { /* skip */ }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }
    setResults(res)
    setStatus(res.length > 0 ? 'done' : 'error')
    if (res.length > 0 && !isPro()) increment('imageEditCount')
  }

  const handleDownload = (item: WatermarkResult) => {
    const a = document.createElement('a')
    a.href = item.dataUrl
    const baseName = item.name.replace(/\.[^.]+$/, '')
    const ext = item.name.split('.').pop() || 'png'
    a.download = `${baseName}_watermark.${ext}`
    a.click()
  }

  const handleDownloadAll = () => results.forEach(handleDownload)

  return (
    <ToolLayout title="图片添加水印" description="为图片添加自定义文字水印，支持平铺、居中、右下角等位置。" icon={<Stamp className="w-7 h-7" />} category="图片工具">
      <div className="space-y-6">
        <FileUploader accept=".jpg,.jpeg,.png,.webp,.bmp" multiple maxSize={isPro() ? 100 : 20}
          label="选择图片" description="支持JPG、PNG、WebP、BMP格式，可多选"
          onFilesSelected={handleFilesSelected} files={files}
          onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))} />

        {files.length > 0 && status === 'idle' && (
          <div className="card !p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1.5">水印文字</label>
              <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="输入水印文字"
                className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">字号: {fontSize}</label>
                <input type="range" min={10} max={120} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">透明度: {opacity}%</label>
                <input type="range" min={5} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full accent-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1.5">颜色</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <span className="text-xs text-navy-400">{color}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-2">位置</label>
              <div className="grid grid-cols-3 gap-2">
                {([['tile', '平铺'], ['center', '居中'], ['bottom-right', '右下角']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setPosition(val)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${position === val ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-navy-200 text-navy-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {files.length > 0 && text.trim() && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleAdd} className="btn-primary w-full !py-3 text-base">
            <Stamp className="w-5 h-5 mr-2" /> 为 {files.length} 张图片添加水印
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
          message={status === 'processing' ? `正在处理 ${results.length + 1}/${files.length}...` : undefined}
          error={status === 'error' ? '处理失败' : undefined} />

        {status === 'done' && results.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">水印添加完成!</p>
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
                    <p className="text-sm font-medium text-navy-700 truncate">{item.name}</p>
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

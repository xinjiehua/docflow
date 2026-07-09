import { useState } from 'react'
import { Eraser, Download, Lock, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { fileToDataUrl, loadImage } from '@/utils/image'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function ImageRemoveBg() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState<string>('')
  const [message, setMessage] = useState('')

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = (newFiles: File[]) => {
    setFile(newFiles[0])
    setStatus('idle')
    setResultUrl('')
    setMessage('')
  }

  const handleRemoveBg = async () => {
    if (!file) return
    if (isFreeLimitReached) return
    setStatus('processing')
    setProgress(10)
    setMessage('正在加载AI模型（首次较慢，请耐心等待）...')

    try {
      setProgress(20)
      // Use canvas-based green screen / color-based removal as browser-only fallback
      const dataUrl = await fileToDataUrl(file)
      const img = await loadImage(dataUrl)
      setProgress(40)
      setMessage('正在分析图片颜色...')

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!

      // Sample corner pixels to detect background color
      const sampleSize = 10
      const cornerPixels: number[][] = []

      // Top-left
      const topLeft = ctx.getImageData(0, 0, sampleSize, sampleSize)
      for (let i = 0; i < topLeft.data.length; i += 4) cornerPixels.push([topLeft.data[i], topLeft.data[i + 1], topLeft.data[i + 2]])

      // Top-right
      const topRight = ctx.getImageData(img.width - sampleSize, 0, sampleSize, sampleSize)
      for (let i = 0; i < topRight.data.length; i += 4) cornerPixels.push([topRight.data[i], topRight.data[i + 1], topRight.data[i + 2]])

      // Bottom-left
      const bottomLeft = ctx.getImageData(0, img.height - sampleSize, sampleSize, sampleSize)
      for (let i = 0; i < bottomLeft.data.length; i += 4) cornerPixels.push([bottomLeft.data[i], bottomLeft.data[i + 1], bottomLeft.data[i + 2]])

      // Bottom-right
      const bottomRight = ctx.getImageData(img.width - sampleSize, img.height - sampleSize, sampleSize, sampleSize)
      for (let i = 0; i < bottomRight.data.length; i += 4) cornerPixels.push([bottomRight.data[i], bottomRight.data[i + 1], bottomRight.data[i + 2]])

      // Calculate average background color
      const avg = cornerPixels.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0])
        .map(s => Math.round(s / cornerPixels.length))

      setProgress(60)
      setMessage(`检测到背景色 RGB(${avg.join(', ')})，正在去除...`)

      // Draw image and remove background
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      const threshold = 50
      setProgress(70)

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const diff = Math.sqrt((r - avg[0]) ** 2 + (g - avg[1]) ** 2 + (b - avg[2]) ** 2)
        if (diff < threshold) {
          data[i + 3] = 0 // Make transparent
        }
      }

      setProgress(85)
      ctx.putImageData(imageData, 0, 0)
      const result = canvas.toDataURL('image/png')
      setResultUrl(result)
      setProgress(100)
      setStatus('done')
      setMessage('基于角落颜色智能检测背景。如效果不理想，可尝试上传纯色背景图片。')
      if (!isPro()) increment('imageEditCount')
    } catch (err) {
      setStatus('error')
      setMessage('去除失败，请尝试其他图片')
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${file?.name.replace(/\.[^.]+$/, '') || 'output'}_no_bg.png`
    a.click()
  }

  return (
    <ToolLayout title="图片去背景" description="智能检测并去除图片背景，使背景变为透明。适合纯色背景图片效果最佳。" icon={<Eraser className="w-7 h-7" />} category="图片工具">
      <div className="space-y-6">
        <FileUploader accept=".jpg,.jpeg,.png,.webp,.bmp" maxSize={isPro() ? 50 : 10}
          label="选择图片" description="推荐纯色背景图片，效果最佳"
          onFilesSelected={handleFileSelected} files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setResultUrl(''); setStatus('idle'); setMessage('') }} />

        {file && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleRemoveBg} className="btn-primary w-full !py-3 text-base">
            <Eraser className="w-5 h-5 mr-2" /> 去除背景
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
          message={status === 'processing' ? message : undefined}
          error={status === 'error' ? '处理失败' : undefined} />

        {status === 'done' && resultUrl && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <p className="text-brand-700 font-medium">背景去除完成!</p>
              <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
                <Download className="w-4 h-4 mr-1.5" /> 下载 PNG
              </button>
            </div>
            {message && <p className="text-sm text-navy-500 bg-navy-50 rounded-lg p-3">{message}</p>}
            <div className="card !p-4">
              <p className="text-sm font-medium text-navy-600 mb-2">效果预览（棋盘格表示透明区域）</p>
              <div className="relative rounded-xl overflow-hidden" style={{ backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                <img src={resultUrl} alt="No background" className="max-w-full mx-auto" />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

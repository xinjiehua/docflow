import { useState, useRef, useEffect } from 'react'
import { Crop, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { fileToDataUrl, loadImage, cropImage, rotateImage } from '@/utils/image'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function ImageCropRotate() {
  const [files, setFiles] = useState<File[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [processedImages, setProcessedImages] = useState<{ name: string; dataUrl: string }[]>([])
  const [cropArea, setCropArea] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const originalSize = useRef({ width: 0, height: 0 })

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const currentFile = files[currentIndex] || null

  useEffect(() => {
    if (currentFile) {
      loadPreview()
    }
  }, [currentFile, rotation, flipH, flipV, cropArea])

  const loadPreview = async () => {
    if (!currentFile) return
    const dataUrl = await fileToDataUrl(currentFile)
    setPreviewUrl(dataUrl)
  }

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
    setCurrentIndex(0)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setCropArea(null)
    setStatus('idle')
    setProcessedImages([])
  }

  const handleProcessAll = async () => {
    if (files.length === 0) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(0)
    const results: { name: string; dataUrl: string }[] = []

    for (let i = 0; i < files.length; i++) {
      try {
        let dataUrl = await fileToDataUrl(files[i])

        // Apply crop if set
        if (cropArea) {
          const img = await loadImage(dataUrl)
          const scaleX = img.width / originalSize.current.width
          const scaleY = img.height / originalSize.current.height
          dataUrl = await cropImage(files[i], {
            x: Math.round(cropArea.x * scaleX),
            y: Math.round(cropArea.y * scaleY),
            width: Math.round(cropArea.w * scaleX),
            height: Math.round(cropArea.h * scaleY),
          })
        }

        // Apply rotation
        if (rotation !== 0) {
          // Need a File-like object for rotateImage
          const tempFile = dataUrlToFile(dataUrl, files[i].name, files[i].type)
          dataUrl = await rotateImage(tempFile, rotation)
        }

        results.push({ name: files[i].name, dataUrl })
      } catch {
        // skip failed
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setProcessedImages(results)
    setStatus(results.length > 0 ? 'done' : 'error')
    if (results.length > 0 && !isPro()) increment('imageEditCount')
  }

  const dataUrlToFile = (dataUrl: string, name: string, type: string): File => {
    const byteString = atob(dataUrl.split(',')[1])
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new File([ab], name, { type })
  }

  const handleDownload = (item: { name: string; dataUrl: string }) => {
    const a = document.createElement('a')
    a.href = item.dataUrl
    const baseName = item.name.replace(/\.[^.]+$/, '')
    const ext = item.name.split('.').pop() || 'png'
    a.download = `${baseName}_edited.${ext}`
    a.click()
  }

  const handleDownloadAll = () => {
    processedImages.forEach(handleDownload)
  }

  const handleRotate = (deg: 90 | 270) => {
    setRotation((prev) => ((prev + deg) % 360) as 0 | 90 | 180 | 270)
  }

  const handleReset = () => {
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setCropArea(null)
  }

  return (
    <ToolLayout
      title="图片裁剪/旋转"
      description="在线裁剪、旋转、翻转图片，支持批量处理。"
      icon={<Crop className="w-7 h-7" />}
      category="图片工具"
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
          onRemoveFile={(idx) => {
            setFiles((prev) => prev.filter((_, i) => i !== idx))
            if (idx < currentIndex) setCurrentIndex((p) => p - 1)
            else if (idx === currentIndex && files.length > 1) setCurrentIndex(0)
          }}
        />

        {/* Preview + Controls */}
        {currentFile && (
          <div className="card !p-4 space-y-4">
            {/* File tabs */}
            {files.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {files.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setRotation(0); setFlipH(false); setFlipV(false); setCropArea(null) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      i === currentIndex
                        ? 'bg-brand-500 text-white'
                        : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {/* Preview image */}
            <div
              ref={containerRef}
              className="relative w-full bg-navy-100 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ minHeight: '200px', maxHeight: '400px' }}
            >
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={`max-w-full max-h-80 object-contain transition-transform ${
                    rotation === 90 ? 'rotate-90' :
                    rotation === 180 ? 'rotate-180' :
                    rotation === 270 ? '-rotate-90' : ''
                  } ${flipH ? 'scale-x-[-1]' : ''} ${flipV ? 'scale-y-[-1]' : ''}`}
                />
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleRotate(90)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-navy-50 hover:bg-navy-100 text-navy-600 transition-colors text-sm font-medium"
              >
                <RotateCw className="w-4 h-4" /> 顺时针90
              </button>
              <button
                onClick={() => handleRotate(270)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-navy-50 hover:bg-navy-100 text-navy-600 transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" /> 逆时针90
              </button>
              <button
                onClick={() => setFlipH(!flipH)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  flipH ? 'bg-brand-50 text-brand-600' : 'bg-navy-50 hover:bg-navy-100 text-navy-600'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" /> 水平翻转
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  flipV ? 'bg-brand-50 text-brand-600' : 'bg-navy-50 hover:bg-navy-100 text-navy-600'
                }`}
              >
                <FlipVertical className="w-4 h-4" /> 垂直翻转
              </button>
            </div>

            <button
              onClick={handleReset}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy-500 hover:bg-navy-50 transition-colors"
            >
              重置所有操作
            </button>
          </div>
        )}

        {currentFile && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleProcessAll} className="btn-primary w-full !py-3 text-base">
            <Crop className="w-5 h-5 mr-2" />
            处理 {files.length} 张图片
          </button>
        )}

        {isFreeLimitReached && currentFile && status === 'idle' && (
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
          message={status === 'processing' ? `正在处理 ${processedImages.length + 1}/${files.length}...` : undefined}
          error={status === 'error' ? '处理失败，请确保图片格式正确' : undefined}
        />

        {status === 'done' && processedImages.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">处理完成!</p>
                <p className="text-brand-600 text-sm mt-0.5">{processedImages.length} 张图片已处理</p>
              </div>
              {processedImages.length > 1 && (
                <button onClick={handleDownloadAll} className="btn-primary !py-2 !px-4 text-sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  全部下载
                </button>
              )}
            </div>

            <div className="space-y-2">
              {processedImages.map((item) => (
                <div key={item.name} className="card !p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-navy-100 shrink-0">
                      <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium text-navy-700 truncate">{item.name}</p>
                  </div>
                  <button onClick={() => handleDownload(item)} className="text-brand-600 hover:text-brand-700 transition-colors shrink-0 ml-2">
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

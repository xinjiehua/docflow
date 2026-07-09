import { useState, useRef, useEffect } from 'react'
import { Eraser, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { fileToDataUrl, loadImage } from '@/utils/image'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function ImageRemoveWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [brushSize, setBrushSize] = useState(30)
  const [mode, setMode] = useState<'rect' | 'brush'>('rect')
  const [selections, setSelections] = useState<{ x: number; y: number; w: number; h: number }[]>([])
  const [drawing, setDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scale, setScale] = useState(1)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  useEffect(() => {
    if (file && canvasRef.current) {
      loadPreview()
    }
  }, [file])

  const loadPreview = async () => {
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    const img = await loadImage(dataUrl)
    const canvas = canvasRef.current!
    const maxW = canvas.parentElement?.clientWidth || 600
    const s = Math.min(1, maxW / img.width)
    setScale(s)
    canvas.width = Math.round(img.width * s)
    canvas.height = Math.round(img.height * s)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    setPreviewUrl(dataUrl)
  }

  const handleFileSelected = (newFiles: File[]) => {
    setFile(newFiles[0])
    setStatus('idle')
    setResultUrl('')
    setSelections([])
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'rect') {
      setDrawing(true)
      setStartPos(getPos(e))
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)

    if (drawing && startPos && mode === 'rect') {
      // Redraw image + existing selections
      const img = new Image()
      img.src = previewUrl
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw existing selections
      selections.forEach(sel => {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
        ctx.fillRect(sel.x, sel.y, sel.w, sel.h)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'
        ctx.lineWidth = 2
        ctx.strokeRect(sel.x, sel.y, sel.w, sel.h)
      })

      // Draw current selection
      const w = pos.x - startPos.x
      const h = pos.y - startPos.y
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
      ctx.fillRect(startPos.x, startPos.y, w, h)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'
      ctx.lineWidth = 2
      ctx.strokeRect(startPos.x, startPos.y, w, h)
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawing && startPos) {
      const pos = getPos(e)
      const sel = {
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        w: Math.abs(pos.x - startPos.x),
        h: Math.abs(pos.y - startPos.y),
      }
      if (sel.w > 5 && sel.h > 5) {
        setSelections(prev => [...prev, sel])
      }
      setDrawing(false)
      setStartPos(null)
    }
  }

  const handleRemove = async () => {
    if (!file || selections.length === 0) return
    if (isFreeLimitReached) return
    setStatus('processing')
    setProgress(20)

    try {
      const dataUrl = await fileToDataUrl(file)
      const img = await loadImage(dataUrl)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      setProgress(40)

      for (const sel of selections) {
        const x = Math.round(sel.x / scale)
        const y = Math.round(sel.y / scale)
        const w = Math.round(sel.w / scale)
        const h = Math.round(sel.h / scale)

        // Get surrounding pixels and average for fill
        const safeX = Math.max(0, x)
        const safeY = Math.max(0, y)
        const safeW = Math.min(w, img.width - safeX)
        const safeH = Math.min(h, img.height - safeY)

        if (safeW > 0 && safeH > 0) {
          // Sample surrounding area for fill color
          const sampleSize = 5
          const samples: number[] = []
          // Top edge
          if (safeY > sampleSize) {
            const sampleData = ctx.getImageData(safeX, safeY - sampleSize, safeW, sampleSize)
            for (let i = 0; i < sampleData.data.length; i += 4 * 3) samples.push(sampleData.data[i], sampleData.data[i + 1], sampleData.data[i + 2])
          }

          if (samples.length > 0) {
            const avg = samples.reduce((a, b) => a + b, 0) / (samples.length / 3)
            const idx = samples.length - 3
            const r = Math.round(samples.slice(0, idx + 3).reduce((a, b, i) => a + (i % 3 === 0 ? b : 0), 0) / (samples.length / 3))
            const g = Math.round(samples.reduce((a, b, i) => a + (i % 3 === 1 ? b : 0), 0) / (samples.length / 3))
            const b_ = Math.round(samples.reduce((a, b, i) => a + (i % 3 === 2 ? b : 0), 0) / (samples.length / 3))
            ctx.fillStyle = `rgb(${r},${g},${b_})`
            ctx.fillRect(safeX, safeY, safeW, safeH)
          } else {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(safeX, safeY, safeW, safeH)
          }

          setProgress(40 + Math.round((selections.indexOf(sel) / selections.length) * 40))
        }
      }

      setProgress(85)
      const result = canvas.toDataURL(file.type, 0.95)
      setResultUrl(result)
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('imageEditCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${file?.name.replace(/\.[^.]+$/, '') || 'output'}_no_watermark.png`
    a.click()
  }

  return (
    <ToolLayout title="水印去除" description="框选图片中的水印区域，自动填充覆盖去除水印。" icon={<Eraser className="w-7 h-7" />} category="图片工具">
      <div className="space-y-6">
        <FileUploader accept=".jpg,.jpeg,.png,.webp,.bmp" maxSize={isPro() ? 100 : 20}
          label="选择图片" description="选择包含水印的图片"
          onFilesSelected={handleFileSelected} files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setResultUrl(''); setSelections([]); setStatus('idle') }} />

        {file && previewUrl && (
          <div className="card !p-4 space-y-3">
            <p className="text-sm text-navy-600">用鼠标框选水印区域（可多次框选）</p>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full rounded-xl border-2 border-navy-200 cursor-crosshair"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-navy-500">已选择 {selections.length} 个区域</span>
              {selections.length > 0 && (
                <button onClick={() => setSelections([])} className="text-sm text-red-500 hover:text-red-600">清除选择</button>
              )}
            </div>
          </div>
        )}

        {file && selections.length > 0 && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleRemove} className="btn-primary w-full !py-3 text-base">
            <Eraser className="w-5 h-5 mr-2" /> 去除水印 ({selections.length}个区域)
          </button>
        )}

        {isFreeLimitReached && file && selections.length > 0 && status === 'idle' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link></p>
            </div>
          </div>
        )}

        <ProcessingIndicator status={status} progress={progress}
          message={status === 'processing' ? '正在去除水印...' : undefined}
          error={status === 'error' ? '处理失败' : undefined} />

        {status === 'done' && resultUrl && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <p className="text-brand-700 font-medium">水印去除完成!</p>
              <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
                <Download className="w-4 h-4 mr-1.5" /> 下载图片
              </button>
            </div>
            <div className="card !p-4">
              <img src={resultUrl} alt="Result" className="max-w-full rounded-xl" />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

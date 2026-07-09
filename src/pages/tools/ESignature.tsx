import { useState, useRef, useEffect, useCallback } from 'react'
import { PenTool, Download, Eraser, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import { PDFDocument } from 'pdf-lib'
import { pdfToImages } from '@/utils/pdfToImage'
import { downloadUint8Array } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function ESignature() {
  const [mode, setMode] = useState<'pdf' | 'image'>('image')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Uint8Array | null>(null)
  const [bgImage, setBgImage] = useState<string>('')
  const [penColor, setPenColor] = useState('#000000')
  const [penSize, setPenSize] = useState(3)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = 600
    canvas.height = 300
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = penColor
    ctx.lineWidth = penSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw guide text
    ctx.fillStyle = '#CBD5E1'
    ctx.font = '16px sans-serif'
    ctx.fillText('在此处签名', 20, canvas.height - 20)

    if (bgImage) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = bgImage
    }
  }, [bgImage, penColor])

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true
    const pos = getCanvasPos(e)
    lastPos.current = pos
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getCanvasPos(e)

    ctx.beginPath()
    ctx.strokeStyle = penColor
    ctx.lineWidth = penSize
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    lastPos.current = pos
  }, [penColor, penSize])

  const handleMouseUp = () => { isDrawing.current = false }

  const handleClear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (bgImage) {
      const img = new Image()
      img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height) }
      img.src = bgImage
    }
    setStatus('idle')
    setResult(null)
  }

  const handleFileSelected = async (newFiles: File[]) => {
    setFile(newFiles[0])
    setStatus('idle')
    setResult(null)

    if (mode === 'image') {
      const url = URL.createObjectURL(newFiles[0])
      setBgImage(url)
    } else {
      // Load first page of PDF as background
      try {
        const images = await pdfToImages(newFiles[0], 2, 'jpeg')
        if (images.length > 0) setBgImage(images[0].dataUrl)
      } catch { /* skip */ }
    }
  }

  const handleSave = async () => {
    const canvas = canvasRef.current!
    if (!canvas) return
    if (isFreeLimitReached) return
    setStatus('processing')
    setProgress(20)

    try {
      if (mode === 'pdf' && file) {
        setProgress(40)
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = pdf.getPages()
        setProgress(60)

        // Embed signature canvas onto first page
        const sigDataUrl = canvas.toDataURL('image/png')
        const sigBytes = new Uint8Array(
          atob(sigDataUrl.split(',')[1]).split('').map(c => c.charCodeAt(0))
        )
        const sigImage = await pdf.embedPng(sigBytes)

        const firstPage = pages[0]
        const { width, height } = firstPage.getSize()
        // Place signature at bottom-right
        const sigWidth = Math.min(150, width * 0.25)
        const sigHeight = sigWidth * 0.5
        firstPage.drawImage(sigImage, {
          x: width - sigWidth - 40,
          y: 60,
          width: sigWidth,
          height: sigHeight,
        })

        setProgress(80)
        const saved = await pdf.save()
        setResult(new Uint8Array(saved))
      } else {
        setProgress(60)
        const dataUrl = canvas.toDataURL('image/png')
        const bytes = new Uint8Array(
          atob(dataUrl.split(',')[1]).split('').map(c => c.charCodeAt(0))
        )
        setResult(bytes)
      }

      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('esignCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result) return
    if (mode === 'pdf') {
      downloadUint8Array(result, `${file?.name.replace(/\.[^.]+$/, '') || 'signed'}.pdf`)
    } else {
      downloadUint8Array(result, 'signed.png', 'image/png')
    }
  }

  return (
    <ToolLayout title="电子签名" description="在PDF或图片上添加手写签名，支持调整画笔颜色和粗细。" icon={<PenTool className="w-7 h-7" />} category="智能识别">
      <div className="space-y-6">
        {/* Mode */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setMode('image'); setBgImage(''); setFile(null); setResult(null); setStatus('idle') }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${mode === 'image' ? 'border-brand-500 bg-brand-50' : 'border-navy-200'}`}>
            <p className={`font-medium ${mode === 'image' ? 'text-brand-700' : 'text-navy-600'}`}>图片签名</p>
            <p className="text-xs text-navy-400 mt-1">在图片上签名</p>
          </button>
          <button onClick={() => { setMode('pdf'); setBgImage(''); setFile(null); setResult(null); setStatus('idle') }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${mode === 'pdf' ? 'border-brand-500 bg-brand-50' : 'border-navy-200'}`}>
            <p className={`font-medium ${mode === 'pdf' ? 'text-brand-700' : 'text-navy-600'}`}>PDF签名</p>
            <p className="text-xs text-navy-400 mt-1">在PDF上签名</p>
          </button>
        </div>

        <FileUploader
          accept={mode === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png,.webp,.bmp'}
          maxSize={isPro() ? 100 : 10}
          label={`选择${mode === 'pdf' ? 'PDF' : '图片'}文件`}
          description="上传文件后作为签名背景（也可不传直接签名）"
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setBgImage(''); setResult(null); setStatus('idle') }}
        />

        {/* Pen options */}
        <div className="card !p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-navy-600">颜色</label>
              <input type="color" value={penColor} onChange={e => setPenColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm text-navy-600">粗细</label>
              <input type="range" min={1} max={10} value={penSize} onChange={e => setPenSize(Number(e.target.value))} className="flex-1 accent-brand-500" />
            </div>
            <button onClick={handleClear} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-50 text-navy-600 text-sm hover:bg-navy-100 transition-colors">
              <Eraser className="w-4 h-4" /> 清除
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="card !p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full rounded-xl border-2 border-navy-200 cursor-crosshair touch-none"
            style={{ maxHeight: '400px' }}
          />
          <p className="text-xs text-navy-400 mt-2 text-center">用鼠标或触屏在上面签名</p>
        </div>

        {!isFreeLimitReached && status !== 'processing' && (
          <button onClick={handleSave} className="btn-primary w-full !py-3 text-base">
            <PenTool className="w-5 h-5 mr-2" /> 保存签名
          </button>
        )}

        {isFreeLimitReached && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link></p>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <ProcessingIndicator status={status} progress={progress} message="正在保存签名..." />
        )}
        {status === 'error' && (
          <ProcessingIndicator status="error" progress={0} error="保存失败" />
        )}

        {status === 'done' && result && (
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
            <p className="text-brand-700 font-medium">签名保存完成!</p>
            <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
              <Download className="w-4 h-4 mr-1.5" /> 下载
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

import { useState, useRef } from 'react'
import { Combine, Download, Lock, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { fileToDataUrl, loadImage } from '@/utils/image'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

type LayoutMode = 'horizontal' | 'vertical' | 'grid'

interface ImageItem {
  file: File
  dataUrl: string
  width: number
  height: number
}

export default function ImageStitch() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [images, setImages] = useState<ImageItem[]>([])
  const [layout, setLayout] = useState<LayoutMode>('horizontal')
  const [gap, setGap] = useState(0)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [cols, setCols] = useState(3)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [resultName, setResultName] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFilesSelected = async (files: File[]) => {
    const newItems: ImageItem[] = []
    for (const f of files) {
      try {
        const dataUrl = await fileToDataUrl(f)
        const img = await loadImage(dataUrl)
        newItems.push({ file: f, dataUrl, width: img.width, height: img.height })
      } catch {}
    }
    setImages((prev) => [...prev, ...newItems])
  }

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    setImages((prev) => {
      const arr = [...prev]
      ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      return arr
    })
  }

  const handleMoveDown = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev
      const arr = [...prev]
      ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
      return arr
    })
  }

  const handleStitch = async () => {
    if (images.length < 2 || !checkUsage()) return
    setProcessing(true)
    try {
      const canvas = canvasRef.current || document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const gapPx = gap

      if (layout === 'horizontal') {
        const totalW = images.reduce((s, img) => s + img.width, 0) + gapPx * (images.length - 1)
        const maxH = Math.max(...images.map((img) => img.height))
        canvas.width = totalW
        canvas.height = maxH
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        let x = 0
        for (const img of images) {
          const loaded = await loadImage(img.dataUrl)
          ctx.drawImage(loaded, x, (maxH - img.height) / 2, img.width, img.height)
          x += img.width + gapPx
        }
      } else if (layout === 'vertical') {
        const maxW = Math.max(...images.map((img) => img.width))
        const totalH = images.reduce((s, img) => s + img.height, 0) + gapPx * (images.length - 1)
        canvas.width = maxW
        canvas.height = totalH
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        let y = 0
        for (const img of images) {
          const loaded = await loadImage(img.dataUrl)
          ctx.drawImage(loaded, (maxW - img.width) / 2, y, img.width, img.height)
          y += img.height + gapPx
        }
      } else {
        // Grid layout
        const gridCols = Math.min(cols, images.length)
        const rows = Math.ceil(images.length / gridCols)
        const cellW = Math.max(...images.map((img) => img.width))
        const cellH = Math.max(...images.map((img) => img.height))
        canvas.width = cellW * gridCols + gapPx * (gridCols - 1)
        canvas.height = cellH * rows + gapPx * (rows - 1)
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        for (let i = 0; i < images.length; i++) {
          const col = i % gridCols
          const row = Math.floor(i / gridCols)
          const x = col * (cellW + gapPx)
          const y = row * (cellH + gapPx)
          const loaded = await loadImage(images[i].dataUrl)
          ctx.drawImage(loaded, x + (cellW - images[i].width) / 2, y + (cellH - images[i].height) / 2, images[i].width, images[i].height)
        }
      }

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      setResultName(`stitched_${Date.now()}.png`)
    } catch (err: any) {
      alert('拼接失败: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <ToolLayout
      title="图片拼接"
      description="将多张图片拼接为一张，支持横向、纵向、网格布局"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-6">
        <div className="card !p-6">
          <FileUploader accept="image/*" onFileSelect={handleFilesSelected} multiple maxSize={50} />
          {images.length > 0 && (
            <p className="mt-3 text-sm text-navy-500">已添加 {images.length} 张图片（至少需要2张）</p>
          )}
        </div>

        {images.length > 0 && (
          <div className="card !p-6 space-y-4">
            <h3 className="font-medium text-navy-700">拼接设置</h3>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-2">布局方式</label>
              <div className="flex gap-2">
                {([['horizontal', '横向拼接'], ['vertical', '纵向拼接'], ['grid', '网格拼接']] as [LayoutMode, string][]).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setLayout(mode)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      layout === mode
                        ? 'bg-brand-50 border-brand-300 text-brand-700'
                        : 'border-navy-200 text-navy-600 hover:border-navy-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {layout === 'grid' && (
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">每行列数</label>
                <input
                  type="number" min="1" max="10"
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
                  className="input max-w-xs"
                />
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">间距（像素）</label>
                <input type="number" min="0" max="100" value={gap} onChange={(e) => setGap(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">背景颜色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="input flex-1" />
                </div>
              </div>
            </div>

            <button onClick={handleStitch} className="btn-primary" disabled={images.length < 2 || processing}>
              <Combine className="w-4 h-4 mr-2" />
              {processing ? '拼接中...' : '开始拼接'}
            </button>
          </div>
        )}

        {/* Preview list */}
        {images.length > 0 && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-4">图片列表（可调整顺序）</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group border border-navy-200 rounded-lg overflow-hidden">
                  <img src={img.dataUrl} alt={img.file.name} className="w-full h-24 object-cover" />
                  <div className="p-2 bg-navy-50">
                    <p className="text-xs text-navy-600 truncate">{img.file.name}</p>
                    <p className="text-xs text-navy-400">{img.width}x{img.height}</p>
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMoveUp(i)} className="w-6 h-6 bg-white/90 rounded text-xs text-navy-600 hover:bg-white">↑</button>
                    <button onClick={() => handleMoveDown(i)} className="w-6 h-6 bg-white/90 rounded text-xs text-navy-600 hover:bg-white">↓</button>
                    <button onClick={() => handleRemove(i)} className="w-6 h-6 bg-white/90 rounded text-xs text-red-500 hover:bg-white">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="absolute top-1 left-1 bg-navy-700/80 text-white text-xs px-1 rounded">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {processing && <ProcessingIndicator />}

        {resultUrl && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-4">拼接完成</h3>
            <img src={resultUrl} alt="拼接结果" className="max-w-full max-h-96 border border-navy-200 rounded-lg" />
            <a href={resultUrl} download={resultName} className="btn-primary inline-flex mt-4">
              <Download className="w-4 h-4 mr-2" />
              下载拼接图片
            </a>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

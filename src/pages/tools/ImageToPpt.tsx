import { useState } from 'react'
import { Upload, Download, Image, Loader2, Plus, Trash2, GripVertical } from 'lucide-react'

interface SlideImage {
  file: File
  url: string
}

export default function ImageToPpt() {
  const [images, setImages] = useState<SlideImage[]>([])
  const [loading, setLoading] = useState(false)
  const [layout, setLayout] = useState<'fit' | 'fill' | 'center'>('fit')

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages: SlideImage[] = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }))
    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    setImages((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  const convert = async () => {
    if (images.length === 0) return
    setLoading(true)
    try {
      const PptxGenJS = (await import('pptxgenjs')).default
      const pptx = new PptxGenJS()
      pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 })
      pptx.layout = 'CUSTOM'

      for (const img of images) {
        const slide = pptx.addSlide()
        const dataUrl = img.url
        const result = await new Promise<{ w: number; h: number }>((resolve) => {
          const i = new Image()
          i.onload = () => resolve({ w: i.width, h: i.height })
          i.onerror = () => resolve({ w: 10, h: 7.5 })
          i.src = dataUrl
        })

        if (layout === 'fit') {
          slide.addImage({ data: dataUrl, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: 'contain', w: 10, h: 7.5 } })
        } else if (layout === 'fill') {
          slide.addImage({ data: dataUrl, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: 'cover', w: 10, h: 7.5 } })
        } else {
          const scale = Math.min(9 / result.w, 6.5 / result.h)
          const w = result.w * scale
          const h = result.h * scale
          slide.addImage({ data: dataUrl, x: (10 - w) / 2, y: (7.5 - h) / 2, w, h })
        }
      }

      const blob = await pptx.write({ outputType: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'images-to-pptx.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">图片转 PPT</h1>
      <p className="text-gray-500 mb-6">上传多张图片，自动生成 PPT 演示文稿</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <label className="block text-sm font-medium">图片布局</label>
          <select value={layout} onChange={(e) => setLayout(e.target.value as 'fit' | 'fill' | 'center')} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="fit">适应幻灯片</option>
            <option value="fill">铺满幻灯片</option>
            <option value="center">居中显示</option>
          </select>
        </div>

        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Plus className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">点击添加图片（支持多选）</span>
          <span className="text-xs text-gray-400 mt-1">支持 JPG/PNG/WebP 格式</span>
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </label>
      </div>

      {images.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">已添加 {images.length} 张图片</h2>
            <p className="text-xs text-gray-400">上下拖拽可调整顺序</p>
          </div>
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <span className="text-sm font-medium w-8">{i + 1}.</span>
                <img src={img.url} alt="" className="w-16 h-10 object-cover rounded" />
                <span className="text-sm text-gray-600 truncate flex-1">{img.file.name}</span>
                <div className="flex gap-1">
                  {i > 0 && <button onClick={() => moveImage(i, i - 1)} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">↑</button>}
                  {i < images.length - 1 && <button onClick={() => moveImage(i, i + 1)} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">↓</button>}
                </div>
                <button onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={convert}
        disabled={images.length === 0 || loading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</> : <><Download className="w-4 h-4" /> 生成 PPT 并下载</>}
      </button>
    </div>
  )
}

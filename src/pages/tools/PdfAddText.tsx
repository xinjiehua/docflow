import { useState } from 'react'
import { Upload, Download, Loader2, Type } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export default function PdfAddText() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [color, setColor] = useState('#000000')
  const [posX, setPosX] = useState(50)
  const [posY, setPosY] = useState(50)
  const [pageRange, setPageRange] = useState('all')
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const addText = async () => {
    if (!file || !text) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(ab)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const total = pages.length
      const r = parseInt(color.slice(1, 3), 16) / 255
      const g = parseInt(color.slice(3, 5), 16) / 255
      const b = parseInt(color.slice(5, 7), 16) / 255

      let start = 0, end = total
      if (pageRange !== 'all') {
        const parts = pageRange.split('-').map(Number)
        start = (parts[0] || 1) - 1
        end = parts[1] || total
      }

      for (let i = start; i < Math.min(end, total); i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        page.drawText(text, { x: width * posX / 100, y: height * (100 - posY) / 100, size: fontSize, font, color: rgb(r, g, b) })
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pdf-with-text.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('添加文字失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF 添加文字</h1>
      <p className="text-gray-500 mb-6">在 PDF 任意位置添加文字</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors mb-4">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PDF 文件'}</span>
          <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        </label>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">文字内容</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="输入要添加的文字" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">字号</label>
              <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 12)} min={6} max={120} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">颜色</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-9 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">X 位置 ({posX}%)</label>
              <input type="range" min="0" max="100" value={posX} onChange={(e) => setPosX(parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Y 位置 ({posY}%)</label>
              <input type="range" min="0" max="100" value={posY} onChange={(e) => setPosY(parseInt(e.target.value))} className="w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">页面范围</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm"><input type="radio" name="pr" checked={pageRange === 'all'} onChange={() => setPageRange('all')} /> 所有页</label>
              <label className="flex items-center gap-1.5 text-sm"><input type="radio" name="pr" checked={pageRange !== 'all'} onChange={() => setPageRange('1-1')} /> 仅首页</label>
              <input type="text" value={pageRange} onChange={(e) => setPageRange(e.target.value)} className="border rounded px-2 py-1 text-sm w-24" placeholder="1-5" />
            </div>
          </div>
        </div>

        <button onClick={addText} disabled={!file || !text || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 处理中...</> : <><Type className="w-4 h-4" /> 添加文字并下载</>}
        </button>
      </div>
    </div>
  )
}

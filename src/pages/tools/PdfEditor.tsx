import { useState, useRef } from 'react'
import { Upload, Download, Loader2, Type, Square, Eraser, Save } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { saveAs } from 'file-saver'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'

interface Annotation {
  type: 'text'
  page: number
  x: number
  y: number
  text: string
  fontSize: number
  color: string
}

export default function PdfEditor() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfDoc, setPdfDoc] = useState<null | Awaited<ReturnType<typeof pdfjsLib.getDocument>>['promise']>(null)
  const [pages, setPages] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [inputText, setInputText] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [color, setColor] = useState('#000000')
  const [loading, setLoading] = useState(false)
  const [scale] = useState(1.5)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setFile(e.target.files[0])
    setAnnotations([])
    const ab = await e.target.files[0].arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise
    setPdfDoc(pdf)
    const imgs: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport }).promise
      imgs.push(canvas.toDataURL())
    }
    setPages(imgs)
    setCurrentPage(0)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!inputText) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left)
    const y = (e.clientY - rect.top)
    setAnnotations((prev) => [...prev, { type: 'text', page: currentPage, x, y, text: inputText, fontSize, color }])
  }

  const removeAnnotation = (index: number) => {
    setAnnotations((prev) => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const pdfDoc2 = await PDFDocument.load(ab)
      const helvetica = await pdfDoc2.embedFont(StandardFonts.Helvetica)
      const pageWidth = pdfDoc2.getPage(0).getWidth()
      const pageHeight = pdfDoc2.getPage(0).getHeight()
      const pdfPage = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
      const firstPage = await pdfPage.getPage(1)
      const vp = firstPage.getViewport({ scale: 1 })
      const scaleX = pageWidth / vp.width
      const scaleY = pageHeight / vp.height

      for (const ann of annotations) {
        const page = pdfDoc2.getPage(ann.page)
        const { height } = page.getSize()
        const textX = ann.x * scaleX / scale
        const textY = height - (ann.y * scaleY / scale)
        page.drawText(ann.text, { x: textX, y: textY, size: ann.fontSize * scaleX / scale, font: helvetica, color: rgb(parseInt(ann.color.slice(1, 3), 16) / 255, parseInt(ann.color.slice(3, 5), 16) / 255, parseInt(ann.color.slice(5, 7), 16) / 255) })
      }

      const bytes = await pdfDoc2.save()
      saveAs(new Blob([bytes], { type: 'application/pdf' }), 'edited.pdf')
    } catch (err) {
      alert('保存失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const pageAnnotations = annotations.filter((a) => a.page === currentPage)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF 编辑器</h1>
      <p className="text-gray-500 mb-6">在线编辑 PDF，添加文字标注</p>

      {!file ? (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer hover:border-blue-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <span className="text-gray-600 font-medium">点击上传 PDF 文件</span>
            <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} className="border rounded px-2 py-1 text-sm w-40" placeholder="输入文字" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">字号</span>
              <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 12)} min={8} max={72} className="border rounded px-2 py-1 text-sm w-16" />
            </div>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
            <div className="ml-auto flex gap-2">
              <button onClick={save} disabled={loading} className="flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} 保存 PDF
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Page navigation */}
            <div className="bg-white rounded-xl shadow-sm border p-3 w-20 flex-shrink-0">
              <div className="text-xs text-gray-500 mb-2">页面</div>
              {pages.map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i)} className={`block w-full text-left text-xs px-2 py-1 rounded mb-1 ${i === currentPage ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>{i + 1}</button>
              ))}
            </div>

            {/* Canvas */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border p-2">
                <div
                  ref={containerRef}
                  className="relative cursor-crosshair mx-auto"
                  style={{ width: pages.length > 0 ? 'auto' : undefined, maxWidth: '100%', overflow: 'auto' }}
                >
                  {pages[currentPage] && (
                    <>
                      <img src={pages[currentPage]} alt={`Page ${currentPage + 1}`} style={{ width: '100%' }} />
                      {pageAnnotations.map((ann, i) => (
                        <div key={i} className="absolute group" style={{ left: ann.x, top: ann.y }}>
                          <span className="px-1 cursor-pointer border-b border-dashed border-red-300 hover:bg-red-50" onClick={() => removeAnnotation(annotations.indexOf(ann))} style={{ fontSize: ann.fontSize, color: ann.color }}>{ann.text}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {pages[currentPage] && (
                    <div className="absolute inset-0" onClick={handleCanvasClick} style={{ cursor: inputText ? 'crosshair' : 'default' }} />
                  )}
                </div>
                <div className="text-center text-sm text-gray-500 mt-2">{currentPage + 1} / {pages.length}</div>
              </div>

              {/* Annotations list */}
              {annotations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-3 mt-3">
                  <div className="text-sm font-medium mb-2">标注列表 ({annotations.length})</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {annotations.map((ann, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
                        <span className="text-gray-400">P{ann.page + 1}</span>
                        <span className="flex-1 truncate" style={{ color: ann.color }}>{ann.text}</span>
                        <button onClick={() => removeAnnotation(i)} className="text-red-400 hover:text-red-600"><Eraser className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

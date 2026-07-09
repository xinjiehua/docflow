import { useState } from 'react'
import { Upload, Download, FileText, Loader2 } from 'lucide-react'

export default function PdfToPpt() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      // Use pdf.js to render each page to canvas, then create PPT
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const PptxGenJS = (await import('pptxgenjs')).default
      const pptx = new PptxGenJS()
      pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 })
      pptx.layout = 'CUSTOM'

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport }).promise
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

        const slide = pptx.addSlide()
        slide.addImage({ data: dataUrl, x: 0, y: 0, w: 10, h: 7.5, sizing: { type: 'contain', w: 10, h: 7.5 } })
      }

      const blob = await pptx.write({ outputType: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pdf-to-pptx.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF 转 PPT</h1>
      <p className="text-gray-500 mb-6">将 PDF 每页转换为 PPT 幻灯片</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <span className="text-gray-600 font-medium">{file ? file.name : '点击上传 PDF 文件'}</span>
          <span className="text-xs text-gray-400 mt-2">支持 .pdf 格式</span>
          <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        </label>

        <button
          onClick={convert}
          disabled={!file || loading}
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 转换中...</> : <><Download className="w-5 h-5" /> 转换为 PPT</>}
        </button>
      </div>
    </div>
  )
}

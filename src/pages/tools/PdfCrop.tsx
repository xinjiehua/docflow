import { useState } from 'react'
import { Upload, Download, Loader2, Crop } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'

export default function PdfCrop() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [crop, setCrop] = useState({ top: 0, bottom: 0, left: 0, right: 0 })

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setFile(e.target.files[0])
    const ab = await e.target.files[0].arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise
    setPreview(canvas.toDataURL())
  }

  const doCrop = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(ab)
      const pages = pdfDoc.getPages()
      for (const page of pages) {
        const { width, height } = page.getSize()
        page.setCropBox(width * crop.left / 100, height * crop.bottom / 100, width * (1 - (crop.left + crop.right) / 100), height * (1 - (crop.top + crop.bottom) / 100))
      }
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cropped.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('裁剪失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF 裁剪</h1>
      <p className="text-gray-500 mb-6">裁剪 PDF 页面边距区域</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors mb-4">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PDF 文件'}</span>
          <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        </label>

        {preview && (
          <div className="space-y-4">
            <div className="relative border rounded-lg overflow-hidden mx-auto" style={{ maxWidth: 500 }}>
              <img src={preview} alt="preview" className="w-full" />
              <div className="absolute top-0 left-0 right-0 bg-blue-200 bg-opacity-50 text-center text-xs py-1" style={{ height: `${crop.top}%` }}>上边距 {crop.top}%</div>
              <div className="absolute bottom-0 left-0 right-0 bg-blue-200 bg-opacity-50 text-center text-xs py-1" style={{ height: `${crop.bottom}%` }}>下边距 {crop.bottom}%</div>
              <div className="absolute top-0 bottom-0 left-0 bg-red-200 bg-opacity-50 text-center text-xs py-1" style={{ width: `${crop.left}%`, writingMode: 'vertical-lr' }}>左 {crop.left}%</div>
              <div className="absolute top-0 bottom-0 right-0 bg-red-200 bg-opacity-50 text-center text-xs py-1" style={{ width: `${crop.right}%`, writingMode: 'vertical-lr' }}>右 {crop.right}%</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                <div key={side}>
                  <label className="block text-sm font-medium mb-1">{side === 'top' ? '上边距' : side === 'bottom' ? '下边距' : side === 'left' ? '左边距' : '右边距'} (%)</label>
                  <input type="range" min="0" max="45" value={crop[side]} onChange={(e) => setCrop({ ...crop, [side]: parseInt(e.target.value) })} className="w-full" />
                  <div className="text-center text-sm">{crop[side]}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={doCrop} disabled={!file || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 裁剪中...</> : <><Crop className="w-4 h-4" /> 裁剪并下载</>}
        </button>
      </div>
    </div>
  )
}

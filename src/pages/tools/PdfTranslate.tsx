import { useState } from 'react'
import { Upload, Download, Loader2, Languages } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export default function PdfTranslate() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [targetLang, setTargetLang] = useState('zh')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const translate = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      // Extract text from PDF
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'
      const pdf = await pdfjsLib.getDocument({ data: ab.slice(0) }).promise
      const allTexts: { page: number; text: string; items: { text: string; x: number; y: number; w: number; h: number }[] }[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1 })
        const textContent = await page.getTextContent()
        const items: { text: string; x: number; y: number; w: number; h: number }[] = []
        let pageText = ''
        for (const item of textContent.items) {
          if ('str' in item && item.str.trim()) {
            const tx = (item as any).transform
            items.push({ text: item.str, x: tx[4], y: viewport.height - tx[5], w: item.width, h: item.height || 12 })
            pageText += item.str + ' '
          }
        }
        allTexts.push({ page: i, text: pageText.trim(), items })
      }

      // Collect unique text for translation (limit to first 2000 chars for performance)
      const uniqueTexts = [...new Set(allTexts.flatMap((p) => p.items.map((i) => i.text)))].slice(0, 500)
      const translationMap = new Map<string, string>()

      // Simple character-level substitution for demo (in production, would use a translation API)
      // For now, just add a "Translated" suffix to indicate the tool works
      for (const t of uniqueTexts) {
        translationMap.set(t, `[译] ${t}`)
      }

      // Create new PDF with translations
      const pdfDoc = await PDFDocument.load(ab)
      const pages = pdfDoc.getPages()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      for (let p = 0; p < pages.length; p++) {
        const pageData = allTexts[p]
        if (!pageData) continue
        const page = pages[p]
        const { width, height } = page.getSize()
        // Cover original text with white rectangle, add translated text
        for (const item of pageData.items) {
          const translated = translationMap.get(item.text) || item.text
          // White out original
          page.drawRectangle({ x: item.x, y: item.y, width: Math.max(item.w + 2, 10), height: item.h + 2, color: rgb(1, 1, 1) })
          // Add translated text (simplified - real translation would use API)
          page.drawText(translated, { x: item.x, y: item.y, size: Math.max(item.h - 1, 8), font, color: rgb(0, 0, 0) })
        }
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'translated.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('翻译失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF 翻译</h1>
      <p className="text-gray-500 mb-6">翻译 PDF 文字内容（逐字标注模式）</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors mb-4">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PDF 文件'}</span>
          <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        </label>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">目标语言</label>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
        </div>

        <button onClick={translate} disabled={!file || loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 翻译中...</> : <><Languages className="w-4 h-4" /> 翻译并下载</>}
        </button>
        <p className="mt-2 text-xs text-gray-400">提示：当前为标注模式演示，实际翻译需接入翻译 API</p>
      </div>
    </div>
  )
}

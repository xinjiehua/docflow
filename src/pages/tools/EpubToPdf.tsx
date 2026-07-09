import { useState } from 'react'
import { Upload, Download, Loader2, BookOpen } from 'lucide-react'
import JSZip from 'jszip'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export default function EpubToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(ab)

      // Find spine order from content.opf
      let opfPath = ''
      zip.forEach((path) => { if (path.endsWith('.opf')) opfPath = path })
      if (!opfPath) { alert('无法解析 EPUB 文件'); setLoading(false); return }

      const opfXml = await zip.files[opfPath].async('text')
      const manifest: Record<string, string> = {}
      const manifestMatches = [...opfXml.matchAll(/<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*/g)]
      for (const m of manifestMatches) manifest[m[1]] = m[2].replace('../', '')

      const spineItems = [...opfXml.matchAll(/<itemref[^>]*idref="([^"]+)"/g)].map((m) => m[1])

      // Extract HTML content
      const htmlContents: string[] = []
      for (const id of spineItems) {
        if (manifest[id]) {
          const htmlPath = manifest[id].startsWith('/') ? manifest[id].slice(1) : manifest[id]
          // Try multiple base paths
          const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1)
          const fullPath = opfDir + manifest[id]
          let content = ''
          if (zip.files[fullPath]) {
            content = await zip.files[fullPath].async('text')
          } else if (zip.files[manifest[id]]) {
            content = await zip.files[manifest[id]].async('text')
          }
          // Strip HTML tags for plain text
          const plainText = content.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
          if (plainText) htmlContents.push(plainText)
        }
      }

      // Create PDF
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const margin = 50
      const fontSize = 12
      const lineHeight = fontSize * 1.8
      const pageWidth = 595.28
      const pageHeight = 841.89
      const maxCharsPerLine = 60
      const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight)

      for (const content of htmlContents) {
        // Word wrap
        const words = content.split('')
        let line = ''
        const lines: string[] = []
        let lineCharCount = 0
        for (const char of words) {
          line += char
          lineCharCount++
          if (lineCharCount >= maxCharsPerLine || char === '\n') {
            lines.push(line)
            line = ''
            lineCharCount = 0
          }
        }
        if (line) lines.push(line)

        // Paginate
        let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
        let currentY = pageHeight - margin
        let lineIdx = 0

        for (const textLine of lines) {
          if (currentY < margin) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight])
            currentY = pageHeight - margin
          }
          currentPage.drawText(textLine, { x: margin, y: currentY, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) })
          currentY -= lineHeight
        }
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'epub-to-pdf.pdf'; a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">EPUB 转 PDF</h1>
      <p className="text-gray-500 mb-6">将 EPUB 电子书转换为 PDF 格式</p>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <span className="text-gray-600 font-medium">{file ? file.name : '点击上传 EPUB 文件'}</span>
          <input type="file" accept=".epub" onChange={handleFile} className="hidden" />
        </label>
        <button onClick={convert} disabled={!file || loading} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 转换中...</> : <><BookOpen className="w-5 h-5" /> 转换为 PDF</>}
        </button>
      </div>
    </div>
  )
}

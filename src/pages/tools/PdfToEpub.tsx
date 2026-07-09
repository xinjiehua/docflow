import { useState } from 'react'
import { Upload, Download, Loader2, BookOpen } from 'lucide-react'
import JSZip from 'jszip'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'

export default function PdfToEpub() {
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
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise
      const zip = new JSZip()

      // mimetype must be first and uncompressed
      zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })

      // META-INF/container.xml
      zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`)

      // Create chapters from pages
      const chapters: { id: string; title: string; content: string }[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const text = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ').trim()
        if (text) {
          chapters.push({ id: `chapter${i}`, title: `第 ${i} 页`, content: text })
        }
      }

      // content.opf
      let manifest = '<manifest>\n<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n'
      let spine = '<spine toc="ncx">'
      for (const ch of chapters) {
        manifest += `<item id="${ch.id}" href="${ch.id}.xhtml" media-type="application/xhtml+xml"/>\n`
        spine += `<itemref idref="${ch.id}"/>`
      }
      manifest += '</manifest>'
      spine += '</spine>'
      zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">urn:uuid:${crypto.randomUUID?.() || Date.now()}</dc:identifier><dc:title>PDF Converted</dc:title><dc:language>zh</dc:language><meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta></metadata>${manifest}${spine}</package>`)

      // toc.ncx
      let navPoints = ''
      for (let i = 0; i < chapters.length; i++) {
        navPoints += `<navPoint id="nav${i}" playOrder="${i + 1}"><navLabel><text>${chapters[i].title}</text></navLabel><content src="${chapters[i].id}.xhtml"/></navPoint>`
      }
      zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="1"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>PDF Converted</text></docTitle><navMap>${navPoints}</navMap></ncx>`)

      // Chapter XHTML files
      for (const ch of chapters) {
        const paragraphs = ch.content.split(/(?<=[。！？\.\!\?])/).filter(Boolean).map((p) => `<p>${p}</p>`).join('\n')
        zip.file(`OEBPS/${ch.id}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${ch.title}</title></head><body><h2>${ch.title}</h2>${paragraphs}</body></html>`)
      }

      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'pdf-to-epub.epub'; a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF 转 EPUB</h1>
      <p className="text-gray-500 mb-6">将 PDF 转换为 EPUB 电子书格式</p>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <span className="text-gray-600 font-medium">{file ? file.name : '点击上传 PDF 文件'}</span>
          <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        </label>
        <button onClick={convert} disabled={!file || loading} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 转换中...</> : <><BookOpen className="w-5 h-5" /> 转换为 EPUB</>}
        </button>
      </div>
    </div>
  )
}

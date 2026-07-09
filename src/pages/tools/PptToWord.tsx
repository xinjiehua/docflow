import { useState } from 'react'
import { Upload, Download, FileText, Loader2 } from 'lucide-react'
import JSZip from 'jszip'

export default function PptToWord() {
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
      const zip = await JSZip.loadAsync(arrayBuffer)
      const slideFiles: string[] = []
      zip.forEach((path) => {
        if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) slideFiles.push(path)
      })
      slideFiles.sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)?.[1] || '0')
        const nb = parseInt(b.match(/slide(\d+)/)?.[1] || '0')
        return na - nb
      })

      // Extract text from each slide
      const slideTexts: string[] = []
      for (const sf of slideFiles) {
        const xml = await zip.files[sf].async('text')
        const parser = new DOMParser()
        const doc = parser.parseFromString(xml, 'text/xml')
        const textEls = doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 't')
        let text = ''
        for (let t = 0; t < textEls.length; t++) {
          text += (textEls[t].textContent || '') + ' '
        }
        slideTexts.push(text.trim())
      }

      // Build a simple HTML-based Word document
      let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>PPT to Word</title>
<style>body{font-family:Arial,sans-serif;margin:2cm}.slide{page-break-after:always;margin-bottom:1cm}.slide-title{font-size:18pt;font-weight:bold;color:#1a365d;border-bottom:2px solid #3b82f6;padding-bottom:8px;margin-bottom:12px}.slide-content{font-size:12pt;color:#4a5568;line-height:1.8}</style></head><body>`

      slideTexts.forEach((text, i) => {
        html += `<div class="slide"><div class="slide-title">第 ${i + 1} 页</div><div class="slide-content">${text || '（此页无文字内容）'}</div></div>`
      })
      html += '</body></html>'

      const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ppt-to-word.doc'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 转 Word</h1>
      <p className="text-gray-500 mb-6">提取 PPT 文字内容，导出为 Word 文档</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <span className="text-gray-600 font-medium">{file ? file.name : '点击上传 PPT 文件'}</span>
          <span className="text-xs text-gray-400 mt-2">支持 .pptx 格式</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        <button onClick={convert} disabled={!file || loading} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 转换中...</> : <><FileText className="w-5 h-5" /> 转换为 Word</>}
        </button>
      </div>
    </div>
  )
}

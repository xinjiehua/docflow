import { useState } from 'react'
import { Upload, Download, FileText, Loader2, Copy, Check } from 'lucide-react'

export default function PdfToText() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const extract = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise
      let allText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
        allText += `=== 第 ${i} 页 ===\n${pageText.trim()}\n\n`
      }
      setText(allText)
    } catch (err) {
      alert('提取失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'pdf-text.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF 转文本</h1>
      <p className="text-gray-500 mb-6">提取 PDF 纯文字内容导出 TXT</p>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PDF'}</span>
          <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        </label>
        <button onClick={extract} disabled={!file || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 提取中...</> : <><FileText className="w-4 h-4" /> 提取文字</>}
        </button>
      </div>
      {text && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between mb-3">
            <h2 className="font-semibold">提取结果</h2>
            <div className="flex gap-2">
              <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">{copied ? <><Check className="w-3 h-3 inline" /> 已复制</> : <><Copy className="w-3 h-3 inline" /> 复制</>}</button>
              <button onClick={download} className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"><Download className="w-3 h-3 inline" /> 下载 TXT</button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">{text}</pre>
        </div>
      )}
    </div>
  )
}

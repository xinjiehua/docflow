import { useState } from 'react'
import { Upload, Download, FileText, Loader2, Copy, Check } from 'lucide-react'

export default function PptExtractText() {
  const [file, setFile] = useState<File | null>(null)
  const [texts, setTexts] = useState<{ page: number; text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const extract = async () => {
    if (!file) return
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const JSZip = (await import('jszip')).default
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

      const results: { page: number; text: string }[] = []
      for (const sf of slideFiles) {
        const xml = await zip.files[sf].async('text')
        const parser = new DOMParser()
        const doc = parser.parseFromString(xml, 'text/xml')
        const textEls = doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 't')
        let slideText = ''
        for (let t = 0; t < textEls.length; t++) {
          slideText += textEls[t].textContent || ''
          slideText += ' '
        }
        const pageNum = parseInt(sf.match(/slide(\d+)/)?.[1] || '0')
        results.push({ page: pageNum, text: slideText.trim() })
      }
      setTexts(results)
    } catch (err) {
      alert('提取失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const copyAll = () => {
    const allText = texts.map((t) => `=== 第 ${t.page} 页 ===\n${t.text}`).join('\n\n')
    navigator.clipboard.writeText(allText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    const allText = texts.map((t) => `=== 第 ${t.page} 页 ===\n${t.text}`).join('\n\n')
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ppt-text.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 提取文字</h1>
      <p className="text-gray-500 mb-6">提取 PPT 每页的文字内容，支持导出 TXT</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>
        <button onClick={extract} disabled={!file || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 提取中...</> : <><FileText className="w-4 h-4" /> 提取文字</>}
        </button>
      </div>

      {texts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">提取结果（{texts.length} 页）</h2>
            <div className="flex gap-2">
              <button onClick={copyAll} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? '已复制' : '复制全部'}
              </button>
              <button onClick={downloadTxt} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                <Download className="w-3 h-3" /> 导出 TXT
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {texts.map((t, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="text-sm font-semibold text-blue-600 mb-2">第 {t.page} 页</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{t.text || '（此页无文字）'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

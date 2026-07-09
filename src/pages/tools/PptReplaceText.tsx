import { useState } from 'react'
import { Upload, Download, Loader2, Search } from 'lucide-react'
import JSZip from 'jszip'

export default function PptReplaceText() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [count, setCount] = useState(0)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setFile(e.target.files[0]); setCount(0) }
  }

  const doReplace = async () => {
    if (!file || !find) return
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      let total = 0

      for (const path of Object.keys(zip.files)) {
        if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) {
          let xml = await zip.files[path].async('text')
          const matches = xml.split(find).length - 1
          total += matches
          xml = xml.split(find).join(replace)
          zip.file(path, xml)
        }
      }

      setCount(total)
      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pptx', '-replaced.pptx')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('替换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 批量替换文字</h1>
      <p className="text-gray-500 mb-6">全文查找替换 PPT 中所有幻灯片的文字</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors mb-4">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">查找内容</label>
            <input type="text" value={find} onChange={(e) => setFind(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="输入要查找的文字" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">替换为</label>
            <input type="text" value={replace} onChange={(e) => setReplace(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="输入替换后的文字" />
          </div>
        </div>

        <button onClick={doReplace} disabled={!file || !find || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 替换中...</> : <><Search className="w-4 h-4" /> 查找并替换</>}
        </button>

        {count > 0 && <p className="mt-3 text-sm text-green-600 text-center">已替换 {count} 处匹配</p>}
        {count === 0 && find && <p className="mt-3 text-sm text-yellow-600 text-center">未找到匹配内容</p>}
      </div>
    </div>
  )
}

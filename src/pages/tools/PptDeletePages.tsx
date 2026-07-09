import { useState } from 'react'
import { Upload, Download, Loader2, Trash2 } from 'lucide-react'
import JSZip from 'jszip'

export default function PptDeletePages() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [deletePages, setDeletePages] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const f = e.target.files[0]
    setFile(f)
    const ab = await f.arrayBuffer()
    const zip = await JSZip.loadAsync(ab)
    let count = 0
    zip.forEach((p) => { if (/^ppt\/slides\/slide\d+\.xml$/.test(p)) count++ })
    setTotalPages(Math.max(count, 1))
  }

  const deleteSelected = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(ab)
      const pages = deletePages.split(',').map((s) => parseInt(s.trim())).filter((n) => n >= 1 && n <= totalPages)

      for (const p of pages) {
        zip.remove(`ppt/slides/slide${p}.xml`)
        const relsPath = `ppt/slides/_rels/slide${p}.xml.rels`
        if (zip.files[relsPath]) zip.remove(relsPath)
      }

      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pptx', '-trimmed.pptx')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('删除失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 删除指定页</h1>
      <p className="text-gray-500 mb-6">选择要删除的页码，去除后重新导出</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors mb-4">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        {totalPages > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">共 {totalPages} 页，输入要删除的页码（逗号分隔）</p>
            <input
              type="text"
              value={deletePages}
              onChange={(e) => setDeletePages(e.target.value)}
              placeholder="例: 2, 4, 6-8"
              className="w-full border rounded-lg px-4 py-2 text-sm"
            />
          </div>
        )}

        <button onClick={deleteSelected} disabled={!file || !deletePages || loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 处理中...</> : <><Trash2 className="w-4 h-4" /> 删除页面并下载</>}
        </button>
      </div>
    </div>
  )
}

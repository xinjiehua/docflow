import { useState } from 'react'
import { Upload, Download, Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import JSZip from 'jszip'

export default function PptRearrange() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [pages, setPages] = useState<number[]>([])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const f = e.target.files[0]
    setFile(f)
    const arrayBuffer = await f.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
    const count: number[] = []
    zip.forEach((path) => {
      const m = path.match(/^ppt\/slides\/slide(\d+)\.xml$/)
      if (m) count.push(parseInt(m[1]))
    })
    count.sort((a, b) => a - b)
    setPages(count)
  }

  const movePage = (from: number, to: number) => {
    setPages((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  const rearrange = async () => {
    if (!file) return
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      const slideMap = new Map<number, string>()
      for (const path of Object.keys(zip.files)) {
        const m = path.match(/^ppt\/slides\/slide(\d+)\.xml$/)
        if (m) slideMap.set(parseInt(m[1]), path)
      }

      // Create new order mapping
      const newOrder = new Map<number, number>()
      pages.forEach((origNum, newIndex) => {
        newOrder.set(origNum, newIndex + 1)
      })

      // Rename slides according to new order
      const newFiles: { path: string; content: Uint8Array }[] = []
      for (const [origNum, path] of slideMap) {
        const content = await zip.files[path].async('uint8array')
        newFiles.push({ path: `ppt/slides/slide${newOrder.get(origNum)}.xml`, content })
      }

      // Remove old slides and add new ones
      for (const path of slideMap.values()) zip.remove(path)
      for (const f of newFiles) zip.file(f.path, f.content)

      // Update relationships similarly
      const relsDir = 'ppt/slides/_rels/'
      const newRels: { path: string; content: Uint8Array }[] = []
      for (const [origNum, path] of slideMap) {
        const relsPath = relsDir + `slide${origNum}.xml.rels`
        if (zip.files[relsPath]) {
          const content = await zip.files[relsPath].async('uint8array')
          newRels.push({ path: relsDir + `slide${newOrder.get(origNum)}.xml.rels`, content })
          zip.remove(relsPath)
        }
      }
      for (const f of newRels) zip.file(f.path, f.content)

      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'rearranged.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('排序失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 页面排序</h1>
      <p className="text-gray-500 mb-6">拖拽或点击箭头调整 PPT 页面顺序</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {pages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">页面顺序（共 {pages.length} 页）</h2>
          <div className="space-y-2">
            {pages.map((p, i) => (
              <div key={p} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg font-bold text-blue-600 w-8">{i + 1}</span>
                <div className="flex-1 text-sm">幻灯片 {p}</div>
                <div className="flex gap-1">
                  {i > 0 && <button onClick={() => movePage(i, i - 1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300"><ArrowUp className="w-4 h-4" /></button>}
                  {i < pages.length - 1 && <button onClick={() => movePage(i, i + 1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300"><ArrowDown className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={rearrange} disabled={pages.length === 0 || loading} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 处理中...</> : <><Download className="w-4 h-4" /> 保存并下载</>}
      </button>
    </div>
  )
}

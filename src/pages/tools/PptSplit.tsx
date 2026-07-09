import { useState } from 'react'
import { Upload, Download, Loader2, Scissors } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default function PptSplit() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'range' | 'each'>('each')
  const [range, setRange] = useState('1-3')
  const [result, setResult] = useState<string>('')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const split = async () => {
    if (!file) return
    setLoading(true)
    setResult('')
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      let slideCount = 0
      zip.forEach((path) => { if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) slideCount++ })
      slideCount = Math.max(slideCount, 1)

      if (mode === 'each') {
        // Split into individual files
        const outputZip = new JSZip()
        for (let s = 1; s <= slideCount; s++) {
          const slidePath = `ppt/slides/slide${s}.xml`
          if (zip.files[slidePath]) {
            const singleZip = new JSZip()
            // Copy entire zip but only include this slide
            zip.forEach((path, entry) => {
              if (!entry.dir) singleZip.file(path, entry.async('uint8array'))
            })
            // Remove slides we don't want (mark as deleted)
            for (let d = 1; d <= slideCount; d++) {
              if (d !== s) {
                const delPath = `ppt/slides/slide${d}.xml`
                if (singleZip.file(delPath)) singleZip.remove(delPath)
              }
            }
            outputZip.file(`slide-${s}.pptx`, singleZip.generateAsync({ type: 'uint8array' }))
          }
        }
        const blob = await outputZip.generateAsync({ type: 'blob' })
        saveAs(blob, 'split-pptx.zip')
        setResult(`已拆分为 ${slideCount} 个文件`)
      } else {
        // Extract specific range
        const parts = range.split(',').map((p) => {
          if (p.includes('-')) {
            const [start, end] = p.split('-').map(Number)
            const arr: number[] = []
            for (let i = Math.max(1, start); i <= Math.min(slideCount, end); i++) arr.push(i)
            return arr
          }
          return [parseInt(p)]
        })
        const pages = parts.flat().filter((p) => p >= 1 && p <= slideCount)

        const outputZip = new JSZip()
        zip.forEach((path, entry) => {
          if (!entry.dir) outputZip.file(path, entry.async('uint8array'))
        })
        for (let d = 1; d <= slideCount; d++) {
          if (!pages.includes(d)) {
            outputZip.remove(`ppt/slides/slide${d}.xml`)
          }
        }
        const blob = await outputZip.generateAsync({ type: 'blob' })
        saveAs(blob, `ppt-pages-${range.replace(/\s/g, '')}.pptx`)
        setResult(`已提取 ${pages.length} 页: ${pages.join(', ')}`)
      }
    } catch (err) {
      alert('拆分失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 拆分</h1>
      <p className="text-gray-500 mb-6">按页码拆分 PPT 文件</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="mode" checked={mode === 'each'} onChange={() => setMode('each')} /> 逐页拆分
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="mode" checked={mode === 'range'} onChange={() => setMode('range')} /> 按范围提取
          </label>
        </div>

        {mode === 'range' && (
          <input
            type="text"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="例: 1-3, 5, 7-10"
            className="mt-3 w-full border rounded-lg px-4 py-2 text-sm"
          />
        )}

        <button
          onClick={split}
          disabled={!file || loading}
          className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 拆分中...</> : <><Scissors className="w-4 h-4" /> 开始拆分</>}
        </button>

        {result && <p className="mt-3 text-sm text-green-600 text-center">{result}</p>}
      </div>
    </div>
  )
}

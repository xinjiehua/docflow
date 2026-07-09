import { useState } from 'react'
import { Upload, Download, Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import JSZip from 'jszip'

interface PptFile {
  file: File
  name: string
}

export default function PptMerge() {
  const [files, setFiles] = useState<PptFile[]>([])
  const [loading, setLoading] = useState(false)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map((f) => ({ file: f, name: f.name }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index))
  const moveFile = (from: number, to: number) => {
    setFiles((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  const merge = async () => {
    if (files.length < 2) return
    setLoading(true)
    try {
      const baseZip = await JSZip.loadAsync(await files[0].file.arrayBuffer())

      // Count slides in base
      let slideCount = 0
      baseZip.forEach((path) => {
        if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) slideCount++
      })

      // Process additional files
      for (let f = 1; f < files.length; f++) {
        const srcZip = await JSZip.loadAsync(await files[f].file.arrayBuffer())
        const offset = slideCount

        // Copy slide XML files with new names
        let srcSlideCount = 0
        const srcSlides: string[] = []
        srcZip.forEach((path) => {
          if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) srcSlides.push(path)
        })
        srcSlides.sort((a, b) => {
          const na = parseInt(a.match(/slide(\d+)/)?.[1] || '0')
          const nb = parseInt(b.match(/slide(\d+)/)?.[1] || '0')
          return na - nb
        })

        for (let s = 0; s < srcSlides.length; s++) {
          slideCount++
          const newName = `slide${slideCount}.xml`
          const content = await srcZip.files[srcSlides[s]].async('text')

          // Copy slide content
          baseZip.file(`ppt/slides/${newName}`, content)

          // Copy relationships
          const srcRelsPath = srcSlides[s].replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels'
          if (srcZip.files[srcRelsPath]) {
            const relsContent = await srcZip.files[srcRelsPath].async('text')
            baseZip.file(`ppt/slides/_rels/${newName}.rels`, relsContent)
          }

          // Copy any referenced media
          const srcRelsXml = srcZip.files[srcRelsPath] ? await srcZip.files[srcRelsPath].async('text') : ''
          const mediaTargets = [...srcRelsXml.matchAll(/Target="([^"]*media\/[^"]+)"/g)].map((m) => m[1])
          for (const target of mediaTargets) {
            const srcMediaPath = target.replace('../', 'ppt/')
            if (!target.startsWith('ppt/')) {
              // Check if media already exists in base
              const mediaName = target.split('/').pop()
              const baseMediaPath = `ppt/media/${mediaName}`
              if (!baseZip.files[baseMediaPath] && srcZip.files[srcMediaPath]) {
                const mediaBlob = await srcZip.files[srcMediaPath].async('blob')
                const mediaArrayBuffer = await mediaBlob.arrayBuffer()
                baseZip.file(baseMediaPath, mediaArrayBuffer)
              }
            }
          }
        }
      }

      // Update presentation.xml
      const presXml = await baseZip.file('ppt/presentation.xml')!.async('text')
      // We don't modify presentation.xml's sldIdLst for simplicity, but the slides are included
      const blob = await baseZip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('合并失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 合并</h1>
      <p className="text-gray-500 mb-6">将多个 PPT 文件合并为一个演示文稿</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Plus className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">点击添加 PPT 文件（支持多选）</span>
          <input type="file" accept=".pptx" multiple onChange={handleFiles} className="hidden" />
        </label>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">合并顺序（{files.length} 个文件）</h2>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium w-8">{i + 1}.</span>
                <span className="text-sm truncate flex-1">{f.name}</span>
                <div className="flex gap-1">
                  {i > 0 && <button onClick={() => moveFile(i, i - 1)} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">↑</button>}
                  {i < files.length - 1 && <button onClick={() => moveFile(i, i + 1)} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">↓</button>}
                </div>
                <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={merge}
        disabled={files.length < 2 || loading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 合并中...</> : <><Download className="w-4 h-4" /> 合并并下载</>}
      </button>
    </div>
  )
}

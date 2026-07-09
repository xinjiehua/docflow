import { useState } from 'react'
import { Upload, Download, Loader2, Hash } from 'lucide-react'
import JSZip from 'jszip'

export default function PptAddPageNumbers() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right'>('bottom-right')
  const [startNum, setStartNum] = useState(1)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const addNumbers = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(ab)
      const slideFiles: string[] = []
      zip.forEach((p) => { if (/^ppt\/slides\/slide\d+\.xml$/.test(p)) slideFiles.push(p) })
      slideFiles.sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)?.[1] || '0')
        const nb = parseInt(b.match(/slide(\d+)/)?.[1] || '0')
        return na - nb
      })

      for (let i = 0; i < slideFiles.length; i++) {
        const pageNum = startNum + i
        let xml = await zip.files[slideFiles[i]].async('text')

        // Position coordinates (EMU units)
        const posMap = {
          'bottom-right': { x: 8640000, y: 6553200, align: 'r' },
          'bottom-center': { x: 4572000, y: 6553200, align: 'ctr' },
          'bottom-left': { x: 457200, y: 6553200, align: 'l' },
          'top-right': { x: 8640000, y: 365760, align: 'r' },
        }
        const pos = posMap[position]
        const algnMap: Record<string, string> = { r: 'r', l: 'l', ctr: 'ctr' }

        const shape = `<p:sp xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:nvSpPr><p:cNvPr id="999" name="PageNum"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${pos.x}" y="${pos.y}"/><a:ext cx="914400" cy="365760"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:pPr algn="${algnMap[pos.align]}"/><a:r><a:rPr lang="zh-CN" sz="1200" dirty="0"><a:solidFill><a:srgbClr val="888888"/></a:solidFill></a:rPr><a:t>${pageNum}</a:t></a:r></a:p></p:txBody></p:sp>`

        xml = xml.replace('</p:sld>', shape + '</p:sld>')
        zip.file(slideFiles[i], xml)
      }

      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pptx', '-numbered.pptx')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('添加页码失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 添加页码</h1>
      <p className="text-gray-500 mb-6">批量给 PPT 每页添加页码</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors mb-4">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">页码位置</label>
            <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="bottom-right">右下角</option>
              <option value="bottom-center">底部居中</option>
              <option value="bottom-left">左下角</option>
              <option value="top-right">右上角</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">起始页码</label>
            <input type="number" value={startNum} onChange={(e) => setStartNum(parseInt(e.target.value) || 1)} min={1} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <button onClick={addNumbers} disabled={!file || loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 处理中...</> : <><Hash className="w-4 h-4" /> 添加页码并下载</>}
        </button>
      </div>
    </div>
  )
}

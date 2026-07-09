import { useState } from 'react'
import { Upload, Download, Loader2 } from 'lucide-react'
import JSZip from 'jszip'

export default function PptToPdf() {
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

      // Extract slide images
      const mediaMap: Record<string, Blob> = {}
      for (const path of Object.keys(zip.files)) {
        if (/^ppt\/media\//.test(path)) {
          const blob = await zip.files[path].async('blob')
          mediaMap[path] = blob
        }
      }

      // Get slide order and relationships
      const slideFiles: string[] = []
      zip.forEach((path) => {
        if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) slideFiles.push(path)
      })
      slideFiles.sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)?.[1] || '0')
        const nb = parseInt(b.match(/slide(\d+)/)?.[1] || '0')
        return na - nb
      })

      // Render each slide to canvas via images
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < slideFiles.length; i++) {
        if (i > 0) pdf.addPage()

        const slideXml = await zip.files[slideFiles[i]].async('text')
        const relsPath = slideFiles[i].replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels'
        let relsXml = ''
        if (zip.files[relsPath]) {
          relsXml = await zip.files[relsPath].async('text')
        }

        // Find the largest image
        const imageMatches = [...slideXml.matchAll(/r:embed="(rId\d+)"/g)]
        let bestBlob: Blob | null = null
        let bestSize = 0

        for (const match of imageMatches) {
          const rId = match[1]
          const targetMatch = relsXml.match(new RegExp(`Id="${rId}"[^>]*Target="([^"]+)"`))
          if (targetMatch) {
            let target = targetMatch[1].replace('../', 'ppt/')
            if (!target.startsWith('ppt/')) target = 'ppt/' + target
            if (mediaMap[target]) {
              const sizeMatch = slideXml.match(new RegExp(`r:embed="${rId}"[^<]*(?:cx="(\\d+)"[^>]*cy="(\\d+)"|cy="(\\d+)"[^>]*cx="(\\d+)")`))
              const cx = parseInt(sizeMatch?.[1] || sizeMatch?.[4] || '0')
              const cy = parseInt(sizeMatch?.[2] || sizeMatch?.[3] || '0')
              const size = cx * cy
              if (size > bestSize) {
                bestSize = size
                bestBlob = mediaMap[target]
              }
            }
          }
        }

        if (bestBlob) {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(bestBlob!)
          })
          pdf.addImage(dataUrl, 'AUTO', 0, 0, pdfW, pdfH)
        }
      }

      pdf.save('ppt-to-pdf.pdf')
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 转 PDF</h1>
      <p className="text-gray-500 mb-6">将 PPT 演示文稿导出为 PDF 格式</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <span className="text-gray-600 font-medium">{file ? file.name : '点击上传 PPT 文件'}</span>
          <span className="text-xs text-gray-400 mt-2">支持 .pptx 格式</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        <button
          onClick={convert}
          disabled={!file || loading}
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 转换中...</> : <><Download className="w-5 h-5" /> 转换为 PDF</>}
        </button>
      </div>
    </div>
  )
}

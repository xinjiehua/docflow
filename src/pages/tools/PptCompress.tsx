import { useState } from 'react'
import { Upload, Download, Loader2 } from 'lucide-react'
import JSZip from 'jszip'

export default function PptCompress() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium')
  const [result, setResult] = useState<{ original: number; compressed: number; saved: number } | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setFile(e.target.files[0]); setResult(null) }
  }

  const compress = async () => {
    if (!file) return
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      const qualityMap = { high: 0.9, medium: 0.7, low: 0.5 }

      for (const path of Object.keys(zip.files)) {
        if (/^ppt\/media\/.*\.(png|jpeg|jpg|gif)$/i.test(path)) {
          const blob = await zip.files[path].async('blob')
          const bitmap = await createImageBitmap(blob)
          const canvas = document.createElement('canvas')
          // Scale down for medium/low quality
          const scale = quality === 'high' ? 1 : quality === 'medium' ? 0.8 : 0.6
          canvas.width = bitmap.width * scale
          canvas.height = bitmap.height * scale
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', qualityMap[quality])
          // Convert data URL back to blob
          const binaryStr = atob(dataUrl.split(',')[1])
          const uint8 = new Uint8Array(binaryStr.length)
          for (let i = 0; i < binaryStr.length; i++) uint8[i] = binaryStr.charCodeAt(i)
          zip.file(path, uint8)
        }
      }

      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', compression: 'DEFLATE', compressionOptions: { level: 9 } })
      setResult({ original: file.size, compressed: blob.size, saved: file.size - blob.size })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pptx', '-compressed.pptx')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('压缩失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 压缩</h1>
      <p className="text-gray-500 mb-6">压缩 PPT 中的图片和冗余数据，减小文件体积</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        <div className="mt-4 flex items-center gap-4">
          <label className="text-sm font-medium">压缩等级</label>
          {(['high', 'medium', 'low'] as const).map((q) => (
            <label key={q} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="quality" checked={quality === q} onChange={() => setQuality(q)} />
              {q === 'high' ? '高质量' : q === 'medium' ? '平衡' : '高压缩'}
            </label>
          ))}
        </div>

        <button onClick={compress} disabled={!file || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 压缩中...</> : <><Download className="w-4 h-4" /> 压缩并下载</>}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500">原始大小</div>
                <div className="font-semibold">{formatSize(result.original)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">压缩后</div>
                <div className="font-semibold">{formatSize(result.compressed)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">节省</div>
                <div className="font-semibold text-green-600">{((result.saved / result.original) * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

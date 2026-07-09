import { useState } from 'react'
import { Upload, Download, Image, Loader2 } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default function PptExtractImages() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<{ name: string; url: string; size: number }[]>([])
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const extract = async () => {
    if (!file) return
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      const results: { name: string; url: string; size: number }[] = []
      for (const path of Object.keys(zip.files)) {
        if (/^ppt\/media\//.test(path) && !zip.files[path].dir) {
          const blob = await zip.files[path].async('blob')
          const url = URL.createObjectURL(blob)
          const name = path.split('/').pop()!
          results.push({ name, url, size: blob.size })
        }
      }
      setImages(results)
    } catch (err) {
      alert('提取失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const downloadAll = async () => {
    const zip = new JSZip()
    for (const img of images) {
      const resp = await fetch(img.url)
      const blob = await resp.blob()
      zip.file(img.name, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'ppt-images.zip')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 提取图片</h1>
      <p className="text-gray-500 mb-6">批量提取 PPT 中所有嵌入的图片素材</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>
        <button onClick={extract} disabled={!file || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 提取中...</> : <><Image className="w-4 h-4" /> 提取图片</>}
        </button>
      </div>

      {images.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">找到 {images.length} 张图片</h2>
            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              <Download className="w-4 h-4" /> 全部下载
            </button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <img src={img.url} alt={img.name} className="w-full h-24 object-contain bg-gray-50" />
                <div className="p-1.5 text-xs text-gray-500 truncate">{img.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

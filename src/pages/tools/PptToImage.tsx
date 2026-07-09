import { useState } from 'react'
import { Upload, Download, Image, Loader2, Trash2 } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default function PptToImage() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<{ url: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'png' | 'jpg'>('png')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setImages([])
    }
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
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

      // Extract media files
      const mediaMap: Record<string, string> = {}
      for (const path of Object.keys(zip.files)) {
        if (/^ppt\/media\//.test(path)) {
          const blob = await zip.files[path].async('blob')
          mediaMap[path] = URL.createObjectURL(blob)
        }
      }

      // Create images from slide relationships
      const results: { url: string; name: string }[] = []
      for (let i = 0; i < slideFiles.length; i++) {
        const slideXml = await zip.files[slideFiles[i]].async('text')
        const relsPath = slideFiles[i].replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels'
        let relsXml = ''
        if (zip.files[relsPath]) {
          relsXml = await zip.files[relsPath].async('text')
        }

        // Find the largest image in this slide
        const imageMatches = [...slideXml.matchAll(/r:embed="(rId\d+)"/g)]
        let bestImage: string | null = null
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
                bestImage = mediaMap[target]
              }
            }
          }
        }

        if (bestImage) {
          results.push({ url: bestImage, name: `slide-${i + 1}.${format}` })
        } else {
          // Create placeholder image using canvas
          const canvas = document.createElement('canvas')
          canvas.width = 960
          canvas.height = 540
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, 960, 540)
          ctx.fillStyle = '#333333'
          ctx.font = 'bold 32px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`Slide ${i + 1}`, 480, 280)
          ctx.font = '16px sans-serif'
          ctx.fillStyle = '#888888'
          ctx.fillText('(无嵌入图片，已生成占位图)', 480, 320)
          results.push({
            url: canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95),
            name: `slide-${i + 1}.${format}`,
          })
        }
      }

      setImages(results)
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const downloadAll = async () => {
    if (images.length === 0) return
    const zip = new JSZip()
    for (const img of images) {
      const response = await fetch(img.url)
      const blob = await response.blob()
      zip.file(img.name, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'ppt-images.zip')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 转图片</h1>
      <p className="text-gray-500 mb-6">上传 PPT 文件，逐页提取导出为高清图片</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <label className="block text-sm font-medium">导出格式</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'png' | 'jpg')}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="png">PNG（无损）</option>
            <option value="jpg">JPG（较小体积）</option>
          </select>
        </div>

        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <span className="text-xs text-gray-400 mt-1">支持 .pptx 格式</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        {file && (
          <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm truncate flex-1">{file.name}</span>
            <button onClick={() => { setFile(null); setImages([]) }} className="text-gray-400 hover:text-red-500 ml-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={convert}
          disabled={!file || loading}
          className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 转换中...</> : '开始转换'}
        </button>
      </div>

      {images.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">转换结果（{images.length} 页）</h2>
            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              <Download className="w-4 h-4" /> 全部下载 ZIP
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <img src={img.url} alt={img.name} className="w-full h-32 object-contain bg-gray-50" />
                <div className="p-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{img.name}</span>
                  <a href={img.url} download={img.name} className="text-blue-600 text-xs hover:underline">
                    <Download className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

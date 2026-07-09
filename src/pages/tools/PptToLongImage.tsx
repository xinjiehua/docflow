import { useState } from 'react'
import { Upload, Download, Loader2, Image } from 'lucide-react'

export default function PptToLongImage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setFile(e.target.files[0]); setPreview(null) }
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(ab)

      // Extract slide images from media
      const mediaMap: Record<string, Blob> = {}
      for (const path of Object.keys(zip.files)) {
        if (/^ppt\/media\//.test(path) && !zip.files[path].dir) {
          mediaMap[path] = await zip.files[path].async('blob')
        }
      }

      // Get slides sorted
      const slideFiles: string[] = []
      zip.forEach((p) => { if (/^ppt\/slides\/slide\d+\.xml$/.test(p)) slideFiles.push(p) })
      slideFiles.sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)?.[1] || '0')
        const nb = parseInt(b.match(/slide(\d+)/)?.[1] || '0')
        return na - nb
      })

      // Load each slide's main image
      const slideImages: string[] = []
      const W = 960
      const H = 540

      for (let i = 0; i < slideFiles.length; i++) {
        const xml = await zip.files[slideFiles[i]].async('text')
        const relsPath = slideFiles[i].replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels'
        const relsXml = zip.files[relsPath] ? await zip.files[relsPath].async('text') : ''
        const embeds = [...xml.matchAll(/r:embed="(rId\d+)"/g)]
        let bestUrl: string | null = null
        let bestSize = 0

        for (const match of embeds) {
          const rId = match[1]
          const tm = relsXml.match(new RegExp(`Id="${rId}"[^>]*Target="([^"]+)"`))
          if (tm) {
            let target = tm[1].replace('../', 'ppt/')
            if (!target.startsWith('ppt/')) target = 'ppt/' + target
            if (mediaMap[target]) {
              const sizeMatch = xml.match(new RegExp(`r:embed="${rId}"[^<]*(?:cx="(\\d+)"[^>]*cy="(\\d+)"|cy="(\\d+)"[^>]*cx="(\\d+)")`))
              const cx = parseInt(sizeMatch?.[1] || sizeMatch?.[4] || '0')
              const cy = parseInt(sizeMatch?.[2] || sizeMatch?.[3] || '0')
              if (cx * cy > bestSize) {
                bestSize = cx * cy
                bestUrl = URL.createObjectURL(mediaMap[target])
              }
            }
          }
        }

        if (bestUrl) {
          slideImages.push(bestUrl)
        } else {
          const canvas = document.createElement('canvas')
          canvas.width = W
          canvas.height = H
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, W, H)
          ctx.fillStyle = '#333'
          ctx.font = 'bold 28px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`Slide ${i + 1}`, W / 2, H / 2)
          slideImages.push(canvas.toDataURL('image/png'))
        }
      }

      // Stitch all slides into one long image
      const totalHeight = slideImages.length * (H + 4)
      const longCanvas = document.createElement('canvas')
      longCanvas.width = W
      longCanvas.height = totalHeight
      const ctx = longCanvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, totalHeight)

      for (let i = 0; i < slideImages.length; i++) {
        const img = new Image()
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, i * (H + 4), W, H)
            // Add separator line
            if (i < slideImages.length - 1) {
              ctx.strokeStyle = '#e5e7eb'
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(40, (i + 1) * (H + 4) - 2)
              ctx.lineTo(W - 40, (i + 1) * (H + 4) - 2)
              ctx.stroke()
            }
            resolve()
          }
          img.onerror = () => resolve()
          img.src = slideImages[i]
        })
      }

      const dataUrl = longCanvas.toDataURL('image/jpeg', 0.9)
      setPreview(dataUrl)

      // Download
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'ppt-long-image.jpg'
      a.click()
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 转长图</h1>
      <p className="text-gray-500 mb-6">将 PPT 所有幻灯片纵向拼接为一张长图</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>
        <button onClick={convert} disabled={!file || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 拼接中...</> : <><Image className="w-4 h-4" /> 生成长图</>}
        </button>
      </div>

      {preview && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-3">预览</h2>
          <div className="overflow-auto max-h-[600px]">
            <img src={preview} alt="长图预览" className="w-full" style={{ maxWidth: 480 }} />
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Upload, Download, Film, Music, Loader2 } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default function PptExtractMedia() {
  const [file, setFile] = useState<File | null>(null)
  const [media, setMedia] = useState<{ name: string; url: string; type: string; size: number }[]>([])
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const extract = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(ab)
      const results: { name: string; url: string; type: string; size: number }[] = []
      const audioVideoExts = /\.(mp3|mp4|wav|avi|mov|wmv|m4a|ogg|flac|wma|webm|mkv)$/i

      for (const path of Object.keys(zip.files)) {
        if (audioVideoExts.test(path) && !zip.files[path].dir) {
          const blob = await zip.files[path].async('blob')
          const url = URL.createObjectURL(blob)
          const name = path.split('/').pop()!
          const isAudio = /\.(mp3|wav|m4a|ogg|flac|wma)$/i.test(name)
          results.push({ name, url, type: isAudio ? 'audio' : 'video', size: blob.size })
        }
      }

      // Also check relationships for embedded media
      for (const path of Object.keys(zip.files)) {
        if (/^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(path)) {
          const relsXml = await zip.files[path].async('text')
          const targets = [...relsXml.matchAll(/Target="([^"]*media\/[^"]+)"/g)].map((m) => m[1])
          for (const target of targets) {
            const mediaPath = target.replace('../', 'ppt/')
            if (zip.files[mediaPath] && !results.find((r) => r.name === mediaPath.split('/').pop())) {
              const ext = mediaPath.split('.').pop()?.toLowerCase() || ''
              if (['mp3', 'mp4', 'wav', 'avi', 'mov', 'wmv', 'm4a', 'ogg', 'flac'].includes(ext)) {
                const blob = await zip.files[mediaPath].async('blob')
                const url = URL.createObjectURL(blob)
                const name = mediaPath.split('/').pop()!
                results.push({ name, url, type: ['mp3', 'wav', 'm4a', 'ogg', 'flac'].includes(ext) ? 'audio' : 'video', size: blob.size })
              }
            }
          }
        }
      }

      setMedia(results)
    } catch (err) {
      alert('提取失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const downloadAll = async () => {
    const zip = new JSZip()
    for (const m of media) {
      const resp = await fetch(m.url)
      const blob = await resp.blob()
      zip.file(m.name, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'ppt-media.zip')
  }

  const formatSize = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 提取音视频</h1>
      <p className="text-gray-500 mb-6">批量提取 PPT 中嵌入的音频和视频素材</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>
        <button onClick={extract} disabled={!file || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 提取中...</> : <><Film className="w-4 h-4" /> 提取音视频</>}
        </button>
      </div>

      {media.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">找到 {media.length} 个音视频文件</h2>
            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              <Download className="w-4 h-4" /> 全部下载
            </button>
          </div>
          <div className="space-y-2">
            {media.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {m.type === 'audio' ? <Music className="w-5 h-5 text-purple-500" /> : <Film className="w-5 h-5 text-blue-500" />}
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-gray-400">{formatSize(m.size)}</div>
                </div>
                <a href={m.url} download={m.name} className="text-blue-600 text-sm hover:underline">下载</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length === 0 && file && !loading && (
        <p className="text-center text-gray-500 mt-4">此 PPT 中未找到音视频文件</p>
      )}
    </div>
  )
}

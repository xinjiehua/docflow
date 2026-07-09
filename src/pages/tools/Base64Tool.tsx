import { useState } from 'react'
import { Binary, Copy, Download, Upload, Image, FileText, Check, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import { fileToDataUrl } from '@/utils/image'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function Base64Tool() {
  const { isPro } = useUserStore()
  const { used, limit } = useUsageStore()
  const [mode, setMode] = useState<'encode' | 'decode' | 'image'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const handleEncode = () => {
    if (!input.trim()) return
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setError('')
    } catch (e: any) {
      setError('编码失败: ' + e.message)
      setOutput('')
    }
  }

  const handleDecode = () => {
    if (!input.trim()) return
    try {
      const decoded = decodeURIComponent(escape(atob(input.trim())))
      setOutput(decoded)
      setError('')
    } catch (e: any) {
      setError('解码失败: ' + e.message)
      setOutput('')
    }
  }

  const handleImageEncode = async (files: File[]) => {
    if (!files[0]) return
    try {
      const dataUrl = await fileToDataUrl(files[0])
      // dataUrl is already base64
      const base64Part = dataUrl.split(',')[1] || dataUrl
      setOutput(base64Part)
      setImagePreview(dataUrl)
      setError('')
    } catch (e: any) {
      setError('图片编码失败: ' + e.message)
      setOutput('')
    }
  }

  const handleBase64ToImage = () => {
    if (!input.trim()) return
    try {
      // Try to detect image format
      const base64 = input.trim()
      let mimeType = 'image/png'
      if (base64.startsWith('/9j/')) mimeType = 'image/jpeg'
      else if (base64.startsWith('iVBOR')) mimeType = 'image/png'
      else if (base64.startsWith('R0lGOD')) mimeType = 'image/gif'
      else if (base64.startsWith('UklGR')) mimeType = 'image/webp'
      else if (base64.startsWith('PHN2Zy')) mimeType = 'image/svg+xml'

      const dataUrl = `data:${mimeType};base64,${base64}`
      setImagePreview(dataUrl)
      setError('')
    } catch (e: any) {
      setError('Base64转图片失败: ' + e.message)
    }
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadImage = () => {
    if (!imagePreview) return
    const a = document.createElement('a')
    a.href = imagePreview
    a.download = 'base64_image.png'
    a.click()
  }

  return (
    <ToolLayout
      title="Base64 编解码"
      description="文本与Base64互转，图片Base64编码/解码"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        {/* Mode selector */}
        <div className="card !p-6">
          <div className="flex gap-2 mb-4">
            {([['encode', '文本编码'], ['decode', '文本解码'], ['image', '图片Base64']] as const).map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setOutput(''); setImagePreview('') }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'border-navy-200 text-navy-600 hover:border-navy-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'encode' && (
            <>
              <h3 className="font-medium text-navy-700 mb-3">输入文本</h3>
              <textarea
                className="w-full h-40 p-4 border border-navy-200 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入需要编码的文本..."
              />
              <button onClick={handleEncode} className="btn-primary mt-4">
                <Binary className="w-4 h-4 mr-2" />
                编码为 Base64
              </button>
            </>
          )}

          {mode === 'decode' && (
            <>
              <h3 className="font-medium text-navy-700 mb-3">输入 Base64</h3>
              <textarea
                className="w-full h-40 p-4 border border-navy-200 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入需要解码的Base64字符串..."
              />
              <div className="flex gap-2 mt-4">
                <button onClick={handleDecode} className="btn-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  解码为文本
                </button>
                <button onClick={handleBase64ToImage} className="btn-secondary">
                  <Image className="w-4 h-4 mr-2" />
                  解码为图片
                </button>
              </div>
            </>
          )}

          {mode === 'image' && (
            <>
              <h3 className="font-medium text-navy-700 mb-3">上传图片</h3>
              <FileUploader accept="image/*" onFileSelect={handleImageEncode} maxSize={10} />
            </>
          )}
        </div>

        {error && (
          <div className="card !p-4 !bg-red-50 !border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {imagePreview && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-3">图片预览</h3>
            <img src={imagePreview} alt="Base64 decoded" className="max-w-full max-h-64 border border-navy-200 rounded-lg" />
            <button onClick={handleDownloadImage} className="btn-secondary mt-3">
              <Download className="w-4 h-4 mr-2" />
              下载图片
            </button>
          </div>
        )}

        {output && (
          <div className="card !p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-navy-700">
                {mode === 'decode' ? '解码结果' : '编码结果'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-navy-400">{output.length.toLocaleString()} 字符</span>
                <button onClick={handleCopy} className="btn-secondary !py-1 !px-3 text-sm">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs text-navy-600 bg-navy-50 p-4 rounded-lg overflow-auto max-h-64 break-all">
              {output.length > 10000 ? output.substring(0, 10000) + '\n...(已截断，已复制完整内容)' : output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

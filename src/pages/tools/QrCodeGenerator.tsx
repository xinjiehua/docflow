import { useState } from 'react'
import { QrCode, Download, Copy, Check } from 'lucide-react'
import ToolLayout from '@/components/tools/ToolLayout'
import { generateQRCode } from '@/utils/tools'

export default function QrCodeGenerator() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(300)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [qrUrl, setQrUrl] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!text.trim()) return
    setGenerating(true)
    try {
      const dataUrl = await generateQRCode(text, { size, fgColor, bgColor })
      setQrUrl(dataUrl)
    } catch { /* skip */ }
    setGenerating(false)
  }

  const handleDownload = () => {
    if (!qrUrl) return
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = 'qrcode.png'
    a.click()
  }

  const handleCopy = async () => {
    if (!qrUrl) return
    try {
      const blob = await (await fetch(qrUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <ToolLayout title="二维码生成" description="输入文字或网址，生成高清二维码图片。支持自定义颜色和尺寸。" icon={<QrCode className="w-7 h-7" />} category="实用工具">
      <div className="space-y-6">
        <div className="card !p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1.5">内容</label>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="输入文字、网址、邮箱等..."
              rows={3} className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1.5">尺寸</label>
              <select value={size} onChange={e => setSize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm">
                <option value={200}>200px</option>
                <option value={300}>300px</option>
                <option value={400}>400px</option>
                <option value={600}>600px</option>
                <option value={800}>800px</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1.5">前景色</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <span className="text-xs text-navy-400">{fgColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1.5">背景色</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <span className="text-xs text-navy-400">{bgColor}</span>
              </div>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={!text.trim() || generating}
            className="btn-primary w-full !py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
            <QrCode className="w-5 h-5 mr-2" /> 生成二维码
          </button>
        </div>

        {qrUrl && (
          <div className="space-y-4">
            <div className="card !p-6 flex flex-col items-center">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <img src={qrUrl} alt="QR Code" className="max-w-full" style={{ width: Math.min(size, 300), height: Math.min(size, 300) }} />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
                  <Download className="w-4 h-4 mr-1.5" /> 下载PNG
                </button>
                <button onClick={handleCopy} className="btn-secondary !py-2 !px-4 text-sm">
                  {copied ? <><Check className="w-4 h-4 mr-1.5" /> 已复制</> : <><Copy className="w-4 h-4 mr-1.5" /> 复制图片</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

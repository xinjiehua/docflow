import { useState, useRef, useEffect } from 'react'
import { FileText, Download, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { markdownToHtml } from '@/utils/tools'
import { jsPDF } from 'jspdf'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function MarkdownToPdf() {
  const [md, setMd] = useState('# 欢迎使用 DocFlow Markdown 转 PDF\n\n输入你的 Markdown 内容...\n\n## 功能特点\n\n- 支持标题、列表、粗体、斜体\n- 支持代码块\n- 支持链接和图片\n\n### 示例\n\n**粗体文字** 和 *斜体文字*\n\n```\ncode block\n```\n\n| 表头1 | 表头2 |\n|------|------|\n| 内容1 | 内容2 |\n')
  const [previewHtml, setPreviewHtml] = useState('')
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const previewRef = useRef<HTMLIFrameElement>(null)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (md.trim()) {
        const html = await markdownToHtml(md)
        setPreviewHtml(html)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [md])

  const handleConvert = async () => {
    if (!md.trim()) return
    if (isFreeLimitReached) return
    setStatus('processing')
    setProgress(20)

    try {
      const html = await markdownToHtml(md)
      setProgress(40)

      // Create PDF using html2canvas approach with jsPDF
      const { default: html2canvas } = await import('html2canvas')
      setProgress(50)

      // Create a temporary div with the rendered HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = `
        <div style="padding: 40px; font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 700px; line-height: 1.8; color: #1a1a2e; font-size: 14px;">
          <style>
            h1 { font-size: 24px; margin: 20px 0 10px; color: #1a1a2e; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; }
            h2 { font-size: 20px; margin: 18px 0 8px; color: #334155; }
            h3 { font-size: 16px; margin: 14px 0 6px; color: #475569; }
            p { margin: 8px 0; }
            ul, ol { margin: 8px 0; padding-left: 24px; }
            li { margin: 4px 0; }
            code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
            pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; }
            pre code { background: none; padding: 0; color: #e2e8f0; }
            blockquote { border-left: 4px solid #4f46e5; padding-left: 16px; margin: 12px 0; color: #64748b; }
            table { border-collapse: collapse; width: 100%; margin: 12px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
            th { background: #f8fafc; font-weight: 600; }
            strong { font-weight: 700; }
            a { color: #4f46e5; }
          </style>
          ${html}
        </div>
      `

      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '800px'
      document.body.appendChild(tempDiv)

      setProgress(70)
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      setProgress(85)

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = pdfHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()

      while (heightLeft > 0) {
        position = -(pdf.internal.pageSize.getHeight() - position)
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }

      document.body.removeChild(tempDiv)
      setResult(pdf.output('blob'))
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('convertCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout title="Markdown 转 PDF" description="将Markdown文档转为格式精美的PDF文件，支持标题、列表、表格、代码块等。" icon={<FileText className="w-7 h-7" />} category="格式转换">
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Editor */}
          <div className="card !p-4">
            <label className="block text-sm font-medium text-navy-600 mb-2">Markdown 内容</label>
            <textarea value={md} onChange={e => setMd(e.target.value)} placeholder="输入Markdown..."
              className="w-full h-96 px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm font-mono resize-none" />
          </div>
          {/* Preview */}
          <div className="card !p-4">
            <label className="block text-sm font-medium text-navy-600 mb-2">预览</label>
            <div className="h-96 overflow-y-auto rounded-lg border border-navy-200 p-4 bg-white prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-navy-400">预览将在这里显示...</p>' }} />
          </div>
        </div>

        {md.trim() && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <FileText className="w-5 h-5 mr-2" /> 转换为 PDF
          </button>
        )}

        {isFreeLimitReached && status === 'idle' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link></p>
            </div>
          </div>
        )}

        <ProcessingIndicator status={status} progress={progress}
          message={status === 'processing' ? '正在生成PDF...' : undefined}
          error={status === 'error' ? '转换失败' : undefined} />

        {status === 'done' && result && (
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
            <div>
              <p className="text-brand-700 font-medium">PDF 生成完成!</p>
            </div>
            <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
              <Download className="w-4 h-4 mr-1.5" /> 下载 PDF
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

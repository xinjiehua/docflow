import { useState } from 'react'
import {ArrowRightLeft} from 'lucide-react'
import { Link } from 'react-router-dom'

import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { pdfToHtml } from '@/utils/converter'
import { downloadBlob } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'


export default function ConvertPdfToWord() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [textResult, setTextResult] = useState<string>('')

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = (files: File[]) => {
    setFile(files[0])
    setStatus('idle')
    setTextResult('')
  }

  const handleConvert = async () => {
    if (!file) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(20)

    try {
      const html = await pdfToHtml(file)
      setProgress(80)
      setTextResult(html)
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('convertCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!textResult) return
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Converted Document</title><style>body{font-family:sans-serif;padding:2rem;line-height:1.8;white-space:pre-wrap;}</style></head><body>${textResult}</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    downloadBlob(blob, 'converted.html')
  }

  return (
    <ToolLayout
      title="PDF 转 Word"
      description="将PDF文件中的文字提取为可编辑格式。支持中英文混合文档。"
      icon={<ArrowRightLeft className="w-7 h-7" />}
      category="格式转换"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".pdf"
          maxSize={isPro() ? 100 : 10}
          label="选择PDF文件"
          description="选择要转换的PDF文件"
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setTextResult('') }}
        />

        {file && !isFreeLimitReached && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            开始转换
          </button>
        )}

        {isFreeLimitReached && file && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              免费版每日限用5次。升级到<Link to="/login" className="underline font-medium text-brand-600 ml-1">登录</Link>或<Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link>可无限使用。
            </p>
          </div>
        )}

        <ProcessingIndicator
          status={status}
          progress={progress}
          message={status === 'processing' ? '正在提取文字内容...' : undefined}
          error={status === 'error' ? '转换失败，请确保PDF包含可提取的文字层' : undefined}
        />

        {status === 'done' && textResult && (
          <div className="space-y-4">
            <div className="card !p-5 max-h-64 overflow-y-auto">
              <h3 className="text-sm font-medium text-navy-700 mb-2">预览内容</h3>
              <pre className="text-sm text-navy-600 whitespace-pre-wrap">{textResult.substring(0, 2000)}</pre>
              {textResult.length > 2000 && (
                <p className="text-xs text-navy-400 mt-2">...内容过长，已截断预览</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleDownload} className="btn-primary flex-1">
                下载为 HTML
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(textResult)
                }}
                className="btn-secondary flex-1"
              >
                复制文本
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

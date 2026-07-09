import { useState } from 'react'
import {FileDown} from 'lucide-react'
import { Link } from 'react-router-dom'

import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { wordToText, htmlToPdf } from '@/utils/converter'
import { downloadUint8Array } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'


export default function ConvertWordToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Uint8Array | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = (files: File[]) => {
    setFile(files[0])
    setStatus('idle')
    setResult(null)
  }

  const handleConvert = async () => {
    if (!file) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(20)

    try {
      const text = await wordToText(file)
      setProgress(60)
      const pdfData = await htmlToPdf(text, file.name)
      setResult(pdfData)
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('convertCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result || !file) return
    const name = file.name.replace(/\.docx?$/i, '.pdf')
    downloadUint8Array(result, name)
  }

  return (
    <ToolLayout
      title="Word 转 PDF"
      description="将Word文档(.docx)转换为PDF格式，方便分享和打印。"
      icon={<FileDown className="w-7 h-7" />}
      category="格式转换"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".doc,.docx"
          maxSize={isPro() ? 100 : 10}
          label="选择Word文档"
          description="支持 .doc 和 .docx 格式"
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setResult(null) }}
        />

        {file && !isFreeLimitReached && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <FileDown className="w-5 h-5 mr-2" />
            转换为PDF
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
          message={status === 'processing' ? '正在转换文档...' : undefined}
          error={status === 'error' ? '转换失败，请确保文件格式正确' : undefined}
        />

        {status === 'done' && result && (
          <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center">
            <p className="text-brand-700 font-medium">转换完成!</p>
            <button onClick={handleDownload} className="btn-primary mt-4">
              下载PDF文件
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

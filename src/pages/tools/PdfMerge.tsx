import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Merge, Lock } from 'lucide-react'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { mergePDFs } from '@/utils/pdf'
import { downloadUint8Array } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Uint8Array | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    setStatus('idle')
    setResult(null)
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(10)

    try {
      const merged = await mergePDFs(files)
      setProgress(90)
      await new Promise((r) => setTimeout(r, 200))

      setResult(merged)
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('pdfMergeCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadUint8Array(result, 'merged.pdf')
  }

  return (
    <ToolLayout
      title="PDF 合并"
      description="将多个PDF文件合并为一个文档。支持拖拽排序，保持原始页面顺序。"
      icon={<Merge className="w-7 h-7" />}
      category="PDF工具"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".pdf"
          multiple
          maxSize={isPro() ? 100 : 10}
          label="选择PDF文件"
          description={`支持选择多个PDF文件进行合并（单个文件最大${isPro() ? '100MB' : '10MB'}）`}
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={handleRemoveFile}
        />

        {isFreeLimitReached && files.length >= 2 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/login" className="underline font-medium text-brand-600 ml-1">登录</Link>或
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link>
                可无限使用。
              </p>
            </div>
          </div>
        )}

        {files.length >= 2 && !isFreeLimitReached && (
          <button onClick={handleMerge} className="btn-primary w-full !py-3 text-base">
            <Merge className="w-5 h-5 mr-2" />
            合并 {files.length} 个PDF文件
          </button>
        )}

        <ProcessingIndicator
          status={status}
          progress={progress}
          message={status === 'processing' ? '正在合并PDF文件...' : undefined}
          error={status === 'error' ? '合并失败，请确保文件是有效的PDF格式' : undefined}
        />

        {status === 'done' && result && (
          <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center">
            <p className="text-brand-700 font-medium">合并完成!</p>
            <p className="text-brand-600 text-sm mt-1">
              已将 {files.length} 个文件合并为一个PDF
            </p>
            <button onClick={handleDownload} className="btn-primary mt-4">
              下载合并后的PDF
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

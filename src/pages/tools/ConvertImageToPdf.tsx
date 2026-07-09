import { useState } from 'react'
import { Image } from 'lucide-react'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { imagesToPdf } from '@/utils/converter'
import { downloadUint8Array } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'

export default function ConvertImageToPdf() {
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Uint8Array | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const isFreeLimitReached = totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
    setStatus('idle')
    setResult(null)
  }

  const handleConvert = async () => {
    if (files.length === 0) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(20)

    try {
      const pdfData = await imagesToPdf(files)
      setResult(pdfData)
      setProgress(100)
      setStatus('done')
      increment('convertCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadUint8Array(result, 'images.pdf')
  }

  return (
    <ToolLayout
      title="图片转 PDF"
      description="将多张图片(JPG/PNG)合并为一个PDF文档，每张图片占一页。"
      icon={<Image className="w-7 h-7" />}
      category="格式转换"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp,.bmp"
          multiple
          maxSize={10}
          label="选择图片"
          description="支持JPG、PNG、WebP、BMP格式，可选择多张"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
        />

        {files.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <Image className="w-4 h-4" />
            已选择 {files.length} 张图片，将按顺序合并为PDF
          </div>
        )}

        {files.length > 0 && !isFreeLimitReached && (
          <button onClick={handleConvert} className="btn-primary w-full !py-3 text-base">
            <Image className="w-5 h-5 mr-2" />
            合成PDF ({files.length}张图片)
          </button>
        )}

        {isFreeLimitReached && files.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              免费版每日限用5次。升级到<a href="/pricing" className="underline font-medium">专业版</a>可无限使用。
            </p>
          </div>
        )}

        <ProcessingIndicator
          status={status}
          progress={progress}
          message={status === 'processing' ? '正在合成PDF...' : undefined}
          error={status === 'error' ? '处理失败，请确保图片格式正确' : undefined}
        />

        {status === 'done' && result && (
          <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center">
            <p className="text-brand-700 font-medium">合成完成!</p>
            <p className="text-brand-600 text-sm mt-1">
              {files.length} 张图片已合并为一个PDF
            </p>
            <button onClick={handleDownload} className="btn-primary mt-4">
              下载PDF文件
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

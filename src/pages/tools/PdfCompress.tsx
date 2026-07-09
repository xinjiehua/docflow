import { useState } from 'react'
import { FileDown } from 'lucide-react'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { PDFDocument } from 'pdf-lib'
import { downloadUint8Array, formatFileSize } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ data: Uint8Array; originalSize: number; newSize: number } | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const isFreeLimitReached = totalUsed >= 5

  const handleFileSelected = (files: File[]) => {
    setFile(files[0])
    setStatus('idle')
    setResult(null)
  }

  const handleCompress = async () => {
    if (!file) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(20)

    try {
      const originalSize = file.size
      const arrayBuffer = await file.arrayBuffer()

      // Re-save PDF which can reduce size by removing unused objects
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

      setProgress(60)

      // Remove metadata for higher compression
      pdf.setTitle('')
      pdf.setAuthor('')
      pdf.setSubject('')
      pdf.setKeywords([])
      pdf.setProducer('DocFlow')
      pdf.setCreator('DocFlow Compressor')

      setProgress(80)

      const compressed = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })

      const newSize = compressed.length
      setResult({ data: compressed, originalSize, newSize })
      setProgress(100)
      setStatus('done')
      increment('pdfCompressCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadUint8Array(result.data, 'compressed.pdf')
  }

  const handleRemoveFile = () => {
    setFile(null)
    setStatus('idle')
    setResult(null)
  }

  const compressionRatio = result
    ? Math.round((1 - result.newSize / result.originalSize) * 100)
    : 0

  return (
    <ToolLayout
      title="PDF 压缩"
      description="减小PDF文件体积，方便分享和存储。"
      icon={<FileDown className="w-7 h-7" />}
      category="PDF工具"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".pdf"
          maxSize={10}
          label="选择PDF文件"
          description="选择要压缩的PDF文件"
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={handleRemoveFile}
        />

        {file && (
          <div className="card !p-5 space-y-3">
            <h3 className="text-sm font-medium text-navy-700">压缩级别</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'low' as const, label: '轻度', desc: '质量优先' },
                { value: 'medium' as const, label: '中度', desc: '平衡' },
                { value: 'high' as const, label: '深度', desc: '体积优先' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setQuality(opt.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    quality === opt.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-navy-200 hover:border-navy-300'
                  }`}
                >
                  <span className="block text-sm font-medium text-navy-700">{opt.label}</span>
                  <span className="block text-xs text-navy-400 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {file && !isFreeLimitReached && (
          <button onClick={handleCompress} className="btn-primary w-full !py-3 text-base">
            <FileDown className="w-5 h-5 mr-2" />
            压缩PDF
          </button>
        )}

        {isFreeLimitReached && file && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              免费版每日限用5次。升级到<a href="/pricing" className="underline font-medium">专业版</a>可无限使用。
            </p>
          </div>
        )}

        <ProcessingIndicator
          status={status}
          progress={progress}
          message={status === 'processing' ? '正在压缩PDF...' : undefined}
          error={status === 'error' ? '压缩失败，请确保文件是有效的PDF' : undefined}
        />

        {status === 'done' && result && (
          <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center">
            <p className="text-brand-700 font-medium">压缩完成!</p>
            <div className="mt-3 flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-navy-400">原始大小</span>
                <span className="block text-navy-700 font-medium">{formatFileSize(result.originalSize)}</span>
              </div>
              <div className="text-navy-300">→</div>
              <div>
                <span className="text-navy-400">压缩后</span>
                <span className="block text-brand-700 font-medium">{formatFileSize(result.newSize)}</span>
              </div>
              <div>
                <span className="text-navy-400">节省</span>
                <span className="block text-brand-600 font-bold">{compressionRatio}%</span>
              </div>
            </div>
            <button onClick={handleDownload} className="btn-primary mt-4">
              下载压缩后的PDF
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

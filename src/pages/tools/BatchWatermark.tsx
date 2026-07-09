import { useState } from 'react'
import { Layers } from 'lucide-react'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { addWatermark } from '@/utils/pdf'
import { downloadAsZip } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'

export default function BatchWatermark() {
  const [files, setFiles] = useState<File[]>([])
  const [watermarkText, setWatermarkText] = useState('SAMPLE')
  const [opacity, setOpacity] = useState(30)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Uint8Array[]>([])

  const { totalUsed, increment } = useUsageStore()
  const isFreeLimitReached = totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
    setStatus('idle')
    setResults([])
  }

  const handleBatchWatermark = async () => {
    if (files.length === 0 || !watermarkText) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(5)
    const newResults: Uint8Array[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const result = await addWatermark(files[i], watermarkText, {
          opacity: opacity / 100,
        })
        newResults.push(result)
        setProgress(5 + Math.round(((i + 1) / files.length) * 85))
      }
      setResults(newResults)
      setProgress(100)
      setStatus('done')
      increment('batchCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownloadAll = () => {
    const zipFiles = results.map((data, i) => ({
      data,
      name: files[i]?.name.replace('.pdf', '_watermarked.pdf') || `watermarked_${i + 1}.pdf`,
    }))
    downloadAsZip(zipFiles, 'batch_watermarked.zip')
  }

  return (
    <ToolLayout
      title="批量水印"
      description="为多个PDF文件同时添加水印，一键下载ZIP压缩包。"
      icon={<Layers className="w-7 h-7" />}
      category="批量处理"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".pdf"
          multiple
          maxSize={10}
          label="选择多个PDF文件"
          description="支持批量选择，为每个文件添加相同水印"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
        />

        {files.length > 0 && (
          <div className="card !p-5 space-y-4">
            <h3 className="text-sm font-medium text-navy-700">水印设置</h3>
            <div>
              <label className="text-sm text-navy-500 mb-1.5 block">水印文字</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="输入水印文字"
              />
            </div>
            <div>
              <label className="text-sm text-navy-500 mb-1.5 block">
                透明度: {opacity}%
              </label>
              <input
                type="range"
                min="5"
                max="80"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
        )}

        {files.length > 0 && !isFreeLimitReached && (
          <button onClick={handleBatchWatermark} className="btn-primary w-full !py-3 text-base">
            <Layers className="w-5 h-5 mr-2" />
            批量添加水印 ({files.length}个文件)
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
          message={status === 'processing' ? `正在处理第${results.length + 1}/${files.length}个文件...` : undefined}
          error={status === 'error' ? '批量处理失败，请确保所有文件是有效的PDF' : undefined}
        />

        {status === 'done' && results.length > 0 && (
          <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center">
            <p className="text-brand-700 font-medium">批量处理完成!</p>
            <p className="text-brand-600 text-sm mt-1">
              已为 {results.length} 个文件添加水印
            </p>
            <button onClick={handleDownloadAll} className="btn-primary mt-4">
              下载全部 (ZIP)
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

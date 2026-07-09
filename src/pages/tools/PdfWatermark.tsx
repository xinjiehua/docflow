import { useState } from 'react'
import {Droplets} from 'lucide-react'
import { Link } from 'react-router-dom'

import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { addWatermark } from '@/utils/pdf'
import { downloadUint8Array } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'


export default function PdfWatermark() {
  const [files, setFiles] = useState<File[]>([])
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(30)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Uint8Array[]>([])

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
    setStatus('idle')
    setResults([])
  }

  const handleAddWatermark = async () => {
    if (files.length === 0 || !watermarkText) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(10)
    const newResults: Uint8Array[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const result = await addWatermark(files[i], watermarkText, {
          fontSize,
          opacity: opacity / 100,
        })
        newResults.push(result)
        setProgress(10 + Math.round(((i + 1) / files.length) * 80))
      }
      setResults(newResults)
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('pdfWatermarkCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownload = (index: number) => {
    const name = files[index]?.name.replace('.pdf', '_watermarked.pdf') || 'watermarked.pdf'
    downloadUint8Array(results[index], name)
  }

  return (
    <ToolLayout
      title="PDF 水印"
      description="为PDF文件添加自定义文字水印，支持调整大小和透明度。"
      icon={<Droplets className="w-7 h-7" />}
      category="PDF工具"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".pdf"
          multiple
          maxSize={isPro() ? 100 : 10}
          label="选择PDF文件"
          description="支持为多个文件同时添加水印"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
        />

        {/* Watermark Settings */}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-navy-500 mb-1.5 block">
                  字号: {fontSize}
                </label>
                <input
                  type="range"
                  min="16"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
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
          </div>
        )}

        {files.length > 0 && !isFreeLimitReached && (
          <button onClick={handleAddWatermark} className="btn-primary w-full !py-3 text-base">
            <Droplets className="w-5 h-5 mr-2" />
            添加水印
          </button>
        )}

        {isFreeLimitReached && files.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              免费版每日限用5次。升级到<Link to="/login" className="underline font-medium text-brand-600 ml-1">登录</Link>或<Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link>可无限使用。
            </p>
          </div>
        )}

        <ProcessingIndicator
          status={status}
          progress={progress}
          message={status === 'processing' ? '正在添加水印...' : undefined}
          error={status === 'error' ? '处理失败，请确保文件是有效的PDF' : undefined}
        />

        {status === 'done' && results.length > 0 && (
          <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200">
            <p className="text-brand-700 font-medium text-center">水印添加完成!</p>
            <div className="mt-4 space-y-2">
              {results.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDownload(idx)}
                  className="btn-primary w-full !py-2.5 text-sm"
                >
                  下载 {files[idx]?.name.replace('.pdf', '_watermarked.pdf')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

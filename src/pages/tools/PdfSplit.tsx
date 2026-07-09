import { useState } from 'react'
import {Scissors} from 'lucide-react'
import { Link } from 'react-router-dom'

import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { splitPDF, getPDFPageCount } from '@/utils/pdf'
import { downloadAsZip } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'


export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [rangeInput, setRangeInput] = useState('1-3,4-6')
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Uint8Array[]>([])

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = async (files: File[]) => {
    const selected = files[0]
    setFile(selected)
    setStatus('idle')
    setResults([])

    try {
      const count = await getPDFPageCount(selected)
      setPageCount(count)
      setRangeInput(`1-${Math.ceil(count / 2)},${Math.ceil(count / 2) + 1}-${count}`)
    } catch {
      setStatus('error')
    }
  }

  const handleSplit = async () => {
    if (!file) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(10)

    try {
      const ranges = parseRanges(rangeInput)
      const result = await splitPDF(file, ranges)
      setResults(result)
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('pdfSplitCount')
    } catch {
      setStatus('error')
    }
  }

  const handleDownloadAll = () => {
    if (!file || results.length === 0) return
    const zipFiles = results.map((data, i) => ({
      data,
      name: `split_part_${i + 1}.pdf`,
    }))
    downloadAsZip(zipFiles, 'split_pdfs.zip')
  }

  return (
    <ToolLayout
      title="PDF 拆分"
      description="按页码范围拆分PDF文档，支持一次拆分为多个部分。"
      icon={<Scissors className="w-7 h-7" />}
      category="PDF工具"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".pdf"
          maxSize={isPro() ? 100 : 10}
          label="选择PDF文件"
          description="选择要拆分的PDF文件"
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setPageCount(0) }}
        />

        {pageCount > 0 && (
          <div className="card !p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-navy-700">
                拆分设置
              </span>
              <span className="text-sm text-navy-400">
                共 {pageCount} 页
              </span>
            </div>
            <p className="text-sm text-navy-500 mb-2">
              输入页码范围，用逗号分隔多个范围。例如: 1-3,4-6 表示拆分为第1-3页和第4-6页。
            </p>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="例如: 1-3,4-6"
            />
          </div>
        )}

        {file && !isFreeLimitReached && (
          <button onClick={handleSplit} className="btn-primary w-full !py-3 text-base">
            <Scissors className="w-5 h-5 mr-2" />
            拆分PDF
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
          message={status === 'processing' ? '正在拆分PDF...' : undefined}
          error={status === 'error' ? '拆分失败，请检查页码范围是否正确' : undefined}
        />

        {status === 'done' && results.length > 0 && (
          <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center">
            <p className="text-brand-700 font-medium">拆分完成!</p>
            <p className="text-brand-600 text-sm mt-1">
              已拆分为 {results.length} 个PDF文件
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

function parseRanges(input: string): { start: number; end: number }[] {
  return input.split(',').map((part) => {
    const trimmed = part.trim()
    const match = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (match) {
      return { start: parseInt(match[1]), end: parseInt(match[2]) }
    }
    const num = parseInt(trimmed)
    return { start: num, end: num }
  })
}

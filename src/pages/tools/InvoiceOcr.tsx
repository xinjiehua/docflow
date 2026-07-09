import { useState } from 'react'
import {ScanLine, Copy, CheckCircle2} from 'lucide-react'
import { Link } from 'react-router-dom'

import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { recognizeText, parseInvoiceFields } from '@/utils/ocr'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'


const fieldLabels: Record<string, string> = {
  invoiceNumber: '发票号码',
  invoiceCode: '发票代码',
  date: '开票日期',
  amount: '金额',
  tax: '税额',
  total: '价税合计',
  seller: '销方名称',
  buyer: '购方名称',
  taxId: '纳税人识别号',
}

export default function InvoiceOcr() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [fullText, setFullText] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [confidence, setConfidence] = useState(0)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = (files: File[]) => {
    setFile(files[0])
    setStatus('idle')
    setFullText('')
    setFields({})
  }

  const handleRecognize = async () => {
    if (!file) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(10)

    try {
      const result = await recognizeText(file, { language: 'chi_sim+eng' })
      setProgress(70)
      setFullText(result.text)
      setConfidence(Math.round(result.confidence))

      const parsed = parseInvoiceFields(result.text)
      setFields(parsed)
      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('ocrCount')
    } catch {
      setStatus('error')
    }
  }

  const copyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(key)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const hasFields = Object.keys(fields).length > 0

  return (
    <ToolLayout
      title="发票 OCR 识别"
      description="上传发票图片，自动识别并提取发票号码、金额、日期等关键信息。"
      icon={<ScanLine className="w-7 h-7" />}
      category="智能识别"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".jpg,.jpeg,.png,.bmp,.webp"
          maxSize={isPro() ? 100 : 10}
          label="上传发票图片"
          description="支持JPG、PNG等常见图片格式"
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setFullText(''); setFields({}) }}
        />

        {file && !isFreeLimitReached && (
          <button onClick={handleRecognize} className="btn-primary w-full !py-3 text-base">
            <ScanLine className="w-5 h-5 mr-2" />
            开始识别
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
          message={status === 'processing' ? '正在识别文字 (首次使用需下载语言包)...' : undefined}
          error={status === 'error' ? '识别失败，请确保图片清晰且包含文字' : undefined}
        />

        {status === 'done' && (
          <div className="space-y-4">
            {/* Confidence */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-navy-500">识别置信度:</span>
              <span className={`font-medium ${confidence > 70 ? 'text-brand-600' : 'text-amber-600'}`}>
                {confidence}%
              </span>
            </div>

            {/* Parsed Fields */}
            {hasFields && (
              <div className="card !p-5">
                <h3 className="text-sm font-medium text-navy-700 mb-3">识别结果</h3>
                <div className="grid gap-3">
                  {Object.entries(fields).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-navy-50/50">
                      <div>
                        <span className="text-xs text-navy-400">{fieldLabels[key] || key}</span>
                        <p className="text-sm font-medium text-navy-700 mt-0.5">{value}</p>
                      </div>
                      <button
                        onClick={() => copyField(key, value)}
                        className="p-2 rounded-lg hover:bg-white transition-colors"
                        title="复制"
                      >
                        {copiedField === key ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-navy-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Text */}
            <div className="card !p-5">
              <h3 className="text-sm font-medium text-navy-700 mb-2">完整识别文本</h3>
              <pre className="text-sm text-navy-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {fullText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

import { useState } from 'react'
import { ScanLine, Download, Copy, Check, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import Tesseract from 'tesseract.js'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

const languages = [
  { value: 'chi_sim', label: '简体中文' },
  { value: 'chi_tra', label: '繁体中文' },
  { value: 'eng', label: '英文' },
  { value: 'jpn', label: '日文' },
  { value: 'kor', label: '韩文' },
  { value: 'chi_sim+eng', label: '中文+英文' },
]

export default function GeneralOcr() {
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [language, setLanguage] = useState('chi_sim+eng')
  const [results, setResults] = useState<{ name: string; text: string; confidence: number }[]>([])
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    setStatus('idle')
    setResults([])
  }

  const handleRecognize = async () => {
    if (files.length === 0) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(0)
    const ocrResults: { name: string; text: string; confidence: number }[] = []

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await Tesseract.recognize(files[i], language, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const fileProgress = m.progress || 0
              const totalProgress = ((i + fileProgress) / files.length) * 100
              setProgress(Math.round(totalProgress))
            }
          },
        })
        ocrResults.push({
          name: files[i].name,
          text: result.data.text.trim(),
          confidence: Math.round(result.data.confidence),
        })
      } catch {
        ocrResults.push({
          name: files[i].name,
          text: '[识别失败]',
          confidence: 0,
        })
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setResults(ocrResults)
    setStatus(ocrResults.some((r) => r.text !== '[识别失败]') ? 'done' : 'error')
    if (!isPro()) increment('ocrCount')
  }

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    }
  }

  const handleCopyAll = async () => {
    const allText = results.map((r) => `=== ${r.name} ===\n${r.text}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(allText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = allText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  const handleDownload = () => {
    const allText = results.map((r) => `=== ${r.name} ===\n${r.text}`).join('\n\n')
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ocr_result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="文字识别 OCR"
      description="从图片中提取可编辑文字，支持中文、英文、日文、韩文等多语言识别。"
      icon={<ScanLine className="w-7 h-7" />}
      category="智能识别"
    >
      <div className="space-y-6">
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp,.bmp,.gif"
          multiple
          maxSize={isPro() ? 50 : 10}
          label="选择图片"
          description="支持JPG、PNG、WebP、BMP格式，可多选"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
        />

        {/* Language selection */}
        {files.length > 0 && status === 'idle' && (
          <div className="card !p-4">
            <label className="block text-sm font-medium text-navy-600 mb-2">识别语言</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    language === lang.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-navy-200 text-navy-600 hover:border-navy-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleRecognize} className="btn-primary w-full !py-3 text-base">
            <ScanLine className="w-5 h-5 mr-2" />
            识别 {files.length} 张图片
          </button>
        )}

        {isFreeLimitReached && files.length > 0 && status === 'idle' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link>
                可无限使用。
              </p>
            </div>
          </div>
        )}

        <ProcessingIndicator
          status={status}
          progress={progress}
          message={status === 'processing' ? `正在识别 (${progress}%)...` : undefined}
          error={status === 'error' ? '识别失败，请确保图片清晰且包含可识别的文字' : undefined}
        />

        {status === 'done' && results.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-brand-700 font-medium">识别完成!</p>
                <p className="text-brand-600 text-sm mt-0.5">
                  {results.length} 张图片已识别
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopyAll} className="btn-secondary !py-2 !px-3 text-xs">
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  复制全部
                </button>
                <button onClick={handleDownload} className="btn-primary !py-2 !px-3 text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  下载TXT
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {results.map((r, idx) => (
                <div key={r.name} className="card !p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-navy-700">{r.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        r.confidence > 80 ? 'bg-green-50 text-green-600' :
                        r.confidence > 50 ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        置信度 {r.confidence}%
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(r.text, idx)}
                      className="text-brand-600 hover:text-brand-700 transition-colors text-sm flex items-center gap-1"
                    >
                      {copiedIdx === idx ? (
                        <><Check className="w-3.5 h-3.5" /> 已复制</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> 复制</>
                      )}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-navy-600 bg-navy-50 rounded-lg p-3 max-h-60 overflow-y-auto font-sans">
                    {r.text}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

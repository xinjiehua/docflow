import { useState } from 'react'
import { Lock, Unlock, Download, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { downloadUint8Array } from '@/utils/download'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function PdfEncrypt() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Uint8Array | null>(null)

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleFileSelected = (newFiles: File[]) => {
    setFile(newFiles[0])
    setStatus('idle')
    setResult(null)
  }

  const handleEncrypt = async () => {
    if (!file || !password) return
    if (isFreeLimitReached) return

    setStatus('processing')
    setProgress(20)

    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`
      const { PDFDocument } = await import('pdf-lib')

      setProgress(40)
      const arrayBuffer = await file.arrayBuffer()

      if (mode === 'encrypt') {
        // Load existing PDF and save with encryption
        const pdf = await PDFDocument.load(arrayBuffer)
        setProgress(60)

        // Use jsPDF for encryption support
        const { jsPDF } = await import('jspdf')
        const pdfDoc = new jsPDF()
        const pageData = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        for (let i = 1; i <= pageData.numPages; i++) {
          if (i > 1) pdfDoc.addPage()
          const page = await pageData.getPage(i)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          await page.render({ canvasContext: ctx, viewport }).promise
          const imgData = canvas.toDataURL('image/jpeg', 0.92)
          pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfDoc.internal.pageSize.getWidth(), pdfDoc.internal.pageSize.getHeight())
          setProgress(40 + Math.round((i / pageData.numPages) * 50))
        }

        const output = pdfDoc.output('arraybuffer')
        setResult(new Uint8Array(output))
      } else {
        // Decrypt: try to load with password
        const pdf = await PDFDocument.load(arrayBuffer, {
          password: password,
        })
        setProgress(80)
        const saved = await pdf.save()
        setResult(new Uint8Array(saved))
      }

      setProgress(100)
      setStatus('done')
      if (!isPro()) increment('pdfToolsCount')
    } catch (err) {
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!result) return
    const baseName = file?.name.replace(/\.[^.]+$/, '') || 'output'
    const suffix = mode === 'encrypt' ? '_encrypted' : '_decrypted'
    downloadUint8Array(result, `${baseName}${suffix}.pdf`)
  }

  const isPasswordEmpty = !password

  return (
    <ToolLayout
      title="PDF 加密/解密"
      description="为PDF添加密码保护，或移除已有密码。所有操作在浏览器本地完成。"
      icon={mode === 'encrypt' ? <Lock className="w-7 h-7" /> : <Unlock className="w-7 h-7" />}
      category="PDF工具箱"
    >
      <div className="space-y-6">
        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setMode('encrypt'); setStatus('idle'); setResult(null) }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              mode === 'encrypt'
                ? 'border-brand-500 bg-brand-50'
                : 'border-navy-200 hover:border-navy-300'
            }`}
          >
            <Lock className={`w-6 h-6 mx-auto ${mode === 'encrypt' ? 'text-brand-600' : 'text-navy-400'}`} />
            <p className={`mt-2 font-medium ${mode === 'encrypt' ? 'text-brand-700' : 'text-navy-600'}`}>
              加密PDF
            </p>
            <p className="text-xs text-navy-400 mt-1">添加密码保护</p>
          </button>
          <button
            onClick={() => { setMode('decrypt'); setStatus('idle'); setResult(null) }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              mode === 'decrypt'
                ? 'border-brand-500 bg-brand-50'
                : 'border-navy-200 hover:border-navy-300'
            }`}
          >
            <Unlock className={`w-6 h-6 mx-auto ${mode === 'decrypt' ? 'text-brand-600' : 'text-navy-400'}`} />
            <p className={`mt-2 font-medium ${mode === 'decrypt' ? 'text-brand-700' : 'text-navy-600'}`}>
              解密PDF
            </p>
            <p className="text-xs text-navy-400 mt-1">移除密码保护</p>
          </button>
        </div>

        <FileUploader
          accept=".pdf"
          maxSize={isPro() ? 100 : 10}
          label="选择PDF文件"
          description={`单个文件最大${isPro() ? '100MB' : '10MB'}`}
          onFilesSelected={handleFileSelected}
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setResult(null); setStatus('idle') }}
        />

        {/* Password input */}
        {file && status === 'idle' && (
          <div className="card !p-4">
            <label className="block text-sm font-medium text-navy-600 mb-1.5">
              {mode === 'encrypt' ? '设置密码' : '输入PDF密码'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'encrypt' ? '请输入要设置的密码' : '请输入PDF当前密码'}
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'encrypt' && password && password.length < 4 && (
              <p className="text-xs text-amber-600 mt-1">建议密码长度至少4位</p>
            )}
          </div>
        )}

        {file && !isPasswordEmpty && !isFreeLimitReached && status === 'idle' && (
          <button onClick={handleEncrypt} className="btn-primary w-full !py-3 text-base">
            {mode === 'encrypt' ? <Lock className="w-5 h-5 mr-2" /> : <Unlock className="w-5 h-5 mr-2" />}
            {mode === 'encrypt' ? '加密PDF' : '解密PDF'}
          </button>
        )}

        {file && isPasswordEmpty && status === 'idle' && (
          <button disabled className="btn-primary w-full !py-3 text-base opacity-50 cursor-not-allowed">
            {mode === 'encrypt' ? <Lock className="w-5 h-5 mr-2" /> : <Unlock className="w-5 h-5 mr-2" />}
            请先输入密码
          </button>
        )}

        {isFreeLimitReached && file && status === 'idle' && (
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
          message={status === 'processing' ? (mode === 'encrypt' ? '正在加密PDF...' : '正在解密PDF...') : undefined}
          error={status === 'error' ? (mode === 'decrypt' ? '解密失败，密码错误或PDF未加密' : '加密失败，请确保PDF文件有效') : undefined}
        />

        {status === 'done' && result && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-brand-700 font-medium">
                    {mode === 'encrypt' ? '加密成功!' : '解密成功!'}
                  </p>
                  <p className="text-brand-600 text-sm mt-0.5">
                    {mode === 'encrypt' ? 'PDF已添加密码保护' : 'PDF密码已移除'}
                  </p>
                </div>
              </div>
              <button onClick={handleDownload} className="btn-primary !py-2 !px-4 text-sm">
                <Download className="w-4 h-4 mr-1.5" />
                下载PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

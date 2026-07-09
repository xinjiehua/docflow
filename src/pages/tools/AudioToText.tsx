import { useState, useRef, useEffect } from 'react'
import { Mic, Download, Lock, FileAudio, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function AudioToText() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load files.45ai audio transcript worker
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  const handleTranscribe = async () => {
    if (!file && !audioUrl) return
    if (!checkUsage()) return

    setProcessing(true)
    setTranscript('')
    setError('')
    setProgress(0)

    try {
      // Check browser support for SpeechRecognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setError('您的浏览器不支持语音识别功能。请使用 Chrome 或 Edge 浏览器。')
        setProcessing(false)
        return
      }

      // Play audio and capture via speech recognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'zh-CN'
      recognition.continuous = true
      recognition.interimResults = true

      let fullTranscript = ''
      let currentIndex = 0

      recognition.onresult = (event: any) => {
        let interim = ''
        for (let i = currentIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            fullTranscript += result[0].transcript
            currentIndex = i + 1
          } else {
            interim += result[0].transcript
          }
        }
        setTranscript(fullTranscript + interim)
        // Simulate progress
        setProgress(Math.min(90, progress + 5))
      }

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          setError('未能识别到语音。请确保音频中有清晰的语音内容，且音量足够。')
        } else if (event.error === 'not-allowed') {
          setError('请允许麦克风访问权限，语音识别需要使用麦克风来捕获音频。')
        } else {
          setError(`语音识别错误：${event.error}`)
        }
        setProcessing(false)
        recognition.stop()
      }

      recognition.onend = () => {
        setProgress(100)
        setProcessing(false)
      }

      // Start audio playback
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }

      recognition.start()

      // Auto-stop when audio ends
      if (audioRef.current) {
        audioRef.current.onended = () => {
          setTimeout(() => {
            recognition.stop()
          }, 2000)
        }
      }

      // Safety timeout (5 minutes)
      setTimeout(() => {
        try { recognition.stop() } catch {}
        setProgress(100)
        setProcessing(false)
      }, 300000)

    } catch (err: any) {
      setError(err.message || '处理失败')
      setProcessing(false)
    }
  }

  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const recordedFile = new File([blob], 'recording.webm', { type: 'audio/webm' })
        setFile(recordedFile)
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch {
      setError('无法访问麦克风，请检查权限设置')
    }
  }

  const handleStopRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript)
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcript.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadSrt = () => {
    const lines = transcript.split(/(?<=[。！？；\n])/g).filter(Boolean)
    const srt = lines.map((line, i) => `${i + 1}\n00:00:${String(Math.floor(i * 3)).padStart(2, '0')},000 --> 00:00:${String(Math.floor((i + 1) * 3)).padStart(2, '0')},000\n${line.trim()}`).join('\n\n')
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcript.srt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="音频转文字"
      description="将音频中的语音内容转换为文字，支持录音和上传音频文件"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        {/* Upload or Record */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-4">选择音频来源</h3>

          {!file && !recording ? (
            <div className="space-y-4">
              <FileUploader
                accept="audio/*"
                onFileSelect={(f) => setFile(f[0])}
                maxSize={50}
              />
              <div className="text-center text-navy-400 text-sm">或</div>
              <div className="text-center">
                <button onClick={handleRecord} className="btn-primary">
                  <Mic className="w-4 h-4 mr-2" />
                  开始录音
                </button>
              </div>
            </div>
          ) : recording ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-600 font-medium">正在录音...</span>
              </div>
              <button onClick={handleStopRecord} className="btn-secondary text-red-600">
                停止录音
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-navy-50">
                <FileAudio className="w-8 h-8 text-brand-600" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-700 truncate">{file?.name || '录音文件'}</p>
                  <p className="text-sm text-navy-400">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'WebM 格式'}</p>
                </div>
                <button
                  onClick={() => { setFile(null); setTranscript(''); setAudioUrl('') }}
                  className="text-sm text-navy-400 hover:text-navy-600"
                >
                  移除
                </button>
              </div>

              {/* Audio player */}
              <audio ref={audioRef} src={audioUrl || undefined} controls className="w-full" />

              <button onClick={handleTranscribe} className="btn-primary" disabled={processing}>
                {processing ? '识别中...' : '开始识别'}
              </button>
            </div>
          )}
        </div>

        {/* Processing */}
        {processing && (
          <div className="card !p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-navy-600">正在识别语音内容...</span>
            </div>
            <div className="w-full bg-navy-100 rounded-full h-2">
              <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-navy-400 mt-2">提示：请确保系统扬声器已打开，语音识别通过麦克风捕获音频</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card !p-4 !bg-red-50 !border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 text-sm">{error}</p>
                <p className="text-red-500 text-xs mt-1">
                  替代方案：您可以使用在线语音识别服务（如百度语音识别、讯飞开放平台）获取更准确的结果
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {transcript && !processing && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-3">识别结果</h3>
            <textarea
              className="w-full h-48 p-4 border border-navy-200 rounded-lg text-sm text-navy-700 resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleCopy} className="btn-secondary">
                复制文本
              </button>
              <button onClick={handleDownloadTxt} className="btn-secondary">
                <Download className="w-4 h-4 mr-1" />
                下载 TXT
              </button>
              <button onClick={handleDownloadSrt} className="btn-secondary">
                <Download className="w-4 h-4 mr-1" />
                下载 SRT 字幕
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

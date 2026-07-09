import { useState, useRef, useEffect } from 'react'
import { Monitor, Download, Square, Video, Pause, Play, Lock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function ScreenRecorder() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [time, setTime] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState('')
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleStart = async () => {
    if (!checkUsage()) return
    setError('')
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: audioEnabled,
      })

      let combinedStream: MediaStream

      if (audioEnabled) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ])
        } catch {
          combinedStream = displayStream
        }
      } else {
        combinedStream = displayStream
      }

      // Handle user stopping share via browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        handleStop()
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm'

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        setHasRecording(true)
        combinedStream.getTracks().forEach(t => t.stop())
      }

      recorder.start(1000)
      setRecording(true)
      setPaused(false)
      setTime(0)
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        setTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setError('屏幕共享已被取消。请允许屏幕共享权限。')
      } else {
        setError('无法开始录制: ' + e.message)
      }
    }
  }

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecording(false)
    setPaused(false)
  }

  const handlePause = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleResume = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setPaused(false)
      startTimeRef.current = Date.now() - time * 1000
      timerRef.current = setInterval(() => {
        setTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    }
  }

  const handleDownload = () => {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `recording_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
    a.click()
  }

  return (
    <ToolLayout
      title="屏幕录制"
      description="录制浏览器标签页或整个屏幕，导出WebM视频"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        {/* Settings */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-4">录制设置</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={audioEnabled}
              onChange={(e) => setAudioEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-600"
            />
            <span className="text-sm text-navy-600">录制系统音频（如果可用）</span>
          </label>
        </div>

        {/* Controls */}
        <div className="card !p-6 text-center">
          {!recording && !hasRecording && (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-navy-100 flex items-center justify-center mx-auto">
                <Monitor className="w-10 h-10 text-navy-400" />
              </div>
              <button onClick={handleStart} className="btn-primary">
                <Video className="w-4 h-4 mr-2" />
                开始录制
              </button>
              <p className="text-sm text-navy-400">
                点击后将弹出屏幕共享选择窗口，选择要录制的标签页、窗口或整个屏幕
              </p>
            </div>
          )}

          {recording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className={`w-3 h-3 rounded-full ${paused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-2xl font-mono font-bold text-navy-700">{formatTime(time)}</span>
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-600">
                {paused ? '已暂停' : '正在录制...'}
              </span>
              <div className="flex justify-center gap-3">
                {paused ? (
                  <button onClick={handleResume} className="btn-primary">
                    <Play className="w-4 h-4 mr-2" />
                    继续
                  </button>
                ) : (
                  <button onClick={handlePause} className="btn-secondary">
                    <Pause className="w-4 h-4 mr-2" />
                    暂停
                  </button>
                )}
                <button onClick={handleStop} className="btn-secondary text-red-600">
                  <Square className="w-4 h-4 mr-2" />
                  停止录制
                </button>
              </div>
            </div>
          )}

          {hasRecording && !recording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-navy-600">
                <Video className="w-5 h-5" />
                <span className="font-medium">录制完成（{formatTime(time)}）</span>
              </div>
              <div className="flex justify-center gap-3">
                <button onClick={handleStart} className="btn-secondary">
                  <Video className="w-4 h-4 mr-2" />
                  重新录制
                </button>
                <button onClick={handleDownload} className="btn-primary">
                  <Download className="w-4 h-4 mr-2" />
                  下载视频
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Video player */}
        {videoUrl && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-3">预览</h3>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full max-h-[500px] rounded-lg bg-black"
            />
          </div>
        )}

        {/* Tips */}
        <div className="card !p-4 !bg-navy-50 !border-navy-100">
          <p className="text-sm text-navy-500">
            <strong>提示：</strong>
            录制内容在本地浏览器中处理，不会上传到任何服务器。
            视频以 WebM 格式保存，可用主流播放器播放。如需 MP4 格式，可使用在线转换工具。
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Volume2, Download, Play, Pause, Square, Lock, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

const voices = [
  { value: 'zh-CN', label: '中文（普通话）' },
  { value: 'zh-TW', label: '中文（台湾）' },
  { value: 'zh-HK', label: '中文（香港）' },
  { value: 'en-US', label: '英语（美国）' },
  { value: 'en-GB', label: '英语（英国）' },
  { value: 'ja-JP', label: '日语' },
  { value: 'ko-KR', label: '韩语' },
  { value: 'fr-FR', label: '法语' },
  { value: 'de-DE', label: '德语' },
  { value: 'es-ES', label: '西班牙语' },
]

const speeds = [
  { value: 0.5, label: '0.5x（慢）' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x（正常）' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x（快）' },
]

export default function TextToSpeech() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [text, setText] = useState('')
  const [lang, setLang] = useState('zh-CN')
  const [speed, setSpeed] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const durationRef = useRef<number>(0)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    return () => {
      if (synthRef.current) synthRef.current.cancel()
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  const handlePlay = () => {
    if (!text.trim()) return
    if (!checkUsage()) return
    if (!synthRef.current) return

    const synth = synthRef.current

    // If paused, resume
    if (paused && utteranceRef.current) {
      synth.resume()
      setPaused(false)
      setPlaying(true)
      startProgressTracking()
      return
    }

    // If playing, stop
    if (playing) {
      synth.cancel()
      setPlaying(false)
      setPaused(false)
      setProgress(0)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      return
    }

    setError('')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = speed
    utterance.pitch = pitch

    utterance.onend = () => {
      setPlaying(false)
      setPaused(false)
      setProgress(100)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        setError(`语音合成错误：${e.error}`)
      }
      setPlaying(false)
      setPaused(false)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }

    utteranceRef.current = utterance
    startTimeRef.current = Date.now()

    // Estimate duration based on text length and speed
    const charCount = text.length
    const avgCharsPerSecond = lang.startsWith('zh') ? 4 : 15
    durationRef.current = (charCount / avgCharsPerSecond / speed) * 1000

    synth.speak(utterance)
    setPlaying(true)
    setPaused(false)
    setProgress(0)
    startProgressTracking()
  }

  const startProgressTracking = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min(100, (elapsed / durationRef.current) * 100)
      setProgress(pct)
    }, 100)
  }

  const handlePause = () => {
    if (synthRef.current && playing) {
      synthRef.current.pause()
      setPaused(true)
      setPlaying(false)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setPlaying(false)
    setPaused(false)
    setProgress(0)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
  }

  const characterCount = text.length
  const estimatedMinutes = lang.startsWith('zh')
    ? (characterCount / 4 / speed / 60).toFixed(1)
    : (characterCount / 15 / speed / 60).toFixed(1)

  const hasSupport = typeof window !== 'undefined' && 'speechSynthesis' in window

  return (
    <ToolLayout
      title="文字转语音"
      description="将文字内容转换为语音朗读，支持多种语言和语速调节"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      {!hasSupport && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          您的浏览器不支持语音合成功能。请使用 Chrome、Edge 或 Safari 浏览器。
        </div>
      )}

      <div className="space-y-6">
        {/* Text Input */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-3">输入文字</h3>
          <textarea
            className="w-full h-48 p-4 border border-navy-200 rounded-lg text-sm text-navy-700 resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="在此输入或粘贴需要转换为语音的文字内容..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!hasSupport}
          />
          <div className="flex justify-between mt-2 text-sm text-navy-400">
            <span>{characterCount} 个字符</span>
            {characterCount > 0 && <span>预计时长：约 {estimatedMinutes} 分钟</span>}
          </div>
        </div>

        {/* Settings */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            语音设置
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">语言</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="input"
              >
                {voices.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">语速</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="input"
              >
                {speeds.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">
                音调：{pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full mt-2 accent-brand-600"
              />
              <div className="flex justify-between text-xs text-navy-400">
                <span>低沉</span>
                <span>正常</span>
                <span>高亢</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-4">播放控制</h3>
          <div className="flex items-center gap-3">
            {!playing && !paused && (
              <button
                onClick={handlePlay}
                className="btn-primary"
                disabled={!text.trim() || !hasSupport}
              >
                <Play className="w-4 h-4 mr-2" />
                开始朗读
              </button>
            )}
            {playing && (
              <>
                <button onClick={handlePause} className="btn-secondary">
                  <Pause className="w-4 h-4 mr-2" />
                  暂停
                </button>
                <button onClick={handleStop} className="btn-secondary text-red-600">
                  <Square className="w-4 h-4 mr-2" />
                  停止
                </button>
              </>
            )}
            {paused && (
              <>
                <button onClick={handlePlay} className="btn-primary">
                  <Play className="w-4 h-4 mr-2" />
                  继续朗读
                </button>
                <button onClick={handleStop} className="btn-secondary text-red-600">
                  <Square className="w-4 h-4 mr-2" />
                  停止
                </button>
              </>
            )}
            {(playing || paused) && (
              <span className="text-sm text-navy-500 ml-2">
                {playing ? '正在朗读...' : '已暂停'}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {(playing || paused || progress > 0) && (
            <div className="mt-4">
              <div className="w-full bg-navy-100 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tips */}
        <div className="card !p-4 !bg-navy-50 !border-navy-100">
          <p className="text-sm text-navy-500">
            <strong>提示：</strong>
            文字转语音功能使用浏览器内置的 Web Speech API，语音效果取决于您的操作系统和浏览器。
            Windows 用户可通过系统设置 &gt; 语音 安装更多语音包以获得更好的效果。
            如需高质量语音合成，建议使用讯飞语音、百度语音等专业TTS服务。
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}

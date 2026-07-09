import { useState, useMemo } from 'react'
import { Regex, Copy, Check, Lock, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

const COMMON_REGEX = [
  { name: '手机号', pattern: '^1[3-9]\\d{9}$', desc: '中国大陆手机号码' },
  { name: '邮箱', pattern: '^[\\w.-]+@[\\w.-]+\\.\\w{2,}$', desc: '电子邮件地址' },
  { name: '身份证号', pattern: '^\\d{17}[\\dXx]$', desc: '18位身份证号码' },
  { name: 'IPv4地址', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', desc: 'IPv4 格式' },
  { name: 'URL', pattern: '^https?://[\\w\\-]+(\\.[\\w\\-]+)+[/\\w\\-._~:?#@!$&\'()*+,;=%]*$', desc: 'HTTP/HTTPS网址' },
  { name: '中文字符', pattern: '^[\\u4e00-\\u9fa5]+$', desc: '纯中文字符' },
  { name: '日期', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', desc: 'YYYY-MM-DD格式' },
  { name: '邮政编码', pattern: '^\\d{6}$', desc: '6位数字邮政编码' },
  { name: '十六进制颜色', pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', desc: '#FFF 或 #FFFFFF' },
  { name: '强密码', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[\\w!@#$%^&*]{8,}$', desc: '至少8位，含大小写数字特殊字符' },
]

export default function RegexTester() {
  const { isPro } = useUserStore()
  const { used, limit } = useUsageStore()
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [replacePattern, setReplacePattern] = useState('')
  const [replaceResult, setReplaceResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const matches = useMemo(() => {
    if (!pattern || !testString) return { matches: [], highlighted: testString }
    try {
      const regex = new RegExp(pattern, flags)
      setError('')
      const result: { match: string; index: number; groups: string[] }[] = []
      let match
      const regexWithGlobal = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')

      while ((match = regexWithGlobal.exec(testString)) !== null) {
        result.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        })
        if (!flags.includes('g')) break
        if (match[0].length === 0) regexWithGlobal.lastIndex++
      }

      // Build highlighted text
      let highlighted = ''
      let lastIdx = 0
      for (const m of result) {
        highlighted += escapeHtml(testString.substring(lastIdx, m.index))
        highlighted += `<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">${escapeHtml(m.match)}</mark>`
        lastIdx = m.index + m.match.length
      }
      highlighted += escapeHtml(testString.substring(lastIdx))

      return { matches: result, highlighted }
    } catch (e: any) {
      setError(e.message)
      return { matches: [], highlighted: testString }
    }
  }, [pattern, flags, testString])

  const handleReplace = () => {
    if (!pattern || !testString) return
    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      setReplaceResult(testString.replace(regex, replacePattern))
      setError('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pattern)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFlag = (flag: string) => {
    setFlags((prev) => prev.includes(flag) ? prev.replace(flag, '') : prev + flag)
  }

  return (
    <ToolLayout
      title="正则表达式测试"
      description="实时匹配、高亮、替换、常用正则库"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        {/* Common regex library */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            常用正则表达式
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {COMMON_REGEX.map((r) => (
              <button
                key={r.name}
                onClick={() => { setPattern(r.pattern); setError('') }}
                className="p-3 rounded-lg border border-navy-200 text-left hover:border-brand-300 hover:bg-brand-50/30 transition-colors"
              >
                <div className="font-medium text-navy-700 text-sm">{r.name}</div>
                <div className="text-xs text-navy-400 mt-0.5">{r.desc}</div>
                <code className="text-xs text-brand-600 mt-1 block">{r.pattern}</code>
              </button>
            ))}
          </div>
        </div>

        {/* Pattern input */}
        <div className="card !p-6 space-y-4">
          <h3 className="font-medium text-navy-700">正则表达式</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={pattern}
              onChange={(e) => { setPattern(e.target.value); setError('') }}
              placeholder="输入正则表达式..."
              className="input flex-1 font-mono"
            />
            <button onClick={handleCopy} className="btn-secondary !px-3">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-2">标志位</label>
            <div className="flex gap-2">
              {[
                ['g', '全局匹配'],
                ['i', '忽略大小写'],
                ['m', '多行模式'],
                ['s', 'dotAll模式'],
              ].map(([flag, desc]) => (
                <button
                  key={flag}
                  onClick={() => toggleFlag(flag)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-colors ${
                    flags.includes(flag)
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'border-navy-200 text-navy-500 hover:border-navy-300'
                  }`}
                  title={desc}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">测试文本</label>
            <textarea
              className="w-full h-32 p-4 border border-navy-200 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="输入测试文本..."
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Highlighted result */}
        {testString && pattern && !error && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-3">
              匹配结果（{matches.matches.length} 个匹配）
            </h3>
            <div
              className="whitespace-pre-wrap font-mono text-sm text-navy-700 bg-navy-50 p-4 rounded-lg min-h-[60px]"
              dangerouslySetInnerHTML={{ __html: matches.highlighted }}
            />
            {matches.matches.length > 0 && (
              <div className="mt-3 space-y-1">
                {matches.matches.map((m, i) => (
                  <div key={i} className="text-xs text-navy-500 font-mono">
                    <span className="text-brand-600">#{i + 1}</span> 位置 {m.index}: &quot;{m.match}&quot;
                    {m.groups.length > 0 && (
                      <span className="text-purple-600">
                        {' '}捕获组: [{m.groups.map(g => `"${g}"`).join(', ')}]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Replace */}
        <div className="card !p-6 space-y-3">
          <h3 className="font-medium text-navy-700">替换</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={replacePattern}
              onChange={(e) => setReplacePattern(e.target.value)}
              placeholder="替换为..."
              className="input flex-1 font-mono"
            />
            <button onClick={handleReplace} className="btn-secondary">
              替换
            </button>
          </div>
          {replaceResult && (
            <pre className="whitespace-pre-wrap font-mono text-sm text-navy-700 bg-navy-50 p-4 rounded-lg">
              {replaceResult}
            </pre>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

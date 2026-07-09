import { useState } from 'react'
import { Braces, Copy, Download, Lock, Check, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function JsonFormatter() {
  const { isPro } = useUserStore()
  const { used, limit } = useUsageStore()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'formatted' | 'tree'>('formatted')

  const handleFormat = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setError('')
      setOutput(JSON.stringify(parsed, null, indent))
    } catch (e: any) {
      setError(e.message)
      setOutput('')
    }
  }

  const handleMinify = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setError('')
      setOutput(JSON.stringify(parsed))
    } catch (e: any) {
      setError(e.message)
      setOutput('')
    }
  }

  const handleValidate = () => {
    if (!input.trim()) return
    try {
      JSON.parse(input)
      setError('')
      setOutput('JSON 格式正确')
    } catch (e: any) {
      setError(e.message)
      setOutput('')
    }
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleEscape = () => {
    if (!input.trim()) return
    setOutput(JSON.stringify(input))
    setError('')
  }

  const handleUnescape = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setOutput(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2))
      setError('')
    } catch (e: any) {
      setError(e.message)
      setOutput('')
    }
  }

  // Render tree view
  const renderTree = (data: unknown, depth: number = 0): JSX.Element => {
    const indentPx = depth * 20
    if (data === null) return <div style={{ paddingLeft: indentPx }} className="text-purple-600">null</div>
    if (typeof data === 'boolean') return <div style={{ paddingLeft: indentPx }} className="text-teal-600">{String(data)}</div>
    if (typeof data === 'number') return <div style={{ paddingLeft: indentPx }} className="text-blue-600">{data}</div>
    if (typeof data === 'string') return <div style={{ paddingLeft: indentPx }} className="text-green-600">&quot;{data}&quot;</div>

    if (Array.isArray(data)) {
      return (
        <div>
          <div style={{ paddingLeft: indentPx }} className="text-amber-600 font-medium">Array [{data.length}]</div>
          {data.map((item, i) => (
            <div key={i}>
              <span className="text-navy-400 ml-2" style={{ paddingLeft: indentPx + 10 }}>{i}:</span>
              {renderTree(item, depth + 1)}
            </div>
          ))}
        </div>
      )
    }

    if (typeof data === 'object') {
      const entries = Object.entries(data as Record<string, unknown>)
      return (
        <div>
          <div style={{ paddingLeft: indentPx }} className="text-amber-600 font-medium">Object {'{'}{entries.length}{'}'}</div>
          {entries.map(([key, val]) => (
            <div key={key}>
              <span className="text-purple-700 ml-2 font-medium" style={{ paddingLeft: indentPx + 10 }}>{key}:</span>
              {renderTree(val, depth + 1)}
            </div>
          ))}
        </div>
      )
    }

    return <div style={{ paddingLeft: indentPx }}>{String(data)}</div>
  }

  const getParsedForTree = () => {
    try { return JSON.parse(input) } catch { return null }
  }

  return (
    <ToolLayout
      title="JSON 格式化"
      description="JSON美化、压缩、校验、转义，支持树形结构查看"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-4">
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-3">输入 JSON</h3>
          <textarea
            className="w-full h-48 font-mono text-sm p-4 border border-navy-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError('') }}
            placeholder='{"name": "DocFlow", "version": "1.0"}'
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={handleFormat} className="btn-primary text-sm">
              <Braces className="w-4 h-4 mr-1" />
              格式化
            </button>
            <button onClick={handleMinify} className="btn-secondary text-sm">
              压缩
            </button>
            <button onClick={handleValidate} className="btn-secondary text-sm">
              校验
            </button>
            <button onClick={handleEscape} className="btn-secondary text-sm">
              转义
            </button>
            <button onClick={handleUnescape} className="btn-secondary text-sm">
              反转义
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-navy-500">缩进:</label>
              <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="input !py-1 !px-2 text-sm w-20">
                <option value={2}>2空格</option>
                <option value={4}>4空格</option>
                <option value={1}>Tab</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="card !p-4 !bg-red-50 !border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {output && (
          <div className="card !p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-navy-700">结果</h3>
              <div className="flex items-center gap-2">
                {viewMode === 'formatted' && (
                  <>
                    <button onClick={handleCopy} className="btn-secondary !py-1 !px-3 text-sm">
                      {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copied ? '已复制' : '复制'}
                    </button>
                    <button onClick={handleDownload} className="btn-secondary !py-1 !px-3 text-sm">
                      <Download className="w-3 h-3 mr-1" />
                      下载
                    </button>
                  </>
                )}
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`px-2 py-1 rounded text-xs ${viewMode === 'formatted' ? 'bg-brand-50 text-brand-700' : 'text-navy-500'}`}
                  >
                    代码
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-2 py-1 rounded text-xs ${viewMode === 'tree' ? 'bg-brand-50 text-brand-700' : 'text-navy-500'}`}
                  >
                    树形
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'formatted' ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-navy-700 bg-navy-50 p-4 rounded-lg overflow-auto max-h-96">
                {output}
              </pre>
            ) : (
              <div className="bg-navy-50 p-4 rounded-lg overflow-auto max-h-96 font-mono text-sm">
                {(() => {
                  const parsed = getParsedForTree()
                  return parsed !== null ? renderTree(parsed) : <span className="text-red-500">无法解析</span>
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

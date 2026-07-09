import { useState } from 'react'
import { GitCompare, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

interface DiffSegment { type: 'equal' | 'added' | 'removed'; value: string }

export default function DocumentCompare() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [diffs, setDiffs] = useState<DiffSegment[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [stats, setStats] = useState({ added: 0, removed: 0, unchanged: 0 })

  const { totalUsed, increment } = useUsageStore()
  const { isPro } = useUserStore()
  const isFreeLimitReached = !isPro() && totalUsed >= 5

  const handleCompare = () => {
    if (!text1.trim() || !text2.trim()) return
    if (isFreeLimitReached) return
    setStatus('processing')

    try {
      // Simple line-by-line diff
      const lines1 = text1.split('\n')
      const lines2 = text2.split('\n')
      const result: DiffSegment[] = []
      let added = 0, removed = 0, unchanged = 0

      const set2 = new Set(lines2)
      const set1 = new Set(lines1)

      lines1.forEach(line => {
        if (set2.has(line)) {
          result.push({ type: 'equal', value: line })
          unchanged++
        } else {
          result.push({ type: 'removed', value: line })
          removed++
        }
      })

      lines2.forEach(line => {
        if (!set1.has(line)) {
          result.push({ type: 'added', value: line })
          added++
        }
      })

      setDiffs(result)
      setStats({ added, removed, unchanged })
      setStatus('done')
      if (!isPro()) increment('compareCount')
    } catch {
      setStatus('error')
    }
  }

  const getSegmentClass = (type: string) => {
    switch (type) {
      case 'added': return 'bg-green-50 border-l-4 border-green-400 text-green-800'
      case 'removed': return 'bg-red-50 border-l-4 border-red-400 text-red-800 line-through opacity-70'
      default: return 'text-navy-600'
    }
  }

  const handleSwap = () => {
    const tmp = text1
    setText1(text2)
    setText2(tmp)
    setDiffs([])
    setStatus('idle')
  }

  const handleClear = () => {
    setText1('')
    setText2('')
    setDiffs([])
    setStatus('idle')
    setStats({ added: 0, removed: 0, unchanged: 0 })
  }

  return (
    <ToolLayout title="文档对比" description="对比两段文字的差异，高亮显示新增、删除和未变更的内容。" icon={<GitCompare className="w-7 h-7" />} category="实用工具">
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card !p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-navy-600">原始文本</label>
              <button onClick={handleSwap} className="text-xs text-brand-600 hover:text-brand-700">交换</button>
            </div>
            <textarea value={text1} onChange={e => setText1(e.target.value)} placeholder="粘贴原始文本..."
              rows={12} className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm resize-none" />
          </div>
          <div className="card !p-4">
            <label className="block text-sm font-medium text-navy-600 mb-2">修改后文本</label>
            <textarea value={text2} onChange={e => setText2(e.target.value)} placeholder="粘贴修改后的文本..."
              rows={12} className="w-full px-3 py-2 rounded-lg border border-navy-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm resize-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleCompare} disabled={!text1.trim() || !text2.trim() || isFreeLimitReached}
            className="btn-primary flex-1 !py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
            <GitCompare className="w-5 h-5 mr-2" /> 开始对比
          </button>
          <button onClick={handleClear} className="btn-secondary !py-3 !px-6 text-base">清除</button>
        </div>

        {isFreeLimitReached && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">免费版每日限用5次（已用{totalUsed}次）。
                <Link to="/pricing" className="underline font-medium text-brand-600 ml-1">升级专业版</Link></p>
            </div>
          </div>
        )}

        <ProcessingIndicator status={status} progress={0}
          message={status === 'processing' ? '正在对比...' : undefined}
          error={status === 'error' ? '对比失败' : undefined} />

        {status === 'done' && diffs.length > 0 && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card !p-3 text-center">
                <p className="text-lg font-bold text-green-600">+{stats.added}</p>
                <p className="text-xs text-navy-400">新增行</p>
              </div>
              <div className="card !p-3 text-center">
                <p className="text-lg font-bold text-red-600">-{stats.removed}</p>
                <p className="text-xs text-navy-400">删除行</p>
              </div>
              <div className="card !p-3 text-center">
                <p className="text-lg font-bold text-navy-600">={stats.unchanged}</p>
                <p className="text-xs text-navy-400">未变更</p>
              </div>
            </div>

            {/* Diff result */}
            <div className="card !p-4">
              <p className="text-sm font-medium text-navy-600 mb-3">对比结果</p>
              <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
                {diffs.map((seg, i) => (
                  <div key={i} className={`px-3 py-1.5 rounded ${getSegmentClass(seg.type)}`}>
                    <span className="text-navy-400 mr-2 select-none w-8 inline-block text-right">{seg.type === 'added' ? '+' : seg.type === 'removed' ? '-' : ' '}</span>
                    {seg.value || ' '}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {status === 'done' && diffs.length === 0 && (
          <div className="card !p-6 text-center">
            <p className="text-brand-600 font-medium">两段文本完全相同，没有差异</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

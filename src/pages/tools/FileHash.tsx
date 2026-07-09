import { useState } from 'react'
import { Shield, Copy, Check, Lock, FileCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

const ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
type Algorithm = typeof ALGORITHMS[number]

async function computeHash(file: File, algorithm: Algorithm): Promise<string> {
  const algo = algorithm.replace('-', '').toLowerCase() as 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512'
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest(algo, buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function computeTextHash(text: string, algorithm: Algorithm): Promise<string> {
  const algo = algorithm.replace('-', '').toLowerCase() as 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512'
  const encoder = new TextEncoder()
  const buffer = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function FileHashTool() {
  const { isPro } = useUserStore()
  const { used, limit } = useUsageStore()
  const [mode, setMode] = useState<'file' | 'text'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [hashes, setHashes] = useState<Partial<Record<Algorithm, string>>>({})
  const [processing, setProcessing] = useState(false)
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm[]>(['MD5', 'SHA-1', 'SHA-256'])
  const [copied, setCopied] = useState<string | null>(null)

  const handleFileSelect = (files: File[]) => {
    if (files[0]) {
      setFile(files[0])
      setHashes({})
    }
  }

  const handleCompute = async () => {
    if (mode === 'file' && !file) return
    if (mode === 'text' && !text.trim()) return
    setProcessing(true)
    const results: Partial<Record<Algorithm, string>> = {}

    for (const algo of selectedAlgo) {
      try {
        if (mode === 'file' && file) {
          results[algo] = await computeHash(file, algo)
        } else if (text) {
          results[algo] = await computeTextHash(text, algo)
        }
      } catch (e: any) {
        results[algo] = `Error: ${e.message}`
      }
    }

    setHashes(results)
    setProcessing(false)
  }

  const toggleAlgo = (algo: Algorithm) => {
    setSelectedAlgo((prev) =>
      prev.includes(algo) ? prev.filter((a) => a !== algo) : [...prev, algo]
    )
  }

  const handleCopy = async (algo: Algorithm, hash: string) => {
    await navigator.clipboard.writeText(hash)
    setCopied(algo)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleVerify = () => {
    const hash = prompt('请粘贴要对比的哈希值:')
    if (!hash) return
    const normalized = hash.toLowerCase().replace(/\s/g, '')
    const matched = Object.entries(hashes).find(([_, v]) =>
      v && v.toLowerCase().replace(/\s/g, '') === normalized
    )
    if (matched) {
      alert(`匹配成功！与 ${matched[0]} 哈希值一致。`)
    } else {
      alert('不匹配：未找到与输入哈希值一致的结果。')
    }
  }

  return (
    <ToolLayout
      title="文件哈希计算"
      description="计算文件或文本的 MD5/SHA-1/SHA-256 等哈希值"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        <div className="card !p-6">
          <div className="flex gap-2 mb-4">
            {(['file', 'text'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setHashes({}) }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'border-navy-200 text-navy-600 hover:border-navy-300'
                }`}
              >
                {m === 'file' ? '文件哈希' : '文本哈希'}
              </button>
            ))}
          </div>

          {mode === 'file' ? (
            <FileUploader accept="*" onFileSelect={handleFileSelect} maxSize={500} />
          ) : (
            <textarea
              className="w-full h-40 p-4 border border-navy-200 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入要计算哈希值的文本..."
            />
          )}

          {file && mode === 'file' && (
            <p className="mt-3 text-sm text-navy-500">
              {file.name}（{(file.size / 1024).toFixed(1)} KB）
            </p>
          )}

          {/* Algorithm selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-navy-600 mb-2">选择算法</label>
            <div className="flex flex-wrap gap-2">
              {ALGORITHMS.map((algo) => (
                <button
                  key={algo}
                  onClick={() => toggleAlgo(algo)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-colors ${
                    selectedAlgo.includes(algo)
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'border-navy-200 text-navy-500 hover:border-navy-300'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCompute}
            className="btn-primary mt-4"
            disabled={processing || selectedAlgo.length === 0 || (mode === 'file' ? !file : !text.trim())}
          >
            <Shield className="w-4 h-4 mr-2" />
            {processing ? '计算中...' : '计算哈希'}
          </button>
        </div>

        {processing && <ProcessingIndicator />}

        {Object.keys(hashes).length > 0 && (
          <div className="card !p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-navy-700">计算结果</h3>
              <button onClick={handleVerify} className="btn-secondary !py-1 !px-3 text-sm">
                <FileCheck className="w-3 h-3 mr-1" />
                对比验证
              </button>
            </div>

            {ALGORITHMS.filter(a => hashes[a]).map((algo) => (
              <div key={algo} className="bg-navy-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono font-medium text-navy-600">{algo}</span>
                  <button
                    onClick={() => hashes[algo] && handleCopy(algo, hashes[algo]!)}
                    className="text-xs text-navy-400 hover:text-navy-600 flex items-center gap-1"
                  >
                    {copied === algo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === algo ? '已复制' : '复制'}
                  </button>
                </div>
                <p className="font-mono text-xs text-navy-700 break-all select-all">{hashes[algo]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

import { useState, useMemo } from 'react'
import { FolderOpen, Download, Trash2, Lock, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

type RenameRule = 'prefix' | 'suffix' | 'replace' | 'sequence' | 'lowercase' | 'uppercase' | 'date'

interface FileItem {
  file: File
  originalName: string
  newName: string
  preview: string
}

function generateRenameMapping(
  files: File[],
  rule: RenameRule,
  params: Record<string, string>
): Map<string, string> {
  const map = new Map<string, string>()

  files.forEach((file, index) => {
    const name = file.name
    const dotIdx = name.lastIndexOf('.')
    const baseName = dotIdx > 0 ? name.substring(0, dotIdx) : name
    const ext = dotIdx > 0 ? name.substring(dotIdx) : ''
    let newBaseName = baseName

    switch (rule) {
      case 'prefix':
        newBaseName = params.prefix + baseName
        break
      case 'suffix':
        newBaseName = baseName + params.suffix
        break
      case 'replace':
        newBaseName = baseName.replace(
          new RegExp(params.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          params.replace
        )
        break
      case 'sequence': {
        const start = parseInt(params.startNum || '1', 10)
        const digits = parseInt(params.digits || '3', 10)
        const prefix = params.seqPrefix || ''
        const num = String(start + index).padStart(digits, '0')
        newBaseName = prefix + num
        break
      }
      case 'lowercase':
        newBaseName = baseName.toLowerCase()
        break
      case 'uppercase':
        newBaseName = baseName.toUpperCase()
        break
      case 'date': {
        const now = new Date()
        const dateStr = params.dateFormat === 'ymd'
          ? `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
          : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        newBaseName = `${dateStr}_${baseName}`
        break
      }
    }

    map.set(name, newBaseName + ext)
  })

  return map
}

export default function BatchRename() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [files, setFiles] = useState<FileItem[]>([])
  const [rule, setRule] = useState<RenameRule>('prefix')
  const [params, setParams] = useState<Record<string, string>>({ prefix: '_', find: '', replace: '', startNum: '1', digits: '3', seqPrefix: '' })

  const updatePreview = (newFiles: File[], newRule: RenameRule, newParams: Record<string, string>) => {
    const map = generateRenameMapping(newFiles, newRule, newParams)
    setFiles(newFiles.map((f) => ({
      file: f,
      originalName: f.name,
      newName: map.get(f.name) || f.name,
      preview: map.get(f.name) || f.name,
    })))
  }

  const handleFilesSelected = (selectedFiles: File[]) => {
    updatePreview([...files, ...selectedFiles], rule, params)
  }

  const handleRuleChange = (newRule: RenameRule) => {
    setRule(newRule)
    updatePreview(files.map((f) => f.file), newRule, params)
  }

  const handleParamChange = (key: string, value: string) => {
    const newParams = { ...params, [key]: value }
    setParams(newParams)
    updatePreview(files.map((f) => f.file), rule, newParams)
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index).map((f) => f.file)
    setFiles(files.filter((_, i) => i !== index))
    updatePreview(newFiles, rule, params)
  }

  const handleClearAll = () => {
    setFiles([])
  }

  const handleReset = () => {
    setParams({ prefix: '_', find: '', replace: '', startNum: '1', digits: '3', seqPrefix: '' })
    setRule('prefix')
    updatePreview(files.map((f) => f.file), 'prefix', { prefix: '_', find: '', replace: '', startNum: '1', digits: '3', seqPrefix: '' })
  }

  const handleDownloadRenameScript = () => {
    if (!checkUsage()) return
    const batContent = files.map((f, i) => {
      const newName = f.newName.replace(/"/g, '')
      const oldName = f.originalName.replace(/"/g, '')
      return `rename "${oldName}" "${newName}"`
    }).join('\n')

    const shContent = files.map((f) => {
      const newName = f.newName.replace(/"/g, '').replace(/'/g, "'\\''")
      const oldName = f.originalName.replace(/"/g, '').replace(/'/g, "'\\''")
      return `mv "${oldName}" "${newName}"`
    }).join('\n')

    const content = `=== Windows BAT 脚本 (在文件所在目录运行) ===\n${batContent}\n\n=== Linux/Mac Shell 脚本 (在文件所在目录运行) ===\n${shContent}`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rename_script.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const changedCount = useMemo(() => files.filter((f) => f.originalName !== f.newName).length, [files])

  const renderRuleParams = () => {
    switch (rule) {
      case 'prefix':
        return (
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">添加前缀</label>
            <input
              type="text"
              value={params.prefix || ''}
              onChange={(e) => handleParamChange('prefix', e.target.value)}
              placeholder="输入前缀文字"
              className="input"
            />
          </div>
        )
      case 'suffix':
        return (
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">添加后缀</label>
            <input
              type="text"
              value={params.suffix || ''}
              onChange={(e) => handleParamChange('suffix', e.target.value)}
              placeholder="输入后缀文字"
              className="input"
            />
          </div>
        )
      case 'replace':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">查找文本</label>
              <input
                type="text"
                value={params.find || ''}
                onChange={(e) => handleParamChange('find', e.target.value)}
                placeholder="要替换的文字"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">替换为</label>
              <input
                type="text"
                value={params.replace || ''}
                onChange={(e) => handleParamChange('replace', e.target.value)}
                placeholder="替换后的文字"
                className="input"
              />
            </div>
          </div>
        )
      case 'sequence':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">前缀</label>
                <input
                  type="text"
                  value={params.seqPrefix || ''}
                  onChange={(e) => handleParamChange('seqPrefix', e.target.value)}
                  placeholder="前缀"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">起始编号</label>
                <input
                  type="number"
                  value={params.startNum || '1'}
                  onChange={(e) => handleParamChange('startNum', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">位数</label>
                <input
                  type="number"
                  value={params.digits || '3'}
                  onChange={(e) => handleParamChange('digits', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>
        )
      case 'lowercase':
      case 'uppercase':
        return (
          <p className="text-sm text-navy-500">
            文件名将{rule === 'lowercase' ? '全部转换为小写' : '全部转换为大写'}
          </p>
        )
      case 'date':
        return (
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">日期格式</label>
            <select
              value={params.dateFormat || 'ymd'}
              onChange={(e) => handleParamChange('dateFormat', e.target.value)}
              className="input"
            >
              <option value="ymd">20240101（无分隔）</option>
              <option value="y-m-d">2024-01-01（带分隔）</option>
            </select>
          </div>
        )
    }
  }

  const rules: { value: RenameRule; label: string; desc: string }[] = [
    { value: 'prefix', label: '添加前缀', desc: '在文件名前添加文字' },
    { value: 'suffix', label: '添加后缀', desc: '在文件名后添加文字' },
    { value: 'replace', label: '查找替换', desc: '替换文件名中的文字' },
    { value: 'sequence', label: '序列编号', desc: '用数字编号重命名' },
    { value: 'lowercase', label: '转小写', desc: '文件名转小写' },
    { value: 'uppercase', label: '转大写', desc: '文件名转大写' },
    { value: 'date', label: '添加日期', desc: '在文件名前添加当前日期' },
  ]

  return (
    <ToolLayout
      title="批量重命名"
      description="批量修改文件名，支持前缀、后缀、替换、序列编号等多种规则"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        {/* Upload */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-4">添加文件</h3>
          <FileUploader
            accept="*"
            onFileSelect={handleFilesSelected}
            multiple
          />
          {files.length > 0 && (
            <div className="mt-3 flex gap-3">
              <button onClick={handleClearAll} className="text-sm text-red-500 hover:text-red-600">
                清空全部
              </button>
              <button onClick={handleReset} className="text-sm text-navy-400 hover:text-navy-600">
                <RotateCcw className="w-3 h-3 inline mr-1" />
                重置规则
              </button>
              <span className="text-sm text-navy-400 ml-auto">共 {files.length} 个文件，{changedCount} 个将重命名</span>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-4">重命名规则</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {rules.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRuleChange(r.value)}
                className={`p-2 rounded-lg text-sm border transition-colors ${
                  rule === r.value
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'border-navy-200 text-navy-600 hover:border-navy-300'
                }`}
              >
                <div className="font-medium">{r.label}</div>
                <div className="text-xs text-navy-400 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
          <div className="max-w-md">{renderRuleParams()}</div>
        </div>

        {/* Preview */}
        {files.length > 0 && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-4">预览结果</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-navy-50 text-sm">
                  <span className="text-navy-400 w-6 text-right shrink-0">{i + 1}</span>
                  <span className="text-navy-600 flex-1 truncate">{f.originalName}</span>
                  <span className="text-navy-300 shrink-0">&rarr;</span>
                  <span className={`flex-1 truncate font-medium ${f.originalName !== f.newName ? 'text-brand-600' : 'text-navy-400'}`}>
                    {f.newName}
                  </span>
                  <button
                    onClick={() => handleRemoveFile(i)}
                    className="text-navy-300 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button onClick={handleDownloadRenameScript} className="btn-primary" disabled={changedCount === 0}>
                <Download className="w-4 h-4 mr-2" />
                下载重命名脚本
              </button>
              <p className="text-xs text-navy-400 mt-2">
                由于浏览器安全限制，无法直接重命名本地文件。请下载重命名脚本，在文件所在目录运行即可。
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

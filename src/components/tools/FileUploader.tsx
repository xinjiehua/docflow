import { useCallback, useState, type DragEvent, type ChangeEvent } from 'react'
import { Upload, File, X, CheckCircle } from 'lucide-react'

interface FileUploaderProps {
  accept: string
  multiple?: boolean
  maxSize?: number // MB
  label?: string
  description?: string
  onFilesSelected: (files: File[]) => void
  files?: File[]
  onRemoveFile?: (index: number) => void
}

export default function FileUploader({
  accept,
  multiple = false,
  maxSize = 50,
  label = '上传文件',
  description,
  onFilesSelected,
  files = [],
  onRemoveFile,
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  const validateFiles = useCallback(
    (incoming: FileList | File[]): File[] => {
      const valid: File[] = []
      for (let i = 0; i < incoming.length; i++) {
        const file = incoming[i]
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        const acceptedExts = accept.split(',').map((s) => s.trim())

        if (!acceptedExts.some((ae) => ae === ext || ae === file.type)) {
          setError(`不支持的文件格式: ${file.name}`)
          return []
        }
        if (file.size > maxSize * 1024 * 1024) {
          setError(`文件过大: ${file.name} (最大 ${maxSize}MB)`)
          return []
        }
        valid.push(file)
      }
      setError('')
      return valid
    },
    [accept, maxSize]
  )

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const valid = validateFiles(e.dataTransfer.files)
      if (valid.length > 0) onFilesSelected(valid)
    },
    [validateFiles, onFilesSelected]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const valid = validateFiles(e.target.files)
        if (valid.length > 0) onFilesSelected(valid)
      }
      e.target.value = ''
    },
    [validateFiles, onFilesSelected]
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      {/* Upload Zone */}
      <label
        className={`upload-zone block ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <p className="text-navy-700 font-medium">{label}</p>
            {description && (
              <p className="text-navy-400 text-sm mt-1">{description}</p>
            )}
          </div>
          <p className="text-navy-400 text-xs">
            拖拽文件到此处，或点击选择文件 (最大 {maxSize}MB)
          </p>
        </div>
      </label>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-navy-200/60"
            >
              <File className="w-4 h-4 text-navy-400 shrink-0" />
              <span className="text-sm text-navy-700 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-navy-400">{formatSize(file.size)}</span>
              <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />
              {onRemoveFile && (
                <button
                  onClick={() => onRemoveFile(idx)}
                  className="p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

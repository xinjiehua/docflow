import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface ProcessingIndicatorProps {
  status: 'idle' | 'processing' | 'done' | 'error'
  progress?: number
  message?: string
  error?: string
}

export default function ProcessingIndicator({
  status,
  progress = 0,
  message,
  error,
}: ProcessingIndicatorProps) {
  if (status === 'idle') return null

  return (
    <div className="mt-6 p-4 rounded-xl bg-white border border-navy-200/60">
      {status === 'processing' && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-medium text-navy-700">
              {message || '正在处理...'}
            </p>
            <div className="mt-2 h-2 bg-navy-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-navy-400 mt-1">{progress}%</p>
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-brand-500" />
          <p className="text-sm font-medium text-brand-700">
            {message || '处理完成!'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error || '处理失败，请重试'}</p>
        </div>
      )}
    </div>
  )
}

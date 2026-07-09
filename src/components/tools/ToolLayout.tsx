import { type ReactNode } from 'react'
import { ArrowLeft, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ToolLayoutProps {
  title: string
  description: string
  icon: ReactNode
  category: string
  children: ReactNode
}

export default function ToolLayout({
  title,
  description,
  icon,
  category,
  children,
}: ToolLayoutProps) {
  return (
    <div className="tool-page">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-navy-400 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors no-underline text-navy-400">
          Home
        </Link>
        <span>/</span>
        <span className="text-navy-400">{category}</span>
        <span>/</span>
        <span className="text-navy-600 font-medium">{title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8 animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-200">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-navy-800">
            {title}
          </h1>
          <p className="text-navy-500 mt-1.5 leading-relaxed">{description}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium">
              <Zap className="w-3 h-3" />
              浏览器本地处理
            </span>
            <span className="text-navy-400 text-xs">文件不会上传到任何服务器</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in-up stagger-2">{children}</div>

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-navy-200/60">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-brand-600 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    </div>
  )
}

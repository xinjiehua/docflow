import { Link, useLocation } from 'react-router-dom'
import { FileText, CreditCard, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { label: 'PDF工具', href: '/tools/pdf-merge' },
  { label: '格式转换', href: '/tools/convert-pdf-to-word' },
  { label: '发票识别', href: '/tools/invoice-ocr' },
  { label: '批量处理', href: '/tools/batch-watermark' },
]

export default function Header() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-navy-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl bg-navy-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-brand-400" />
          </div>
          <span className="font-display font-bold text-xl text-navy-800 tracking-tight">
            DocFlow
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-navy-500 hover:text-navy-700 hover:bg-navy-50'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Pricing + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="btn-secondary text-sm !px-4 !py-2 no-underline"
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">升级专业版</span>
            <span className="sm:hidden">定价</span>
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-navy-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-navy-200/60 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3.5 py-2.5 rounded-lg text-sm font-medium no-underline ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-navy-500 hover:bg-navy-50'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { FileText, CreditCard, Menu, X, LogIn, Crown, LogOut, User, Shield, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useUserStore } from '@/stores/user'
import ChangePasswordModal from '@/components/layout/ChangePasswordModal'

const navLinks = [
  { label: 'PDF工具', href: '/tools/pdf-merge' },
  { label: '格式转换', href: '/tools/convert-pdf-to-word' },
  { label: '发票识别', href: '/tools/invoice-ocr' },
  { label: '批量处理', href: '/tools/batch-watermark' },
]

export default function Header() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [changePwdOpen, setChangePwdOpen] = useState(false)
  const { isLoggedIn, currentUser, signOut, isPro, daysRemaining } = useUserStore()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-navy-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl bg-navy-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-brand-400" />
          </div>
          <span className="font-display font-bold text-xl text-navy-800 tracking-tight">
            智文办公
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

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Pricing / User Status */}
          {isLoggedIn && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-navy-50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isPro() ? 'bg-gradient-to-br from-brand-400 to-cyan-500' : 'bg-navy-100'
                }`}>
                  {isPro() ? (
                    <Crown className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-navy-500" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-navy-700 leading-tight">
                    {currentUser.phone.length >= 11
                      ? currentUser.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
                      : currentUser.phone}
                  </p>
                  {isPro() ? (
                    <p className="text-xs text-brand-600 leading-tight">
                      专业版 · 剩余 {daysRemaining()} 天
                    </p>
                  ) : (
                    <p className="text-xs text-navy-400 leading-tight">免费版</p>
                  )}
                </div>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-navy-100 z-50 overflow-hidden">
                    <div className="p-3 border-b border-navy-100">
                      <p className="text-sm font-medium text-navy-800">{currentUser.phone}</p>
                      <p className="text-xs text-navy-400 mt-0.5">
                        {isPro() ? (
                          <span className="text-brand-600">
                            专业版 · 到期 {new Date(currentUser.expiry_date!).toLocaleDateString('zh-CN')}
                          </span>
                        ) : (
                          '免费版用户'
                        )}
                      </p>
                    </div>
                    <div className="p-1.5">
                      {!isPro() && (
                        <Link
                          to="/pricing"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-navy-600 hover:bg-navy-50 no-underline"
                        >
                          <CreditCard className="w-4 h-4" />
                          升级专业版
                        </Link>
                      )}
                      {isPro() && (
                        <Link
                          to="/pricing"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-navy-600 hover:bg-navy-50 no-underline"
                        >
                          <Crown className="w-4 h-4" />
                          我的订阅
                        </Link>
                      )}
                      {currentUser.plan === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-navy-600 hover:bg-navy-50 no-underline"
                        >
                          <Shield className="w-4 h-4" />
                          管理后台
                        </Link>
                      )}
                      <button
                        onClick={() => { setUserMenuOpen(false); setChangePwdOpen(true) }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-navy-600 hover:bg-navy-50 w-full"
                      >
                        <KeyRound className="w-4 h-4" />
                        修改密码
                      </button>
                      <hr className="my-1 border-navy-100" />
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false) }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/pricing"
              className="btn-secondary text-sm !px-4 !py-2 no-underline"
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">升级专业版</span>
              <span className="sm:hidden">定价</span>
            </Link>
          )}

          {/* Login button when not logged in */}
          {!isLoggedIn && (
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-navy-600 hover:bg-navy-50 no-underline font-medium"
            >
              <LogIn className="w-4 h-4" />
              登录
            </Link>
          )}

          {/* Mobile Toggle */}
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
          {/* Mobile Login */}
          {!isLoggedIn && (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium no-underline text-navy-500 hover:bg-navy-50"
            >
              登录 / 注册
            </Link>
          )}
        </nav>
      )}

      {/* Change Password Modal */}
      {isLoggedIn && currentUser && (
        <ChangePasswordModal
          isOpen={changePwdOpen}
          onClose={() => setChangePwdOpen(false)}
          phone={currentUser.phone}
        />
      )}
    </header>
  )
}

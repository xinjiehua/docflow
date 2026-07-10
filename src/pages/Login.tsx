import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useUserStore } from '@/stores/user'

export default function Login() {
  const navigate = useNavigate()
  const { currentUser, isLoggedIn, signUp, signIn, signOut } = useUserStore()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  const ADMIN_PASSWORD = 'docflow2024'

  // If already logged in, redirect
  if (isLoggedIn && currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="card !p-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-xl font-display font-bold text-navy-800">你已登录</h2>
          <p className="text-navy-500 mt-2">
            手机号：<span className="font-medium">{currentUser.phone}</span>
          </p>
          <p className="text-navy-500 mt-1">
            当前套餐：
            <span className={`font-medium ${currentUser.plan === 'pro' ? 'text-brand-600' : 'text-navy-400'}`}>
              {currentUser.plan === 'pro' ? '专业版' : '免费版'}
            </span>
          </p>
          {currentUser.expiry_date && (
            <p className="text-navy-500 mt-1">
              到期时间：<span className="font-medium">{new Date(currentUser.expiry_date).toLocaleDateString('zh-CN')}</span>
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate('/pricing')} className="btn-primary flex-1">
              前往定价页
            </button>
            <button
              onClick={() => signOut()}
              className="btn-secondary flex-1"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (adminMode) {
      if (adminPassword === ADMIN_PASSWORD) {
        // Navigate to admin page with pre-auth indicator
        navigate('/admin?pre_auth=true')
        return
      }
      setError('管理员密码错误')
      return
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      setError('请输入正确的11位手机号')
      return
    }

    if (!password || password.length < 6) {
      setError('请输入至少6位密码')
      return
    }

    setLoading(true)

    try {
      if (mode === 'register') {
        const result = await signUp(phone, password)
        if (result.error) {
          setError(result.error)
        } else {
          navigate('/pricing')
        }
      } else {
        const result = await signIn(phone, password)
        if (result.error) {
          setError(result.error)
        } else {
          navigate('/pricing')
        }
      }
    } catch {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {/* Login Card */}
      <div className="card !p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-700 to-brand-600 flex items-center justify-center mx-auto mb-4">
            {mode === 'login' ? (
              <LogIn className="w-8 h-8 text-white" />
            ) : (
              <UserPlus className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {mode === 'login' ? '登录账号' : '注册账号'}
          </h1>
          <p className="text-navy-500 mt-2 text-sm">
            {mode === 'login'
              ? '登录后可使用专业版功能，查看到期时间'
              : '注册账号，开始使用 智文办公 文档工具'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              手机号
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入11位手机号"
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-navy-400 hover:text-navy-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-base disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />请稍候...</>
            ) : (
              mode === 'login' ? '登录' : '注册并登录'
            )}
          </button>
        </form>

        {/* Forgot Password (login mode only) */}
        {mode === 'login' && (
          <div className="mt-4 text-center">
            <p className="text-xs text-navy-400">
              忘记密码？请联系客服微信 <span className="font-medium text-brand-600">qaz617574493</span> 进行密码重置
            </p>
          </div>
        )}

        {/* Toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            {mode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </div>
      </div>

      {/* Admin Entry */}
      <div className="mt-6 card !p-5">
        <button
          onClick={() => setAdminMode(!adminMode)}
          className="w-full flex items-center gap-3 text-left"
        >
          <Shield className="w-5 h-5 text-navy-400" />
          <span className="text-sm text-navy-500">管理员入口</span>
        </button>

        {adminMode && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="管理员密码"
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
            />
            <button type="submit" className="btn-secondary w-full !py-2.5 text-sm">
              进入管理后台
            </button>
          </form>
        )}
      </div>

      {/* Note */}
      <div className="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-100">
        <p className="text-xs text-brand-600">
          <strong>隐私说明：</strong>你的账号数据通过 Supabase 安全存储。文档处理仍在你浏览器中本地完成，不会上传任何文件到服务器。
        </p>
      </div>
    </div>
  )
}

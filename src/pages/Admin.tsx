import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Shield, Users, CreditCard, Check, X, ArrowLeft,
  Clock, Phone, Crown, Key, Search,
  ChevronDown, ChevronUp, Copy, ClipboardCheck, Loader2
} from 'lucide-react'
import { useUserStore, PaymentRecord, UserProfile } from '@/stores/user'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'docflow2024'

export default function Admin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    currentUser,
    signIn,
    fetchProfile,
    getPayments,
    getAllUsers,
    verifyPayment,
    rejectPayment,
    upgradeUser,
  } = useUserStore()

  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'payments' | 'users'>('payments')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)
  const [upgradeDays, setUpgradeDays] = useState(30)
  const [copyCode, setCopyCode] = useState<string | null>(null)
  const [notification, setNotification] = useState('')

  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [dataLoaded, setDataLoaded] = useState(false)
  const preAuth = searchParams.get('pre_auth') === 'true'

  // Single auth check: zustand state first, then pre_auth, fallback to Supabase session
  useEffect(() => {
    if (currentUser?.plan === 'admin') {
      setAuthenticated(true)
    } else if (!authenticated && !loginLoading) {
      const checkAndAuth = async () => {
        if (preAuth) {
          // Came from Login.tsx with password pre-verified, auto Supabase login
          const { error } = await signIn('admin', ADMIN_PASSWORD)
          if (!error) return // currentUser will update and trigger authenticated
        }
        // Fallback: check Supabase session directly
        const { session } = await supabase.auth.getSession()
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (profile?.plan === 'admin') {
            setAuthenticated(true)
          }
        }
      }
      checkAndAuth()
    }
  }, [currentUser, currentUser?.plan])

  const loadData = async () => {
    setLoading(true)
    const [p, u] = await Promise.all([getPayments(), getAllUsers()])
    setPayments(p)
    setUsers(u)
    setLoading(false)
    setDataLoaded(true)
  }

  useEffect(() => {
    if (authenticated && !dataLoaded) loadData()
  }, [authenticated, dataLoaded])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setAuthError('')
    try {
      const { error } = await signIn('admin', ADMIN_PASSWORD)
      if (error) {
        setAuthError('管理员密码错误')
      }
      // If login succeeds, the currentUser will update via onAuthStateChange,
      // and the useEffect above will set authenticated=true
    } catch {
      setAuthError('登录失败')
    } finally {
      setLoginLoading(false)
    }
  }

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3000)
  }

  const handleVerify = async (paymentId: string) => {
    setActionLoading(paymentId)
    const updated = await verifyPayment(paymentId)
    if (updated) {
      showNotification(`付款已审核通过，激活码: ${updated.activation_code}`)
      await loadData()
    } else {
      showNotification('审核失败，请重试')
    }
    setActionLoading(null)
  }

  const handleReject = async (paymentId: string) => {
    setActionLoading(paymentId)
    const success = await rejectPayment(paymentId)
    if (success) {
      showNotification('付款已拒绝')
      await loadData()
    }
    setActionLoading(null)
  }

  const handleUpgrade = async (userId: string) => {
    setActionLoading('upgrade-' + userId)
    const success = await upgradeUser(userId, upgradeDays)
    if (success) {
      showNotification(`用户已升级 ${upgradeDays} 天`)
      await loadData()
    }
    setActionLoading(null)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopyCode(code)
    setTimeout(() => setCopyCode(null), 2000)
  }

  const pendingPayments = payments.filter((p) => p.status === 'pending')
  const verifiedPayments = payments.filter((p) => p.status === 'verified')

  const filteredPayments = payments.filter((p) =>
    p.phone.includes(searchQuery) ||
    p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.activation_code && p.activation_code.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredUsers = users.filter((u) =>
    u.phone.includes(searchQuery)
  )

  const getUserById = (userId: string) => users.find((u) => u.id === userId)

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="card !p-8 text-center">
          <Shield className="w-12 h-12 text-navy-400 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-navy-800">管理员验证</h1>
          <p className="text-navy-500 text-sm mt-2 mb-6">请输入管理员密码以进入后台</p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{authError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员密码"
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-center"
              autoFocus
            />
            <button type="submit" disabled={loginLoading} className="btn-primary w-full !py-3 disabled:opacity-50">
              {loginLoading ? <><Loader2 className="w-4 h-4 inline animate-spin mr-1" />验证中...</> : '进入管理后台'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in-up">
          <div className="px-4 py-3 rounded-xl bg-brand-600 text-white text-sm shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            {notification}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-navy-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-navy-500" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-navy-800">管理后台</h1>
            <p className="text-sm text-navy-500">管理用户和付款记录</p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-navy-50">
            <p className="text-xs text-navy-400">总用户</p>
            <p className="text-lg font-bold text-navy-800">{users.length}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-50">
            <p className="text-xs text-amber-500">待审核</p>
            <p className="text-lg font-bold text-amber-700">{pendingPayments.length}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-brand-50">
            <p className="text-xs text-brand-500">已完成</p>
            <p className="text-lg font-bold text-brand-700">{verifiedPayments.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索手机号、交易号或激活码..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'payments'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-100'
              : 'bg-white text-navy-500 hover:bg-navy-50 border border-navy-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          付款记录 ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-100'
              : 'bg-white text-navy-500 hover:bg-navy-50 border border-navy-200'
          }`}
        >
          <Users className="w-4 h-4" />
          用户管理 ({users.length})
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin mr-2" />
          <span className="text-navy-400">加载中...</span>
        </div>
      ) : (
        <>
          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {filteredPayments.length === 0 ? (
                <div className="card !p-12 text-center">
                  <CreditCard className="w-12 h-12 text-navy-200 mx-auto mb-3" />
                  <p className="text-navy-400">暂无付款记录</p>
                  <p className="text-xs text-navy-300 mt-1">用户付款后会在这里显示</p>
                </div>
              ) : (
                filteredPayments
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      user={getUserById(payment.user_id)}
                      expanded={expandedPayment === payment.id}
                      onToggle={() => setExpandedPayment(
                        expandedPayment === payment.id ? null : payment.id
                      )}
                      onVerify={() => handleVerify(payment.id)}
                      onReject={() => handleReject(payment.id)}
                      onCopyCode={handleCopyCode}
                      copyCode={copyCode}
                      actionLoading={actionLoading}
                      formatTime={formatTime}
                    />
                  ))
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="card !p-12 text-center">
                  <Users className="w-12 h-12 text-navy-200 mx-auto mb-3" />
                  <p className="text-navy-400">暂无注册用户</p>
                </div>
              ) : (
                filteredUsers
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      upgradeDays={upgradeDays}
                      onUpgradeDaysChange={setUpgradeDays}
                      onUpgrade={() => handleUpgrade(user.id)}
                      actionLoading={actionLoading}
                      formatTime={formatTime}
                    />
                  ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Sub-components

function PaymentCard({
  payment,
  user,
  expanded,
  onToggle,
  onVerify,
  onReject,
  onCopyCode,
  copyCode,
  actionLoading,
  formatTime,
}: {
  payment: PaymentRecord
  user: UserProfile | undefined
  expanded: boolean
  onToggle: () => void
  onVerify: () => void
  onReject: () => void
  onCopyCode: (code: string) => void
  copyCode: string | null
  actionLoading: string | null
  formatTime: (iso: string) => string
}) {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    verified: 'bg-brand-100 text-brand-700 border-brand-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }

  const statusLabels = {
    pending: '待审核',
    verified: '已通过',
    rejected: '已拒绝',
  }

  const isActioning = actionLoading === payment.id

  return (
    <div className={`card !p-0 overflow-hidden ${payment.status === 'pending' ? '!border-amber-300' : ''}`}>
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-center gap-4 p-4">
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
            payment.status === 'pending'
              ? 'bg-amber-50 border-amber-200'
              : payment.status === 'verified'
              ? 'bg-brand-50 border-brand-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {payment.status === 'pending' ? (
              <Clock className="w-5 h-5 text-amber-500" />
            ) : payment.status === 'verified' ? (
              <Check className="w-5 h-5 text-brand-500" />
            ) : (
              <X className="w-5 h-5 text-red-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-navy-400" />
              <span className="font-medium text-navy-800">{payment.phone}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[payment.status]}`}>
                {statusLabels[payment.status]}
              </span>
            </div>
            <p className="text-xs text-navy-400 mt-1">
              交易号: {payment.transaction_id} · {formatTime(payment.created_at)}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-navy-800">&yen;{payment.amount}</p>
          </div>

          <ChevronDown className={`w-5 h-5 text-navy-300 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-navy-100 p-4 bg-navy-50/50 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-navy-400">用户ID</span>
              <p className="text-navy-700 font-mono text-xs mt-0.5">{payment.user_id.slice(0, 16)}...</p>
            </div>
            <div>
              <span className="text-navy-400">付款ID</span>
              <p className="text-navy-700 font-mono text-xs mt-0.5">{payment.id.slice(0, 16)}...</p>
            </div>
            <div>
              <span className="text-navy-400">提交时间</span>
              <p className="text-navy-700 mt-0.5">{formatTime(payment.created_at)}</p>
            </div>
            {payment.verified_at && (
              <div>
                <span className="text-navy-400">审核时间</span>
                <p className="text-navy-700 mt-0.5">{formatTime(payment.verified_at)}</p>
              </div>
            )}
          </div>

          {payment.activation_code && (
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-medium text-brand-700">激活码</span>
                </div>
                <button
                  onClick={() => onCopyCode(payment.activation_code!)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-100 text-brand-700 text-xs font-medium hover:bg-brand-200 transition-colors"
                >
                  {copyCode === payment.activation_code ? (
                    <><ClipboardCheck className="w-3.5 h-3.5" />已复制</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" />复制</>
                  )}
                </button>
              </div>
              <p className="text-2xl font-mono font-bold text-brand-800 mt-2 tracking-wider">
                {payment.activation_code}
              </p>
            </div>
          )}

          {payment.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={onVerify}
                disabled={isActioning}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                {isActioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                审核通过（生成激活码）
              </button>
              <button
                onClick={onReject}
                disabled={isActioning}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-100 text-navy-600 font-medium text-sm hover:bg-navy-200 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                拒绝
              </button>
            </div>
          )}

          {user && (
            <div className="p-3 rounded-xl bg-white border border-navy-200">
              <p className="text-xs text-navy-400 mb-2">关联用户信息</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-navy-600">手机: {user.phone}</span>
                <span className={`font-medium ${user.plan === 'pro' ? 'text-brand-600' : 'text-navy-400'}`}>
                  {user.plan === 'pro' ? (
                    <><Crown className="w-3.5 h-3.5 inline mr-1" />专业版</>
                  ) : (
                    '免费版'
                  )}
                </span>
                {user.expiry_date && (
                  <span className="text-navy-500">
                    到期: {new Date(user.expiry_date).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function UserCard({
  user,
  upgradeDays,
  onUpgradeDaysChange,
  onUpgrade,
  actionLoading,
  formatTime,
}: {
  user: UserProfile
  upgradeDays: number
  onUpgradeDaysChange: (days: number) => void
  onUpgrade: () => void
  actionLoading: string | null
  formatTime: (iso: string) => string
}) {
  const isExpired = user.plan === 'pro' && user.expiry_date && new Date(user.expiry_date) < new Date()
  const isActioning = actionLoading === 'upgrade-' + user.id

  return (
    <div className="card !p-4">
      <div className="flex items-center gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
          user.plan === 'pro' && !isExpired
            ? 'bg-gradient-to-br from-brand-400 to-cyan-500 text-white'
            : 'bg-navy-100 text-navy-500'
        }`}>
          {user.plan === 'pro' && !isExpired ? (
            <Crown className="w-6 h-6" />
          ) : (
            <span className="text-lg font-bold">{user.phone.slice(-1)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-navy-800">{user.phone}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              user.plan === 'pro' && !isExpired
                ? 'bg-brand-100 text-brand-700'
                : 'bg-navy-100 text-navy-400'
            }`}>
              {user.plan === 'pro' && !isExpired ? '专业版' : '免费版'}
            </span>
            {isExpired && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                已过期
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
            <span>注册: {formatTime(user.created_at)}</span>
            {user.expiry_date && (
              <span>
                到期: {new Date(user.expiry_date).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={upgradeDays}
            onChange={(e) => onUpgradeDaysChange(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border-2 border-navy-200 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value={7}>7天</option>
            <option value={15}>15天</option>
            <option value={30}>30天</option>
            <option value={90}>90天</option>
            <option value={365}>1年</option>
          </select>
          <button
            onClick={onUpgrade}
            disabled={isActioning}
            className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50"
          >
            {isActioning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Crown className="w-4 h-4 mr-1" />升级</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

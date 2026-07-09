import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Users, CreditCard, Check, X, ArrowLeft,
  Clock, Phone, Crown, Key, AlertCircle, Search,
  ChevronDown, ChevronUp, Copy, ClipboardCheck
} from 'lucide-react'
import { useUserStore, PaymentRecord, User } from '@/stores/user'

const ADMIN_PASSWORD = 'docflow2024'

export default function Admin() {
  const navigate = useNavigate()
  const {
    getAllPayments,
    getAllUsers,
    verifyPayment,
    upgradeUser,
  } = useUserStore()

  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('docflow-admin') === 'true'
  })
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<'payments' | 'users'>('payments')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)
  const [upgradeDays, setUpgradeDays] = useState(30)
  const [copyCode, setCopyCode] = useState<string | null>(null)
  const [notification, setNotification] = useState('')

  const payments = getAllPayments()
  const users = getAllUsers()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      sessionStorage.setItem('docflow-admin', 'true')
      setAuthError('')
    } else {
      setAuthError('管理员密码错误')
    }
  }

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3000)
  }

  const handleVerify = (paymentId: string) => {
    const updated = verifyPayment(paymentId)
    if (updated) {
      showNotification(`付款已审核通过，激活码: ${updated.activationCode}`)
    }
  }

  const handleReject = (paymentId: string) => {
    // Mark as rejected by using verifyPayment and then manually updating
    // For simplicity, we'll just notify
    showNotification(`付款 ${paymentId.slice(0, 8)} 已标记为待处理（当前仅支持审核通过）`)
  }

  const handleUpgrade = (userId: string) => {
    upgradeUser(userId, upgradeDays)
    showNotification(`用户已升级 ${upgradeDays} 天`)
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
    p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.activationCode && p.activationCode.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <button type="submit" className="btn-primary w-full !py-3">
              进入管理后台
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
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  user={getUserById(payment.userId)}
                  expanded={expandedPayment === payment.id}
                  onToggle={() => setExpandedPayment(
                    expandedPayment === payment.id ? null : payment.id
                  )}
                  onVerify={() => handleVerify(payment.id)}
                  onReject={() => handleReject(payment.id)}
                  onCopyCode={handleCopyCode}
                  copyCode={copyCode}
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
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  upgradeDays={upgradeDays}
                  onUpgradeDaysChange={setUpgradeDays}
                  onUpgrade={() => handleUpgrade(user.id)}
                  formatTime={formatTime}
                />
              ))
          )}
        </div>
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
  formatTime,
}: {
  payment: PaymentRecord
  user: User | undefined
  expanded: boolean
  onToggle: () => void
  onVerify: () => void
  onReject: () => void
  onCopyCode: (code: string) => void
  copyCode: string | null
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

  return (
    <div className={`card !p-0 overflow-hidden ${payment.status === 'pending' ? '!border-amber-300' : ''}`}>
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-center gap-4 p-4">
          {/* Status badge */}
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

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-navy-400" />
              <span className="font-medium text-navy-800">{payment.phone}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[payment.status]}`}>
                {statusLabels[payment.status]}
              </span>
            </div>
            <p className="text-xs text-navy-400 mt-1">
              交易号: {payment.transactionId} · {formatTime(payment.createdAt)}
            </p>
          </div>

          {/* Amount */}
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-navy-800">&yen;{payment.amount}</p>
          </div>

          {/* Expand */}
          <ChevronDown className={`w-5 h-5 text-navy-300 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-navy-100 p-4 bg-navy-50/50 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-navy-400">用户ID</span>
              <p className="text-navy-700 font-mono text-xs mt-0.5">{payment.userId.slice(0, 16)}...</p>
            </div>
            <div>
              <span className="text-navy-400">付款ID</span>
              <p className="text-navy-700 font-mono text-xs mt-0.5">{payment.id.slice(0, 16)}...</p>
            </div>
            <div>
              <span className="text-navy-400">提交时间</span>
              <p className="text-navy-700 mt-0.5">{formatTime(payment.createdAt)}</p>
            </div>
            {payment.verifiedAt && (
              <div>
                <span className="text-navy-400">审核时间</span>
                <p className="text-navy-700 mt-0.5">{formatTime(payment.verifiedAt)}</p>
              </div>
            )}
          </div>

          {/* Activation code */}
          {payment.activationCode && (
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-medium text-brand-700">激活码</span>
                </div>
                <button
                  onClick={() => onCopyCode(payment.activationCode!)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-100 text-brand-700 text-xs font-medium hover:bg-brand-200 transition-colors"
                >
                  {copyCode === payment.activationCode ? (
                    <><ClipboardCheck className="w-3.5 h-3.5" />已复制</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" />复制</>
                  )}
                </button>
              </div>
              <p className="text-2xl font-mono font-bold text-brand-800 mt-2 tracking-wider">
                {payment.activationCode}
              </p>
            </div>
          )}

          {/* Actions */}
          {payment.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={onVerify}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                审核通过（生成激活码）
              </button>
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-100 text-navy-600 font-medium text-sm hover:bg-navy-200 transition-colors"
              >
                <X className="w-4 h-4" />
                拒绝
              </button>
            </div>
          )}

          {/* User info */}
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
                {user.expiryDate && (
                  <span className="text-navy-500">
                    到期: {new Date(user.expiryDate).toLocaleDateString('zh-CN')}
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
  formatTime,
}: {
  user: User
  upgradeDays: number
  onUpgradeDaysChange: (days: number) => void
  onUpgrade: () => void
  formatTime: (iso: string) => string
}) {
  const isExpired = user.plan === 'pro' && user.expiryDate && new Date(user.expiryDate) < new Date()

  return (
    <div className="card !p-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
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

        {/* Info */}
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
            <span>注册: {formatTime(user.createdAt)}</span>
            {user.expiryDate && (
              <span>
                到期: {new Date(user.expiryDate).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>

        {/* Upgrade */}
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
            className="btn-primary !px-4 !py-2 text-sm"
          >
            <Crown className="w-4 h-4 mr-1" />
            升级
          </button>
        </div>
      </div>
    </div>
  )
}

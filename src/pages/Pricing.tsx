import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, X, Zap, Crown, QrCode, MessageCircle, Copy, ClipboardCheck, LogIn, Key, Clock, Loader2, Star } from 'lucide-react'
import { useUserStore, PaymentRecord, UserProfile } from '@/stores/user'

export interface PlanOption {
  id: string
  name: string
  duration: number      // days
  price: number         // yuan
  unitPrice: number     // per month equivalent
  badge: string | null  // e.g. '最受欢迎', '超值'
  highlight: boolean
}

const planOptions: PlanOption[] = [
  {
    id: 'monthly',
    name: '月付',
    duration: 30,
    price: 29,
    unitPrice: 29,
    badge: null,
    highlight: false,
  },
  {
    id: 'quarterly',
    name: '季付',
    duration: 90,
    price: 79,
    unitPrice: 26.3,
    badge: null,
    highlight: false,
  },
  {
    id: 'semiannual',
    name: '半年付',
    duration: 180,
    price: 149,
    unitPrice: 24.8,
    badge: '最受欢迎',
    highlight: true,
  },
  {
    id: 'yearly',
    name: '年付',
    duration: 365,
    price: 259,
    unitPrice: 21.6,
    badge: null,
    highlight: false,
  },
  {
    id: 'threeyear',
    name: '三年付',
    duration: 1095,
    price: 699,
    unitPrice: 19.4,
    badge: '超值',
    highlight: false,
  },
]

const freeFeatures = [
  { text: '每日5次免费处理', included: true },
  { text: '所有PDF工具', included: true },
  { text: '格式转换', included: true },
  { text: '发票OCR识别', included: true },
  { text: '单文件最大10MB', included: true },
  { text: '批量处理', included: false },
  { text: '无水印导出', included: false },
  { text: '优先客服支持', included: false },
]

const proFeatures = [
  { text: '无限次处理', included: true },
  { text: '所有PDF工具', included: true },
  { text: '格式转换', included: true },
  { text: '发票OCR识别', included: true },
  { text: '单文件最大100MB', included: true },
  { text: '批量处理', included: true },
  { text: '无水印导出', included: true },
  { text: '优先客服支持', included: true },
]

function PaymentModal({ onClose, selectedPlan }: { onClose: () => void; selectedPlan: PlanOption }) {
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [activationCode, setActivationCode] = useState('')
  const [activateStatus, setActivateStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activating, setActivating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const { isLoggedIn, currentUser, submitPayment, isPro, activateWithCode } = useUserStore()
  const wechatId = 'qaz617574493'

  const handleCopy = () => {
    navigator.clipboard.writeText(wechatId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitTransaction = async () => {
    if (!transactionId.trim()) return
    setSubmitting(true)
    try {
      const result = await submitPayment(transactionId.trim(), selectedPlan.price, selectedPlan.duration)
      if (result) {
        setSubmitStatus('success')
        setStep(2)
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleActivate = async () => {
    if (!activationCode.trim()) return
    setActivating(true)
    setActivateStatus('idle')
    try {
      const success = await activateWithCode(activationCode.trim())
      if (success) {
        setActivateStatus('success')
        setStep(3)
      } else {
        setActivateStatus('error')
      }
    } catch {
      setActivateStatus('error')
    } finally {
      setActivating(false)
    }
  }

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up p-8 text-center">
          <LogIn className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-navy-800">请先登录</h2>
          <p className="text-sm text-navy-500 mt-2">升级专业版需要先登录账号</p>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1">返回</button>
            <button onClick={() => { onClose(); navigate('/login') }} className="btn-primary flex-1">去登录</button>
          </div>
        </div>
      </div>
    )
  }

  // Already pro
  if (isPro()) {
    const days = daysRemaining()
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up p-8 text-center">
          <Crown className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-navy-800">你已是专业版用户</h2>
          <p className="text-sm text-navy-500 mt-2">
            专业版剩余 <span className="font-bold text-brand-600">{days}</span> 天
          </p>
          <p className="text-xs text-navy-400 mt-1">
            到期时间: {currentUser?.expiry_date ? new Date(currentUser.expiry_date).toLocaleDateString('zh-CN') : '-'}
          </p>
          <button onClick={onClose} className="btn-primary mt-6">好的</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-500 to-cyan-500 p-6 text-white text-center">
          <Crown className="w-10 h-10 mx-auto mb-2" />
          <h2 className="text-xl font-display font-bold">升级到专业版</h2>
          <p className="text-sm opacity-90 mt-1">{selectedPlan.name} · {selectedPlan.duration}天 · ¥{selectedPlan.price}</p>
        </div>

        {/* Steps */}
        <div className="p-6">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    step === s
                      ? 'bg-brand-500 text-white scale-110'
                      : step > s
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-navy-100 text-navy-400'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4 mx-auto" /> : s}
                </button>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-brand-300' : 'bg-navy-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: QR Code + Submit Transaction */}
          {step === 1 && (
            <div className="text-center">
              <h3 className="font-medium text-navy-700 mb-3">第一步：扫码支付</h3>
              <p className="text-sm text-navy-500 mb-4">
                打开微信，扫描下方收款码支付 <span className="font-bold text-brand-600">¥{selectedPlan.price}</span>
                <span className="text-xs text-navy-400 ml-1">（{selectedPlan.name}）</span>
              </p>
              <div className="inline-block p-3 bg-white rounded-2xl border-2 border-navy-100 shadow-md">
                <img
                  src="/wechat-pay.jpg"
                  alt="微信收款码"
                  className="w-48 h-48 rounded-xl"
                />
              </div>

              {/* Transaction ID input */}
              <div className="mt-5">
                <label className="block text-sm font-medium text-navy-700 mb-1.5 text-left">
                  支付交易号（微信支付后可见）
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="请输入微信支付交易号"
                  className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="mt-3 p-3 rounded-xl bg-brand-50 border border-brand-200">
                  <p className="text-sm text-brand-700">
                    付款凭证已提交成功！请联系客服获取激活码
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">提交失败，请重试</p>
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-600">
                  <strong>提示：</strong>支付完成后，请将交易号记录好。添加客服微信 qaz617574493 发送交易号，客服审核后会自动生成激活码。
                </p>
              </div>

              <button
                onClick={handleSubmitTransaction}
                disabled={!transactionId.trim() || submitting}
                className="btn-primary mt-4 !px-8 disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />提交中...</>
                ) : (
                  '提交付款凭证'
                )}
              </button>

              {submitStatus === 'success' && (
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary mt-3 !px-8 text-sm"
                >
                  已联系客服，输入激活码 &rarr;
                </button>
              )}
            </div>
          )}

          {/* Step 2: Contact + Code Input */}
          {step === 2 && (
            <div className="text-center">
              <h3 className="font-medium text-navy-700 mb-3">第二步：输入激活码</h3>
              <p className="text-sm text-navy-500 mb-4">
                客服审核通过后会给你一个激活码，输入即可开通
              </p>

              <div className="flex flex-col items-center gap-4 p-5 bg-brand-50 rounded-2xl mb-5">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-navy-400">客服微信号</p>
                  <p className="text-xl font-display font-bold text-navy-800 mt-1">{wechatId}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="btn-secondary !px-6 text-sm"
                >
                  {copied ? (
                    <><ClipboardCheck className="w-4 h-4 mr-1.5 text-brand-500" />已复制</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-1.5" />复制微信号</>
                  )}
                </button>
              </div>

              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value.toUpperCase())
                  setActivateStatus('idle')
                }}
                placeholder="请输入激活码（如 DF-ABC123）"
                className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-center text-lg tracking-widest focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />

              {activateStatus === 'success' && (
                <div className="mt-3 p-4 rounded-xl bg-brand-50 border border-brand-200">
                  <Crown className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                  <p className="text-brand-700 font-medium">激活成功！</p>
                  <p className="text-brand-600 text-sm mt-1">你已升级为专业版，可无限使用所有工具</p>
                  <button
                    onClick={() => { setStep(3) }}
                    className="btn-primary mt-3"
                  >
                    查看状态
                  </button>
                </div>
              )}

              {activateStatus === 'error' && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">激活码无效或已被使用，请检查后重试</p>
                </div>
              )}

              {activateStatus === 'idle' && (
                <button
                  onClick={handleActivate}
                  disabled={!activationCode.trim() || activating}
                  className="btn-primary w-full mt-4 !py-3 text-base disabled:opacity-50"
                >
                  {activating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />激活中...</>
                  ) : (
                    <><Key className="w-4 h-4 mr-2" />激活专业版</>
                  )}
                </button>
              )}

              <div className="mt-4 p-3 bg-navy-50 rounded-xl">
                <p className="text-xs text-navy-500">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  没有激活码？请添加客服微信，发送你的付款交易号，审核通过后会给你激活码
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Done info */}
          {step === 3 && (
            <Step3Done currentUser={currentUser} daysRemaining={daysRemaining} onClose={onClose} navigate={navigate} />
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors text-sm"
        >
          X
        </button>
      </div>
    </div>
  )
}

function Step3Done({ currentUser, daysRemaining, onClose, navigate }: {
  currentUser: UserProfile | null
  daysRemaining: () => number
  onClose: () => void
  navigate: ReturnType<typeof useNavigate>
}) {
  const days = daysRemaining()
  return (
    <div className="text-center">
      <h3 className="font-medium text-navy-700 mb-3">升级完成</h3>
      <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200">
        <Crown className="w-10 h-10 text-brand-600 mx-auto mb-3" />
        <p className="text-brand-700 font-medium">专业版已激活</p>
        <p className="text-brand-600 text-sm mt-1">
          可无限使用所有文档处理工具
        </p>
        <p className="text-brand-600 text-sm mt-2">
          剩余 <span className="font-bold">{days}</span> 天 · 到期 {currentUser?.expiry_date ? new Date(currentUser.expiry_date).toLocaleDateString('zh-CN') : '-'}
        </p>
      </div>
      <button
        onClick={() => { onClose(); navigate('/') }}
        className="btn-primary mt-4 !px-8"
      >
        开始使用
      </button>
    </div>
  )
}

export default function Pricing() {
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(planOptions.find(p => p.highlight) || planOptions[0])
  const { isLoggedIn, isPro, currentUser, daysRemaining } = useUserStore()

  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedPlan(plan)
    setShowPayModal(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* User status banner */}
      {isLoggedIn && currentUser && (
        <div className={`mb-8 p-4 rounded-2xl border ${
          isPro()
            ? 'bg-brand-50 border-brand-200'
            : 'bg-navy-50 border-navy-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isPro()
                  ? 'bg-gradient-to-br from-brand-400 to-cyan-500'
                  : 'bg-navy-200'
              }`}>
                <Crown className={`w-5 h-5 ${isPro() ? 'text-white' : 'text-navy-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-800">
                  {currentUser.phone}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    isPro() ? 'bg-brand-100 text-brand-700' : 'bg-navy-100 text-navy-400'
                  }`}>
                    {isPro() ? '专业版' : '免费版'}
                  </span>
                </p>
                {isPro() ? (
                  <p className="text-xs text-brand-600">
                    到期时间: {currentUser.expiry_date ? new Date(currentUser.expiry_date).toLocaleDateString('zh-CN') : '-'} · 剩余 {daysRemaining()} 天
                  </p>
                ) : (
                  <p className="text-xs text-navy-400">升级专业版享受无限次处理</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-navy-800">
          简单透明的定价
        </h1>
        <p className="mt-3 text-navy-500 text-lg">
          选择适合你的方案，随时可以升级
        </p>
      </div>

      {/* Free Plan */}
      <div className="max-w-sm mx-auto mb-10">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-navy-50 text-navy-500">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-navy-800">免费版</h2>
              <p className="text-sm text-navy-400">个人日常使用足够</p>
            </div>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-display font-bold text-navy-800">免费</span>
          </div>
          <ul className="space-y-3 mb-6">
            {freeFeatures.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5 text-sm">
                {f.included ? (
                  <Check className="w-4 h-4 text-brand-500 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-navy-300 shrink-0" />
                )}
                <span className={f.included ? 'text-navy-600' : 'text-navy-300'}>{f.text}</span>
              </li>
            ))}
          </ul>
          <Link to="/tools/pdf-merge" className="btn-secondary w-full no-underline">免费开始</Link>
        </div>
      </div>

      {/* Pro Plans */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-navy-800">专业版</h2>
            <p className="text-sm text-navy-500">无限次处理，长时更优惠</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {planOptions.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={`card !p-5 w-[160px] text-left transition-all hover:scale-105 cursor-pointer border-2 ${
                plan.highlight
                  ? '!border-brand-400 !shadow-lg !shadow-brand-100'
                  : selectedPlan?.id === plan.id
                  ? '!border-brand-300'
                  : 'hover:!border-brand-200'
              }`}
            >
              {plan.badge && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                  plan.badge === '超值'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-brand-100 text-brand-700'
                }`}>
                  {plan.badge}
                </span>
              )}
              <p className="text-sm font-medium text-navy-700 mb-1">{plan.name}</p>
              <p className="text-2xl font-display font-bold text-navy-800">
                <span className="text-base">¥</span>{plan.price}
              </p>
              <p className="text-xs text-navy-400 mt-1">{plan.duration}天</p>
              <p className="text-xs text-brand-500 mt-1">折合 ¥{plan.unitPrice}/月</p>
            </button>
          ))}
        </div>

        {/* Pro Features Summary */}
        <div className="max-w-3xl mx-auto mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {proFeatures.map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-brand-50/50">
                <Check className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-navy-600">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Flow */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="card !p-6 sm:!p-8">
          <h2 className="text-lg font-display font-bold text-navy-800 text-center mb-6">
            升级流程
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {[
              { num: '1', title: '注册登录', desc: '手机号注册账号' },
              { num: '2', title: '扫码支付', desc: '选择套餐微信扫码' },
              { num: '3', title: '输入激活码', desc: '客服审核后自动开通' },
            ].map((item, idx) => (
              <div key={item.num} className="flex flex-col items-center text-center flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mb-3">
                  {item.num}
                </div>
                <h3 className="font-medium text-navy-700 text-sm">{item.title}</h3>
                <p className="text-xs text-navy-400 mt-1">{item.desc}</p>
                {idx < 2 && (
                  <div className="hidden sm:block text-navy-300 mt-[-40px] ml-[60px]">&rarr;</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => handleSelectPlan(selectedPlan)}
              className="btn-primary"
            >
              <QrCode className="w-4 h-4 mr-2" />
              立即升级专业版
            </button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-xl font-display font-bold text-navy-800 text-center mb-8">
          常见问题
        </h2>
        <div className="space-y-4">
          {[
            {
              q: '免费版有使用限制吗?',
              a: '免费版每日可使用5次任意工具处理。单个文件最大支持10MB。对日常使用已经足够。',
            },
            {
              q: '文件安全吗?',
              a: '所有文件处理都在你的浏览器中本地完成，不会上传到任何服务器。关闭网页后数据自动清除。',
            },
            {
              q: '如何升级到专业版?',
              a: '先注册/登录账号，然后点击"立即升级"，扫码支付后输入交易号，联系客服获取激活码即可开通。',
            },
            {
              q: '如何查看我的账号到期时间?',
              a: '登录后，页面顶部会显示你的套餐状态和剩余天数。点击用户头像可查看详细信息。',
            },
            {
              q: '可以随时取消订阅吗?',
              a: '当然可以。专业版到期后自动回到免费版。不同套餐时长越长越优惠，如需退款请联系客服。',
            },
            {
              q: '支付后多久能开通?',
              a: '联系客服后审核通过立即生成激活码，输入激活码即可开通。工作时间通常几分钟内完成。',
            },
          ].map((item) => (
            <div key={item.q} className="card !p-5">
              <h3 className="font-medium text-navy-700 text-sm">{item.q}</h3>
              <p className="text-sm text-navy-500 mt-2 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedPlan && <PaymentModal onClose={() => setShowPayModal(false)} selectedPlan={selectedPlan} />}
    </div>
  )
}

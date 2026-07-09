import { Link } from 'react-router-dom'
import { Check, X, Zap, Crown } from 'lucide-react'

const plans = [
  {
    name: '免费版',
    description: '个人日常使用足够',
    price: '0',
    period: '',
    icon: <Zap className="w-6 h-6" />,
    highlight: false,
    features: [
      { text: '每日5次免费处理', included: true },
      { text: '所有PDF工具', included: true },
      { text: '格式转换', included: true },
      { text: '发票OCR识别', included: true },
      { text: '单文件最大10MB', included: true },
      { text: '批量处理', included: false },
      { text: '无水印导出', included: false },
      { text: '优先客服支持', included: false },
    ],
    cta: '免费开始',
    ctaHref: '/tools/pdf-merge',
    ctaClass: 'btn-secondary w-full',
  },
  {
    name: '专业版',
    description: '适合办公和商业使用',
    price: '29',
    period: '/月',
    icon: <Crown className="w-6 h-6" />,
    highlight: true,
    features: [
      { text: '无限次处理', included: true },
      { text: '所有PDF工具', included: true },
      { text: '格式转换', included: true },
      { text: '发票OCR识别', included: true },
      { text: '单文件最大100MB', included: true },
      { text: '批量处理', included: true },
      { text: '无水印导出', included: true },
      { text: '优先客服支持', included: true },
    ],
    cta: '立即升级',
    ctaHref: '#',
    ctaClass: 'btn-primary w-full',
  },
]

export default function Pricing() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-navy-800">
          简单透明的定价
        </h1>
        <p className="mt-3 text-navy-500 text-lg">
          选择适合你的方案，随时可以升级
        </p>
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card relative ${plan.highlight ? '!border-brand-300 !shadow-lg !shadow-brand-100' : ''}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 text-white text-xs font-medium">
                推荐
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-brand-400 to-cyan-500 text-white'
                    : 'bg-navy-50 text-navy-500'
                }`}
              >
                {plan.icon}
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-navy-800">
                  {plan.name}
                </h2>
                <p className="text-sm text-navy-400">{plan.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-display font-bold text-navy-800">
                {plan.price === '0' ? '免费' : ''}
              </span>
              {plan.price !== '0' && (
                <>
                  <span className="text-4xl font-display font-bold text-navy-800">
                    {plan.price}
                  </span>
                  <span className="text-navy-400 ml-1">{plan.period}</span>
                </>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature.text} className="flex items-center gap-2.5 text-sm">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-brand-500 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-navy-300 shrink-0" />
                  )}
                  <span
                    className={
                      feature.included ? 'text-navy-600' : 'text-navy-300'
                    }
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link to={plan.ctaHref} className={`${plan.ctaClass} no-underline`}>
              {plan.cta}
            </Link>
          </div>
        ))}
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
              q: '可以随时取消订阅吗?',
              a: '当然可以。专业版按月订阅，随时可以取消，取消后当前月仍可继续使用。',
            },
            {
              q: '支持哪些文件格式?',
              a: '支持PDF、Word(.docx)、Excel(.xlsx)、JPG、PNG等常见格式。',
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
    </div>
  )
}

import { Link } from 'react-router-dom'
import {
  Merge, Scissors, Droplets, FileDown,
  ArrowRightLeft, FileText, Image, Table,
  ScanLine, Layers, Shield, Zap,
  ChevronRight, Star, Users, Clock,
} from 'lucide-react'

const toolCategories = [
  {
    title: 'PDF 工具箱',
    description: '合并、拆分、水印、压缩',
    icon: <Layers className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    tools: [
      { name: 'PDF 合并', desc: '将多个PDF合并为一个文档', icon: <Merge className="w-5 h-5" />, href: '/tools/pdf-merge' },
      { name: 'PDF 拆分', desc: '按页码范围拆分PDF文档', icon: <Scissors className="w-5 h-5" />, href: '/tools/pdf-split' },
      { name: 'PDF 水印', desc: '为PDF添加自定义文字水印', icon: <Droplets className="w-5 h-5" />, href: '/tools/pdf-watermark' },
      { name: 'PDF 压缩', desc: '减小PDF文件体积', icon: <FileDown className="w-5 h-5" />, href: '/tools/pdf-compress' },
    ],
  },
  {
    title: '格式转换',
    description: 'Word、Excel、PDF、图片互转',
    icon: <ArrowRightLeft className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-500',
    tools: [
      { name: 'PDF 转 Word', desc: '将PDF转为可编辑Word文档', icon: <FileText className="w-5 h-5" />, href: '/tools/convert-pdf-to-word' },
      { name: 'Word 转 PDF', desc: '将Word文档转为PDF格式', icon: <FileDown className="w-5 h-5" />, href: '/tools/convert-word-to-pdf' },
      { name: 'Excel 转 PDF', desc: '将表格转为PDF文档', icon: <Table className="w-5 h-5" />, href: '/tools/convert-excel-to-pdf' },
      { name: '图片转 PDF', desc: '多张图片合成PDF文档', icon: <Image className="w-5 h-5" />, href: '/tools/convert-image-to-pdf' },
    ],
  },
  {
    title: '智能识别 & 批量处理',
    description: 'OCR识别、批量操作提升效率',
    icon: <ScanLine className="w-6 h-6" />,
    gradient: 'from-amber-500 to-orange-500',
    tools: [
      { name: '发票 OCR 识别', desc: '自动提取发票关键信息', icon: <ScanLine className="w-5 h-5" />, href: '/tools/invoice-ocr' },
      { name: '批量水印', desc: '为多个文件同时添加水印', icon: <Layers className="w-5 h-5" />, href: '/tools/batch-watermark' },
    ],
  },
]

const stats = [
  { label: '每日处理文件', value: '10,000+', icon: <FileText className="w-5 h-5" /> },
  { label: '注册用户', value: '5,000+', icon: <Users className="w-5 h-5" /> },
  { label: '处理耗时', value: '< 10秒', icon: <Clock className="w-5 h-5" /> },
  { label: '用户评分', value: '4.8/5', icon: <Star className="w-5 h-5" /> },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-blue-50/50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6 animate-fade-in-up">
            <Zap className="w-4 h-4" />
            所有处理在浏览器本地完成，文件不会上传到服务器
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-navy-800 leading-tight animate-fade-in-up stagger-1">
            全能文档处理工具
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent">
              一站式在线搞定
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-navy-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
            PDF合并拆分、格式转换、发票OCR识别、批量处理 --
            无需安装软件，打开网页即可使用
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
            <Link
              to="/tools/pdf-merge"
              className="btn-primary text-base !px-8 !py-3 no-underline"
            >
              开始使用
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
            <Link
              to="/pricing"
              className="btn-secondary text-base !px-8 !py-3 no-underline"
            >
              查看定价
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up stagger-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-500">
                  {stat.icon}
                </div>
                <span className="text-2xl font-display font-bold text-navy-800">{stat.value}</span>
                <span className="text-sm text-navy-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {toolCategories.map((cat, catIdx) => (
          <div key={cat.title} className={catIdx > 0 ? 'mt-16' : ''}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white`}>
                {cat.icon}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-navy-800">
                  {cat.title}
                </h2>
                <p className="text-sm text-navy-400">{cat.description}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.tools.map((tool) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="card group no-underline"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-500 group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors shrink-0">
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-navy-700 group-hover:text-brand-700 transition-colors flex items-center gap-1">
                        {tool.name}
                        <ChevronRight className="w-4 h-4 text-navy-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                      </h3>
                      <p className="text-sm text-navy-400 mt-1">{tool.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Trust Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="card !p-8 sm:!p-12">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center text-white shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-navy-800">
                文件安全，隐私保障
              </h2>
              <p className="text-navy-500 mt-2 leading-relaxed">
                DocFlow 的所有文档处理均在你的浏览器中本地完成。
                你的文件不会被上传到任何服务器，也不会被任何人看到。
                关闭网页后，所有处理数据自动清除。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

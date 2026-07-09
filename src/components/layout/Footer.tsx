import { FileText } from 'lucide-react'

const toolGroups = [
  {
    title: 'PDF工具',
    links: [
      { label: 'PDF合并', href: '/tools/pdf-merge' },
      { label: 'PDF拆分', href: '/tools/pdf-split' },
      { label: 'PDF水印', href: '/tools/pdf-watermark' },
      { label: 'PDF压缩', href: '/tools/pdf-compress' },
    ],
  },
  {
    title: '格式转换',
    links: [
      { label: 'PDF转Word', href: '/tools/convert-pdf-to-word' },
      { label: 'Word转PDF', href: '/tools/convert-word-to-pdf' },
      { label: 'Excel转PDF', href: '/tools/convert-excel-to-pdf' },
      { label: '图片转PDF', href: '/tools/convert-image-to-pdf' },
    ],
  },
  {
    title: '其他工具',
    links: [
      { label: '发票OCR识别', href: '/tools/invoice-ocr' },
      { label: '批量水印', href: '/tools/batch-watermark' },
      { label: '批量重命名', href: '/tools/batch-rename' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-navy-800 text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-brand-400" />
              </div>
              <span className="font-display font-bold text-lg">DocFlow</span>
            </div>
            <p className="text-navy-400 text-sm leading-relaxed">
              一站式在线文档处理工具，所有处理在浏览器本地完成，保护你的文件隐私。
            </p>
          </div>

          {/* Tool Groups */}
          {toolGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-medium text-sm text-navy-300 mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-navy-400 hover:text-brand-400 transition-colors no-underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-navy-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-500 text-xs">
            2025 DocFlow. All files are processed locally in your browser.
          </p>
          <p className="text-navy-500 text-xs">
            Your files never leave your device.
          </p>
        </div>
      </div>
    </footer>
  )
}

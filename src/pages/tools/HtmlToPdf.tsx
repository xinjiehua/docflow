import { useState, useRef } from 'react'
import { Code, Download, Lock, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

export default function HtmlToPdf() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>示例文档</title>
<style>
body { font-family: sans-serif; padding: 40px; color: #333; }
h1 { color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px; }
h2 { color: #0f3460; margin-top: 24px; }
p { line-height: 1.8; }
.highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
</style>
</head>
<body>
<h1>DocFlow 文档示例</h1>
<p>这是一个 <span class="highlight">HTML 转 PDF</span> 的示例文档。</p>
<h2>功能说明</h2>
<p>输入任意 HTML 代码，即可将其渲染为 PDF 文件下载。</p>
<h2>支持特性</h2>
<ul>
<li>完整的 CSS 样式支持</li>
<li>中文字体自动适配</li>
<li>表格、列表等复杂排版</li>
</ul>
</body>
</html>`)
  const [processing, setProcessing] = useState(false)
  const [preview, setPreview] = useState(true)
  const [resultUrl, setResultUrl] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const previewSrcDoc = html

  const handleConvert = async () => {
    if (!html.trim() || !checkUsage()) return
    setProcessing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      // Create offscreen container
      const container = document.createElement('div')
      container.style.width = '210mm'
      container.style.padding = '10mm'
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.background = 'white'
      container.innerHTML = html
      // Inject base styles for rendering
      const style = document.createElement('style')
      style.textContent = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || ''
      document.body.appendChild(container)

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      document.body.removeChild(container)

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      const pageHeight = 297

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      } else {
        let remainingHeight = pdfHeight
        let position = 0
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'JPEG', 0, -position, pdfWidth, pdfHeight)
          remainingHeight -= pageHeight
          position += pageHeight
          if (remainingHeight > 0) pdf.addPage()
        }
      }

      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
    } catch (err: any) {
      alert('转换失败: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const templates = [
    {
      name: '简历模板',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;max-width:700px;margin:0 auto;padding:30px;color:#333}h1{color:#1a1a2e;border-bottom:3px solid #e94560;padding-bottom:8px}h2{color:#0f3460;margin-top:20px;display:flex;align-items:center;gap:8px}h2::after{content:'';flex:1;height:1px;background:#ddd}.contact{display:flex;gap:20px;margin:10px 0 20px;color:#666;font-size:14px}.section{margin-bottom:16px}.item{display:flex;margin:6px 0}.item-label{width:80px;color:#888;font-size:14px;flex-shrink:0}.item-value{flex:1}</style></head><body><h1>张三</h1><div class="contact"><span>13800138000</span><span>zhangsan@email.com</span><span>北京市</span></div><h2>教育背景</h2><div class="section"><div class="item"><span class="item-label">学校</span><span class="item-value">XX大学 | 计算机科学与技术 | 本科</span></div><div class="item"><span class="item-label">时间</span><span class="item-value">2018.09 - 2022.06</span></div></div><h2>工作经历</h2><div class="section"><div class="item"><span class="item-label">公司</span><span class="item-value">XX科技有限公司</span></div><div class="item"><span class="item-label">职位</span><span class="item-value">前端工程师</span></div><div class="item"><span class="item-label">时间</span><span class="item-value">2022.07 - 至今</span></div><div class="item"><span class="item-label">职责</span><span class="item-value">负责公司核心产品的前端开发与优化</span></div></div><h2>技能</h2><div class="section"><p>JavaScript / TypeScript / React / Vue / Node.js / CSS</p></div></body></html>`,
    },
    {
      name: '发票样式',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;max-width:700px;margin:0 auto;padding:30px;color:#333}h1{text-align:center;color:#e94560;font-size:24px;border:2px solid #e94560;padding:10px;display:inline-block;margin:0 auto 20px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;font-size:14px}th{background:#f5f5f5;font-weight:600}.total{font-size:16px;font-weight:bold;text-align:right;padding:12px}.info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;font-size:14px}.info-item{color:#666}</style></head><body><div style="text-align:center"><h1>XX科技有限公司</h1><p>销售发票</p></div><div class="info"><div class="info-item"><strong>发票号码：</strong>FP20240001</div><div class="info-item"><strong>开票日期：</strong>2024-01-15</div><div class="info-item"><strong>购买方：</strong>XX贸易公司</div><div class="info-item"><strong>税号：</strong>91XXXXXXXXXX</div></div><table><thead><tr><th>序号</th><th>品名</th><th>规格</th><th>数量</th><th>单价</th><th>金额</th><th>税率</th></tr></thead><tbody><tr><td>1</td><td>办公软件许可</td><td>企业版</td><td>1</td><td>¥5,000.00</td><td>¥5,000.00</td><td>6%</td></tr><tr><td>2</td><td>技术支持服务</td><td>年度</td><td>1</td><td>¥3,000.00</td><td>¥3,000.00</td><td>6%</td></tr></tbody></table><div class="total">合计金额：¥8,000.00（含税）</div></body></html>`,
    },
  ]

  return (
    <ToolLayout
      title="HTML 转 PDF"
      description="输入HTML代码，渲染为PDF文件下载，支持自定义样式"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        <div className="card !p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-navy-700">HTML 代码</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-navy-400">快速模板:</span>
              {templates.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setHtml(t.html)}
                  className="text-xs px-2 py-1 rounded bg-navy-50 text-navy-600 hover:bg-navy-100 transition-colors"
                >
                  {t.name}
                </button>
              ))}
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => setPreview(true)}
                  className={`px-2 py-1 rounded text-xs ${preview ? 'bg-brand-50 text-brand-700' : 'text-navy-500 hover:bg-navy-50'}`}
                >
                  <Eye className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <textarea
            className="w-full h-64 font-mono text-sm p-4 border border-navy-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="在此输入HTML代码..."
          />
        </div>

        {preview && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-4">预览效果</h3>
            <div className="border border-navy-200 rounded-lg overflow-hidden bg-white">
              <iframe
                ref={iframeRef}
                srcDoc={previewSrcDoc}
                className="w-full h-96"
                sandbox="allow-same-origin"
                title="HTML Preview"
              />
            </div>
          </div>
        )}

        <button onClick={handleConvert} className="btn-primary" disabled={!html.trim() || processing}>
          <Code className="w-4 h-4 mr-2" />
          {processing ? '转换中...' : '转换为 PDF'}
        </button>

        {processing && <ProcessingIndicator />}

        {resultUrl && (
          <div className="card !p-6">
            <h3 className="font-medium text-navy-700 mb-4">转换完成</h3>
            <a href={resultUrl} download="html-export.pdf" className="btn-primary inline-flex">
              <Download className="w-4 h-4 mr-2" />
              下载 PDF
            </a>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

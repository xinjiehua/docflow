import { useState } from 'react'
import { Download, Loader2, FileCode } from 'lucide-react'
import { marked } from 'marked'

export default function MarkdownToPpt() {
  const [markdown, setMarkdown] = useState('# 标题\n\n## 副标题\n\n- 要点一\n- 要点二\n- 要点三\n\n## 第二页\n\n正文内容')
  const [loading, setLoading] = useState(false)

  const parseMarkdown = (md: string) => {
    const tokens = marked.lexer(md)
    const slides: { title: string; content: string[] }[] = []
    let currentSlide: { title: string; content: string[] } | null = null

    for (const token of tokens) {
      if (token.type === 'heading') {
        if (token.depth === 1) {
          if (currentSlide) slides.push(currentSlide)
          currentSlide = { title: token.text, content: [] }
        } else {
          if (!currentSlide) currentSlide = { title: '', content: [] }
          currentSlide.content.push(`## ${token.text}`)
        }
      } else if (token.type === 'list') {
        if (!currentSlide) currentSlide = { title: '', content: [] }
        for (const item of token.items) {
          currentSlide.content.push(`• ${item.text}`)
        }
      } else if (token.type === 'paragraph') {
        if (!currentSlide) currentSlide = { title: '', content: [] }
        currentSlide.content.push(token.text)
      }
    }
    if (currentSlide) slides.push(currentSlide)
    if (slides.length === 0) slides.push({ title: '演示文稿', content: ['暂无内容'] })
    return slides
  }

  const convert = async () => {
    setLoading(true)
    try {
      const slides = parseMarkdown(markdown)
      const PptxGenJS = (await import('pptxgenjs')).default
      const pptx = new PptxGenJS()
      pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 })
      pptx.layout = 'CUSTOM'

      for (const slide of slides) {
        const s = pptx.addSlide()
        // Title
        if (slide.title) {
          s.addText(slide.title, {
            x: 0.8, y: 0.6, w: 8.4, h: 1.2,
            fontSize: 32, bold: true, color: '333333',
            align: 'left', valign: 'middle',
          })
        }
        // Content
        const contentText = slide.content.map((c) => ({
          text: c,
          options: { fontSize: 18, color: '555555', bullet: c.startsWith('•') ? { type: 'bullet' } : false, breakLine: true },
        }))
        if (contentText.length > 0) {
          s.addText(contentText, {
            x: 0.8, y: slide.title ? 2.2 : 1.5, w: 8.4, h: slide.title ? 4.8 : 5.5,
            valign: 'top', lineSpacingMultiple: 1.5,
          })
        }
      }

      const blob = await pptx.write({ outputType: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'markdown-presentation.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('转换失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const slides = parseMarkdown(markdown)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Markdown 转 PPT</h1>
      <p className="text-gray-500 mb-6">用 Markdown 编写内容，自动生成 PPT 演示文稿（# 标题分页）</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileCode className="w-5 h-5" />
            <h2 className="font-semibold">Markdown 编辑</h2>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-96 font-mono text-sm border rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="输入 Markdown 内容..."
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileCode className="w-5 h-5" />
            <h2 className="font-semibold">预览（{slides.length} 页）</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {slides.map((s, i) => (
              <div key={i} className="border rounded-lg p-4 bg-gray-50">
                <div className="text-base font-bold mb-2">{s.title || `第 ${i + 1} 页`}</div>
                {s.content.map((c, j) => (
                  <div key={j} className="text-sm text-gray-600 ml-2">{c}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={convert} disabled={loading} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 生成中...</> : <><Download className="w-5 h-5" /> 生成 PPT 并下载</>}
      </button>
    </div>
  )
}

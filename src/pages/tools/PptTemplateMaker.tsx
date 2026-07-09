import { useState } from 'react'
import { Download, Loader2, Palette, Layout } from 'lucide-react'

interface SlideData {
  title: string
  content: string
}

const templates = [
  { name: '商务蓝', bg: '1a365d', titleColor: 'FFFFFF', contentColor: 'E2E8F0', accent: '3B82F6' },
  { name: '简约白', bg: 'FFFFFF', titleColor: '1A202C', contentColor: '4A5568', accent: '3B82F6' },
  { name: '科技黑', bg: '111827', titleColor: '10B981', contentColor: 'D1D5DB', accent: '10B981' },
  { name: '活力橙', bg: 'FFF7ED', titleColor: 'EA580C', contentColor: '78716C', accent: 'EA580C' },
  { name: '学术绿', bg: 'F0FDF4', titleColor: '166534', contentColor: '4B5563', accent: '22C55E' },
  { name: '热情红', bg: 'FEF2F2', titleColor: 'DC2626', contentColor: '6B7280', accent: 'DC2626' },
  { name: '深紫', bg: '2E1065', titleColor: 'C084FC', contentColor: 'DDD6FE', accent: 'A855F7' },
  { name: '暖黄', bg: 'FFFBEB', titleColor: 'D97706', contentColor: '78716C', accent: 'F59E0B' },
]

export default function PptTemplateMaker() {
  const [templateIdx, setTemplateIdx] = useState(1)
  const [slides, setSlides] = useState<SlideData[]>([
    { title: '项目名称', content: '副标题 / 演讲者 / 日期' },
    { title: '目录', content: '• 第一部分\n• 第二部分\n• 第三部分' },
    { title: '第一部分', content: '在这里输入内容要点' },
    { title: '第二部分', content: '在这里输入内容要点' },
    { title: '第三部分', content: '在这里输入内容要点' },
    { title: '谢谢', content: '联系方式 / Q&A' },
  ])
  const [loading, setLoading] = useState(false)

  const updateSlide = (index: number, field: keyof SlideData, value: string) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const addSlide = () => setSlides((prev) => [...prev, { title: '新页面', content: '' }])
  const removeSlide = (index: number) => setSlides((prev) => prev.filter((_, i) => i !== index))

  const generate = async () => {
    setLoading(true)
    try {
      const tmpl = templates[templateIdx]
      const PptxGenJS = (await import('pptxgenjs')).default
      const pptx = new PptxGenJS()
      pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 })
      pptx.layout = 'CUSTOM'

      for (let i = 0; i < slides.length; i++) {
        const s = slides[i]
        const slide = pptx.addSlide()
        slide.background = { fill: tmpl.bg }

        // Title
        slide.addText(s.title, {
          x: 0.8, y: i === 0 ? 2.2 : 0.6, w: 8.4, h: i === 0 ? 1.5 : 1.2,
          fontSize: i === 0 ? 40 : 28, bold: true, color: tmpl.titleColor,
          align: i === 0 ? 'center' : 'left',
        })

        // Content
        const lines = s.content.split('\n').map((line) => ({
          text: line,
          options: { fontSize: i === 0 ? 20 : 18, color: tmpl.contentColor, breakLine: true },
        }))
        slide.addText(lines, {
          x: 0.8, y: i === 0 ? 4 : 2.2, w: 8.4, h: i === 0 ? 2 : 4.8,
          align: i === 0 ? 'center' : 'left', valign: 'top', lineSpacingMultiple: 1.5,
        })

        // Accent bar
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: i === 0 ? 7 : 0, w: 10, h: 0.08,
          fill: { color: tmpl.accent },
        })
      }

      const blob = await pptx.write({ outputType: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'template-presentation.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('生成失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 模板制作</h1>
      <p className="text-gray-500 mb-6">选择模板风格，编辑内容，一键导出精美 PPT</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Palette className="w-5 h-5" /> 选择模板风格</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => setTemplateIdx(i)}
              className={`p-2 rounded-lg border-2 text-xs font-medium transition-colors ${templateIdx === i ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: t.bg, border: `2px solid ${t.accent}` }} />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2"><Layout className="w-5 h-5" /> 编辑幻灯片</h2>
          <button onClick={addSlide} className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">+ 添加页面</button>
        </div>
        <div className="space-y-3">
          {slides.map((s, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">第 {i + 1} 页</span>
                {slides.length > 1 && <button onClick={() => removeSlide(i)} className="text-xs text-red-500 hover:underline">删除</button>}
              </div>
              <input type="text" value={s.title} onChange={(e) => updateSlide(i, 'title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm font-semibold mb-2" placeholder="标题" />
              <textarea value={s.content} onChange={(e) => updateSlide(i, 'content', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="内容（每行一个要点）" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 生成中...</> : <><Download className="w-5 h-5" /> 生成 PPT 并下载</>}
      </button>
    </div>
  )
}

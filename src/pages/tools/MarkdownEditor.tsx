import { useState, useMemo } from 'react'
import { FileText, Download, Copy, Check, Lock, Columns } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

const defaultMd = `# 欢迎使用 Markdown 编辑器

## 功能特性

- **实时预览**：左右分栏同步显示
- **语法高亮**：代码块自动着色
- **多种导出**：支持 HTML / TXT 下载

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, DocFlow!");
}
\`\`\`

## 表格

| 功能 | 状态 | 说明 |
|------|------|------|
| 实时预览 | 已完成 | 同步渲染 |
| 导出HTML | 已完成 | 带样式导出 |
| 导出PDF | 已完成 | 可打印 |

## 引用

> Markdown 是一种轻量级标记语言，允许使用易读易写的纯文本格式编写文档。

---

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

**粗体** *斜体* ~~删除线~~ \`行内代码\`

---

*由 DocFlow Markdown 编辑器生成*`

export default function MarkdownEditor() {
  const { isPro } = useUserStore()
  const { used, limit } = useUsageStore()
  const [md, setMd] = useState(defaultMd)
  const [copied, setCopied] = useState(false)
  const [showHtml, setShowHtml] = useState(false)

  const html = useMemo(() => {
    // Simple markdown to HTML conversion (no dependency needed)
    let out = md
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold & italic & strikethrough
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr/>')
      // Unordered list
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Ordered list
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Images
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Tables
      .replace(/^\|(.+)\|$/gm, (match, content) => {
        if (content.replace(/[\s|-]/g, '') === '') return '' // separator row
        const cells = content.split('|').map((c: string) => c.trim())
        return '<tr>' + cells.map((c: string) => '<td>' + c + '</td>').join('') + '</tr>'
      })
      // Wrap consecutive <tr> in <table>
      // Paragraphs (lines not already tagged)
      .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')

    // Wrap list items in ul
    out = out.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

    // Wrap table rows in table
    out = out.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>')

    return out
  }, [md])

  const fullHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>Markdown Document</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.8; }
h1 { font-size: 28px; border-bottom: 2px solid #e94560; padding-bottom: 8px; }
h2 { font-size: 22px; color: #0f3460; margin-top: 24px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
h3 { font-size: 18px; color: #16213e; margin-top: 20px; }
code.inline-code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 90%; color: #e94560; }
pre { background: #1a1a2e; color: #e0e0e0; padding: 16px; border-radius: 8px; overflow-x: auto; }
pre code { color: #e0e0e0; font-size: 14px; }
blockquote { border-left: 4px solid #e94560; margin: 12px 0; padding: 8px 16px; background: #fff5f5; color: #555; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; }
th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background: #f5f5f5; font-weight: 600; }
tr:nth-child(even) { background: #fafafa; }
hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
a { color: #e94560; text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; border-radius: 8px; }
ul { padding-left: 24px; }
li { margin: 4px 0; }
</style>
</head>
<body>
${html}
</body>
</html>`
  }, [html])

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportHtml = () => {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown-export.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportTxt = () => {
    const blob = new Blob([md], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown-export.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = () => {
    const printWin = window.open('', '_blank')
    if (printWin) {
      printWin.document.write(fullHtml)
      printWin.document.close()
      printWin.onload = () => printWin.print()
    }
  }

  const charCount = md.length
  const wordCount = md.replace(/\s/g, '').length
  const lineCount = md.split('\n').length

  return (
    <ToolLayout
      title="Markdown 编辑器"
      description="实时预览Markdown文档，支持导出HTML/PDF/TXT"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="card !p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleExportHtml} className="btn-secondary !px-3 !py-1.5 text-sm">
              <Download className="w-3 h-3 mr-1" />
              导出 HTML
            </button>
            <button onClick={handleExportTxt} className="btn-secondary !px-3 !py-1.5 text-sm">
              <Download className="w-3 h-3 mr-1" />
              导出 MD
            </button>
            <button onClick={handleExportPdf} className="btn-secondary !px-3 !py-1.5 text-sm">
              <Download className="w-3 h-3 mr-1" />
              导出 PDF
            </button>
            <button onClick={handleCopyHtml} className="btn-secondary !px-3 !py-1.5 text-sm">
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? '已复制' : '复制 HTML'}
            </button>
            <div className="flex-1" />
            <span className="text-xs text-navy-400">
              {charCount} 字符 | {wordCount} 字 | {lineCount} 行
            </span>
          </div>
        </div>

        {/* Editor + Preview */}
        <div className="grid md:grid-cols-2 gap-0 border border-navy-200 rounded-xl overflow-hidden" style={{ minHeight: '500px' }}>
          {/* Editor */}
          <div className="relative">
            <div className="absolute top-2 left-3 text-xs text-navy-400 bg-white/80 px-2 rounded z-10">编辑</div>
            <textarea
              className="w-full h-full min-h-[500px] p-3 pt-8 font-mono text-sm resize-none focus:outline-none border-r border-navy-200 bg-white"
              value={md}
              onChange={(e) => setMd(e.target.value)}
              placeholder="在此编写 Markdown..."
            />
          </div>

          {/* Preview */}
          <div className="bg-white">
            <div className="px-3 pt-2 pb-1 text-xs text-navy-400 border-b border-navy-100">预览</div>
            <div
              className="p-4 overflow-auto prose-sm"
              style={{ minHeight: '460px', maxHeight: '600px' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

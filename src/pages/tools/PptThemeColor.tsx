import { useState } from 'react'
import { Upload, Download, Loader2, Palette } from 'lucide-react'
import JSZip from 'jszip'

const themes = [
  { name: '商务蓝', colors: { dk1: '1A365D', lt1: 'FFFFFF', dk2: '2C5282', lt2: 'E2E8F0', accent1: '3B82F6', accent2: '60A5FA', accent3: '93C5FD', accent4: '1E40AF', accent5: '2563EB', accent6: '1D4ED8', hlink: '2563EB', folHlink: '7C3AED' } },
  { name: '简约灰', colors: { dk1: '1A202C', lt1: 'FFFFFF', dk2: '4A5568', lt2: 'F7FAFC', accent1: '718096', accent2: 'A0AEC0', accent3: 'CBD5E0', accent4: '2D3748', accent5: '4A5568', accent6: '718096', hlink: '4A5568', folHlink: '718096' } },
  { name: '翠绿', colors: { dk1: '064E3B', lt1: 'FFFFFF', dk2: '065F46', lt2: 'D1FAE5', accent1: '10B981', accent2: '34D399', accent3: '6EE7B7', accent4: '047857', accent5: '059669', accent6: '10B981', hlink: '059669', folHlink: '10B981' } },
  { name: '热情红', colors: { dk1: '7F1D1D', lt1: 'FFFFFF', dk2: '991B1B', lt2: 'FEE2E2', accent1: 'EF4444', accent2: 'F87171', accent3: 'FCA5A5', accent4: 'B91C1C', accent5: 'DC2626', accent6: 'EF4444', hlink: 'DC2626', folHlink: 'EF4444' } },
  { name: '暖橙', colors: { dk1: '78350F', lt1: 'FFFFFF', dk2: '92400E', lt2: 'FEF3C7', accent1: 'F59E0B', accent2: 'FBBF24', accent3: 'FCD34D', accent4: 'D97706', accent5: 'F59E0B', accent6: 'FBBF24', hlink: 'D97706', folHlink: 'F59E0B' } },
  { name: '优雅紫', colors: { dk1: '4C1D95', lt1: 'FFFFFF', dk2: '5B21B6', lt2: 'EDE9FE', accent1: '8B5CF6', accent2: 'A78BFA', accent3: 'C4B5FD', accent4: '6D28D9', accent5: '7C3AED', accent6: '8B5CF6', hlink: '7C3AED', folHlink: 'A78BFA' } },
]

export default function PptThemeColor() {
  const [file, setFile] = useState<File | null>(null)
  const [themeIdx, setThemeIdx] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const applyTheme = async () => {
    if (!file) return
    setLoading(true)
    try {
      const ab = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(ab)
      const theme = themes[themeIdx]

      // Find and update theme XML
      const themePath = 'ppt/theme/theme1.xml'
      if (zip.files[themePath]) {
        let themeXml = await zip.files[themePath].async('text')
        const colorMap: Record<string, string> = {
          'mstColorMapDk1': 'dk1', 'mstColorMapLt1': 'lt1', 'mstColorMapDk2': 'dk2', 'mstColorMapLt2': 'lt2',
          'mstColorMapAccent1': 'accent1', 'mstColorMapAccent2': 'accent2', 'mstColorMapAccent3': 'accent3',
          'mstColorMapAccent4': 'accent4', 'mstColorMapAccent5': 'accent5', 'mstColorMapAccent6': 'accent6',
          'mstColorMapHlink': 'hlink', 'mstColorMapFolHlink': 'folHlink',
        }
        for (const [xmlKey, themeKey] of Object.entries(colorMap)) {
          const regex = new RegExp(`<a:${xmlKey}[^>]*val="[0-9A-Fa-f]+"`, 'g')
          themeXml = themeXml.replace(regex, `<a:${xmlKey} val="${theme.colors[themeKey as keyof typeof theme.colors]}"`)
        }
        zip.file(themePath, themeXml)
      }

      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pptx', `-${themes[themeIdx].name}.pptx`)
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('应用配色失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 主题配色</h1>
      <p className="text-gray-500 mb-6">一键更换 PPT 整体配色方案</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors mb-6">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        <h2 className="font-semibold mb-3 flex items-center gap-2"><Palette className="w-5 h-5" /> 选择配色方案</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {themes.map((t, i) => (
            <button
              key={i}
              onClick={() => setThemeIdx(i)}
              className={`p-3 rounded-xl border-2 transition-colors text-left ${themeIdx === i ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="text-sm font-medium mb-2">{t.name}</div>
              <div className="flex gap-1">
                {[t.colors.dk1, t.colors.accent1, t.colors.accent2, t.colors.accent3, t.colors.lt1].map((c, j) => (
                  <div key={j} className="w-6 h-6 rounded-full border" style={{ backgroundColor: `#${c}` }} />
                ))}
              </div>
            </button>
          ))}
        </div>

        <button onClick={applyTheme} disabled={!file || loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 处理中...</> : <><Download className="w-4 h-4" /> 应用配色并下载</>}
        </button>
      </div>
    </div>
  )
}

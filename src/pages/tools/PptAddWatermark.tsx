import { useState } from 'react'
import { Upload, Download, Loader2 } from 'lucide-react'
import JSZip from 'jszip'

export default function PptWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('机密')
  const [opacity, setOpacity] = useState(30)
  const [fontSize, setFontSize] = useState(48)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const addWatermark = async () => {
    if (!file || !text) return
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)

      // Add watermark to each slide's XML as a shape
      for (const path of Object.keys(zip.files)) {
        if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) {
          let xml = await zip.files[path].async('text')
          // Find the end tag to insert watermark shape before it
          const ns = ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
          const opacityVal = (opacity / 100).toFixed(2)
          const fill = `<a:solidFill><a:srgbClr val="999999"><a:alpha val="${opacityVal}0000"/></a:srgbClr></a:solidFill>`
          const watermarkShape = `<p:sp${ns}><p:nvSpPr><p:cNvPr id="9999" name="Watermark"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm rot="5400000"><a:off x="0" y="0"/><a:ext cx="9144000" cy="6858000"/><a:chOff x="0" y="0"/><a:chExt cx="9144000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="zh-CN" sz="${fontSize * 100}" dirty="0">${fill}</a:rPr><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp>`
          // Insert before closing </p:sld>
          xml = xml.replace('</p:sld>', watermarkShape + '</p:sld>')
          zip.file(path, xml)
        }
      }

      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pptx', '-watermarked.pptx')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('添加水印失败：' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PPT 添加水印</h1>
      <p className="text-gray-500 mb-6">批量给 PPT 每页添加文字水印</p>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-500">{file ? file.name : '点击上传 PPT 文件'}</span>
          <input type="file" accept=".pptx" onChange={handleFile} className="hidden" />
        </label>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">水印文字</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="机密" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">透明度 ({opacity}%)</label>
            <input type="range" min="5" max="80" value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">字体大小 ({fontSize}pt)</label>
            <input type="range" min="16" max="96" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full" />
          </div>
        </div>

        <button onClick={addWatermark} disabled={!file || !text || loading} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 处理中...</> : <><Download className="w-4 h-4" /> 添加水印并下载</>}
        </button>
      </div>
    </div>
  )
}

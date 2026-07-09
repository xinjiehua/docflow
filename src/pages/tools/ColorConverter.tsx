import { useState, useMemo } from 'react'
import { Palette, Copy, Check, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!match) return null
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v } }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255
  const k = 1 - Math.max(rr, gg, bb)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  }
}

export default function ColorConverter() {
  const { isPro } = useUserStore()
  const { used, limit } = useUsageStore()
  const [hex, setHex] = useState('#3B82F6')
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 })
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 })
  const [copied, setCopied] = useState<string | null>(null)

  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb])

  const handleHexChange = (value: string) => {
    let v = value
    if (!v.startsWith('#')) v = '#' + v
    setHex(v)
    const parsed = hexToRgb(v)
    if (parsed) {
      setRgb(parsed)
      setHsl(rgbToHsl(parsed.r, parsed.g, parsed.b))
    }
  }

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, value)) }
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
  }

  const handleHslChange = (channel: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hsl, [channel]: Math.max(0, channel === 'h' ? 360 : 100, Math.min(channel === 'h' ? 360 : 100, value)) }
    setHsl(newHsl)
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleHexChange(e.target.value)
  }

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  // Generate palette shades
  const shades = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const lightness = i * 10
      const rgb = hslToRgb(hsl.h, hsl.s, lightness)
      return { hex: rgbToHex(rgb.r, rgb.g, rgb.b), lightness }
    })
  }, [hsl])

  // Complementary and analogous
  const paletteColors = useMemo(() => {
    return [
      { name: '互补色', h: (hsl.h + 180) % 360 },
      { name: '类似色1', h: (hsl.h + 30) % 360 },
      { name: '类似色2', h: (hsl.h + 330) % 360 },
      { name: '三角色1', h: (hsl.h + 120) % 360 },
      { name: '三角色2', h: (hsl.h + 240) % 360 },
    ].map(c => {
      const rgb = hslToRgb(c.h, hsl.s, hsl.l)
      return { ...c, hex: rgbToHex(rgb.r, rgb.g, rgb.b) }
    })
  }, [hsl])

  const ColorRow = ({ label, value, format }: { label: string; value: string; format: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-navy-100 last:border-0">
      <div>
        <span className="text-sm text-navy-500 mr-2">{label}</span>
        <code className="text-sm font-mono font-medium text-navy-700">{value}</code>
      </div>
      <button
        onClick={() => handleCopy(value, label)}
        className="text-xs text-navy-400 hover:text-navy-600 flex items-center gap-1"
      >
        {copied === label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied === label ? '已复制' : '复制'}
      </button>
    </div>
  )

  return (
    <ToolLayout
      title="颜色转换器"
      description="HEX/RGB/HSL/CMYK互转，色板拾取，调色板生成"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        {/* Color preview + picker */}
        <div className="card !p-6">
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-32 h-32 rounded-2xl border-2 border-navy-200 shadow-inner cursor-pointer relative"
                style={{ backgroundColor: hex }}
              >
                <input
                  type="color"
                  value={hex}
                  onChange={handleColorPicker}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-sm text-navy-500">点击选色</span>
            </div>

            <div className="flex-1 space-y-4">
              {/* HEX */}
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">HEX</label>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="input font-mono"
                  maxLength={7}
                />
              </div>

              {/* RGB */}
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">RGB</label>
                <div className="flex gap-2">
                  {(['r', 'g', 'b'] as const).map((ch) => (
                    <div key={ch} className="flex-1">
                      <label className="text-xs text-navy-400">{ch.toUpperCase()}</label>
                      <input
                        type="number" min="0" max="255"
                        value={rgb[ch]}
                        onChange={(e) => handleRgbChange(ch, Number(e.target.value))}
                        className="input font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* HSL */}
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">HSL</label>
                <div className="flex gap-2">
                  {(['h', 's', 'l'] as const).map((ch) => (
                    <div key={ch} className="flex-1">
                      <label className="text-xs text-navy-400">{ch.toUpperCase()}{ch === 'h' ? '°' : '%'}</label>
                      <input
                        type="number" min="0" max={ch === 'h' ? 360 : 100}
                        value={hsl[ch]}
                        onChange={(e) => handleHslChange(ch, Number(e.target.value))}
                        className="input font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All format values */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-3">所有格式</h3>
          <ColorRow label="HEX" value={hex} format="hex" />
          <ColorRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} format="rgb" />
          <ColorRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} format="hsl" />
          <ColorRow label="CMYK" value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`} format="cmyk" />
          <ColorRow label="CSS" value={hex} format="css" />
        </div>

        {/* Shade palette */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-3">明暗色板</h3>
          <div className="flex gap-1 rounded-xl overflow-hidden">
            {shades.map((s) => (
              <button
                key={s.lightness}
                onClick={() => handleHslChange('l', s.lightness)}
                className="flex-1 h-12 hover:scale-110 transition-transform cursor-pointer relative group"
                style={{ backgroundColor: s.hex }}
                title={`${s.hex} (L${s.lightness})`}
              >
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: s.lightness > 50 ? '#000' : '#fff' }}>
                  {s.hex}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Palette colors */}
        <div className="card !p-6">
          <h3 className="font-medium text-navy-700 mb-3">配色方案</h3>
          <div className="flex gap-2">
            {paletteColors.map((c) => (
              <button
                key={c.name}
                onClick={() => handleHexChange(c.hex)}
                className="flex-1 rounded-xl overflow-hidden cursor-pointer group"
              >
                <div className="h-16 transition-transform hover:scale-105" style={{ backgroundColor: c.hex }} />
                <div className="text-center py-1.5 bg-navy-50">
                  <div className="text-xs text-navy-600">{c.name}</div>
                  <code className="text-[10px] text-navy-400">{c.hex}</code>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

import { useState } from 'react'
import { Camera, Copy, Check, Lock, Image } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

interface ExifEntry {
  label: string
  value: string
}

const EXIF_LABELS: Record<string, string> = {
  // Camera
  Make: '相机厂商',
  Model: '相机型号',
  LensModel: '镜头型号',
  ExposureTime: '快门速度',
  FNumber: '光圈值',
  ISO: 'ISO感光度',
  FocalLength: '焦距',
  FocalLengthIn35mmFormat: '等效35mm焦距',
  ExposureProgram: '曝光程序',
  ExposureMode: '曝光模式',
  MeteringMode: '测光模式',
  ExposureCompensation: '曝光补偿',
  // Image
  ImageWidth: '图片宽度',
  ImageHeight: '图片高度',
  ExifImageWidth: '图片宽度',
  ExifImageHeight: '图片高度',
  Orientation: '方向',
  XResolution: 'X分辨率',
  YResolution: 'Y分辨率',
  ResolutionUnit: '分辨率单位',
  BitsPerSample: '位深度',
  ColorSpace: '色彩空间',
  // Date
  DateTimeOriginal: '拍摄日期',
  CreateDate: '创建日期',
  ModifyDate: '修改日期',
  // GPS
  GPSLatitude: '纬度',
  GPSLongitude: '经度',
  GPSAltitude: '海拔',
  GPSLatitudeRef: '纬度参考',
  GPSLongitudeRef: '经度参考',
  // Software
  Software: '处理软件',
}

function gpsToDms(coord: number[]): string {
  const deg = coord[0]
  const min = coord[1]
  const sec = coord[2]
  return `${deg}° ${min}' ${sec.toFixed(2)}"`
}

function formatExifValue(value: unknown): string {
  if (value === undefined || value === null) return '-'
  if (Array.isArray(value)) {
    if (value.length === 3 && value[0] > 100) {
      return gpsToDms(value)
    }
    return value.join(', ')
  }
  if (value instanceof Date) {
    return value.toLocaleString('zh-CN')
  }
  if (typeof value === 'number') {
    // Format exposure time as fraction
    if (value < 1 && value > 0) {
      const denom = Math.round(1 / value)
      if (Math.abs(1 / denom - value) < 0.0001) return `1/${denom}`
    }
    return String(value)
  }
  return String(value)
}

function categorizeExif(entries: ExifEntry[]): { category: string; items: ExifEntry[] }[] {
  const camera = ['Make', 'Model', 'LensModel', 'ExposureTime', 'FNumber', 'ISO', 'FocalLength', 'FocalLengthIn35mmFormat', 'ExposureProgram', 'ExposureMode', 'MeteringMode', 'ExposureCompensation']
  const image = ['ImageWidth', 'ImageHeight', 'ExifImageWidth', 'ExifImageHeight', 'Orientation', 'XResolution', 'YResolution', 'ResolutionUnit', 'BitsPerSample', 'ColorSpace']
  const date = ['DateTimeOriginal', 'CreateDate', 'ModifyDate']
  const gps = ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSLatitudeRef', 'GPSLongitudeRef']
  const software = ['Software']

  const cats = [
    { category: '相机信息', keys: camera },
    { category: '图片信息', keys: image },
    { category: '时间信息', keys: date },
    { category: 'GPS 信息', keys: gps },
    { category: '软件信息', keys: software },
  ]

  return cats
    .map(cat => ({
      category: cat.category,
      items: entries.filter(e => cat.keys.some(k => e.label === (EXIF_LABELS[k] || k))),
    }))
    .filter(cat => cat.items.length > 0)
}

export default function ImageExifViewer() {
  const { isPro } = useUserStore()
  const { used, limit } = useUsageStore()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [entries, setEntries] = useState<ExifEntry[]>([])
  const [allEntries, setAllEntries] = useState<ExifEntry[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleFileSelect = async (files: File[]) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    setError('')
    setEntries([])
    setAllEntries([])

    // Preview
    const url = URL.createObjectURL(f)
    setPreview(url)

    // Read EXIF
    setProcessing(true)
    try {
      const exifr = await import('exifr')
      const exifData = await exifr.parse(f, {
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
        icc: true,
        translateValues: true,
        translateKeys: true,
      })

      if (!exifData) {
        setError('该图片不包含EXIF信息')
      } else {
        const mapped: ExifEntry[] = []
        const allMapped: ExifEntry[] = []
        for (const [key, value] of Object.entries(exifData)) {
          const formatted = formatExifValue(value)
          const entry: ExifEntry = {
            label: EXIF_LABELS[key] || key,
            value: formatted,
          }
          allMapped.push(entry)
          if (EXIF_LABELS[key]) {
            mapped.push(entry)
          }
        }
        setEntries(mapped)
        setAllEntries(allMapped)
      }
    } catch (e: any) {
      setError('读取EXIF失败: ' + e.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleCopyAll = async () => {
    const text = entries.map(e => `${e.label}: ${e.value}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categories = categorizeExif(entries)

  return (
    <ToolLayout
      title="图片 EXIF 查看"
      description="查看图片拍摄参数、GPS位置、设备信息等元数据"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-6">
        <div className="card !p-6">
          <FileUploader accept="image/*" onFileSelect={handleFileSelect} maxSize={50} />
        </div>

        {processing && <ProcessingIndicator />}

        {error && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            {error}
          </div>
        )}

        {preview && file && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card !p-6">
              <h3 className="font-medium text-navy-700 mb-3">图片预览</h3>
              <img src={preview} alt="Preview" className="max-w-full max-h-64 rounded-lg border border-navy-200" />
              <div className="mt-3 text-sm text-navy-500 space-y-1">
                <p>文件名: {file.name}</p>
                <p>文件大小: {(file.size / 1024).toFixed(1)} KB</p>
                <p>文件类型: {file.type}</p>
              </div>
            </div>

            <div className="card !p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-navy-700 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  EXIF 信息
                </h3>
                {entries.length > 0 && (
                  <button onClick={handleCopyAll} className="btn-secondary !py-1 !px-3 text-xs">
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? '已复制' : '复制全部'}
                  </button>
                )}
              </div>

              {categories.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.category}>
                      <h4 className="text-sm font-medium text-brand-700 mb-2">{cat.category}</h4>
                      <div className="space-y-1">
                        {cat.items.map((item) => (
                          <div key={item.label} className="flex justify-between py-1.5 border-b border-navy-50 last:border-0">
                            <span className="text-sm text-navy-500">{item.label}</span>
                            <span className="text-sm font-mono text-navy-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : entries.length === 0 && !error ? (
                <p className="text-sm text-navy-400">正在读取...</p>
              ) : null}
            </div>
          </div>
        )}

        {/* All EXIF fields for advanced users */}
        {allEntries.length > entries.length && (
          <div className="card !p-6">
            <details>
              <summary className="text-sm font-medium text-navy-600 cursor-pointer">
                查看全部 {allEntries.length} 个 EXIF 字段
              </summary>
              <div className="mt-4 space-y-1 max-h-96 overflow-y-auto">
                {allEntries.map((item) => (
                  <div key={item.label} className="flex justify-between py-1 border-b border-navy-50 text-sm">
                    <span className="text-navy-500 font-mono">{item.label}</span>
                    <span className="text-navy-700 font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

// 通用工具函数

// 文件转 Data URL
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Data URL 转 File
export function dataUrlToFile(dataUrl: string, fileName: string, mimeType: string): File {
  const byteString = atob(dataUrl.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new File([ab], fileName, { type: mimeType })
}

// 加载图片
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// 图片格式转换
export async function convertImageFormat(
  file: File,
  targetFormat: 'png' | 'jpeg' | 'webp',
  quality = 0.92
): Promise<{ dataUrl: string; fileName: string }> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!

  if (targetFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(img, 0, 0)

  const mimeType = `image/${targetFormat}`
  const resultDataUrl = canvas.toDataURL(mimeType, quality)
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const fileName = `${baseName}.${targetFormat}`

  return { dataUrl: resultDataUrl, fileName }
}

// 图片压缩
export async function compressImage(
  file: File,
  quality = 0.7,
  maxWidth = 1920
): Promise<{ dataUrl: string; originalSize: number; compressedSize: number }> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)
  const originalSize = file.size

  let targetWidth = img.width
  let targetHeight = img.height

  if (img.width > maxWidth) {
    const ratio = maxWidth / img.width
    targetWidth = maxWidth
    targetHeight = Math.floor(img.height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const resultDataUrl = canvas.toDataURL(mimeType, quality)
  const base64Length = resultDataUrl.split(',')[1].length
  const compressedSize = Math.round((base64Length * 3) / 4)

  return { dataUrl: resultDataUrl, originalSize, compressedSize }
}

// 图片裁剪
export async function cropImage(
  file: File,
  crop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)

  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    img,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, crop.width, crop.height
  )

  return canvas.toDataURL(file.type, 0.95)
}

// 图片旋转
export async function rotateImage(file: File, degrees: 90 | 180 | 270): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)

  const canvas = document.createElement('canvas')
  if (degrees === 90 || degrees === 270) {
    canvas.width = img.height
    canvas.height = img.width
  } else {
    canvas.width = img.width
    canvas.height = img.height
  }

  const ctx = canvas.getContext('2d')!
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((degrees * Math.PI) / 180)
  ctx.drawImage(img, -img.width / 2, -img.height / 2)
  ctx.restore()

  return canvas.toDataURL(file.type, 0.95)
}

// 图片调整大小
export async function resizeImage(
  file: File,
  options: { width?: number; height?: number; maintainAspectRatio?: boolean }
): Promise<{ dataUrl: string; newWidth: number; newHeight: number }> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)

  let targetWidth = options.width || img.width
  let targetHeight = options.height || img.height

  if (options.maintainAspectRatio !== false) {
    const ratio = Math.min(targetWidth / img.width, targetHeight / img.height)
    targetWidth = Math.round(img.width * ratio)
    targetHeight = Math.round(img.height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  return {
    dataUrl: canvas.toDataURL(file.type, 0.95),
    newWidth: targetWidth,
    newHeight: targetHeight,
  }
}

// 图片添加文字水印
export async function addImageWatermark(
  file: File,
  text: string,
  options?: { fontSize?: number; opacity?: number; color?: string; position?: 'center' | 'bottom-right' | 'tile' }
): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(img, 0, 0)

  const fontSize = options?.fontSize || Math.max(20, Math.min(img.width, img.height) / 15)
  const opacity = options?.opacity || 0.3
  const color = options?.color || '#000000'
  const position = options?.position || 'tile'

  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = color
  ctx.globalAlpha = opacity

  if (position === 'tile') {
    const textWidth = ctx.measureText(text).width
    const gap = Math.max(textWidth + 50, 150)
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((-30 * Math.PI) / 180)
    for (let y = -canvas.height; y < canvas.height * 2; y += gap * 2) {
      for (let x = -canvas.width; x < canvas.width * 2; x += gap) {
        ctx.fillText(text, x - canvas.width, y - canvas.height)
      }
    }
    ctx.restore()
  } else if (position === 'center') {
    const textWidth = ctx.measureText(text).width
    ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height / 2)
  } else {
    ctx.font = `${fontSize * 0.7}px sans-serif`
    const textWidth = ctx.measureText(text).width
    ctx.fillText(text, canvas.width - textWidth - 20, canvas.height - 20)
  }

  ctx.globalAlpha = 1

  return canvas.toDataURL(file.type, 0.95)
}

// 生成二维码
export async function generateQRCode(text: string, options?: { size?: number; bgColor?: string; fgColor?: string }): Promise<string> {
  const QRCode = await import('qrcode')
  const size = options?.size || 300
  const dataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    color: {
      dark: options?.fgColor || '#000000',
      light: options?.bgColor || '#FFFFFF',
    },
  })
  return dataUrl
}

// Markdown 转 HTML
export async function markdownToHtml(md: string): Promise<string> {
  const { marked } = await import('marked')
  return marked(md) as string
}

// 文档文字对比
export function diffText(text1: string, text2: string): { type: string; value: string }[] {
  const DiffMatchPatch = (window as unknown as { DiffMatchPatch: new () => { diff_main: (a: string, b: string) => [number, string][] } }).DiffMatchPatch
  if (!DiffMatchPatch) {
    // Fallback: line-by-line diff
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const result: { type: string; value: string }[] = []
    const set2 = new Set(lines2)
    lines1.forEach((line) => {
      result.push({ type: set2.has(line) ? 'equal' : 'removed', value: line })
    })
    const set1 = new Set(lines1)
    lines2.forEach((line) => {
      if (!set1.has(line)) result.push({ type: 'added', value: line })
    })
    return result
  }
  const dmp = new DiffMatchPatch()
  const diffs = dmp.diff_main(text1, text2)
  return diffs.map(([op, text]) => ({
    type: op === 0 ? 'equal' : op === 1 ? 'added' : 'removed',
    value: text,
  }))
}

// 批量重命名
export function generateRenameMapping(
  files: File[],
  pattern: string,
  startNumber = 1
): { original: string; renamed: string }[] {
  return files.map((file, idx) => {
    const ext = '.' + file.name.split('.').pop()
    const base = file.name.replace(/\.[^.]+$/, '')
    let newName = pattern
      .replace('{n}', String(startNumber + idx).padStart(String(startNumber + idx + files.length - 1).length, '0'))
      .replace('{name}', base)
      .replace('{i}', String(idx + 1))
    if (!newName.includes('.')) newName += ext
    return { original: file.name, renamed: newName }
  })
}

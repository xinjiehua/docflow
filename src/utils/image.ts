// 图片处理工具函数

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function dataUrlToFile(dataUrl: string, fileName: string, mimeType: string): File {
  const byteString = atob(dataUrl.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new File([ab], fileName, { type: mimeType })
}

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

  // JPEG needs white background
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

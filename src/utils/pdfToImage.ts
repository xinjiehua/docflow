// PDF转图片工具函数

export async function pdfToImages(
  file: File,
  scale = 2,
  format: 'png' | 'jpeg' = 'png'
): Promise<{ dataUrl: string; page: number; width: number; height: number }[]> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const results: { dataUrl: string; page: number; width: number; height: number }[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!

    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    await page.render({ canvasContext: ctx, viewport }).promise

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    const dataUrl = canvas.toDataURL(mimeType, 0.95)

    results.push({
      dataUrl,
      page: i,
      width: canvas.width,
      height: canvas.height,
    })
  }

  return results
}

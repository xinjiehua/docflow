import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  return mergedPdf.save()
}

export async function splitPDF(
  file: File,
  ranges: { start: number; end: number }[]
): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(arrayBuffer)
  const results: Uint8Array[] = []

  for (const range of ranges) {
    const newPdf = await PDFDocument.create()
    const indices = Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start + i - 1
    ).filter((i) => i >= 0 && i < pdf.getPageCount())
    const copiedPages = await newPdf.copyPages(pdf, indices)
    copiedPages.forEach((page) => newPdf.addPage(page))
    results.push(await newPdf.save())
  }

  return results
}

export async function addWatermark(
  file: File,
  text: string,
  options?: { fontSize?: number; opacity?: number; color?: string }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(arrayBuffer)
  const font = await pdf.embedFont('Helvetica')
  const fontSize = options?.fontSize || 48
  const opacity = options?.opacity || 0.3

  const pages = pdf.getPages()
  for (const page of pages) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: fontSize,
      font,
      opacity,
      rotate: { angle: -30, type: 'degrees' as const },
    })
  }

  return pdf.save()
}

export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(arrayBuffer)
  return pdf.getPageCount()
}

export async function extractPDFImages(file: File): Promise<{ width: number; height: number }[]> {
  // We use pdfjs-dist for this, but it's async loaded
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: { width: number; height: number }[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    pages.push({ width: viewport.width, height: viewport.height })
  }

  return pages
}

export { getPDFPageCount as getPageCount }

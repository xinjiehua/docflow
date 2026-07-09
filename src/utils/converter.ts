import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'

export async function pdfToHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

export async function wordToHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  return result.value
}

export async function wordToText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

export async function excelToJson(file: File): Promise<unknown[]> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(firstSheet)
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const pdf = new jsPDF()
  let first = true

  for (const file of files) {
    const dataUrl = await fileToDataUrl(file)
    const img = await loadImage(dataUrl)

    if (!first) pdf.addPage()
    first = false

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = Math.min(pageWidth / img.width, pageHeight / img.height) * 0.9

    const imgWidth = img.width * ratio
    const imgHeight = img.height * ratio
    const x = (pageWidth - imgWidth) / 2
    const y = (pageHeight - imgHeight) / 2

    pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight)
  }

  return pdf.output('arraybuffer') as Uint8Array
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function htmlToPdf(html: string, fileName: string): Promise<Uint8Array> {
  const pdf = new jsPDF()
  const lines = pdf.splitTextToSize(html, 180)
  let y = 20

  for (const line of lines) {
    if (y > 270) {
      pdf.addPage()
      y = 20
    }
    pdf.text(line, 15, y)
    y += 7
  }

  return pdf.output('arraybuffer') as Uint8Array
}

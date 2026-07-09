import Tesseract from 'tesseract.js'

export interface OcrResult {
  text: string
  confidence: number
  data: Tesseract.RecognizeResult['data']
}

export async function recognizeText(
  file: File,
  options?: { language?: string }
): Promise<OcrResult> {
  const lang = options?.language || 'chi_sim+eng'

  const result = await Tesseract.recognize(file, lang, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        // Progress can be tracked via callback if needed
      }
    },
  })

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    data: result.data,
  }
}

export function parseInvoiceFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {}

  // Try to extract common invoice fields using regex patterns
  const patterns: [string, RegExp][] = [
    ['invoiceNumber', /(?:发票代码|Invoice\s*No)[：:\s]*(\S+)/],
    ['invoiceCode', /(?:发票号码|Invoice\s*Code)[：:\s]*(\S+)/],
    ['date', /(?:开票日期|Date)[：:\s]*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/],
    ['amount', /(?:金额|Amount|合计)[：:\s]*[\x00-\x7f]*([0-9,]+\.?\d*)/],
    ['tax', /(?:税额|Tax)[：:\s]*[\x00-\x7f]*([0-9,]+\.?\d*)/],
    ['total', /(?:价税合计|Total)[：:\s]*[\x00-\x7f]*([0-9,]+\.?\d*)/],
    ['seller', /(?:销方名称|卖方|Seller)[：:\s]*(.{2,30})/],
    ['buyer', /(?:购方名称|买方|Buyer)[：:\s]*(.{2,30})/],
    ['taxId', /(?:纳税人识别号|Tax\s*ID)[：:\s]*(\S{15,20})/],
  ]

  for (const [key, pattern] of patterns) {
    const match = text.match(pattern)
    if (match) {
      fields[key] = match[1].trim()
    }
  }

  return fields
}

export { recognizeText as recognizeImage }

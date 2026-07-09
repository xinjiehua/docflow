import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from '@/stores/user'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Pricing from '@/pages/Pricing'
import Login from '@/pages/Login'
import Admin from '@/pages/Admin'
// Original 10 tools
import PdfMerge from '@/pages/tools/PdfMerge'
import PdfSplit from '@/pages/tools/PdfSplit'
import PdfWatermark from '@/pages/tools/PdfWatermark'
import PdfCompress from '@/pages/tools/PdfCompress'
import ConvertPdfToWord from '@/pages/tools/ConvertPdfToWord'
import ConvertWordToPdf from '@/pages/tools/ConvertWordToPdf'
import ConvertExcelToPdf from '@/pages/tools/ConvertExcelToPdf'
import ConvertImageToPdf from '@/pages/tools/ConvertImageToPdf'
import InvoiceOcr from '@/pages/tools/InvoiceOcr'
import BatchWatermark from '@/pages/tools/BatchWatermark'
// Batch 1: 7 new tools
import PdfToImage from '@/pages/tools/PdfToImage'
import PdfEncrypt from '@/pages/tools/PdfEncrypt'
import WordToExcel from '@/pages/tools/WordToExcel'
import ImageFormatConvert from '@/pages/tools/ImageFormatConvert'
import ImageCompress from '@/pages/tools/ImageCompress'
import GeneralOcr from '@/pages/tools/GeneralOcr'
import ImageCropRotate from '@/pages/tools/ImageCropRotate'
// Batch 2: 12 new tools
import PdfExtractPages from '@/pages/tools/PdfExtractPages'
import PdfAddPageNumbers from '@/pages/tools/PdfAddPageNumbers'
import PdfToExcel from '@/pages/tools/PdfToExcel'
import ImageResize from '@/pages/tools/ImageResize'
import ImageWatermark from '@/pages/tools/ImageWatermark'
import QrCodeGenerator from '@/pages/tools/QrCodeGenerator'
import MarkdownToPdf from '@/pages/tools/MarkdownToPdf'
import ESignature from '@/pages/tools/ESignature'
import ImageRemoveBg from '@/pages/tools/ImageRemoveBg'
import DocumentCompare from '@/pages/tools/DocumentCompare'
import ImageRemoveWatermark from '@/pages/tools/ImageRemoveWatermark'
// Batch 3: 5 new tools
import ContractTemplates from '@/pages/tools/ContractTemplates'
import AudioToText from '@/pages/tools/AudioToText'
import BatchRename from '@/pages/tools/BatchRename'
import TextToSpeech from '@/pages/tools/TextToSpeech'
import OnlineSpreadsheet from '@/pages/tools/OnlineSpreadsheet'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppRoutes() {
  const initialize = useUserStore((s) => s.initialize)
  const loading = useUserStore((s) => s.loading)

  useEffect(() => {
    initialize()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-700 to-brand-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <p className="text-navy-400 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      {/* PDF Tools */}
      <Route path="/tools/pdf-merge" element={<PdfMerge />} />
      <Route path="/tools/pdf-split" element={<PdfSplit />} />
      <Route path="/tools/pdf-watermark" element={<PdfWatermark />} />
      <Route path="/tools/pdf-compress" element={<PdfCompress />} />
      <Route path="/tools/pdf-to-image" element={<PdfToImage />} />
      <Route path="/tools/pdf-encrypt" element={<PdfEncrypt />} />
      <Route path="/tools/pdf-extract-pages" element={<PdfExtractPages />} />
      <Route path="/tools/pdf-add-page-numbers" element={<PdfAddPageNumbers />} />
      <Route path="/tools/pdf-to-excel" element={<PdfToExcel />} />
      {/* Format Conversion */}
      <Route path="/tools/convert-pdf-to-word" element={<ConvertPdfToWord />} />
      <Route path="/tools/convert-word-to-pdf" element={<ConvertWordToPdf />} />
      <Route path="/tools/convert-excel-to-pdf" element={<ConvertExcelToPdf />} />
      <Route path="/tools/convert-image-to-pdf" element={<ConvertImageToPdf />} />
      <Route path="/tools/convert-word-to-excel" element={<WordToExcel />} />
      <Route path="/tools/image-format-convert" element={<ImageFormatConvert />} />
      <Route path="/tools/image-compress" element={<ImageCompress />} />
      <Route path="/tools/markdown-to-pdf" element={<MarkdownToPdf />} />
      {/* Image Tools */}
      <Route path="/tools/image-resize" element={<ImageResize />} />
      <Route path="/tools/image-watermark" element={<ImageWatermark />} />
      <Route path="/tools/image-remove-bg" element={<ImageRemoveBg />} />
      <Route path="/tools/image-crop-rotate" element={<ImageCropRotate />} />
      <Route path="/tools/image-remove-watermark" element={<ImageRemoveWatermark />} />
      {/* Smart Recognition */}
      <Route path="/tools/invoice-ocr" element={<InvoiceOcr />} />
      <Route path="/tools/general-ocr" element={<GeneralOcr />} />
      <Route path="/tools/document-compare" element={<DocumentCompare />} />
      {/* Batch Processing */}
      <Route path="/tools/batch-watermark" element={<BatchWatermark />} />
      <Route path="/tools/batch-rename" element={<BatchRename />} />
      {/* Office Tools */}
      <Route path="/tools/qr-code-generator" element={<QrCodeGenerator />} />
      <Route path="/tools/e-signature" element={<ESignature />} />
      <Route path="/tools/contract-templates" element={<ContractTemplates />} />
      <Route path="/tools/audio-to-text" element={<AudioToText />} />
      <Route path="/tools/text-to-speech" element={<TextToSpeech />} />
      <Route path="/tools/online-spreadsheet" element={<OnlineSpreadsheet />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-navy-50">
        <Header />
        <main className="flex-1">
          <ScrollToTop />
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

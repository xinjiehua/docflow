import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from '@/stores/user'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Pricing from '@/pages/Pricing'
import Login from '@/pages/Login'
import Admin from '@/pages/Admin'
import PdfMerge from '@/pages/tools/PdfMerge'
import PdfSplit from '@/pages/tools/PdfSplit'
import PdfWatermark from '@/pages/tools/PdfWatermark'
import PdfCompress from '@/pages/tools/PdfCompress'
import PdfToImage from '@/pages/tools/PdfToImage'
import PdfEncrypt from '@/pages/tools/PdfEncrypt'
import ConvertPdfToWord from '@/pages/tools/ConvertPdfToWord'
import ConvertWordToPdf from '@/pages/tools/ConvertWordToPdf'
import ConvertExcelToPdf from '@/pages/tools/ConvertExcelToPdf'
import ConvertImageToPdf from '@/pages/tools/ConvertImageToPdf'
import WordToExcel from '@/pages/tools/WordToExcel'
import ImageFormatConvert from '@/pages/tools/ImageFormatConvert'
import ImageCompress from '@/pages/tools/ImageCompress'
import InvoiceOcr from '@/pages/tools/InvoiceOcr'
import GeneralOcr from '@/pages/tools/GeneralOcr'
import BatchWatermark from '@/pages/tools/BatchWatermark'
import ImageCropRotate from '@/pages/tools/ImageCropRotate'

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
      {/* Format Conversion */}
      <Route path="/tools/convert-pdf-to-word" element={<ConvertPdfToWord />} />
      <Route path="/tools/convert-word-to-pdf" element={<ConvertWordToPdf />} />
      <Route path="/tools/convert-excel-to-pdf" element={<ConvertExcelToPdf />} />
      <Route path="/tools/convert-image-to-pdf" element={<ConvertImageToPdf />} />
      <Route path="/tools/convert-word-to-excel" element={<WordToExcel />} />
      <Route path="/tools/image-format-convert" element={<ImageFormatConvert />} />
      <Route path="/tools/image-compress" element={<ImageCompress />} />
      {/* Smart Recognition */}
      <Route path="/tools/invoice-ocr" element={<InvoiceOcr />} />
      <Route path="/tools/general-ocr" element={<GeneralOcr />} />
      {/* Batch Processing */}
      <Route path="/tools/batch-watermark" element={<BatchWatermark />} />
      <Route path="/tools/image-crop-rotate" element={<ImageCropRotate />} />
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

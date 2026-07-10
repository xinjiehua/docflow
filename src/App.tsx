import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from '@/stores/user'
import { useUsageStore, DAILY_FREE_LIMIT } from '@/stores/usage'
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

// Batch 4: 12 new tools
import PdfRotatePages from '@/pages/tools/PdfRotatePages'
import ImageStitch from '@/pages/tools/ImageStitch'
import HtmlToPdf from '@/pages/tools/HtmlToPdf'
import JsonFormatter from '@/pages/tools/JsonFormatter'
import Base64Tool from '@/pages/tools/Base64Tool'
import FileHash from '@/pages/tools/FileHash'
import RegexTester from '@/pages/tools/RegexTester'
import ColorConverter from '@/pages/tools/ColorConverter'
import ImageExifViewer from '@/pages/tools/ImageExifViewer'
import MarkdownEditor from '@/pages/tools/MarkdownEditor'
import ScreenRecorder from '@/pages/tools/ScreenRecorder'
import TextStatistics from '@/pages/tools/TextStatistics'

// Batch 5: 17 new tools
import PdfSignStamp from '@/pages/tools/PdfSignStamp'
import PdfTableExtract from '@/pages/tools/PdfTableExtract'
import PdfBookmarkManage from '@/pages/tools/PdfBookmarkManage'
import WordDocumentCompare from '@/pages/tools/WordDocumentCompare'
import ImageFilter from '@/pages/tools/ImageFilter'
import ImageBorder from '@/pages/tools/ImageBorder'
import ImageAsciiArt from '@/pages/tools/ImageAsciiArt'
import BatchImageCompress from '@/pages/tools/BatchImageCompress'
import OnlineDrawingBoard from '@/pages/tools/OnlineDrawingBoard'
import QrCodeDecoder from '@/pages/tools/QrCodeDecoder'
import BarcodeGenerator from '@/pages/tools/BarcodeGenerator'
import OnlineNotes from '@/pages/tools/OnlineNotes'
import PasswordGenerator from '@/pages/tools/PasswordGenerator'
import TimestampConverter from '@/pages/tools/TimestampConverter'
import UrlEncoderDecoder from '@/pages/tools/UrlEncoderDecoder'
import JwtDecoder from '@/pages/tools/JwtDecoder'
import BaseConverter from '@/pages/tools/BaseConverter'

// Batch 6: 20 PPT Tools
import PptToImage from '@/pages/tools/PptToImage'
import ImageToPpt from '@/pages/tools/ImageToPpt'
import PdfToPpt from '@/pages/tools/PdfToPpt'
import PptToPdf from '@/pages/tools/PptToPdf'
import PptMerge from '@/pages/tools/PptMerge'
import PptSplit from '@/pages/tools/PptSplit'
import PptExtractImages from '@/pages/tools/PptExtractImages'
import PptExtractText from '@/pages/tools/PptExtractText'
import PptCompress from '@/pages/tools/PptCompress'
import PptRearrange from '@/pages/tools/PptRearrange'
import PptAddWatermark from '@/pages/tools/PptAddWatermark'
import MarkdownToPpt from '@/pages/tools/MarkdownToPpt'
import PptTemplateMaker from '@/pages/tools/PptTemplateMaker'
import PptReplaceText from '@/pages/tools/PptReplaceText'
import PptToWord from '@/pages/tools/PptToWord'
import PptDeletePages from '@/pages/tools/PptDeletePages'
import PptAddPageNumbers from '@/pages/tools/PptAddPageNumbers'
import PptExtractMedia from '@/pages/tools/PptExtractMedia'
import PptToLongImage from '@/pages/tools/PptToLongImage'
import PptThemeColor from '@/pages/tools/PptThemeColor'

// Batch 7: 19 PDF/Convert/Image Tools
import PdfEditor from '@/pages/tools/PdfEditor'
import PdfCrop from '@/pages/tools/PdfCrop'
import PdfAddText from '@/pages/tools/PdfAddText'
import PdfTranslate from '@/pages/tools/PdfTranslate'
import PdfToText from '@/pages/tools/PdfToText'
import PdfToCsv from '@/pages/tools/PdfToCsv'
import EpubToPdf from '@/pages/tools/EpubToPdf'
import PdfToEpub from '@/pages/tools/PdfToEpub'
import PdfRearrange from '@/pages/tools/PdfRearrange'
import CsvToExcel from '@/pages/tools/CsvToExcel'
import ExcelToCsv from '@/pages/tools/ExcelToCsv'
import XmlToJson from '@/pages/tools/XmlToJson'
import JsonToXml from '@/pages/tools/JsonToXml'
import ImageMosaic from '@/pages/tools/ImageMosaic'
import ImageFreeCollage from '@/pages/tools/ImageFreeCollage'
import ImageRound from '@/pages/tools/ImageRound'
import ImageFlip from '@/pages/tools/ImageFlip'
import ImagePixelate from '@/pages/tools/ImagePixelate'
import CollageMaker from '@/pages/tools/CollageMaker'

// Batch 8: 14 Office/Utility Tools
import MindMap from '@/pages/tools/MindMap'
import FlowChart from '@/pages/tools/FlowChart'
import IdPhotoMaker from '@/pages/tools/IdPhotoMaker'
import ResumeGenerator from '@/pages/tools/ResumeGenerator'
import CalendarMaker from '@/pages/tools/CalendarMaker'
import LoremIpsum from '@/pages/tools/LoremIpsum'
import WordCounter from '@/pages/tools/WordCounter'
import HttpRequestTest from '@/pages/tools/HttpRequestTest'
import ImageAddText from '@/pages/tools/ImageAddText'
import ImageBlurBg from '@/pages/tools/ImageBlurBg'
import GovDocFormat from '@/pages/tools/GovDocFormat'
import FileFormatQuery from '@/pages/tools/FileFormatQuery'
import ImageSplit from '@/pages/tools/ImageSplit'
import WatermarkPaper from '@/pages/tools/WatermarkPaper'

// Batch 9: Text(9) + GIF(4) + Calculators(5) = 18
import TraditionalSimplified from '@/pages/tools/TraditionalSimplified'
import PinyinConverter from '@/pages/tools/PinyinConverter'
import TextDedup from '@/pages/tools/TextDedup'
import TextSort from '@/pages/tools/TextSort'
import CaseConverter from '@/pages/tools/CaseConverter'
import LineNumberTool from '@/pages/tools/LineNumberTool'
import TextReplace from '@/pages/tools/TextReplace'
import SymbolInsert from '@/pages/tools/SymbolInsert'
import EmojiTool from '@/pages/tools/EmojiTool'
import GifFrameViewer from '@/pages/tools/GifFrameViewer'
import GifCompressor from '@/pages/tools/GifCompressor'
import GifSplitter from '@/pages/tools/GifSplitter'
import ImageToGif from '@/pages/tools/ImageToGif'
import BmiCalculator from '@/pages/tools/BmiCalculator'
import UnitConverter from '@/pages/tools/UnitConverter'
import DateCalculator from '@/pages/tools/DateCalculator'
import PercentageCalculator from '@/pages/tools/PercentageCalculator'
import ExchangeRateCalculator from '@/pages/tools/ExchangeRateCalculator'

// Batch 10: Encrypt(4) + Color(4) + Dev(7) = 15
import TextEncrypt from '@/pages/tools/TextEncrypt'
import HashGenerator from '@/pages/tools/HashGenerator'
import PasswordStrengthChecker from '@/pages/tools/PasswordStrengthChecker'
import RandomPasswordGenerator from '@/pages/tools/RandomPasswordGenerator'
import ColorPalette from '@/pages/tools/ColorPalette'
import ColorContrastChecker from '@/pages/tools/ColorContrastChecker'
import GradientGenerator from '@/pages/tools/GradientGenerator'
import GlassmorphismGenerator from '@/pages/tools/GlassmorphismGenerator'
import CronExpression from '@/pages/tools/CronExpression'
import IpAddressTool from '@/pages/tools/IpAddressTool'
import LoremIpsumAdvanced from '@/pages/tools/LoremIpsumAdvanced'
import RegexVisualizer from '@/pages/tools/RegexVisualizer'
import JsonDiff from '@/pages/tools/JsonDiff'
import SqlFormatter from '@/pages/tools/SqlFormatter'
import UuidGenerator from '@/pages/tools/UuidGenerator'

// Batch 11: Audio(4) + Life(5) = 9
import AudioTrimmer from '@/pages/tools/AudioTrimmer'
import AudioVolumeNormalizer from '@/pages/tools/AudioVolumeNormalizer'
import AudioFormatConverter from '@/pages/tools/AudioFormatConverter'
import AudioMerger from '@/pages/tools/AudioMerger'
import CountdownTimer from '@/pages/tools/CountdownTimer'
import PomodoroTimer from '@/pages/tools/PomodoroTimer'
import Stopwatch from '@/pages/tools/Stopwatch'
import LoanCalculator from '@/pages/tools/LoanCalculator'
import TaxCalculator from '@/pages/tools/TaxCalculator'

// Batch 12: Video(7) = 7
import VideoCompressor from '@/pages/tools/VideoCompressor'
import VideoFormatConverter from '@/pages/tools/VideoFormatConverter'
import VideoFrameCapture from '@/pages/tools/VideoFrameCapture'
import VideoToAudio from '@/pages/tools/VideoToAudio'
import VideoSpeedChanger from '@/pages/tools/VideoSpeedChanger'
import VideoThumbnail from '@/pages/tools/VideoThumbnail'
import VideoMetadata from '@/pages/tools/VideoMetadata'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}



function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)
  const isPro = useUserStore((s) => s.isPro())
  const totalUsed = useUsageStore((s) => s.totalUsed)
  const canUse = useUsageStore((s) => s.canUse)

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (!isPro() && !canUse()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-navy-800 mb-3">今日免费次数已用完</h2>
          <p className="text-navy-500 mb-2">免费用户每天可使用 {DAILY_FREE_LIMIT} 次工具</p>
          <p className="text-navy-400 text-sm mb-8">升级为 Pro 会员，享受无限次使用</p>
          <a href="/pricing" className="btn-primary inline-block !px-8 !py-3 no-underline">升级 Pro</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useUserStore((s) => s.currentUser)
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (currentUser?.plan !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
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
            <span className="text-white font-bold text-lg">智</span>
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
      <Route path="/admin" element={<AdminRoute><Admin></Admin></AdminRoute>} />

      {/* PDF Tools */}
      <Route path="/tools/pdf-merge" element={<ProtectedRoute><PdfMerge></PdfMerge></ProtectedRoute>} />
      <Route path="/tools/pdf-split" element={<ProtectedRoute><PdfSplit></PdfSplit></ProtectedRoute>} />
      <Route path="/tools/pdf-watermark" element={<ProtectedRoute><PdfWatermark></PdfWatermark></ProtectedRoute>} />
      <Route path="/tools/pdf-compress" element={<ProtectedRoute><PdfCompress></PdfCompress></ProtectedRoute>} />
      <Route path="/tools/pdf-to-image" element={<ProtectedRoute><PdfToImage></PdfToImage></ProtectedRoute>} />
      <Route path="/tools/pdf-encrypt" element={<ProtectedRoute><PdfEncrypt></PdfEncrypt></ProtectedRoute>} />
      <Route path="/tools/pdf-extract-pages" element={<ProtectedRoute><PdfExtractPages></PdfExtractPages></ProtectedRoute>} />
      <Route path="/tools/pdf-add-page-numbers" element={<ProtectedRoute><PdfAddPageNumbers></PdfAddPageNumbers></ProtectedRoute>} />
      <Route path="/tools/pdf-to-excel" element={<ProtectedRoute><PdfToExcel></PdfToExcel></ProtectedRoute>} />
      <Route path="/tools/pdf-rotate-pages" element={<ProtectedRoute><PdfRotatePages></PdfRotatePages></ProtectedRoute>} />
      <Route path="/tools/pdf-sign-stamp" element={<ProtectedRoute><PdfSignStamp></PdfSignStamp></ProtectedRoute>} />
      <Route path="/tools/pdf-table-extract" element={<ProtectedRoute><PdfTableExtract></PdfTableExtract></ProtectedRoute>} />
      <Route path="/tools/pdf-bookmark-manage" element={<ProtectedRoute><PdfBookmarkManage></PdfBookmarkManage></ProtectedRoute>} />
      <Route path="/tools/pdf-editor" element={<ProtectedRoute><PdfEditor></PdfEditor></ProtectedRoute>} />
      <Route path="/tools/pdf-crop" element={<ProtectedRoute><PdfCrop></PdfCrop></ProtectedRoute>} />
      <Route path="/tools/pdf-add-text" element={<ProtectedRoute><PdfAddText></PdfAddText></ProtectedRoute>} />
      <Route path="/tools/pdf-translate" element={<ProtectedRoute><PdfTranslate></PdfTranslate></ProtectedRoute>} />
      <Route path="/tools/pdf-to-text" element={<ProtectedRoute><PdfToText></PdfToText></ProtectedRoute>} />
      <Route path="/tools/pdf-to-csv" element={<ProtectedRoute><PdfToCsv></PdfToCsv></ProtectedRoute>} />
      <Route path="/tools/pdf-rearrange" element={<ProtectedRoute><PdfRearrange></PdfRearrange></ProtectedRoute>} />

      {/* Format Conversion */}
      <Route path="/tools/convert-pdf-to-word" element={<ProtectedRoute><ConvertPdfToWord></ConvertPdfToWord></ProtectedRoute>} />
      <Route path="/tools/convert-word-to-pdf" element={<ProtectedRoute><ConvertWordToPdf></ConvertWordToPdf></ProtectedRoute>} />
      <Route path="/tools/convert-excel-to-pdf" element={<ProtectedRoute><ConvertExcelToPdf></ConvertExcelToPdf></ProtectedRoute>} />
      <Route path="/tools/convert-image-to-pdf" element={<ProtectedRoute><ConvertImageToPdf></ConvertImageToPdf></ProtectedRoute>} />
      <Route path="/tools/convert-word-to-excel" element={<ProtectedRoute><WordToExcel></WordToExcel></ProtectedRoute>} />
      <Route path="/tools/image-format-convert" element={<ProtectedRoute><ImageFormatConvert></ImageFormatConvert></ProtectedRoute>} />
      <Route path="/tools/image-compress" element={<ProtectedRoute><ImageCompress></ImageCompress></ProtectedRoute>} />
      <Route path="/tools/markdown-to-pdf" element={<ProtectedRoute><MarkdownToPdf></MarkdownToPdf></ProtectedRoute>} />
      <Route path="/tools/html-to-pdf" element={<ProtectedRoute><HtmlToPdf></HtmlToPdf></ProtectedRoute>} />
      <Route path="/tools/word-document-compare" element={<ProtectedRoute><WordDocumentCompare></WordDocumentCompare></ProtectedRoute>} />
      <Route path="/tools/epub-to-pdf" element={<ProtectedRoute><EpubToPdf></EpubToPdf></ProtectedRoute>} />
      <Route path="/tools/pdf-to-epub" element={<ProtectedRoute><PdfToEpub></PdfToEpub></ProtectedRoute>} />
      <Route path="/tools/csv-to-excel" element={<ProtectedRoute><CsvToExcel></CsvToExcel></ProtectedRoute>} />
      <Route path="/tools/excel-to-csv" element={<ProtectedRoute><ExcelToCsv></ExcelToCsv></ProtectedRoute>} />
      <Route path="/tools/xml-to-json" element={<ProtectedRoute><XmlToJson></XmlToJson></ProtectedRoute>} />
      <Route path="/tools/json-to-xml" element={<ProtectedRoute><JsonToXml></JsonToXml></ProtectedRoute>} />
      <Route path="/tools/ppt-to-image" element={<ProtectedRoute><PptToImage></PptToImage></ProtectedRoute>} />
      <Route path="/tools/image-to-ppt" element={<ProtectedRoute><ImageToPpt></ImageToPpt></ProtectedRoute>} />
      <Route path="/tools/pdf-to-ppt" element={<ProtectedRoute><PdfToPpt></PdfToPpt></ProtectedRoute>} />
      <Route path="/tools/ppt-to-pdf" element={<ProtectedRoute><PptToPdf></PptToPdf></ProtectedRoute>} />
      <Route path="/tools/ppt-to-word" element={<ProtectedRoute><PptToWord></PptToWord></ProtectedRoute>} />
      <Route path="/tools/markdown-to-ppt" element={<ProtectedRoute><MarkdownToPpt></MarkdownToPpt></ProtectedRoute>} />

      {/* Image Tools */}
      <Route path="/tools/image-resize" element={<ProtectedRoute><ImageResize></ImageResize></ProtectedRoute>} />
      <Route path="/tools/image-watermark" element={<ProtectedRoute><ImageWatermark></ImageWatermark></ProtectedRoute>} />
      <Route path="/tools/image-remove-bg" element={<ProtectedRoute><ImageRemoveBg></ImageRemoveBg></ProtectedRoute>} />
      <Route path="/tools/image-crop-rotate" element={<ProtectedRoute><ImageCropRotate></ImageCropRotate></ProtectedRoute>} />
      <Route path="/tools/image-remove-watermark" element={<ProtectedRoute><ImageRemoveWatermark></ImageRemoveWatermark></ProtectedRoute>} />
      <Route path="/tools/image-stitch" element={<ProtectedRoute><ImageStitch></ImageStitch></ProtectedRoute>} />
      <Route path="/tools/image-exif-viewer" element={<ProtectedRoute><ImageExifViewer></ImageExifViewer></ProtectedRoute>} />
      <Route path="/tools/image-filter" element={<ProtectedRoute><ImageFilter></ImageFilter></ProtectedRoute>} />
      <Route path="/tools/image-border" element={<ProtectedRoute><ImageBorder></ImageBorder></ProtectedRoute>} />
      <Route path="/tools/image-ascii-art" element={<ProtectedRoute><ImageAsciiArt></ImageAsciiArt></ProtectedRoute>} />
      <Route path="/tools/batch-image-compress" element={<ProtectedRoute><BatchImageCompress></BatchImageCompress></ProtectedRoute>} />
      <Route path="/tools/image-mosaic" element={<ProtectedRoute><ImageMosaic></ImageMosaic></ProtectedRoute>} />
      <Route path="/tools/image-free-collage" element={<ProtectedRoute><ImageFreeCollage></ImageFreeCollage></ProtectedRoute>} />
      <Route path="/tools/image-round" element={<ProtectedRoute><ImageRound></ImageRound></ProtectedRoute>} />
      <Route path="/tools/image-flip" element={<ProtectedRoute><ImageFlip></ImageFlip></ProtectedRoute>} />
      <Route path="/tools/image-pixelate" element={<ProtectedRoute><ImagePixelate></ImagePixelate></ProtectedRoute>} />
      <Route path="/tools/collage-maker" element={<ProtectedRoute><CollageMaker></CollageMaker></ProtectedRoute>} />
      <Route path="/tools/image-add-text" element={<ProtectedRoute><ImageAddText></ImageAddText></ProtectedRoute>} />
      <Route path="/tools/image-blur-bg" element={<ProtectedRoute><ImageBlurBg></ImageBlurBg></ProtectedRoute>} />
      <Route path="/tools/image-split" element={<ProtectedRoute><ImageSplit></ImageSplit></ProtectedRoute>} />

      {/* Smart Recognition */}
      <Route path="/tools/invoice-ocr" element={<ProtectedRoute><InvoiceOcr></InvoiceOcr></ProtectedRoute>} />
      <Route path="/tools/general-ocr" element={<ProtectedRoute><GeneralOcr></GeneralOcr></ProtectedRoute>} />
      <Route path="/tools/document-compare" element={<ProtectedRoute><DocumentCompare></DocumentCompare></ProtectedRoute>} />

      {/* Batch Processing */}
      <Route path="/tools/batch-watermark" element={<ProtectedRoute><BatchWatermark></BatchWatermark></ProtectedRoute>} />
      <Route path="/tools/batch-rename" element={<ProtectedRoute><BatchRename></BatchRename></ProtectedRoute>} />

      {/* Office Tools */}
      <Route path="/tools/qr-code-generator" element={<ProtectedRoute><QrCodeGenerator></QrCodeGenerator></ProtectedRoute>} />
      <Route path="/tools/e-signature" element={<ProtectedRoute><ESignature></ESignature></ProtectedRoute>} />
      <Route path="/tools/contract-templates" element={<ProtectedRoute><ContractTemplates></ContractTemplates></ProtectedRoute>} />
      <Route path="/tools/audio-to-text" element={<ProtectedRoute><AudioToText></AudioToText></ProtectedRoute>} />
      <Route path="/tools/text-to-speech" element={<ProtectedRoute><TextToSpeech></TextToSpeech></ProtectedRoute>} />
      <Route path="/tools/online-spreadsheet" element={<ProtectedRoute><OnlineSpreadsheet></OnlineSpreadsheet></ProtectedRoute>} />
      <Route path="/tools/markdown-editor" element={<ProtectedRoute><MarkdownEditor></MarkdownEditor></ProtectedRoute>} />
      <Route path="/tools/screen-recorder" element={<ProtectedRoute><ScreenRecorder></ScreenRecorder></ProtectedRoute>} />
      <Route path="/tools/online-drawing-board" element={<ProtectedRoute><OnlineDrawingBoard></OnlineDrawingBoard></ProtectedRoute>} />
      <Route path="/tools/qr-code-decoder" element={<ProtectedRoute><QrCodeDecoder></QrCodeDecoder></ProtectedRoute>} />
      <Route path="/tools/barcode-generator" element={<ProtectedRoute><BarcodeGenerator></BarcodeGenerator></ProtectedRoute>} />
      <Route path="/tools/online-notes" element={<ProtectedRoute><OnlineNotes></OnlineNotes></ProtectedRoute>} />
      <Route path="/tools/password-generator" element={<ProtectedRoute><PasswordGenerator></PasswordGenerator></ProtectedRoute>} />
      <Route path="/tools/mind-map" element={<ProtectedRoute><MindMap></MindMap></ProtectedRoute>} />
      <Route path="/tools/flow-chart" element={<ProtectedRoute><FlowChart></FlowChart></ProtectedRoute>} />
      <Route path="/tools/id-photo-maker" element={<ProtectedRoute><IdPhotoMaker></IdPhotoMaker></ProtectedRoute>} />
      <Route path="/tools/resume-generator" element={<ProtectedRoute><ResumeGenerator></ResumeGenerator></ProtectedRoute>} />
      <Route path="/tools/calendar-maker" element={<ProtectedRoute><CalendarMaker></CalendarMaker></ProtectedRoute>} />
      <Route path="/tools/lorem-ipsum" element={<ProtectedRoute><LoremIpsum></LoremIpsum></ProtectedRoute>} />
      <Route path="/tools/word-counter" element={<ProtectedRoute><WordCounter></WordCounter></ProtectedRoute>} />
      <Route path="/tools/http-request-test" element={<ProtectedRoute><HttpRequestTest></HttpRequestTest></ProtectedRoute>} />
      <Route path="/tools/gov-doc-format" element={<ProtectedRoute><GovDocFormat></GovDocFormat></ProtectedRoute>} />
      <Route path="/tools/watermark-paper" element={<ProtectedRoute><WatermarkPaper></WatermarkPaper></ProtectedRoute>} />
      <Route path="/tools/text-statistics" element={<ProtectedRoute><TextStatistics></TextStatistics></ProtectedRoute>} />
      <Route path="/tools/file-format-query" element={<ProtectedRoute><FileFormatQuery></FileFormatQuery></ProtectedRoute>} />

      {/* PPT Tools */}
      <Route path="/tools/ppt-merge" element={<ProtectedRoute><PptMerge></PptMerge></ProtectedRoute>} />
      <Route path="/tools/ppt-split" element={<ProtectedRoute><PptSplit></PptSplit></ProtectedRoute>} />
      <Route path="/tools/ppt-extract-images" element={<ProtectedRoute><PptExtractImages></PptExtractImages></ProtectedRoute>} />
      <Route path="/tools/ppt-extract-text" element={<ProtectedRoute><PptExtractText></PptExtractText></ProtectedRoute>} />
      <Route path="/tools/ppt-compress" element={<ProtectedRoute><PptCompress></PptCompress></ProtectedRoute>} />
      <Route path="/tools/ppt-rearrange" element={<ProtectedRoute><PptRearrange></PptRearrange></ProtectedRoute>} />
      <Route path="/tools/ppt-add-watermark" element={<ProtectedRoute><PptAddWatermark></PptAddWatermark></ProtectedRoute>} />
      <Route path="/tools/ppt-template-maker" element={<ProtectedRoute><PptTemplateMaker></PptTemplateMaker></ProtectedRoute>} />
      <Route path="/tools/ppt-replace-text" element={<ProtectedRoute><PptReplaceText></PptReplaceText></ProtectedRoute>} />
      <Route path="/tools/ppt-delete-pages" element={<ProtectedRoute><PptDeletePages></PptDeletePages></ProtectedRoute>} />
      <Route path="/tools/ppt-add-page-numbers" element={<ProtectedRoute><PptAddPageNumbers></PptAddPageNumbers></ProtectedRoute>} />
      <Route path="/tools/ppt-extract-media" element={<ProtectedRoute><PptExtractMedia></PptExtractMedia></ProtectedRoute>} />
      <Route path="/tools/ppt-to-long-image" element={<ProtectedRoute><PptToLongImage></PptToLongImage></ProtectedRoute>} />
      <Route path="/tools/ppt-theme-color" element={<ProtectedRoute><PptThemeColor></PptThemeColor></ProtectedRoute>} />

      {/* Developer Tools */}
      <Route path="/tools/json-formatter" element={<ProtectedRoute><JsonFormatter></JsonFormatter></ProtectedRoute>} />
      <Route path="/tools/base64-tool" element={<ProtectedRoute><Base64Tool></Base64Tool></ProtectedRoute>} />
      <Route path="/tools/regex-tester" element={<ProtectedRoute><RegexTester></RegexTester></ProtectedRoute>} />
      <Route path="/tools/file-hash" element={<ProtectedRoute><FileHash></FileHash></ProtectedRoute>} />
      <Route path="/tools/color-converter" element={<ProtectedRoute><ColorConverter></ColorConverter></ProtectedRoute>} />
      <Route path="/tools/timestamp-converter" element={<ProtectedRoute><TimestampConverter></TimestampConverter></ProtectedRoute>} />
      <Route path="/tools/url-encoder-decoder" element={<ProtectedRoute><UrlEncoderDecoder></UrlEncoderDecoder></ProtectedRoute>} />
      <Route path="/tools/jwt-decoder" element={<ProtectedRoute><JwtDecoder></JwtDecoder></ProtectedRoute>} />
      <Route path="/tools/base-converter" element={<ProtectedRoute><BaseConverter></BaseConverter></ProtectedRoute>} />

      {/* Text Processing */}
      <Route path="/tools/traditional-simplified" element={<ProtectedRoute><TraditionalSimplified></TraditionalSimplified></ProtectedRoute>} />
      <Route path="/tools/pinyin-converter" element={<ProtectedRoute><PinyinConverter></PinyinConverter></ProtectedRoute>} />
      <Route path="/tools/text-dedup" element={<ProtectedRoute><TextDedup></TextDedup></ProtectedRoute>} />
      <Route path="/tools/text-sort" element={<ProtectedRoute><TextSort></TextSort></ProtectedRoute>} />
      <Route path="/tools/case-converter" element={<ProtectedRoute><CaseConverter></CaseConverter></ProtectedRoute>} />
      <Route path="/tools/line-number-tool" element={<ProtectedRoute><LineNumberTool></LineNumberTool></ProtectedRoute>} />
      <Route path="/tools/text-replace" element={<ProtectedRoute><TextReplace></TextReplace></ProtectedRoute>} />
      <Route path="/tools/symbol-insert" element={<ProtectedRoute><SymbolInsert></SymbolInsert></ProtectedRoute>} />
      <Route path="/tools/emoji-tool" element={<ProtectedRoute><EmojiTool></EmojiTool></ProtectedRoute>} />

      {/* GIF Tools */}
      <Route path="/tools/gif-frame-viewer" element={<ProtectedRoute><GifFrameViewer></GifFrameViewer></ProtectedRoute>} />
      <Route path="/tools/gif-compressor" element={<ProtectedRoute><GifCompressor></GifCompressor></ProtectedRoute>} />
      <Route path="/tools/gif-splitter" element={<ProtectedRoute><GifSplitter></GifSplitter></ProtectedRoute>} />
      <Route path="/tools/image-to-gif" element={<ProtectedRoute><ImageToGif></ImageToGif></ProtectedRoute>} />

      {/* Calculators */}
      <Route path="/tools/bmi-calculator" element={<ProtectedRoute><BmiCalculator></BmiCalculator></ProtectedRoute>} />
      <Route path="/tools/unit-converter" element={<ProtectedRoute><UnitConverter></UnitConverter></ProtectedRoute>} />
      <Route path="/tools/date-calculator" element={<ProtectedRoute><DateCalculator></DateCalculator></ProtectedRoute>} />
      <Route path="/tools/percentage-calculator" element={<ProtectedRoute><PercentageCalculator></PercentageCalculator></ProtectedRoute>} />
      <Route path="/tools/exchange-rate-calculator" element={<ProtectedRoute><ExchangeRateCalculator></ExchangeRateCalculator></ProtectedRoute>} />

      {/* Encryption & Security */}
      <Route path="/tools/text-encrypt" element={<ProtectedRoute><TextEncrypt></TextEncrypt></ProtectedRoute>} />
      <Route path="/tools/hash-generator" element={<ProtectedRoute><HashGenerator></HashGenerator></ProtectedRoute>} />
      <Route path="/tools/password-strength-checker" element={<ProtectedRoute><PasswordStrengthChecker></PasswordStrengthChecker></ProtectedRoute>} />
      <Route path="/tools/random-password-generator" element={<ProtectedRoute><RandomPasswordGenerator></RandomPasswordGenerator></ProtectedRoute>} />

      {/* Color Tools */}
      <Route path="/tools/color-palette" element={<ProtectedRoute><ColorPalette></ColorPalette></ProtectedRoute>} />
      <Route path="/tools/color-contrast-checker" element={<ProtectedRoute><ColorContrastChecker></ColorContrastChecker></ProtectedRoute>} />
      <Route path="/tools/gradient-generator" element={<ProtectedRoute><GradientGenerator></GradientGenerator></ProtectedRoute>} />
      <Route path="/tools/glassmorphism-generator" element={<ProtectedRoute><GlassmorphismGenerator></GlassmorphismGenerator></ProtectedRoute>} />

      {/* Enhanced Developer Tools */}
      <Route path="/tools/cron-expression" element={<ProtectedRoute><CronExpression></CronExpression></ProtectedRoute>} />
      <Route path="/tools/ip-address-tool" element={<ProtectedRoute><IpAddressTool></IpAddressTool></ProtectedRoute>} />
      <Route path="/tools/lorem-ipsum-advanced" element={<ProtectedRoute><LoremIpsumAdvanced></LoremIpsumAdvanced></ProtectedRoute>} />
      <Route path="/tools/regex-visualizer" element={<ProtectedRoute><RegexVisualizer></RegexVisualizer></ProtectedRoute>} />
      <Route path="/tools/json-diff" element={<ProtectedRoute><JsonDiff></JsonDiff></ProtectedRoute>} />
      <Route path="/tools/sql-formatter" element={<ProtectedRoute><SqlFormatter></SqlFormatter></ProtectedRoute>} />
      <Route path="/tools/uuid-generator" element={<ProtectedRoute><UuidGenerator></UuidGenerator></ProtectedRoute>} />

      {/* Audio Tools */}
      <Route path="/tools/audio-trimmer" element={<ProtectedRoute><AudioTrimmer></AudioTrimmer></ProtectedRoute>} />
      <Route path="/tools/audio-volume-normalizer" element={<ProtectedRoute><AudioVolumeNormalizer></AudioVolumeNormalizer></ProtectedRoute>} />
      <Route path="/tools/audio-format-converter" element={<ProtectedRoute><AudioFormatConverter></AudioFormatConverter></ProtectedRoute>} />
      <Route path="/tools/audio-merger" element={<ProtectedRoute><AudioMerger></AudioMerger></ProtectedRoute>} />

      {/* Life Tools */}
      <Route path="/tools/countdown-timer" element={<ProtectedRoute><CountdownTimer></CountdownTimer></ProtectedRoute>} />
      <Route path="/tools/pomodoro-timer" element={<ProtectedRoute><PomodoroTimer></PomodoroTimer></ProtectedRoute>} />
      <Route path="/tools/stopwatch" element={<ProtectedRoute><Stopwatch></Stopwatch></ProtectedRoute>} />
      <Route path="/tools/loan-calculator" element={<ProtectedRoute><LoanCalculator></LoanCalculator></ProtectedRoute>} />
      <Route path="/tools/tax-calculator" element={<ProtectedRoute><TaxCalculator></TaxCalculator></ProtectedRoute>} />

      {/* Video Tools */}
      <Route path="/tools/video-compressor" element={<ProtectedRoute><VideoCompressor></VideoCompressor></ProtectedRoute>} />
      <Route path="/tools/video-format-converter" element={<ProtectedRoute><VideoFormatConverter></VideoFormatConverter></ProtectedRoute>} />
      <Route path="/tools/video-frame-capture" element={<ProtectedRoute><VideoFrameCapture></VideoFrameCapture></ProtectedRoute>} />
      <Route path="/tools/video-to-audio" element={<ProtectedRoute><VideoToAudio></VideoToAudio></ProtectedRoute>} />
      <Route path="/tools/video-speed-changer" element={<ProtectedRoute><VideoSpeedChanger></VideoSpeedChanger></ProtectedRoute>} />
      <Route path="/tools/video-thumbnail" element={<ProtectedRoute><VideoThumbnail></VideoThumbnail></ProtectedRoute>} />
      <Route path="/tools/video-metadata" element={<ProtectedRoute><VideoMetadata></VideoMetadata></ProtectedRoute>} />
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

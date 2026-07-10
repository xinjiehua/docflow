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
      <Route path="/tools/pdf-rotate-pages" element={<PdfRotatePages />} />
      <Route path="/tools/pdf-sign-stamp" element={<PdfSignStamp />} />
      <Route path="/tools/pdf-table-extract" element={<PdfTableExtract />} />
      <Route path="/tools/pdf-bookmark-manage" element={<PdfBookmarkManage />} />
      <Route path="/tools/pdf-editor" element={<PdfEditor />} />
      <Route path="/tools/pdf-crop" element={<PdfCrop />} />
      <Route path="/tools/pdf-add-text" element={<PdfAddText />} />
      <Route path="/tools/pdf-translate" element={<PdfTranslate />} />
      <Route path="/tools/pdf-to-text" element={<PdfToText />} />
      <Route path="/tools/pdf-to-csv" element={<PdfToCsv />} />
      <Route path="/tools/pdf-rearrange" element={<PdfRearrange />} />

      {/* Format Conversion */}
      <Route path="/tools/convert-pdf-to-word" element={<ConvertPdfToWord />} />
      <Route path="/tools/convert-word-to-pdf" element={<ConvertWordToPdf />} />
      <Route path="/tools/convert-excel-to-pdf" element={<ConvertExcelToPdf />} />
      <Route path="/tools/convert-image-to-pdf" element={<ConvertImageToPdf />} />
      <Route path="/tools/convert-word-to-excel" element={<WordToExcel />} />
      <Route path="/tools/image-format-convert" element={<ImageFormatConvert />} />
      <Route path="/tools/image-compress" element={<ImageCompress />} />
      <Route path="/tools/markdown-to-pdf" element={<MarkdownToPdf />} />
      <Route path="/tools/html-to-pdf" element={<HtmlToPdf />} />
      <Route path="/tools/word-document-compare" element={<WordDocumentCompare />} />
      <Route path="/tools/epub-to-pdf" element={<EpubToPdf />} />
      <Route path="/tools/pdf-to-epub" element={<PdfToEpub />} />
      <Route path="/tools/csv-to-excel" element={<CsvToExcel />} />
      <Route path="/tools/excel-to-csv" element={<ExcelToCsv />} />
      <Route path="/tools/xml-to-json" element={<XmlToJson />} />
      <Route path="/tools/json-to-xml" element={<JsonToXml />} />
      <Route path="/tools/ppt-to-image" element={<PptToImage />} />
      <Route path="/tools/image-to-ppt" element={<ImageToPpt />} />
      <Route path="/tools/pdf-to-ppt" element={<PdfToPpt />} />
      <Route path="/tools/ppt-to-pdf" element={<PptToPdf />} />
      <Route path="/tools/ppt-to-word" element={<PptToWord />} />
      <Route path="/tools/markdown-to-ppt" element={<MarkdownToPpt />} />

      {/* Image Tools */}
      <Route path="/tools/image-resize" element={<ImageResize />} />
      <Route path="/tools/image-watermark" element={<ImageWatermark />} />
      <Route path="/tools/image-remove-bg" element={<ImageRemoveBg />} />
      <Route path="/tools/image-crop-rotate" element={<ImageCropRotate />} />
      <Route path="/tools/image-remove-watermark" element={<ImageRemoveWatermark />} />
      <Route path="/tools/image-stitch" element={<ImageStitch />} />
      <Route path="/tools/image-exif-viewer" element={<ImageExifViewer />} />
      <Route path="/tools/image-filter" element={<ImageFilter />} />
      <Route path="/tools/image-border" element={<ImageBorder />} />
      <Route path="/tools/image-ascii-art" element={<ImageAsciiArt />} />
      <Route path="/tools/batch-image-compress" element={<BatchImageCompress />} />
      <Route path="/tools/image-mosaic" element={<ImageMosaic />} />
      <Route path="/tools/image-free-collage" element={<ImageFreeCollage />} />
      <Route path="/tools/image-round" element={<ImageRound />} />
      <Route path="/tools/image-flip" element={<ImageFlip />} />
      <Route path="/tools/image-pixelate" element={<ImagePixelate />} />
      <Route path="/tools/collage-maker" element={<CollageMaker />} />
      <Route path="/tools/image-add-text" element={<ImageAddText />} />
      <Route path="/tools/image-blur-bg" element={<ImageBlurBg />} />
      <Route path="/tools/image-split" element={<ImageSplit />} />

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
      <Route path="/tools/markdown-editor" element={<MarkdownEditor />} />
      <Route path="/tools/screen-recorder" element={<ScreenRecorder />} />
      <Route path="/tools/online-drawing-board" element={<OnlineDrawingBoard />} />
      <Route path="/tools/qr-code-decoder" element={<QrCodeDecoder />} />
      <Route path="/tools/barcode-generator" element={<BarcodeGenerator />} />
      <Route path="/tools/online-notes" element={<OnlineNotes />} />
      <Route path="/tools/password-generator" element={<PasswordGenerator />} />
      <Route path="/tools/mind-map" element={<MindMap />} />
      <Route path="/tools/flow-chart" element={<FlowChart />} />
      <Route path="/tools/id-photo-maker" element={<IdPhotoMaker />} />
      <Route path="/tools/resume-generator" element={<ResumeGenerator />} />
      <Route path="/tools/calendar-maker" element={<CalendarMaker />} />
      <Route path="/tools/lorem-ipsum" element={<LoremIpsum />} />
      <Route path="/tools/word-counter" element={<WordCounter />} />
      <Route path="/tools/http-request-test" element={<HttpRequestTest />} />
      <Route path="/tools/gov-doc-format" element={<GovDocFormat />} />
      <Route path="/tools/watermark-paper" element={<WatermarkPaper />} />
      <Route path="/tools/text-statistics" element={<TextStatistics />} />
      <Route path="/tools/file-format-query" element={<FileFormatQuery />} />

      {/* PPT Tools */}
      <Route path="/tools/ppt-merge" element={<PptMerge />} />
      <Route path="/tools/ppt-split" element={<PptSplit />} />
      <Route path="/tools/ppt-extract-images" element={<PptExtractImages />} />
      <Route path="/tools/ppt-extract-text" element={<PptExtractText />} />
      <Route path="/tools/ppt-compress" element={<PptCompress />} />
      <Route path="/tools/ppt-rearrange" element={<PptRearrange />} />
      <Route path="/tools/ppt-add-watermark" element={<PptAddWatermark />} />
      <Route path="/tools/ppt-template-maker" element={<PptTemplateMaker />} />
      <Route path="/tools/ppt-replace-text" element={<PptReplaceText />} />
      <Route path="/tools/ppt-delete-pages" element={<PptDeletePages />} />
      <Route path="/tools/ppt-add-page-numbers" element={<PptAddPageNumbers />} />
      <Route path="/tools/ppt-extract-media" element={<PptExtractMedia />} />
      <Route path="/tools/ppt-to-long-image" element={<PptToLongImage />} />
      <Route path="/tools/ppt-theme-color" element={<PptThemeColor />} />

      {/* Developer Tools */}
      <Route path="/tools/json-formatter" element={<JsonFormatter />} />
      <Route path="/tools/base64-tool" element={<Base64Tool />} />
      <Route path="/tools/regex-tester" element={<RegexTester />} />
      <Route path="/tools/file-hash" element={<FileHash />} />
      <Route path="/tools/color-converter" element={<ColorConverter />} />
      <Route path="/tools/timestamp-converter" element={<TimestampConverter />} />
      <Route path="/tools/url-encoder-decoder" element={<UrlEncoderDecoder />} />
      <Route path="/tools/jwt-decoder" element={<JwtDecoder />} />
      <Route path="/tools/base-converter" element={<BaseConverter />} />

      {/* Text Processing */}
      <Route path="/tools/traditional-simplified" element={<TraditionalSimplified />} />
      <Route path="/tools/pinyin-converter" element={<PinyinConverter />} />
      <Route path="/tools/text-dedup" element={<TextDedup />} />
      <Route path="/tools/text-sort" element={<TextSort />} />
      <Route path="/tools/case-converter" element={<CaseConverter />} />
      <Route path="/tools/line-number-tool" element={<LineNumberTool />} />
      <Route path="/tools/text-replace" element={<TextReplace />} />
      <Route path="/tools/symbol-insert" element={<SymbolInsert />} />
      <Route path="/tools/emoji-tool" element={<EmojiTool />} />

      {/* GIF Tools */}
      <Route path="/tools/gif-frame-viewer" element={<GifFrameViewer />} />
      <Route path="/tools/gif-compressor" element={<GifCompressor />} />
      <Route path="/tools/gif-splitter" element={<GifSplitter />} />
      <Route path="/tools/image-to-gif" element={<ImageToGif />} />

      {/* Calculators */}
      <Route path="/tools/bmi-calculator" element={<BmiCalculator />} />
      <Route path="/tools/unit-converter" element={<UnitConverter />} />
      <Route path="/tools/date-calculator" element={<DateCalculator />} />
      <Route path="/tools/percentage-calculator" element={<PercentageCalculator />} />
      <Route path="/tools/exchange-rate-calculator" element={<ExchangeRateCalculator />} />

      {/* Encryption & Security */}
      <Route path="/tools/text-encrypt" element={<TextEncrypt />} />
      <Route path="/tools/hash-generator" element={<HashGenerator />} />
      <Route path="/tools/password-strength-checker" element={<PasswordStrengthChecker />} />
      <Route path="/tools/random-password-generator" element={<RandomPasswordGenerator />} />

      {/* Color Tools */}
      <Route path="/tools/color-palette" element={<ColorPalette />} />
      <Route path="/tools/color-contrast-checker" element={<ColorContrastChecker />} />
      <Route path="/tools/gradient-generator" element={<GradientGenerator />} />
      <Route path="/tools/glassmorphism-generator" element={<GlassmorphismGenerator />} />

      {/* Enhanced Developer Tools */}
      <Route path="/tools/cron-expression" element={<CronExpression />} />
      <Route path="/tools/ip-address-tool" element={<IpAddressTool />} />
      <Route path="/tools/lorem-ipsum-advanced" element={<LoremIpsumAdvanced />} />
      <Route path="/tools/regex-visualizer" element={<RegexVisualizer />} />
      <Route path="/tools/json-diff" element={<JsonDiff />} />
      <Route path="/tools/sql-formatter" element={<SqlFormatter />} />
      <Route path="/tools/uuid-generator" element={<UuidGenerator />} />

      {/* Audio Tools */}
      <Route path="/tools/audio-trimmer" element={<AudioTrimmer />} />
      <Route path="/tools/audio-volume-normalizer" element={<AudioVolumeNormalizer />} />
      <Route path="/tools/audio-format-converter" element={<AudioFormatConverter />} />
      <Route path="/tools/audio-merger" element={<AudioMerger />} />

      {/* Life Tools */}
      <Route path="/tools/countdown-timer" element={<CountdownTimer />} />
      <Route path="/tools/pomodoro-timer" element={<PomodoroTimer />} />
      <Route path="/tools/stopwatch" element={<Stopwatch />} />
      <Route path="/tools/loan-calculator" element={<LoanCalculator />} />
      <Route path="/tools/tax-calculator" element={<TaxCalculator />} />

      {/* Video Tools */}
      <Route path="/tools/video-compressor" element={<VideoCompressor />} />
      <Route path="/tools/video-format-converter" element={<VideoFormatConverter />} />
      <Route path="/tools/video-frame-capture" element={<VideoFrameCapture />} />
      <Route path="/tools/video-to-audio" element={<VideoToAudio />} />
      <Route path="/tools/video-speed-changer" element={<VideoSpeedChanger />} />
      <Route path="/tools/video-thumbnail" element={<VideoThumbnail />} />
      <Route path="/tools/video-metadata" element={<VideoMetadata />} />
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

import { Link } from 'react-router-dom'
import {
  Merge, Scissors, Droplets, FileDown,
  ArrowRightLeft, FileText, Image, Table,
  ScanLine, Layers, Shield, Zap, Lock,
  ChevronRight, Star, Users, Clock, ImageIcon, Crop, RotateCw,
  Hash, PenTool, QrCode, FileUp, Mic, Volume2, FolderOpen, FileSpreadsheet,
  Columns, Type, Eraser, FileCheck, GitCompare, FileSignature, Music,
  RotateCcw, Paintbrush, FileJson, Binary, Fingerprint, Code2, Palette, Camera, MonitorSpeaker, BarChart3, FileCode, StickyNote,
  Stamp, TableProperties, BookOpen, FileDiff, Sparkles, Square, HashIcon, Package, Pen, ScanBarcode, NotepadText, KeyRound, Clock, Link, ShieldCheck, Languages, ArrowUpDown, Presentation, Grid3x3, LayoutGrid, Circle, FlipHorizontal, Trash2, GitBranch, User, Calendar, Globe
} from 'lucide-react'

const toolCategories = [
  {
    title: 'PDF 工具箱',
    description: '合并、拆分、水印、压缩、加密、页码、提取',
    icon: <Layers className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    tools: [
      { name: 'PDF 合并', desc: '将多个PDF合并为一个文档', icon: <Merge className="w-5 h-5" />, href: '/tools/pdf-merge' },
      { name: 'PDF 拆分', desc: '按页码范围拆分PDF文档', icon: <Scissors className="w-5 h-5" />, href: '/tools/pdf-split' },
      { name: 'PDF 水印', desc: '为PDF添加自定义文字水印', icon: <Droplets className="w-5 h-5" />, href: '/tools/pdf-watermark' },
      { name: 'PDF 压缩', desc: '减小PDF文件体积', icon: <FileDown className="w-5 h-5" />, href: '/tools/pdf-compress' },
      { name: 'PDF 转图片', desc: '将PDF每页导出为PNG/JPG图片', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/pdf-to-image' },
      { name: 'PDF 加密/解密', desc: '添加或移除PDF密码保护', icon: <Lock className="w-5 h-5" />, href: '/tools/pdf-encrypt' },
      { name: 'PDF 提取页面', desc: '提取或删除PDF指定页面', icon: <Layers className="w-5 h-5" />, href: '/tools/pdf-extract-pages' },
      { name: 'PDF 添加页码', desc: '为PDF每页添加页码', icon: <Hash className="w-5 h-5" />, href: '/tools/pdf-add-page-numbers' },
      { name: 'PDF 转 Excel', desc: '提取PDF文字内容转为Excel表格', icon: <Table className="w-5 h-5" />, href: '/tools/pdf-to-excel' },
      { name: 'PDF 旋转页面', desc: '旋转PDF指定页面(90/180/270度)', icon: <RotateCcw className="w-5 h-5" />, href: '/tools/pdf-rotate-pages' },
      { name: 'PDF 签名/图章', desc: '上传签名或盖章嵌入PDF指定位置', icon: <Stamp className="w-5 h-5" />, href: '/tools/pdf-sign-stamp' },
      { name: 'PDF 表格提取', desc: '自动识别PDF表格导出Excel', icon: <TableProperties className="w-5 h-5" />, href: '/tools/pdf-table-extract' },
      { name: 'PDF 书签管理', desc: '查看/添加/删除书签，批量生成', icon: <BookOpen className="w-5 h-5" />, href: '/tools/pdf-bookmark-manage' },
      { name: 'PDF 编辑器', desc: '点击添加文字标注到PDF页面', icon: <PenTool className="w-5 h-5" />, href: '/tools/pdf-editor' },
      { name: 'PDF 裁剪', desc: '按比例裁剪PDF页面边距', icon: <Crop className="w-5 h-5" />, href: '/tools/pdf-crop' },
      { name: 'PDF 添加文字', desc: '自定义位置/字号/颜色添加文字', icon: <Type className="w-5 h-5" />, href: '/tools/pdf-add-text' },
      { name: 'PDF 翻译', desc: '提取文本翻译后覆盖到PDF', icon: <Languages className="w-5 h-5" />, href: '/tools/pdf-translate' },
      { name: 'PDF 转文本', desc: '导出PDF全部文字为TXT文件', icon: <FileText className="w-5 h-5" />, href: '/tools/pdf-to-text' },
      { name: 'PDF 转CSV', desc: '按坐标提取PDF表格导出CSV', icon: <Table className="w-5 h-5" />, href: '/tools/pdf-to-csv' },
      { name: 'PDF 页面排序', desc: '拖拽调整PDF页面顺序', icon: <ArrowUpDown className="w-5 h-5" />, href: '/tools/pdf-rearrange' },
    ],
  },
  {
    title: '格式转换',
    description: 'Word、Excel、PDF、图片、Markdown互转',
    icon: <ArrowRightLeft className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-500',
    tools: [
      { name: 'PDF 转 Word', desc: '将PDF转为可编辑Word文档', icon: <FileText className="w-5 h-5" />, href: '/tools/convert-pdf-to-word' },
      { name: 'Word 转 PDF', desc: '将Word文档转为PDF格式', icon: <FileDown className="w-5 h-5" />, href: '/tools/convert-word-to-pdf' },
      { name: 'Excel 转 PDF', desc: '将表格转为PDF文档', icon: <Table className="w-5 h-5" />, href: '/tools/convert-excel-to-pdf' },
      { name: '图片转 PDF', desc: '多张图片合成PDF文档', icon: <Image className="w-5 h-5" />, href: '/tools/convert-image-to-pdf' },
      { name: 'Word 转 Excel', desc: '提取Word表格数据转为Excel', icon: <Table className="w-5 h-5" />, href: '/tools/convert-word-to-excel' },
      { name: '图片格式转换', desc: 'PNG、JPG、WebP格式互转', icon: <ArrowRightLeft className="w-5 h-5" />, href: '/tools/image-format-convert' },
      { name: '图片压缩', desc: '压缩图片体积，支持批量处理', icon: <FileDown className="w-5 h-5" />, href: '/tools/image-compress' },
      { name: 'Markdown 转 PDF', desc: 'Markdown文档转为PDF文件', icon: <FileText className="w-5 h-5" />, href: '/tools/markdown-to-pdf' },
      { name: 'HTML 转 PDF', desc: '将HTML内容转为PDF文档', icon: <FileCode className="w-5 h-5" />, href: '/tools/html-to-pdf' },
      { name: 'Word 文档对比', desc: '对比两个Word文件差异', icon: <FileDiff className="w-5 h-5" />, href: '/tools/word-document-compare' },
      { name: 'EPUB 转 PDF', desc: '电子书转换为PDF文档', icon: <FileText className="w-5 h-5" />, href: '/tools/epub-to-pdf' },
      { name: 'PDF 转 EPUB', desc: 'PDF文档转为电子书格式', icon: <BookOpen className="w-5 h-5" />, href: '/tools/pdf-to-epub' },
      { name: 'CSV 转 Excel', desc: 'CSV文件转换为XLSX表格', icon: <FileSpreadsheet className="w-5 h-5" />, href: '/tools/csv-to-excel' },
      { name: 'Excel 转 CSV', desc: 'XLSX表格导出为CSV文件', icon: <FileSpreadsheet className="w-5 h-5" />, href: '/tools/excel-to-csv' },
      { name: 'XML 转 JSON', desc: 'XML数据格式转换为JSON', icon: <FileJson className="w-5 h-5" />, href: '/tools/xml-to-json' },
      { name: 'JSON 转 XML', desc: 'JSON数据格式转换为XML', icon: <FileJson className="w-5 h-5" />, href: '/tools/json-to-xml' },
      { name: 'PPT 转 图片', desc: 'PPT每页导出为PNG图片', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/ppt-to-image' },
      { name: '图片转 PPT', desc: '多张图片生成PPT演示文稿', icon: <Presentation className="w-5 h-5" />, href: '/tools/image-to-ppt' },
      { name: 'PDF 转 PPT', desc: 'PDF页面转为PPT演示文稿', icon: <Presentation className="w-5 h-5" />, href: '/tools/pdf-to-ppt' },
      { name: 'PPT 转 PDF', desc: 'PPT演示文稿转为PDF文档', icon: <Presentation className="w-5 h-5" />, href: '/tools/ppt-to-pdf' },
      { name: 'PPT 转 Word', desc: 'PPT幻灯片转为Word文档', icon: <FileText className="w-5 h-5" />, href: '/tools/ppt-to-word' },
      { name: 'Markdown 转 PPT', desc: 'Markdown文档生成PPT', icon: <FileCode className="w-5 h-5" />, href: '/tools/markdown-to-ppt' },
    ],
  },
  {
    title: '图片处理',
    description: '裁剪旋转、调整大小、水印、去背景',
    icon: <ImageIcon className="w-6 h-6" />,
    gradient: 'from-emerald-500 to-teal-500',
    tools: [
      { name: '图片裁剪/旋转', desc: '在线裁剪、旋转、翻转图片', icon: <Crop className="w-5 h-5" />, href: '/tools/image-crop-rotate' },
      { name: '图片调整大小', desc: '按比例或指定尺寸调整图片', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/image-resize' },
      { name: '图片添加水印', desc: '为图片添加文字水印', icon: <Droplets className="w-5 h-5" />, href: '/tools/image-watermark' },
      { name: '图片去背景', desc: '去除图片背景色，变透明', icon: <Eraser className="w-5 h-5" />, href: '/tools/image-remove-bg' },
      { name: '图片去水印', desc: '框选区域去除图片水印', icon: <Eraser className="w-5 h-5" />, href: '/tools/image-remove-watermark' },
      { name: '图片拼接', desc: '多张图片拼接为一张(横向/纵向/网格)', icon: <Paintbrush className="w-5 h-5" />, href: '/tools/image-stitch' },
      { name: '图片EXIF查看', desc: '查看照片拍摄信息和GPS位置', icon: <Camera className="w-5 h-5" />, href: '/tools/image-exif-viewer' },
      { name: '图片滤镜特效', desc: '14种滤镜实时预览', icon: <Sparkles className="w-5 h-5" />, href: '/tools/image-filter' },
      { name: '图片边框/圆角', desc: '边框、圆角、阴影批量处理', icon: <Square className="w-5 h-5" />, href: '/tools/image-border' },
      { name: '图片转ASCII', desc: '将图片转为ASCII字符画', icon: <HashIcon className="w-5 h-5" />, href: '/tools/image-ascii-art' },
      { name: '批量图片压缩', desc: '多图批量压缩打包下载', icon: <Package className="w-5 h-5" />, href: '/tools/batch-image-compress' },
      { name: '图片马赛克', desc: '区域马赛克/全图像素化处理', icon: <Grid3x3 className="w-5 h-5" />, href: '/tools/image-mosaic' },
      { name: '自由拼图', desc: '拖拽多图自由排列生成拼图', icon: <LayoutGrid className="w-5 h-5" />, href: '/tools/image-free-collage' },
      { name: '圆角/圆形裁剪', desc: '圆角矩形或圆形裁剪图片', icon: <Circle className="w-5 h-5" />, href: '/tools/image-round' },
      { name: '图片翻转', desc: '水平/垂直/180度翻转图片', icon: <FlipHorizontal className="w-5 h-5" />, href: '/tools/image-flip' },
      { name: '图片像素化', desc: '调节像素块大小实现像素风', icon: <Grid3x3 className="w-5 h-5" />, href: '/tools/image-pixelate' },
      { name: '网格拼图', desc: '多图网格排列生成拼图', icon: <LayoutGrid className="w-5 h-5" />, href: '/tools/collage-maker' },
      { name: '图片添加文字', desc: '多文字叠加到图片自定义位置', icon: <Type className="w-5 h-5" />, href: '/tools/image-add-text' },
      { name: '模糊背景', desc: '高斯模糊处理适合做背景图', icon: <Droplets className="w-5 h-5" />, href: '/tools/image-blur-bg' },
      { name: '图片分割', desc: '按网格将图片分割成多块', icon: <Scissors className="w-5 h-5" />, href: '/tools/image-split' },
    ],
  },
  {
    title: '智能识别 & 对比',
    description: 'OCR识别、文档对比，提升工作效率',
    icon: <ScanLine className="w-6 h-6" />,
    gradient: 'from-amber-500 to-orange-500',
    tools: [
      { name: '发票 OCR 识别', desc: '自动提取发票关键信息', icon: <ScanLine className="w-5 h-5" />, href: '/tools/invoice-ocr' },
      { name: '文字识别 OCR', desc: '从图片中提取可编辑文字', icon: <ScanLine className="w-5 h-5" />, href: '/tools/general-ocr' },
      { name: '文档对比', desc: '对比两段文本的差异', icon: <GitCompare className="w-5 h-5" />, href: '/tools/document-compare' },
    ],
  },
  {
    title: '批量处理 & 办公工具',
    description: '批量水印、批量重命名、二维码、签名、合同模板',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-indigo-500 to-violet-500',
    tools: [
      { name: '批量水印', desc: '为多个文件同时添加水印', icon: <Layers className="w-5 h-5" />, href: '/tools/batch-watermark' },
      { name: '批量重命名', desc: '按规则批量修改文件名', icon: <FolderOpen className="w-5 h-5" />, href: '/tools/batch-rename' },
      { name: '二维码生成', desc: '输入文字生成二维码图片', icon: <QrCode className="w-5 h-5" />, href: '/tools/qr-code-generator' },
      { name: '电子签名', desc: '手写签名并嵌入PDF或图片', icon: <PenTool className="w-5 h-5" />, href: '/tools/e-signature' },
      { name: '合同模板', desc: '快速生成常用合同文档', icon: <FileSignature className="w-5 h-5" />, href: '/tools/contract-templates' },
      { name: '音频转文字', desc: '将音频语音转为可编辑文字', icon: <Mic className="w-5 h-5" />, href: '/tools/audio-to-text' },
      { name: '文字转语音', desc: '将文字内容朗读出来', icon: <Volume2 className="w-5 h-5" />, href: '/tools/text-to-speech' },
      { name: '在线表格编辑', desc: '创建编辑表格，导入导出CSV', icon: <FileSpreadsheet className="w-5 h-5" />, href: '/tools/online-spreadsheet' },
      { name: 'Markdown编辑器', desc: '实时预览，导出HTML/TXT/PDF', icon: <FileCode className="w-5 h-5" />, href: '/tools/markdown-editor' },
      { name: '屏幕录制', desc: '录制屏幕操作，导出WebM视频', icon: <MonitorSpeaker className="w-5 h-5" />, href: '/tools/screen-recorder' },
      { name: '在线画板', desc: '画笔/形状/箭头/文字绘图', icon: <Pen className="w-5 h-5" />, href: '/tools/online-drawing-board' },
      { name: '二维码解码', desc: '上传二维码图片识别内容', icon: <ScanBarcode className="w-5 h-5" />, href: '/tools/qr-code-decoder' },
      { name: '条形码生成', desc: 'Code128/EAN-13/UPC-A等', icon: <ScanBarcode className="w-5 h-5" />, href: '/tools/barcode-generator' },
      { name: '在线便签', desc: '自动保存多条便签管理', icon: <NotepadText className="w-5 h-5" />, href: '/tools/online-notes' },
      { name: '密码生成器', desc: '自定义规则批量生成+强度评估', icon: <KeyRound className="w-5 h-5" />, href: '/tools/password-generator' },
      { name: 'PPT 合并', desc: '多个PPT合并为一个文件', icon: <Layers className="w-5 h-5" />, href: '/tools/ppt-merge' },
      { name: 'PPT 拆分', desc: '按页码拆分PPT为多个文件', icon: <Scissors className="w-5 h-5" />, href: '/tools/ppt-split' },
      { name: 'PPT 提取图片', desc: '提取PPT中的所有图片素材', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/ppt-extract-images' },
      { name: 'PPT 提取文字', desc: '提取PPT所有幻灯片文字', icon: <FileText className="w-5 h-5" />, href: '/tools/ppt-extract-text' },
      { name: 'PPT 压缩', desc: '缩小PPT文件体积', icon: <FileDown className="w-5 h-5" />, href: '/tools/ppt-compress' },
      { name: 'PPT 页面排序', desc: '拖拽调整幻灯片顺序', icon: <ArrowUpDown className="w-5 h-5" />, href: '/tools/ppt-rearrange' },
      { name: 'PPT 添加水印', desc: '为PPT所有页面添加水印', icon: <Droplets className="w-5 h-5" />, href: '/tools/ppt-add-watermark' },
      { name: 'PPT 模板制作', desc: '8套预设模板快速生成PPT', icon: <Presentation className="w-5 h-5" />, href: '/tools/ppt-template-maker' },
      { name: 'PPT 批量替换文字', desc: '查找替换PPT中的文字内容', icon: <PenTool className="w-5 h-5" />, href: '/tools/ppt-replace-text' },
      { name: 'PPT 删除指定页', desc: '删除PPT中不需要的页面', icon: <Trash2 className="w-5 h-5" />, href: '/tools/ppt-delete-pages' },
      { name: 'PPT 添加页码', desc: '为PPT每页添加页码编号', icon: <Hash className="w-5 h-5" />, href: '/tools/ppt-add-page-numbers' },
      { name: 'PPT 提取音视频', desc: '提取PPT中嵌入的音视频', icon: <Music className="w-5 h-5" />, href: '/tools/ppt-extract-media' },
      { name: 'PPT 转长图', desc: 'PPT所有页纵向拼接为一张图', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/ppt-to-long-image' },
      { name: 'PPT 主题配色', desc: '修改PPT的主题颜色方案', icon: <Palette className="w-5 h-5" />, href: '/tools/ppt-theme-color' },
      { name: '思维导图', desc: '拖拽创建和编辑思维导图', icon: <GitBranch className="w-5 h-5" />, href: '/tools/mind-map' },
      { name: '流程图', desc: '绘制流程图导出SVG', icon: <GitBranch className="w-5 h-5" />, href: '/tools/flow-chart' },
      { name: '证件照制作', desc: '一寸/二寸/护照多尺寸背景色', icon: <User className="w-5 h-5" />, href: '/tools/id-photo-maker' },
      { name: '简历生成器', desc: '填写信息生成专业简历', icon: <FileText className="w-5 h-5" />, href: '/tools/resume-generator' },
      { name: '日历生成器', desc: '生成月历导出SVG/PNG', icon: <Calendar className="w-5 h-5" />, href: '/tools/calendar-maker' },
      { name: '随机文本生成', desc: '中英文占位文本批量生成', icon: <Type className="w-5 h-5" />, href: '/tools/lorem-ipsum' },
      { name: '文字统计增强', desc: '字/词/句/段/阅读时间全面统计', icon: <BarChart3 className="w-5 h-5" />, href: '/tools/word-counter' },
      { name: 'HTTP请求测试', desc: '发送HTTP请求查看响应', icon: <Globe className="w-5 h-5" />, href: '/tools/http-request-test' },
      { name: '公文格式排版', desc: 'GB/T 9704标准公文排版打印', icon: <FileText className="w-5 h-5" />, href: '/tools/gov-doc-format' },
      { name: '水印纸生成器', desc: '生成带平铺水印的打印纸', icon: <Droplets className="w-5 h-5" />, href: '/tools/watermark-paper' },
    ],
  },
  {
    title: '开发者工具',
    description: 'JSON、Base64、正则、哈希、颜色转换',
    icon: <Code2 className="w-6 h-6" />,
    gradient: 'from-rose-500 to-pink-600',
    tools: [
      { name: 'JSON 格式化', desc: '格式化/压缩/校验/树形查看', icon: <FileJson className="w-5 h-5" />, href: '/tools/json-formatter' },
      { name: 'Base64 编解码', desc: '文本和图片的Base64编解码', icon: <Binary className="w-5 h-5" />, href: '/tools/base64-tool' },
      { name: '正则表达式测试', desc: '实时测试正则匹配，常用正则库', icon: <Code2 className="w-5 h-5" />, href: '/tools/regex-tester' },
      { name: '文件哈希计算', desc: 'MD5/SHA系列哈希值计算与校验', icon: <Fingerprint className="w-5 h-5" />, href: '/tools/file-hash' },
      { name: '颜色转换器', desc: 'HEX/RGB/HSL/CMYK互转+配色方案', icon: <Palette className="w-5 h-5" />, href: '/tools/color-converter' },
      { name: '时间戳转换', desc: 'Unix时间戳与日期互转', icon: <Clock className="w-5 h-5" />, href: '/tools/timestamp-converter' },
      { name: 'URL 编解码', desc: 'URL编码/解码+结构解析', icon: <Link className="w-5 h-5" />, href: '/tools/url-encoder-decoder' },
      { name: 'JWT 解析器', desc: '解析Token的Header/Payload', icon: <ShieldCheck className="w-5 h-5" />, href: '/tools/jwt-decoder' },
      { name: '进制转换器', desc: '二进制/八进制/十进制/十六进制', icon: <Binary className="w-5 h-5" />, href: '/tools/base-converter' },
    ],
  },
  {
    title: '实用小工具',
    description: '文字统计、图片处理辅助，日常办公好帮手',
    icon: <StickyNote className="w-6 h-6" />,
    gradient: 'from-teal-500 to-emerald-600',
    tools: [
      { name: '文字统计', desc: '中英文混合文本全面统计分析', icon: <BarChart3 className="w-5 h-5" />, href: '/tools/text-statistics' },
      { name: '文件格式查询', desc: '45种常见文件格式信息速查', icon: <FileText className="w-5 h-5" />, href: '/tools/file-format-query' },
    ],
  },
]

const stats = [
  { label: '每日处理文件', value: '10,000+', icon: <FileText className="w-5 h-5" /> },
  { label: '注册用户', value: '5,000+', icon: <Users className="w-5 h-5" /> },
  { label: '处理耗时', value: '< 10秒', icon: <Clock className="w-5 h-5" /> },
  { label: '用户评分', value: '4.8/5', icon: <Star className="w-5 h-5" /> },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-blue-50/50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6 animate-fade-in-up">
            <Zap className="w-4 h-4" />
            所有处理在浏览器本地完成，文件不会上传到服务器
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-navy-800 leading-tight animate-fade-in-up stagger-1">
            全能文档处理工具
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent">
              一站式在线搞定
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-navy-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
            PDF处理、格式转换、OCR文字识别、图片编辑 --
            116+款办公工具，无需安装软件，打开网页即可使用
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
            <Link
              to="/tools/pdf-merge"
              className="btn-primary text-base !px-8 !py-3 no-underline"
            >
              开始使用
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
            <Link
              to="/pricing"
              className="btn-secondary text-base !px-8 !py-3 no-underline"
            >
              查看定价
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up stagger-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-500">
                  {stat.icon}
                </div>
                <span className="text-2xl font-display font-bold text-navy-800">{stat.value}</span>
                <span className="text-sm text-navy-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {toolCategories.map((cat, catIdx) => (
          <div key={cat.title} className={catIdx > 0 ? 'mt-16' : ''}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white`}>
                {cat.icon}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-navy-800">
                  {cat.title}
                </h2>
                <p className="text-sm text-navy-400">{cat.description}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.tools.map((tool) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="card group no-underline"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-500 group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors shrink-0">
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-navy-700 group-hover:text-brand-700 transition-colors flex items-center gap-1">
                        {tool.name}
                        <ChevronRight className="w-4 h-4 text-navy-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                      </h3>
                      <p className="text-sm text-navy-400 mt-1">{tool.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Trust Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="card !p-8 sm:!p-12">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center text-white shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-navy-800">
                文件安全，隐私保障
              </h2>
              <p className="text-navy-500 mt-2 leading-relaxed">
                DocFlow 的所有文档处理均在你的浏览器中本地完成。
                你的文件不会被上传到任何服务器，也不会被任何人看到。
                关闭网页后，所有处理数据自动清除。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

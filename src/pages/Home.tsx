import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Merge, Scissors, Droplets, FileDown,
  ArrowRightLeft, FileText, Image, Table,
  ScanLine, Layers, Shield, Zap, Lock,
  ChevronRight, Star, Users, Clock, ImageIcon, Crop, RotateCw,
  Hash, PenTool, QrCode, FileUp, Mic, Volume2, FolderOpen, FileSpreadsheet,
  Columns, Type, Eraser, FileCheck, GitCompare, FileSignature, Music,
  RotateCcw, Paintbrush, FileJson, Binary, Fingerprint, Code2, Palette, Camera, MonitorSpeaker, BarChart3, FileCode, StickyNote,
  Stamp, TableProperties, BookOpen, FileDiff, Sparkles, Square, HashIcon, Package, Pen, ScanBarcode, NotepadText, KeyRound, Clock as ClockIcon, Link, ShieldCheck, Languages, ArrowUpDown, Presentation, Grid3x3, LayoutGrid, Circle, FlipHorizontal, Trash2, GitBranch, User, Calendar, Globe,
  Percent, Gauge, Banknote, FileDiff, Volume2, Smile,
  Search
} from 'lucide-react'

const toolCategories = [
  {
    id: 'pdf',
    title: 'PDF 工具箱',
    description: '合并、拆分、水印、压缩、加密、编辑、翻译',
    icon: <Layers className="w-5 h-5" />,
    gradient: 'from-blue-500 to-cyan-500',
    tools: [
      { name: 'PDF 合并', desc: '将多个PDF合并为一个文档', icon: <Merge className="w-5 h-5" />, href: '/tools/pdf-merge' },
      { name: 'PDF 拆分', desc: '按页码范围拆分PDF文档', icon: <Scissors className="w-5 h-5" />, href: '/tools/pdf-split' },
      { name: 'PDF 水印', desc: '为PDF添加自定义文字水印', icon: <Droplets className="w-5 h-5" />, href: '/tools/pdf-watermark' },
      { name: 'PDF 压缩', desc: '减小PDF文件体积', icon: <FileDown className="w-5 h-5" />, href: '/tools/pdf-compress' },
      { name: 'PDF 转图片', desc: '将PDF每页导出为PNG/JPG', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/pdf-to-image' },
      { name: 'PDF 加密/解密', desc: '添加或移除PDF密码保护', icon: <Lock className="w-5 h-5" />, href: '/tools/pdf-encrypt' },
      { name: 'PDF 提取页面', desc: '提取或删除PDF指定页面', icon: <Layers className="w-5 h-5" />, href: '/tools/pdf-extract-pages' },
      { name: 'PDF 添加页码', desc: '为PDF每页添加页码', icon: <Hash className="w-5 h-5" />, href: '/tools/pdf-add-page-numbers' },
      { name: 'PDF 转 Excel', desc: '提取PDF文字内容转为Excel', icon: <Table className="w-5 h-5" />, href: '/tools/pdf-to-excel' },
      { name: 'PDF 旋转页面', desc: '旋转PDF指定页面(90/180/270)', icon: <RotateCcw className="w-5 h-5" />, href: '/tools/pdf-rotate-pages' },
      { name: 'PDF 签名/图章', desc: '上传签名嵌入PDF指定位置', icon: <Stamp className="w-5 h-5" />, href: '/tools/pdf-sign-stamp' },
      { name: 'PDF 表格提取', desc: '自动识别PDF表格导出Excel', icon: <TableProperties className="w-5 h-5" />, href: '/tools/pdf-table-extract' },
      { name: 'PDF 书签管理', desc: '查看/添加/删除书签', icon: <BookOpen className="w-5 h-5" />, href: '/tools/pdf-bookmark-manage' },
      { name: 'PDF 编辑器', desc: '添加文字标注到PDF页面', icon: <PenTool className="w-5 h-5" />, href: '/tools/pdf-editor' },
      { name: 'PDF 裁剪', desc: '按比例裁剪PDF页面边距', icon: <Crop className="w-5 h-5" />, href: '/tools/pdf-crop' },
      { name: 'PDF 添加文字', desc: '自定义位置/字号添加文字', icon: <Type className="w-5 h-5" />, href: '/tools/pdf-add-text' },
      { name: 'PDF 翻译', desc: '提取文本翻译后覆盖到PDF', icon: <Languages className="w-5 h-5" />, href: '/tools/pdf-translate' },
      { name: 'PDF 转文本', desc: '导出PDF全部文字为TXT文件', icon: <FileText className="w-5 h-5" />, href: '/tools/pdf-to-text' },
      { name: 'PDF 转CSV', desc: '按坐标提取PDF表格导出CSV', icon: <Table className="w-5 h-5" />, href: '/tools/pdf-to-csv' },
      { name: 'PDF 页面排序', desc: '拖拽调整PDF页面顺序', icon: <ArrowUpDown className="w-5 h-5" />, href: '/tools/pdf-rearrange' },
    ],
  },
  {
    id: 'ppt',
    title: 'PPT 工具箱',
    description: 'PPT合并、拆分、提取、模板、水印、格式转换',
    icon: <Presentation className="w-5 h-5" />,
    gradient: 'from-orange-500 to-amber-500',
    tools: [
      { name: 'PPT 合并', desc: '多个PPT合并为一个文件', icon: <Layers className="w-5 h-5" />, href: '/tools/ppt-merge' },
      { name: 'PPT 拆分', desc: '按页码拆分PPT为多个文件', icon: <Scissors className="w-5 h-5" />, href: '/tools/ppt-split' },
      { name: 'PPT 提取图片', desc: '提取PPT中的所有图片素材', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/ppt-extract-images' },
      { name: 'PPT 提取文字', desc: '提取PPT所有幻灯片文字', icon: <FileText className="w-5 h-5" />, href: '/tools/ppt-extract-text' },
      { name: 'PPT 压缩', desc: '缩小PPT文件体积', icon: <FileDown className="w-5 h-5" />, href: '/tools/ppt-compress' },
      { name: 'PPT 页面排序', desc: '拖拽调整幻灯片顺序', icon: <ArrowUpDown className="w-5 h-5" />, href: '/tools/ppt-rearrange' },
      { name: 'PPT 添加水印', desc: '为PPT所有页面添加水印', icon: <Droplets className="w-5 h-5" />, href: '/tools/ppt-add-watermark' },
      { name: 'PPT 模板制作', desc: '8套预设模板快速生成PPT', icon: <Presentation className="w-5 h-5" />, href: '/tools/ppt-template-maker' },
      { name: 'PPT 替换文字', desc: '查找替换PPT中的文字', icon: <PenTool className="w-5 h-5" />, href: '/tools/ppt-replace-text' },
      { name: 'PPT 删除指定页', desc: '删除PPT中不需要的页面', icon: <Trash2 className="w-5 h-5" />, href: '/tools/ppt-delete-pages' },
      { name: 'PPT 添加页码', desc: '为PPT每页添加页码编号', icon: <Hash className="w-5 h-5" />, href: '/tools/ppt-add-page-numbers' },
      { name: 'PPT 提取音视频', desc: '提取PPT中嵌入的音视频', icon: <Music className="w-5 h-5" />, href: '/tools/ppt-extract-media' },
      { name: 'PPT 转长图', desc: 'PPT所有页纵向拼接为一张图', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/ppt-to-long-image' },
      { name: 'PPT 主题配色', desc: '修改PPT的主题颜色方案', icon: <Palette className="w-5 h-5" />, href: '/tools/ppt-theme-color' },
    ],
  },
  {
    id: 'convert',
    title: '格式转换',
    description: 'Word、Excel、PDF、PPT、图片、Markdown互转',
    icon: <ArrowRightLeft className="w-5 h-5" />,
    gradient: 'from-purple-500 to-pink-500',
    tools: [
      { name: 'PDF 转 Word', desc: '将PDF转为可编辑Word文档', icon: <FileText className="w-5 h-5" />, href: '/tools/convert-pdf-to-word' },
      { name: 'Word 转 PDF', desc: '将Word文档转为PDF格式', icon: <FileDown className="w-5 h-5" />, href: '/tools/convert-word-to-pdf' },
      { name: 'Excel 转 PDF', desc: '将表格转为PDF文档', icon: <Table className="w-5 h-5" />, href: '/tools/convert-excel-to-pdf' },
      { name: '图片转 PDF', desc: '多张图片合成PDF文档', icon: <Image className="w-5 h-5" />, href: '/tools/convert-image-to-pdf' },
      { name: 'Word 转 Excel', desc: '提取Word表格数据转为Excel', icon: <Table className="w-5 h-5" />, href: '/tools/convert-word-to-excel' },
      { name: '图片格式转换', desc: 'PNG/JPG/WebP格式互转', icon: <ArrowRightLeft className="w-5 h-5" />, href: '/tools/image-format-convert' },
      { name: '图片压缩', desc: '压缩图片体积，支持批量', icon: <FileDown className="w-5 h-5" />, href: '/tools/image-compress' },
      { name: 'Markdown 转 PDF', desc: 'Markdown文档转为PDF', icon: <FileText className="w-5 h-5" />, href: '/tools/markdown-to-pdf' },
      { name: 'HTML 转 PDF', desc: '将HTML内容转为PDF文档', icon: <FileCode className="w-5 h-5" />, href: '/tools/html-to-pdf' },
      { name: 'Word 文档对比', desc: '对比两个Word文件差异', icon: <FileDiff className="w-5 h-5" />, href: '/tools/word-document-compare' },
      { name: 'EPUB 转 PDF', desc: '电子书转换为PDF文档', icon: <FileText className="w-5 h-5" />, href: '/tools/epub-to-pdf' },
      { name: 'PDF 转 EPUB', desc: 'PDF文档转为电子书格式', icon: <BookOpen className="w-5 h-5" />, href: '/tools/pdf-to-epub' },
      { name: 'CSV 转 Excel', desc: 'CSV文件转换为XLSX表格', icon: <FileSpreadsheet className="w-5 h-5" />, href: '/tools/csv-to-excel' },
      { name: 'Excel 转 CSV', desc: 'XLSX表格导出为CSV文件', icon: <FileSpreadsheet className="w-5 h-5" />, href: '/tools/excel-to-csv' },
      { name: 'XML 转 JSON', desc: 'XML数据格式转换为JSON', icon: <FileJson className="w-5 h-5" />, href: '/tools/xml-to-json' },
      { name: 'JSON 转 XML', desc: 'JSON数据格式转换为XML', icon: <FileJson className="w-5 h-5" />, href: '/tools/json-to-xml' },
      { name: 'PPT 转 图片', desc: 'PPT每页导出为PNG图片', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/ppt-to-image' },
      { name: '图片转 PPT', desc: '多张图片生成PPT演示', icon: <Presentation className="w-5 h-5" />, href: '/tools/image-to-ppt' },
      { name: 'PDF 转 PPT', desc: 'PDF页面转为PPT演示', icon: <Presentation className="w-5 h-5" />, href: '/tools/pdf-to-ppt' },
      { name: 'PPT 转 PDF', desc: 'PPT演示转为PDF文档', icon: <Presentation className="w-5 h-5" />, href: '/tools/ppt-to-pdf' },
      { name: 'PPT 转 Word', desc: 'PPT幻灯片转为Word文档', icon: <FileText className="w-5 h-5" />, href: '/tools/ppt-to-word' },
      { name: 'Markdown 转 PPT', desc: 'Markdown文档生成PPT', icon: <FileCode className="w-5 h-5" />, href: '/tools/markdown-to-ppt' },
    ],
  },
  {
    id: 'image',
    title: '图片处理',
    description: '裁剪旋转、滤镜、去背景、拼图、马赛克',
    icon: <ImageIcon className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-teal-500',
    tools: [
      { name: '图片裁剪/旋转', desc: '在线裁剪、旋转、翻转图片', icon: <Crop className="w-5 h-5" />, href: '/tools/image-crop-rotate' },
      { name: '图片调整大小', desc: '按比例或指定尺寸调整', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/image-resize' },
      { name: '图片添加水印', desc: '为图片添加文字水印', icon: <Droplets className="w-5 h-5" />, href: '/tools/image-watermark' },
      { name: '图片去背景', desc: '去除图片背景色，变透明', icon: <Eraser className="w-5 h-5" />, href: '/tools/image-remove-bg' },
      { name: '图片去水印', desc: '框选区域去除图片水印', icon: <Eraser className="w-5 h-5" />, href: '/tools/image-remove-watermark' },
      { name: '图片拼接', desc: '多图拼接为一张(横/纵/网格)', icon: <Paintbrush className="w-5 h-5" />, href: '/tools/image-stitch' },
      { name: '图片EXIF查看', desc: '查看照片拍摄信息和GPS', icon: <Camera className="w-5 h-5" />, href: '/tools/image-exif-viewer' },
      { name: '图片滤镜特效', desc: '14种滤镜实时预览', icon: <Sparkles className="w-5 h-5" />, href: '/tools/image-filter' },
      { name: '图片边框/圆角', desc: '边框、圆角、阴影批量处理', icon: <Square className="w-5 h-5" />, href: '/tools/image-border' },
      { name: '图片转ASCII', desc: '将图片转为ASCII字符画', icon: <HashIcon className="w-5 h-5" />, href: '/tools/image-ascii-art' },
      { name: '批量图片压缩', desc: '多图批量压缩打包下载', icon: <Package className="w-5 h-5" />, href: '/tools/batch-image-compress' },
      { name: '图片马赛克', desc: '区域马赛克/全图像素化处理', icon: <Grid3x3 className="w-5 h-5" />, href: '/tools/image-mosaic' },
      { name: '自由拼图', desc: '拖拽多图自由排列生成拼图', icon: <LayoutGrid className="w-5 h-5" />, href: '/tools/image-free-collage' },
      { name: '圆角/圆形裁剪', desc: '圆角矩形或圆形裁剪图片', icon: <Circle className="w-5 h-5" />, href: '/tools/image-round' },
      { name: '图片翻转', desc: '水平/垂直/180度翻转', icon: <FlipHorizontal className="w-5 h-5" />, href: '/tools/image-flip' },
      { name: '图片像素化', desc: '调节像素块大小实现像素风', icon: <Grid3x3 className="w-5 h-5" />, href: '/tools/image-pixelate' },
      { name: '网格拼图', desc: '多图网格排列生成拼图', icon: <LayoutGrid className="w-5 h-5" />, href: '/tools/collage-maker' },
      { name: '图片添加文字', desc: '多文字叠加到图片自定义位置', icon: <Type className="w-5 h-5" />, href: '/tools/image-add-text' },
      { name: '模糊背景', desc: '高斯模糊处理适合做背景图', icon: <Droplets className="w-5 h-5" />, href: '/tools/image-blur-bg' },
      { name: '图片分割', desc: '按网格将图片分割成多块', icon: <Scissors className="w-5 h-5" />, href: '/tools/image-split' },
    ],
  },
  {
    id: 'ocr',
    title: '智能识别',
    description: 'OCR文字识别、文档对比、AI智能处理',
    icon: <ScanLine className="w-5 h-5" />,
    gradient: 'from-amber-500 to-orange-500',
    tools: [
      { name: '发票 OCR 识别', desc: '自动提取发票关键信息', icon: <ScanLine className="w-5 h-5" />, href: '/tools/invoice-ocr' },
      { name: '文字识别 OCR', desc: '从图片中提取可编辑文字', icon: <ScanLine className="w-5 h-5" />, href: '/tools/general-ocr' },
      { name: '文档对比', desc: '对比两段文本的差异', icon: <GitCompare className="w-5 h-5" />, href: '/tools/document-compare' },
    ],
  },
  {
    id: 'office',
    title: '办公工具',
    description: '电子签名、合同模板、在线表格、思维导图、简历',
    icon: <Zap className="w-5 h-5" />,
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
      { name: '屏幕录制', desc: '录制屏幕操作，导出视频', icon: <MonitorSpeaker className="w-5 h-5" />, href: '/tools/screen-recorder' },
      { name: '在线画板', desc: '画笔/形状/箭头/文字绘图', icon: <Pen className="w-5 h-5" />, href: '/tools/online-drawing-board' },
      { name: '二维码解码', desc: '上传二维码图片识别内容', icon: <ScanBarcode className="w-5 h-5" />, href: '/tools/qr-code-decoder' },
      { name: '条形码生成', desc: 'Code128/EAN-13/UPC-A等', icon: <ScanBarcode className="w-5 h-5" />, href: '/tools/barcode-generator' },
      { name: '在线便签', desc: '自动保存多条便签管理', icon: <NotepadText className="w-5 h-5" />, href: '/tools/online-notes' },
      { name: '密码生成器', desc: '自定义规则批量生成+强度评估', icon: <KeyRound className="w-5 h-5" />, href: '/tools/password-generator' },
      { name: '思维导图', desc: '拖拽创建和编辑思维导图', icon: <GitBranch className="w-5 h-5" />, href: '/tools/mind-map' },
      { name: '流程图', desc: '绘制流程图导出SVG', icon: <GitBranch className="w-5 h-5" />, href: '/tools/flow-chart' },
      { name: '证件照制作', desc: '一寸/二寸/护照多尺寸背景色', icon: <User className="w-5 h-5" />, href: '/tools/id-photo-maker' },
      { name: '简历生成器', desc: '填写信息生成专业简历', icon: <FileText className="w-5 h-5" />, href: '/tools/resume-generator' },
      { name: '日历生成器', desc: '生成月历导出SVG/PNG', icon: <Calendar className="w-5 h-5" />, href: '/tools/calendar-maker' },
      { name: '随机文本生成', desc: '中英文占位文本批量生成', icon: <Type className="w-5 h-5" />, href: '/tools/lorem-ipsum' },
      { name: '文字统计增强', desc: '字/词/句/段/阅读时间统计', icon: <BarChart3 className="w-5 h-5" />, href: '/tools/word-counter' },
      { name: 'HTTP请求测试', desc: '发送HTTP请求查看响应', icon: <Globe className="w-5 h-5" />, href: '/tools/http-request-test' },
      { name: '公文格式排版', desc: 'GB/T 9704标准公文排版', icon: <FileText className="w-5 h-5" />, href: '/tools/gov-doc-format' },
      { name: '水印纸生成器', desc: '生成带平铺水印的打印纸', icon: <Droplets className="w-5 h-5" />, href: '/tools/watermark-paper' },
      { name: '文字统计', desc: '中英文混合文本全面统计', icon: <BarChart3 className="w-5 h-5" />, href: '/tools/text-statistics' },
      { name: '文件格式查询', desc: '45种常见文件格式信息速查', icon: <FileText className="w-5 h-5" />, href: '/tools/file-format-query' },
    ],
  },
  {
    id: 'dev',
    title: '开发者工具',
    description: 'JSON、Base64、正则、哈希、颜色、时间戳转换',
    icon: <Code2 className="w-5 h-5" />,
    gradient: 'from-rose-500 to-pink-600',
    tools: [
      { name: 'JSON 格式化', desc: '格式化/压缩/校验/树形查看', icon: <FileJson className="w-5 h-5" />, href: '/tools/json-formatter' },
      { name: 'Base64 编解码', desc: '文本和图片的Base64编解码', icon: <Binary className="w-5 h-5" />, href: '/tools/base64-tool' },
      { name: '正则表达式测试', desc: '实时测试正则匹配，常用正则库', icon: <Code2 className="w-5 h-5" />, href: '/tools/regex-tester' },
      { name: '文件哈希计算', desc: 'MD5/SHA系列哈希值计算校验', icon: <Fingerprint className="w-5 h-5" />, href: '/tools/file-hash' },
      { name: '颜色转换器', desc: 'HEX/RGB/HSL/CMYK互转+配色', icon: <Palette className="w-5 h-5" />, href: '/tools/color-converter' },
      { name: '时间戳转换', desc: 'Unix时间戳与日期互转', icon: <ClockIcon className="w-5 h-5" />, href: '/tools/timestamp-converter' },
      { name: 'URL 编解码', desc: 'URL编码/解码+结构解析', icon: <Link className="w-5 h-5" />, href: '/tools/url-encoder-decoder' },
      { name: 'JWT 解析器', desc: '解析Token的Header/Payload', icon: <ShieldCheck className="w-5 h-5" />, href: '/tools/jwt-decoder' },
      { name: '进制转换器', desc: '二进制/八/十/十六进制', icon: <Binary className="w-5 h-5" />, href: '/tools/base-converter' },
    ],
  },
  {
    id: 'text',
    title: '文本处理',
    description: '繁简转换、拼音、去重排序、大小写、替换、编号',
    icon: <Type className="w-5 h-5" />,
    gradient: 'from-teal-500 to-cyan-600',
    tools: [
      { name: '繁简转换', desc: '中文繁体简体互相转换', icon: <Languages className="w-5 h-5" />, href: '/tools/traditional-simplified' },
      { name: '拼音转换', desc: '汉字转拼音(带声调)', icon: <Type className="w-5 h-5" />, href: '/tools/pinyin-converter' },
      { name: '文本去重', desc: '按行去除重复内容', icon: <Layers className="w-5 h-5" />, href: '/tools/text-dedup' },
      { name: '文本排序', desc: '按行升序/降序/随机排列', icon: <ArrowUpDown className="w-5 h-5" />, href: '/tools/text-sort' },
      { name: '大小写转换', desc: '全角半角/大小写/首字母大写', icon: <Type className="w-5 h-5" />, href: '/tools/case-converter' },
      { name: '行号工具', desc: '添加/删除行号', icon: <Hash className="w-5 h-5" />, href: '/tools/line-number-tool' },
      { name: '文本替换', desc: '批量查找替换文本内容', icon: <FileDiff className="w-5 h-5" />, href: '/tools/text-replace' },
      { name: '符号插入', desc: '特殊符号快速插入复制', icon: <NotepadText className="w-5 h-5" />, href: '/tools/symbol-insert' },
      { name: 'Emoji工具', desc: 'Emoji搜索/复制/转换', icon: <Smile className="w-5 h-5" />, href: '/tools/emoji-tool' },
    ],
  },
  {
    id: 'gif',
    title: 'GIF工具',
    description: '逐帧查看、压缩、分割、精灵图合成',
    icon: <Film className="w-5 h-5" />,
    gradient: 'from-fuchsia-500 to-pink-500',
    tools: [
      { name: 'GIF逐帧查看', desc: '逐帧浏览GIF每一帧画面', icon: <Film className="w-5 h-5" />, href: '/tools/gif-frame-viewer' },
      { name: 'GIF压缩', desc: '减小GIF文件体积', icon: <FileDown className="w-5 h-5" />, href: '/tools/gif-compressor' },
      { name: '图片分割', desc: '按网格将图片分割成多块', icon: <Scissors className="w-5 h-5" />, href: '/tools/gif-splitter' },
      { name: '精灵图合成', desc: '多图合成精灵图(游戏素材)', icon: <LayoutGrid className="w-5 h-5" />, href: '/tools/image-to-gif' },
    ],
  },
  {
    id: 'calculator',
    title: '实用计算器',
    description: 'BMI、单位、日期、百分比、汇率换算',
    icon: <Heart className="w-5 h-5" />,
    gradient: 'from-orange-500 to-red-500',
    tools: [
      { name: 'BMI计算器', desc: '身高体重指数计算', icon: <Heart className="w-5 h-5" />, href: '/tools/bmi-calculator' },
      { name: '单位转换器', desc: '长度/重量/面积/体积等', icon: <ArrowRightLeft className="w-5 h-5" />, href: '/tools/unit-converter' },
      { name: '日期计算器', desc: '日期差计算/日期推算', icon: <Calendar className="w-5 h-5" />, href: '/tools/date-calculator' },
      { name: '百分比计算器', desc: '百分比/占比/变化率', icon: <Percent className="w-5 h-5" />, href: '/tools/percentage-calculator' },
      { name: '汇率计算器', desc: '20种货币实时参考汇率', icon: <TrendingUp className="w-5 h-5" />, href: '/tools/exchange-rate-calculator' },
    ],
  },
  {
    id: 'security',
    title: '加密安全',
    description: '文本加密、哈希生成、密码强度检测、密码生成',
    icon: <Lock className="w-5 h-5" />,
    gradient: 'from-slate-600 to-zinc-700',
    tools: [
      { name: '文本加密解密', desc: '凯撒/XOR/Base64/反转', icon: <Lock className="w-5 h-5" />, href: '/tools/text-encrypt' },
      { name: '哈希值生成器', desc: 'SHA-1/256/384/512生成', icon: <Fingerprint className="w-5 h-5" />, href: '/tools/hash-generator' },
      { name: '密码强度检测', desc: '密码安全等级全面评估', icon: <ShieldCheck className="w-5 h-5" />, href: '/tools/password-strength-checker' },
      { name: '随机密码生成', desc: '自定义规则批量生成密码', icon: <KeyRound className="w-5 h-5" />, href: '/tools/random-password-generator' },
    ],
  },
  {
    id: 'color',
    title: '颜色工具',
    description: '配色方案、对比度、渐变、毛玻璃效果',
    icon: <Palette className="w-5 h-5" />,
    gradient: 'from-violet-500 to-purple-600',
    tools: [
      { name: '配色方案生成', desc: '明暗/类似/互补/三角色', icon: <Palette className="w-5 h-5" />, href: '/tools/color-palette' },
      { name: '颜色对比度检测', desc: 'WCAG无障碍对比度检查', icon: <ScanLine className="w-5 h-5" />, href: '/tools/color-contrast-checker' },
      { name: '渐变色生成器', desc: '线性/径向渐变+预设方案', icon: <Paintbrush className="w-5 h-5" />, href: '/tools/gradient-generator' },
      { name: '毛玻璃效果生成', desc: 'Glassmorphism CSS生成', icon: <Layers className="w-5 h-5" />, href: '/tools/glassmorphism-generator' },
    ],
  },
  {
    id: 'audio',
    title: '音频工具',
    description: '裁剪、音量分析、格式转换、合并',
    icon: <Music className="w-5 h-5" />,
    gradient: 'from-sky-500 to-blue-600',
    tools: [
      { name: '音频裁剪', desc: '设置起止时间裁剪音频', icon: <Scissors className="w-5 h-5" />, href: '/tools/audio-trimmer' },
      { name: '音频音量分析', desc: '峰值/RMS/频谱分析', icon: <Volume2 className="w-5 h-5" />, href: '/tools/audio-volume-normalizer' },
      { name: '音频格式转换', desc: 'MP3/WAV/OGG/AAC互转', icon: <ArrowRightLeft className="w-5 h-5" />, href: '/tools/audio-format-converter' },
      { name: '音频合并', desc: '多个音频文件顺序合并', icon: <Layers className="w-5 h-5" />, href: '/tools/audio-merger' },
    ],
  },
  {
    id: 'life',
    title: '生活实用',
    description: '倒计时、番茄钟、秒表、贷款、个税计算',
    icon: <Calendar className="w-5 h-5" />,
    gradient: 'from-amber-500 to-yellow-600',
    tools: [
      { name: '倒计时器', desc: '自定义时长倒计时', icon: <Clock className="w-5 h-5" />, href: '/tools/countdown-timer' },
      { name: '番茄钟', desc: '专注+休息循环计时', icon: <Clock className="w-5 h-5" />, href: '/tools/pomodoro-timer' },
      { name: '秒表', desc: '精确计时+分段记录', icon: <Clock className="w-5 h-5" />, href: '/tools/stopwatch' },
      { name: '贷款计算器', desc: '等额本息/等额本金计算', icon: <Banknote className="w-5 h-5" />, href: '/tools/loan-calculator' },
      { name: '个税计算器', desc: '2024年个税税率计算', icon: <Banknote className="w-5 h-5" />, href: '/tools/tax-calculator' },
    ],
  },
  {
    id: 'video',
    title: '视频工具',
    description: '压缩、格式转换、截帧、提取音频、变速',
    icon: <Film className="w-5 h-5" />,
    gradient: 'from-rose-600 to-red-700',
    tools: [
      { name: '视频压缩', desc: '减小视频文件体积', icon: <Film className="w-5 h-5" />, href: '/tools/video-compressor' },
      { name: '视频格式转换', desc: 'MP4/WebM/AVI/MOV互转', icon: <ArrowRightLeft className="w-5 h-5" />, href: '/tools/video-format-converter' },
      { name: '视频截帧', desc: '截取视频任意帧画面', icon: <Camera className="w-5 h-5" />, href: '/tools/video-frame-capture' },
      { name: '视频提取音频', desc: '从视频中分离音频', icon: <Music className="w-5 h-5" />, href: '/tools/video-to-audio' },
      { name: '视频变速播放', desc: '0.25x~4x速度调节', icon: <Gauge className="w-5 h-5" />, href: '/tools/video-speed-changer' },
      { name: '视频缩略图', desc: '自动提取视频缩略图', icon: <ImageIcon className="w-5 h-5" />, href: '/tools/video-thumbnail' },
      { name: '视频信息查看', desc: '查看视频分辨率/时长/编码', icon: <FileText className="w-5 h-5" />, href: '/tools/video-metadata' },
    ],
  },
]

const stats = [
  { label: '每日处理文件', value: '10,000+', icon: <FileText className="w-5 h-5" /> },
  { label: '注册用户', value: '5,000+', icon: <Users className="w-5 h-5" /> },
  { label: '处理耗时', value: '< 10秒', icon: <Clock className="w-5 h-5" /> },
  { label: '用户评分', value: '4.8/5', icon: <Star className="w-5 h-5" /> },
]

// Count total tools
const totalTools = toolCategories.reduce((sum, cat) => sum + cat.tools.length, 0)

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Filter tools based on search and category
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return toolCategories
      .map((cat) => {
        if (activeCategory !== 'all' && cat.id !== activeCategory) return null
        if (!query) return cat
        const filtered = cat.tools.filter(
          (tool) =>
            tool.name.toLowerCase().includes(query) ||
            tool.desc.toLowerCase().includes(query)
        )
        return filtered.length > 0 ? { ...cat, tools: filtered } : null
      })
      .filter(Boolean) as typeof toolCategories
  }, [searchQuery, activeCategory])

  const hasResults = filteredCategories.length > 0

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
            PDF处理、PPT工具、格式转换、OCR文字识别、图片编辑 --
            {totalTools}+款办公工具，无需安装软件，打开网页即可使用
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

      {/* Search + Category Filter */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工具名称或功能描述..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-navy-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm text-navy-700 placeholder:text-navy-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 text-xs px-2 py-1 rounded bg-navy-50"
              >
                清除
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-navy-500 hover:bg-navy-50 border border-transparent'
              }`}
            >
              全部
            </button>
            {toolCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-navy-500 hover:bg-navy-50 border border-transparent'
                }`}
              >
                {cat.icon}
                {cat.title.replace(/\s*工具.*/, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Search result count */}
        {searchQuery && (
          <p className="mt-3 text-sm text-navy-400">
            {hasResults
              ? `找到 ${filteredCategories.reduce((s, c) => s + c.tools.length, 0)} 个匹配工具`
              : '没有找到匹配的工具'}
          </p>
        )}
      </section>

      {/* Tool Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {hasResults ? (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white`}>
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-navy-800">
                    {cat.title}
                    <span className="ml-2 text-sm font-normal text-navy-400">{cat.tools.length}个工具</span>
                  </h2>
                  <p className="text-xs text-navy-400">{cat.description}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.href}
                    to={tool.href}
                    className="card group no-underline !py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center text-navy-500 group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors shrink-0">
                        {tool.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-navy-700 group-hover:text-brand-700 transition-colors text-sm flex items-center gap-1">
                          {tool.name}
                          <ChevronRight className="w-3.5 h-3.5 text-navy-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                        </h3>
                        <p className="text-xs text-navy-400 mt-0.5 line-clamp-2">{tool.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-navy-200 mx-auto mb-4" />
            <p className="text-navy-400 text-lg">没有找到匹配 "{searchQuery}" 的工具</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
              className="mt-4 text-brand-600 hover:text-brand-700 text-sm font-medium"
            >
              清除搜索，查看全部工具
            </button>
          </div>
        )}
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
                智文办公的所有文档处理均在你的浏览器中本地完成。
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

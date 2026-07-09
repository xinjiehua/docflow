# DocFlow - 全能文档处理工具

一站式在线文档处理工具，支持PDF合并拆分、格式转换、发票OCR识别、批量处理。所有处理在浏览器本地完成，文件不会上传到服务器。

## 功能

### PDF 工具箱
- PDF 合并 - 多个PDF合并为一个文档
- PDF 拆分 - 按页码范围拆分PDF
- PDF 水印 - 添加自定义文字水印
- PDF 压缩 - 减小PDF文件体积

### 格式转换
- PDF 转 Word - 提取PDF中的文字内容
- Word 转 PDF - Word文档转PDF格式
- Excel 转 PDF - 表格转PDF文档
- 图片转 PDF - 多张图片合成PDF

### 智能识别
- 发票 OCR 识别 - 自动提取发票关键信息

### 批量处理
- 批量水印 - 多文件同时添加水印

## 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS
- pdf-lib (PDF处理)
- mammoth (Word解析)
- xlsx (Excel处理)
- Tesseract.js (OCR识别)
- jsPDF (PDF生成)
- Zustand (状态管理)

## 本地开发

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
npm install --ignore-scripts
npm run dev
```

### 构建

```bash
npm run build
```

## 部署

本项目为纯前端应用，可直接部署到以下免费平台：

- **Vercel**: 推荐方案，支持自定义域名
- **GitHub Pages**: 完全免费
- **Netlify**: 免费额度充足
- **Cloudflare Pages**: 全球CDN加速

## 目录结构

```
docflow/
├── src/
│   ├── components/
│   │   ├── layout/       # Header, Footer
│   │   └── tools/        # FileUploader, ToolLayout, ProcessingIndicator
│   ├── pages/
│   │   ├── Home.tsx      # 首页
│   │   ├── Pricing.tsx   # 定价页
│   │   └── tools/        # 各工具页面
│   ├── stores/           # Zustand 状态管理
│   ├── utils/            # 文档处理核心逻辑
│   │   ├── pdf.ts        # PDF合并/拆分/水印
│   │   ├── converter.ts  # 格式转换
│   │   ├── ocr.ts        # OCR识别
│   │   └── download.ts   # 文件下载
│   ├── lib/              # 工具函数
│   ├── App.tsx           # 路由配置
│   └── main.tsx          # 入口
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## License

MIT

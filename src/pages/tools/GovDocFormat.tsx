import { useState } from 'react';
import { Download, Printer, FileText } from 'lucide-react';

export default function GovDocFormat() {
  const [data, setData] = useState({
    orgName: '',
    docNum: '',
    title: '',
    recipient: '',
    body: '',
    signer: '',
    date: '',
    cc: '',
    attachment: '',
  });
  const [preview, setPreview] = useState('');

  const update = (field: string, value: string) => setData(prev => ({ ...prev, [field]: value }));

  const generateHtml = () => {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.title || '公文'}</title>
<style>
  @page{size:A4;margin:37mm 26mm 35mm 26mm}
  body{font-family:'FangSong','仿宋',serif;font-size:16pt;line-height:28pt;color:#000;max-width:210mm;margin:0 auto;padding:20mm 26mm}
  .header{text-align:center;margin-bottom:20pt}
  .org{font-family:'SimHei','黑体',sans-serif;font-size:22pt;font-weight:bold;letter-spacing:2pt;margin-bottom:10pt}
  .docnum{font-family:'FangSong',serif;font-size:16pt;text-align:center;margin-bottom:20pt}
  .line{border-bottom:1px solid #CC0000;margin-bottom:20pt}
  .title{font-family:'SimHei','黑体',sans-serif;font-size:22pt;text-align:center;font-weight:bold;margin:20pt 0;line-height:30pt}
  .recipient{font-family:'FangSong',serif;font-size:16pt;margin-bottom:10pt}
  .body{font-family:'FangSong',serif;font-size:16pt;line-height:28pt;text-indent:2em;margin:10pt 0;white-space:pre-wrap}
  .signer{text-align:right;margin-top:30pt;padding-right:40pt}
  .signer-org{font-family:'FangSong',serif;font-size:16pt;margin-bottom:5pt}
  .signer-date{font-family:'FangSong',serif;font-size:16pt}
  .cc{font-family:'FangSong',serif;font-size:14pt;margin-top:30pt}
  .attach{font-family:'FangSong',serif;font-size:14pt;margin-top:10pt}
  .print{position:fixed;bottom:10pt;left:50%;transform:translateX(-50%)}
  @media print{.print{display:none}}
</style></head><body>
  <div class="header">
    <div class="org">${data.orgName}</div>
    <div class="docnum">${data.docNum || '〔　　〕　　号'}</div>
    <div class="line"></div>
  </div>
  <div class="title">${data.title || '标题'}</div>
  <div class="recipient">${data.recipient}：</div>
  <div class="body">${data.body || '正文内容...'}</div>
  <div class="signer">
    <div class="signer-org">${data.signer}</div>
    <div class="signer-date">${data.date || new Date().toISOString().split('T')[0]}</div>
  </div>
  ${data.cc ? `<div class="cc">抄送：${data.cc}</div>` : ''}
  ${data.attachment ? `<div class="attach">附件：${data.attachment}</div>` : ''}
  <div class="print">
    <button onclick="window.print()" style="padding:8px 20px;background:#2563EB;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px">打印 / 导出PDF</button>
  </div>
</body></html>`;
  };

  const handlePreview = () => setPreview(generateHtml());

  const handleDownload = () => {
    const html = generateHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `公文_${data.title || '未命名'}.html`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">公文格式排版</h2>
      <p className="text-gray-500 mb-4">按国家标准GB/T 9704格式排版公文，支持打印为PDF。</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <input value={data.orgName} onChange={e => update('orgName', e.target.value)} placeholder="发文机关" className="w-full border rounded-lg px-3 py-2" />
          <input value={data.docNum} onChange={e => update('docNum', e.target.value)} placeholder="发文字号（如 XX〔2024〕1号）" className="w-full border rounded-lg px-3 py-2" />
          <input value={data.title} onChange={e => update('title', e.target.value)} placeholder="标题" className="w-full border rounded-lg px-3 py-2 text-lg font-bold" />
          <input value={data.recipient} onChange={e => update('recipient', e.target.value)} placeholder="主送机关" className="w-full border rounded-lg px-3 py-2" />
          <textarea value={data.body} onChange={e => update('body', e.target.value)} placeholder="正文内容（首行自动缩进）" className="w-full border rounded-lg px-3 py-2 h-48 font-serif" />
          <div className="grid grid-cols-2 gap-3">
            <input value={data.signer} onChange={e => update('signer', e.target.value)} placeholder="署名/发文单位" className="border rounded-lg px-3 py-2" />
            <input value={data.date} onChange={e => update('date', e.target.value)} placeholder="日期（YYYY-MM-DD）" className="border rounded-lg px-3 py-2" />
          </div>
          <input value={data.cc} onChange={e => update('cc', e.target.value)} placeholder="抄送单位" className="w-full border rounded-lg px-3 py-2" />
          <input value={data.attachment} onChange={e => update('attachment', e.target.value)} placeholder="附件说明" className="w-full border rounded-lg px-3 py-2" />
          <div className="flex gap-2">
            <button onClick={handlePreview} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">预览</button>
            <button onClick={handleDownload} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">下载HTML</button>
          </div>
        </div>
        {preview && (
          <div className="border rounded-lg overflow-auto bg-white" style={{ height: '85vh' }}>
            <iframe srcDoc={preview} className="w-full h-full" title="公文预览" />
          </div>
        )}
      </div>
    </div>
  );
}

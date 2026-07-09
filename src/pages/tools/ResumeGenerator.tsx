import { useState } from 'react';
import { Download, User, Briefcase, GraduationCap, Phone, Mail, FileText } from 'lucide-react';

export default function ResumeGenerator() {
  const [data, setData] = useState({
    name: '', title: '', phone: '', email: '', address: '',
    summary: '',
    experience: [{ company: '', position: '', period: '', desc: '' }],
    education: [{ school: '', degree: '', period: '' }],
    skills: '',
  });
  const [preview, setPreview] = useState('');
  const [template, setTemplate] = useState<'simple' | 'modern' | 'classic'>('modern');

  const updateField = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addExp = () => {
    setData(prev => ({ ...prev, experience: [...prev.experience, { company: '', position: '', period: '', desc: '' }] }));
  };
  const removeExp = (idx: number) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }));
  };
  const updateExp = (idx: number, field: string, value: string) => {
    setData(prev => ({
      ...prev, experience: prev.experience.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    }));
  };
  const addEdu = () => {
    setData(prev => ({ ...prev, education: [...prev.education, { school: '', degree: '', period: '' }] }));
  };
  const removeEdu = (idx: number) => {
    setData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }));
  };
  const updateEdu = (idx: number, field: string, value: string) => {
    setData(prev => ({
      ...prev, education: prev.education.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    }));
  };

  const generateHtml = () => {
    const colors = { simple: '#333', modern: '#2563EB', classic: '#1a1a1a' };
    const c = colors[template];
    const skillsList = data.skills.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:'Microsoft YaHei','Helvetica Neue',sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#333;line-height:1.6}
      h1{color:${c};margin-bottom:4px;font-size:28px} h2{color:${c};border-bottom:2px solid ${c};padding-bottom:6px;font-size:18px;margin-top:24px}
      .contact{color:#666;font-size:14px;margin-bottom:16px} .section{margin-bottom:20px}
      .item{margin-bottom:12px} .item-title{font-weight:bold;color:#444} .item-sub{color:#777;font-size:14px}
      ul{margin:4px 0;padding-left:20px} li{margin-bottom:2px}
      .skills{display:flex;flex-wrap:wrap;gap:8px} .skill-tag{background:#E0E7FF;color:${c};padding:4px 12px;border-radius:4px;font-size:14px}
    </style></head><body>
      <h1>${data.name || '姓名'}</h1>
      <p style="font-size:16px;color:#555;margin:0">${data.title}</p>
      <div class="contact">${[data.phone, data.email, data.address].filter(Boolean).join(' | ')}</div>
      ${data.summary ? `<div class="section"><h2>个人简介</h2><p>${data.summary}</p></div>` : ''}
      ${data.experience.some(e => e.company) ? `<div class="section"><h2>工作经历</h2>${data.experience.filter(e => e.company).map(e => `<div class="item"><div class="item-title">${e.company} - ${e.position}</div><div class="item-sub">${e.period}</div>${e.desc ? `<p>${e.desc}</p>` : ''}</div>`).join('')}</div>` : ''}
      ${data.education.some(e => e.school) ? `<div class="section"><h2>教育经历</h2>${data.education.filter(e => e.school).map(e => `<div class="item"><div class="item-title">${e.school}</div><div class="item-sub">${e.degree} | ${e.period}</div></div>`).join('')}</div>` : ''}
      ${skillsList.length ? `<div class="section"><h2>专业技能</h2><div class="skills">${skillsList.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>` : ''}
    </body></html>`;
  };

  const handlePreview = () => {
    const html = generateHtml();
    setPreview(html);
  };

  const handleDownloadPdf = async () => {
    const html = generateHtml();
    const { default: jsPDF } = await import('jspdf');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const handleDownloadHtml = () => {
    const html = generateHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${data.name || '简历'}.html`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">简历生成器</h2>
      <div className="flex gap-2 mb-4">
        {(['simple', 'modern', 'classic'] as const).map(t => (
          <button key={t} onClick={() => setTemplate(t)} className={`px-4 py-2 rounded-lg border text-sm ${template === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>
            {{ simple: '简约', modern: '现代', classic: '经典' }[t]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={data.name} onChange={e => updateField('name', e.target.value)} placeholder="姓名" className="border rounded-lg px-3 py-2" />
            <input value={data.title} onChange={e => updateField('title', e.target.value)} placeholder="职位/头衔" className="border rounded-lg px-3 py-2" />
            <input value={data.phone} onChange={e => updateField('phone', e.target.value)} placeholder="电话" className="border rounded-lg px-3 py-2" />
            <input value={data.email} onChange={e => updateField('email', e.target.value)} placeholder="邮箱" className="border rounded-lg px-3 py-2" />
          </div>
          <input value={data.address} onChange={e => updateField('address', e.target.value)} placeholder="地址" className="w-full border rounded-lg px-3 py-2" />
          <textarea value={data.summary} onChange={e => updateField('summary', e.target.value)} placeholder="个人简介" className="w-full border rounded-lg px-3 py-2 h-20" />
          <div>
            <div className="flex items-center gap-2 mb-2"><Briefcase size={18} /><span className="font-medium">工作经历</span></div>
            {data.experience.map((exp, idx) => (
              <div key={idx} className="border rounded-lg p-3 mb-2 space-y-2">
                <div className="flex gap-2">
                  <input value={exp.company} onChange={e => updateExp(idx, 'company', e.target.value)} placeholder="公司" className="flex-1 border rounded px-2 py-1 text-sm" />
                  <input value={exp.position} onChange={e => updateExp(idx, 'position', e.target.value)} placeholder="职位" className="flex-1 border rounded px-2 py-1 text-sm" />
                  <button onClick={() => removeExp(idx)} className="text-red-500 text-sm">删除</button>
                </div>
                <input value={exp.period} onChange={e => updateExp(idx, 'period', e.target.value)} placeholder="时间段 (如 2020-2023)" className="w-full border rounded px-2 py-1 text-sm" />
                <textarea value={exp.desc} onChange={e => updateExp(idx, 'desc', e.target.value)} placeholder="工作描述" className="w-full border rounded px-2 py-1 text-sm h-16" />
              </div>
            ))}
            <button onClick={addExp} className="text-blue-600 text-sm">+ 添加工作经历</button>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2"><GraduationCap size={18} /><span className="font-medium">教育经历</span></div>
            {data.education.map((edu, idx) => (
              <div key={idx} className="border rounded-lg p-3 mb-2 flex gap-2 items-center">
                <input value={edu.school} onChange={e => updateEdu(idx, 'school', e.target.value)} placeholder="学校" className="flex-1 border rounded px-2 py-1 text-sm" />
                <input value={edu.degree} onChange={e => updateEdu(idx, 'degree', e.target.value)} placeholder="学历/专业" className="flex-1 border rounded px-2 py-1 text-sm" />
                <input value={edu.period} onChange={e => updateEdu(idx, 'period', e.target.value)} placeholder="时间" className="w-32 border rounded px-2 py-1 text-sm" />
                <button onClick={() => removeEdu(idx)} className="text-red-500 text-sm">删除</button>
              </div>
            ))}
            <button onClick={addEdu} className="text-blue-600 text-sm">+ 添加教育经历</button>
          </div>
          <textarea value={data.skills} onChange={e => updateField('skills', e.target.value)} placeholder="技能 (用逗号分隔)" className="w-full border rounded-lg px-3 py-2 h-20" />
          <div className="flex gap-2">
            <button onClick={handlePreview} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">预览</button>
            <button onClick={handleDownloadHtml} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">下载HTML</button>
            <button onClick={handleDownloadPdf} className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">打印PDF</button>
          </div>
        </div>
        {preview && (
          <div className="border rounded-lg overflow-auto" style={{ height: '80vh' }}>
            <iframe srcDoc={preview} className="w-full h-full" title="简历预览" />
          </div>
        )}
      </div>
    </div>
  );
}

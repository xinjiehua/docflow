import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

const ZH_PARAGRAPHS = [
  '文档的内容需要经过精心编排和反复修改，以确保信息的准确性和可读性。在实际工作中，我们经常需要生成一些占位文本来填充模板或测试布局效果。这些文本虽然不具备实际意义，但在排版设计和页面开发过程中发挥着重要作用。',
  '在现代办公环境中，文档处理是一项基本技能。无论是撰写报告、制作演示文稿，还是编写技术文档，都需要掌握一定的文字处理技巧。高质量的文档不仅内容准确，还应当格式规范、层次清晰。',
  '数据分析和可视化已经成为企业决策的重要依据。通过图表和统计数据，管理者可以更直观地了解业务状况，发现潜在的问题和机会。掌握数据分析工具的使用方法，对于提升工作效率至关重要。',
  '项目管理涉及多个方面的协调与统筹。从任务分配到进度跟踪，从资源调配到风险控制，每一个环节都需要精心规划。良好的项目管理能够确保团队高效协作，按时交付高质量的成果。',
  '互联网技术的发展深刻改变了人们的工作方式。远程办公、在线协作、云计算等技术的广泛应用，使得跨地域团队合作成为可能。了解和掌握这些技术，有助于提升个人的职业竞争力。',
  '用户界面设计需要考虑用户体验的各个方面。良好的界面设计应当简洁直观，操作便捷，同时兼顾美观性和功能性。设计师需要在满足业务需求的前提下，尽可能提供流畅的使用体验。',
  '信息安全是当前社会面临的重要议题。随着数字化程度的不断提高，数据泄露和网络攻击的风险也在增加。采取有效的安全措施，保护个人隐私和企业数据，是每个组织必须重视的问题。',
  '人工智能技术正在逐步渗透到各个行业领域。从自然语言处理到图像识别，从智能推荐到自动化决策，AI技术的应用场景越来越广泛。学习和理解AI技术，对于把握未来发展趋势具有重要意义。',
];

const EN_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

export default function LoremIpsum() {
  const [type, setType] = useState<'zh' | 'en'>('zh');
  const [count, setCount] = useState(3);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (type === 'zh') {
      const result: string[] = [];
      for (let i = 0; i < count; i++) {
        result.push(ZH_PARAGRAPHS[i % ZH_PARAGRAPHS.length]);
      }
      setText(result.join('\n\n'));
    } else {
      const result: string[] = [];
      for (let i = 0; i < count; i++) {
        const words: string[] = [];
        const wordCount = 60 + Math.floor(Math.random() * 40);
        for (let j = 0; j < wordCount; j++) {
          words.push(EN_WORDS[Math.floor(Math.random() * EN_WORDS.length)]);
        }
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        result.push(words.join(' ') + '.');
      }
      setText(result.join('\n\n'));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = type === 'zh' ? 'txt' : 'txt';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lorem-ipsum.${ext}`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">随机文本生成器</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button onClick={() => setType('zh')} className={`px-4 py-2 rounded-lg border ${type === 'zh' ? 'bg-blue-600 text-white' : 'bg-white'}`}>中文</button>
            <button onClick={() => setType('en')} className={`px-4 py-2 rounded-lg border ${type === 'en' ? 'bg-blue-600 text-white' : 'bg-white'}`}>英文</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">段落数：</span>
            <input type="number" min="1" max="20" value={count} onChange={e => setCount(Number(e.target.value))} className="w-16 border rounded px-2 py-1" />
          </div>
          <button onClick={generate} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            <RefreshCw size={18} />生成
          </button>
        </div>
        {text && (
          <>
            <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{text}</pre>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Copy size={18} />{copied ? '已复制' : '复制文本'}
              </button>
              <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <Download size={18} />下载TXT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

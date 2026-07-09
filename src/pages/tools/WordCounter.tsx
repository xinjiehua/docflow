import { useState } from 'react';
import { Type, Hash, AlignLeft } from 'lucide-react';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'input' | 'file'>('input');
  const [fileName, setFileName] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setText(reader.result as string);
      setMode('file');
    };
    reader.readAsText(file);
  };

  const stats = {
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split(/\n/).length : 0,
    paragraphs: text.trim() ? text.trim().split(/\n\s*\n/).length : 0,
    sentences: text.trim() ? text.split(/[.!?。！？]+/).filter(Boolean).length : 0,
    chineseChars: (text.match(/[\u4e00-\u9fff]/g) || []).length,
    chineseWords: Math.ceil((text.match(/[\u4e00-\u9fff]/g) || []).length * 0.7),
    englishWords: (text.match(/[a-zA-Z]+/g) || []).length,
    numbers: (text.match(/\d+/g) || []).length,
    punctuation: (text.match(/[^\w\s\u4e00-\u9fff]/g) || []).length,
    readingTimeMin: Math.ceil((text.match(/[\u4e00-\u9fff]/g) || []).length * 0.7 + (text.match(/[a-zA-Z]+/g) || []).length) / 250 || 0,
    speakingTimeMin: Math.ceil(((text.match(/[\u4e00-\u9fff]/g) || []).length * 0.7 + (text.match(/[a-zA-Z]+/g) || []).length) / 150) || 0,
  };

  const statItems = [
    { label: '总字符数', value: stats.chars, icon: Type },
    { label: '字符数(不含空格)', value: stats.charsNoSpace, icon: Type },
    { label: '英文单词数', value: stats.englishWords, icon: Hash },
    { label: '中文字数(约)', value: stats.chineseWords, icon: AlignLeft },
    { label: '中文字符数', value: stats.chineseChars, icon: Hash },
    { label: '数字个数', value: stats.numbers, icon: Hash },
    { label: '标点符号', value: stats.punctuation, icon: Type },
    { label: '行数', value: stats.lines, icon: AlignLeft },
    { label: '段落数', value: stats.paragraphs, icon: AlignLeft },
    { label: '句子数', value: stats.sentences, icon: Type },
    { label: '预计阅读时间', value: `${stats.readingTimeMin} 分钟`, icon: Type },
    { label: '预计朗读时间', value: `${stats.speakingTimeMin} 分钟`, icon: Type },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">文字统计</h2>
      <div className="space-y-4">
        <div className="flex gap-2 mb-2">
          <button onClick={() => setMode('input')} className={`px-4 py-2 rounded-lg border text-sm ${mode === 'input' ? 'bg-blue-600 text-white' : 'bg-white'}`}>输入文本</button>
          <label className={`px-4 py-2 rounded-lg border text-sm cursor-pointer ${mode === 'file' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
            上传文件
            <input type="file" accept=".txt,.md,.csv,.json,.html,.xml" onChange={handleFile} className="hidden" />
          </label>
          {fileName && <span className="text-gray-500 text-sm self-center">{fileName}</span>}
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full h-48 p-3 border rounded-lg font-mono text-sm resize-y"
          placeholder="在此输入或粘贴文本..."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {statItems.map(item => (
            <div key={item.label} className="bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <item.icon size={14} />
                {item.label}
              </div>
              <div className="text-2xl font-bold text-gray-800">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>字符频率 TOP 10：</strong>
            {text ? (() => {
              const freq: Record<string, number> = {};
              Array.from(text.replace(/\s/g, '')).forEach(ch => { freq[ch] = (freq[ch] || 0) + 1; });
              return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([ch, cnt]) => `"${ch}"(${cnt})`).join(', ');
            })()
            : '请先输入文本'}
          </p>
        </div>
      </div>
    </div>
  );
}

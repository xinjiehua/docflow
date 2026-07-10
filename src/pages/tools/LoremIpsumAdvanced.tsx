import { useState } from 'react';
import { Type } from 'lucide-react';

const ZH_SENTENCES = [
  '在这漫长的旅途中，每一步都承载着过去与未来的交汇。', '智慧如同星辰，在黑暗中指引前行的方向。',
  '山间的溪流汇入大海，正如微小的努力汇聚成伟大的成就。', '春风拂面，带走了冬日的寒意，带来了新的希望。',
  '在知识的海洋中遨游，每一个发现都是一次心灵的触动。', '时间是最公正的裁判，它不偏不倚地对待每一个人。',
  '技术改变世界，而世界也在不断塑造着技术的未来。', '创意是有限的资源，而想象力是无限的。',
  '每一次尝试都是通往成功的一块垫脚石。', '生活中的美好，往往隐藏在最平凡的事物之中。',
  '清晨的第一缕阳光，温暖着大地上的每一个角落。', '书是人类进步的阶梯，每一页都蕴含着无穷的智慧。',
  '沟通是一座桥梁，连接着人与人之间的理解与信任。', '在困境中寻找机遇，是通往成功的最佳路径。',
  '数据是新时代的石油，驱动着世界的运转。', '坚持的力量，往往比天赋更能决定一个人的未来。',
];

const EN_SENTENCES = [
  'The quick brown fox jumps over the lazy dog near the riverbank.', 'Knowledge is power, and power comes from understanding the world around us.',
  'Technology has transformed the way we live, work, and communicate.', 'In the heart of every challenge lies an opportunity for growth.',
  'The best way to predict the future is to create it yourself.', 'Creativity is intelligence having fun with new possibilities.',
  'Every great achievement was once considered impossible.', 'The journey of a thousand miles begins with a single step.',
  'Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Innovation distinguishes between a leader and a follower.',
  'Time flies like an arrow; fruit flies like a banana.', 'To be or not to be, that is the question we all face.',
];

export default function LoremIpsumAdvanced() {
  const [count, setCount] = useState('3');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [type, setType] = useState<'paragraph' | 'sentence' | 'word'>('paragraph');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const n = parseInt(count) || 1;
    const pool = lang === 'zh' ? ZH_SENTENCES : EN_SENTENCES;
    let result = '';
    if (type === 'paragraph') {
      for (let i = 0; i < n; i++) {
        const para: string[] = [];
        const len = 3 + Math.floor(Math.random() * 4);
        for (let j = 0; j < len; j++) para.push(pool[Math.floor(Math.random() * pool.length)]);
        result += para.join('') + '\n\n';
      }
    } else if (type === 'sentence') {
      for (let i = 0; i < n; i++) result += pool[Math.floor(Math.random() * pool.length)] + '\n';
    } else {
      const all = pool.join(' ');
      const words = all.split(/\s+/);
      for (let i = 0; i < n; i++) result += (words[Math.floor(Math.random() * words.length)] + ' ');
    }
    setOutput(result.trim());
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Type className="w-5 h-5" /> 高级随机文本生成</h2>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-sm text-navy-600">数量</label><input type="number" min="1" max="100" value={count} onChange={e => setCount(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>
          <div><label className="text-sm text-navy-600">语言</label>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setLang('zh')} className={`flex-1 px-3 py-2 rounded-lg text-sm ${lang === 'zh' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600'}`}>中文</button>
              <button onClick={() => setLang('en')} className={`flex-1 px-3 py-2 rounded-lg text-sm ${lang === 'en' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600'}`}>英文</button>
            </div>
          </div>
          <div><label className="text-sm text-navy-600">类型</label>
            <div className="flex gap-2 mt-1">
              {(['paragraph', 'sentence', 'word'] as const).map(t => <button key={t} onClick={() => setType(t)} className={`flex-1 px-2 py-2 rounded-lg text-xs ${type === t ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600'}`}>{t === 'paragraph' ? '段落' : t === 'sentence' ? '句子' : '单词'}</button>)}
            </div>
          </div>
        </div>
        <button onClick={generate} className="btn-primary text-sm">生成</button>
        {output && (
          <div className="relative">
            <pre className="bg-navy-50 rounded-xl p-4 text-sm text-navy-700 whitespace-pre-wrap max-h-80 overflow-y-auto">{output}</pre>
            <button onClick={copy} className="absolute top-2 right-2 px-2 py-1 text-xs bg-white text-brand-600 rounded shadow border border-navy-200">{copied ? '已复制' : '复制'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

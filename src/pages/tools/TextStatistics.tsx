import { useState, useCallback } from 'react';

interface TextStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
  chineseChars: number;
  englishChars: number;
  numbers: number;
  punctuation: number;
  avgWordLength: number;
  avgSentenceLength: number;
  readingTime: number;
  speakingTime: number;
  topWords: { word: string; count: number }[];
  topChars: { char: string; count: number }[];
}

function calculateStats(text: string): TextStats {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const numbers = (text.match(/[0-9]/g) || []).length;
  const punctuation = (text.match(/[^\w\s\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // Words: Chinese chars count as words, English words split by space
  const englishWords = text.match(/[a-zA-Z]+/g) || [];
  const words = chineseChars + englishWords.length;

  const sentences = text.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim().length > 0 ? 1 : 0);
  const lines = text.split('\n').length;

  const bytes = new Blob([text]).size;

  const wordList = text.toLowerCase().match(/[a-zA-Z]+/g) || [];
  const avgWordLength = wordList.length > 0 ? wordList.reduce((sum, w) => sum + w.length, 0) / wordList.length : 0;
  const avgSentenceLength = sentences > 0 ? words / sentences : 0;

  // Reading speed: Chinese ~400 chars/min, English ~200 words/min
  const readingTime = (chineseChars / 400) + (englishWords.length / 200);
  // Speaking speed: Chinese ~250 chars/min, English ~150 words/min
  const speakingTime = (chineseChars / 250) + (englishWords.length / 150);

  // Top words
  const wordFreq: Record<string, number> = {};
  wordList.forEach(w => {
    if (w.length >= 2) wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // Top chars
  const charFreq: Record<string, number> = {};
  text.replace(/\s/g, '').split('').forEach(c => {
    charFreq[c] = (charFreq[c] || 0) + 1;
  });
  const topChars = Object.entries(charFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([char, count]) => ({ char, count }));

  return {
    chars,
    charsNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    bytes,
    chineseChars,
    englishChars,
    numbers,
    punctuation,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    readingTime: Math.round(readingTime * 10) / 10,
    speakingTime: Math.round(speakingTime * 10) / 10,
    topWords,
    topChars,
  };
}

function formatTime(minutes: number): string {
  if (minutes < 1) return '不到1分钟';
  if (minutes < 60) return `${Math.round(minutes)}分钟`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}

export default function TextStatistics() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<TextStats | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'detail' | 'words' | 'chars'>('basic');

  const handleAnalyze = useCallback(() => {
    if (!text.trim()) return;
    setStats(calculateStats(text));
  }, [text]);

  const handleClear = () => {
    setText('');
    setStats(null);
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setText(clipText);
    } catch {
      // clipboard access denied
    }
  };

  const statCard = (label: string, value: string | number, unit?: string) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-800">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            文字统计工具
          </h1>
          <p className="text-gray-500 mt-2">全面统计文本的各项指标，支持中英文混合分析</p>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-600">输入或粘贴文本</label>
            <div className="flex gap-2">
              <button
                onClick={handlePaste}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                粘贴
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入或粘贴要统计的文本内容..."
            className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-400">
              当前字数：{text.length.toLocaleString()}
            </span>
            <div className="flex gap-3">
              <input
                type="file"
                accept=".txt,.md,.csv,.log,.json,.xml,.html,.css,.js,.ts,.py,.java,.c,.cpp"
                className="hidden"
                id="file-upload-stats"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setText(ev.target?.result as string || '');
                    reader.readAsText(file);
                  }
                }}
              />
              <label htmlFor="file-upload-stats" className="cursor-pointer px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                上传文件
              </label>
              <button
                onClick={handleAnalyze}
                disabled={!text.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                开始统计
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {stats && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              {[
                { key: 'basic' as const, label: '基本统计' },
                { key: 'detail' as const, label: '详细分析' },
                { key: 'words' as const, label: '词频统计' },
                { key: 'chars' as const, label: '字符频率' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Basic Stats */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCard('总字符数', stats.chars)}
                {statCard('字符数(不含空格)', stats.charsNoSpaces)}
                {statCard('总字数', stats.words)}
                {statCard('句子数', stats.sentences)}
                {statCard('段落数', stats.paragraphs)}
                {statCard('行数', stats.lines)}
                {statCard('字节数', stats.bytes)}
                {statCard('标点符号', stats.punctuation)}
              </div>
            )}

            {/* Detail Stats */}
            {activeTab === 'detail' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">字符构成</h3>
                  <div className="space-y-4">
                    {[
                      { label: '中文字符', value: stats.chineseChars, total: stats.charsNoSpaces, color: 'bg-red-500' },
                      { label: '英文字母', value: stats.englishChars, total: stats.charsNoSpaces, color: 'bg-blue-500' },
                      { label: '数字', value: stats.numbers, total: stats.charsNoSpaces, color: 'bg-green-500' },
                      { label: '标点符号', value: stats.punctuation, total: stats.charsNoSpaces, color: 'bg-yellow-500' },
                    ].map(item => {
                      const pct = stats.charsNoSpaces > 0 ? (item.value / stats.charsNoSpaces) * 100 : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{item.label}</span>
                            <span className="font-medium text-gray-800">{item.value.toLocaleString()} ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">阅读与朗读</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-3xl mb-2">📖</div>
                        <div className="text-sm text-gray-500 mb-1">预计阅读时间</div>
                        <div className="text-lg font-bold text-blue-700">{formatTime(stats.readingTime)}</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-3xl mb-2">🎤</div>
                        <div className="text-sm text-gray-500 mb-1">预计朗读时间</div>
                        <div className="text-lg font-bold text-purple-700">{formatTime(stats.speakingTime)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">平均指标</h3>
                    <div className="space-y-3">
                      {statCard('平均词长', stats.avgWordLength, '字母')}
                      {statCard('平均句长', stats.avgSentenceLength, '字/句')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Word Frequency */}
            {activeTab === 'words' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  高频词汇 (Top {stats.topWords.length})
                </h3>
                {stats.topWords.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">暂无英文词汇数据（至少需要2个字母的英文单词）</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stats.topWords.map((item, idx) => (
                      <div key={item.word} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                          idx < 3 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-mono font-medium text-gray-700 flex-1">{item.word}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(item.count / stats.topWords[0].count) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Character Frequency */}
            {activeTab === 'chars' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  字符频率 (Top {stats.topChars.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stats.topChars.map((item, idx) => (
                    <div key={item.char} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                        idx < 3 ? 'bg-purple-500' : 'bg-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-mono text-lg font-bold text-gray-700 w-8 text-center">
                        {item.char === ' ' ? '␣' : item.char}
                      </span>
                      <div className="flex-1">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(item.count / stats.topChars[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Tips */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>支持中英文混合文本统计 | 阅读速度：中文约400字/分钟，英文约200词/分钟</p>
        </div>
      </div>
    </div>
  );
}

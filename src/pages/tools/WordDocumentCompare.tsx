import { useState } from 'react';

interface DiffLine { left: string; right: string; type: 'same' | 'added' | 'removed' | 'modified'; }

export default function WordDocumentCompare() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffs, setDiffs] = useState<DiffLine[]>([]);
  const [comparing, setComparing] = useState(false);
  const [stats, setStats] = useState({ same: 0, added: 0, removed: 0, modified: 0 });
  const [diffAlgo, setDiffAlgo] = useState<'line' | 'word'>('line');
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);

  const handleFile = async (num: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (num === 1) { setFile1(f); setName1(f.name); }
    else { setFile2(f); setName2(f.name); }
    const buf = await f.arrayBuffer();
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer: buf });
      if (num === 1) setText1(result.value);
      else setText2(result.value);
    } catch {
      // fallback to text
      const text = await f.text();
      if (num === 1) setText1(text);
      else setText2(text);
    }
  };

  const compare = () => {
    if (!text1 && !text2) return;
    setComparing(true);
    setTimeout(() => {
      const result = diffAlgo === 'line' ? compareByLine(text1, text2) : compareByWord(text1, text2);
      setDiffs(result);
      const s = { same: 0, added: 0, removed: 0, modified: 0 };
      result.forEach(d => s[d.type]++);
      setStats(s);
      setComparing(false);
    }, 100);
  };

  const compareByLine = (t1: string, t2: string): DiffLine[] => {
    const lines1 = t1.split('\n');
    const lines2 = t2.split('\n');
    const result: DiffLine[] = [];
    const maxLen = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLen; i++) {
      const l = lines1[i] ?? '';
      const r = lines2[i] ?? '';
      if (i >= lines1.length) result.push({ left: '', right: r, type: 'added' });
      else if (i >= lines2.length) result.push({ left: l, right: '', type: 'removed' });
      else if (l === r) result.push({ left: l, right: r, type: 'same' });
      else result.push({ left: l, right: r, type: 'modified' });
    }
    return result;
  };

  const compareByWord = (t1: string, t2: string): DiffLine[] => {
    const words1 = t1.split(/(\s+)/);
    const words2 = t2.split(/(\s+)/);
    const lcs = findLCS(words1, words2);
    const result: DiffLine[] = [];
    let i = 0, j = 0;
    while (i < lcs.length || j < words2.length) {
      if (j < words2.length && i < lcs.length && words2[j] === lcs[i]) {
        const leftWords: string[] = [];
        while (i < lcs.length && j < words2.length && words2[j] === lcs[i]) { leftWords.push(lcs[i]); i++; j++; }
        result.push({ left: '', right: leftWords.join(''), type: 'same' });
      } else {
        const added: string[] = [];
        while (j < words2.length && (i >= lcs.length || words2[j] !== lcs[i])) { added.push(words2[j]); j++; }
        if (added.length > 0) result.push({ left: '', right: added.join(''), type: 'added' });
      }
    }
    return result;
  };

  const findLCS = (a: string[], b: string[]): string[] => {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
    const result: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { result.unshift(a[i - 1]); i--; j--; }
      else if (dp[i - 1][j] > dp[i][j - 1]) i--;
      else j--;
    }
    return result;
  };

  const swapFiles = () => {
    setFile1(file2); setFile2(file1);
    setName1(name2); setName2(name1);
    setText1(text2); setText2(text1);
  };

  const filteredDiffs = showOnlyDiff ? diffs.filter(d => d.type !== 'same') : diffs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📄 Word 文档对比</h1>
          <p className="text-gray-500 mt-2">上传两个Word文件，逐段对比差异，保留格式信息</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">原始文档</h3>
              <button onClick={swapFiles} className="text-sm text-blue-500 hover:underline">⇄ 交换</button>
            </div>
            <label className="block w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 transition-colors mb-3">
              <span className="text-2xl block mb-1">📄</span>
              <p className="text-sm text-gray-600">{name1 || '点击上传 Word 文件'}</p>
              <input type="file" accept=".docx,.doc,.txt" onChange={e => handleFile(1, e)} className="hidden" />
            </label>
            {text1 && (
              <textarea value={text1} onChange={e => setText1(e.target.value)} rows={8}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-3">修改文档</h3>
            <label className="block w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 transition-colors mb-3">
              <span className="text-2xl block mb-1">📄</span>
              <p className="text-sm text-gray-600">{name2 || '点击上传 Word 文件'}</p>
              <input type="file" accept=".docx,.doc,.txt" onChange={e => handleFile(2, e)} className="hidden" />
            </label>
            {text2 && (
              <textarea value={text2} onChange={e => setText2(e.target.value)} rows={8}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            {(['line', 'word'] as const).map(a => (
              <button key={a} onClick={() => setDiffAlgo(a)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${diffAlgo === a ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {a === 'line' ? '逐行对比' : '逐词对比'}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={showOnlyDiff} onChange={e => setShowOnlyDiff(e.target.checked)} className="accent-blue-600" />
            仅显示差异
          </label>
          <button onClick={compare} disabled={comparing || (!text1 && !text2)}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors">
            {comparing ? '对比中...' : '开始对比'}
          </button>
        </div>

        {diffs.length > 0 && (
          <>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: '相同', count: stats.same, color: 'bg-gray-100 text-gray-600' },
                { label: '新增', count: stats.added, color: 'bg-green-100 text-green-700' },
                { label: '删除', count: stats.removed, color: 'bg-red-100 text-red-700' },
                { label: '修改', count: stats.modified, color: 'bg-yellow-100 text-yellow-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-lg p-3 text-center`}>
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm font-mono">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-gray-600 w-12">#</th>
                      <th className="px-3 py-2 text-left text-gray-600 w-1/2">原始文档</th>
                      <th className="px-3 py-2 text-left text-gray-600 w-1/2">修改文档</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDiffs.map((d, i) => (
                      <tr key={i} className={
                        d.type === 'same' ? 'bg-white' :
                        d.type === 'added' ? 'bg-green-50' :
                        d.type === 'removed' ? 'bg-red-50' : 'bg-yellow-50'
                      }>
                        <td className="px-3 py-1.5 text-gray-400 border-b border-gray-100">{i + 1}</td>
                        <td className={`px-3 py-1.5 border-b border-gray-100 whitespace-pre-wrap break-all ${
                          d.type === 'removed' ? 'bg-red-100 line-through text-red-700' :
                          d.type === 'modified' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500'
                        }`}>{d.left || '-'}</td>
                        <td className={`px-3 py-1.5 border-b border-gray-100 whitespace-pre-wrap break-all ${
                          d.type === 'added' ? 'bg-green-100 text-green-700' :
                          d.type === 'modified' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500'
                        }`}>{d.right || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

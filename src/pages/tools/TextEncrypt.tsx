import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function TextEncrypt() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'caesar' | 'xor' | 'base64' | 'reverse'>('caesar');
  const [shift, setShift] = useState('3');
  const [copied, setCopied] = useState(false);

  const encrypt = () => {
    let result = '';
    if (mode === 'caesar') {
      const s = parseInt(shift) || 0;
      result = [...text].map(ch => {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode((code - 65 + s) % 26 + 65);
        if (code >= 97 && code <= 122) return String.fromCharCode((code - 97 + s) % 26 + 97);
        return ch;
      }).join('');
    } else if (mode === 'xor') {
      const k = key || 'default';
      result = [...text].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ k.charCodeAt(i % k.length))).join('');
      result = btoa(result);
    } else if (mode === 'base64') {
      result = btoa(unescape(encodeURIComponent(text)));
    } else {
      result = [...text].reverse().join('');
    }
    setOutput(result);
  };

  const decrypt = () => {
    let result = '';
    if (mode === 'caesar') {
      const s = parseInt(shift) || 0;
      result = [...text].map(ch => {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode((code - 65 - s + 26) % 26 + 65);
        if (code >= 97 && code <= 122) return String.fromCharCode((code - 97 - s + 26) % 26 + 97);
        return ch;
      }).join('');
    } else if (mode === 'xor') {
      try {
        const decoded = atob(text);
        const k = key || 'default';
        result = [...decoded].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ k.charCodeAt(i % k.length))).join('');
      } catch { result = '解密失败：无效的输入'; }
    } else if (mode === 'base64') {
      try { result = decodeURIComponent(escape(atob(text))); } catch { result = '解密失败：无效的Base64'; }
    } else {
      result = [...text].reverse().join('');
    }
    setOutput(result);
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const modes = [
    { id: 'caesar' as const, label: '凯撒密码', desc: '字母位移加密' },
    { id: 'xor' as const, label: 'XOR加密', desc: '密钥异或加密' },
    { id: 'base64' as const, label: 'Base64', desc: 'Base64编码' },
    { id: 'reverse' as const, label: '反转', desc: '文本反转' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Lock className="w-5 h-5" /> 文本加密解密</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {modes.map(m => <button key={m.id} onClick={() => setMode(m.id)} className={`px-3 py-2 rounded-lg text-xs ${mode === m.id ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-navy-50 text-navy-600 border border-transparent'}`}>{m.label}<br /><span className="text-navy-400 text-[10px]">{m.desc}</span></button>)}
        </div>
        {(mode === 'caesar') && <div><label className="text-sm text-navy-600">位移量</label><input type="number" value={shift} onChange={e => setShift(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>}
        {(mode === 'xor') && <div><label className="text-sm text-navy-600">密钥</label><input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="输入加密密钥" className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm" /></div>}
        <div><label className="text-sm text-navy-600">输入文本</label><textarea value={text} onChange={e => setText(e.target.value)} rows={5} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm resize-y" /></div>
        <div className="flex gap-2">
          <button onClick={encrypt} className="btn-primary text-sm">加密</button>
          <button onClick={decrypt} className="btn-secondary text-sm">解密</button>
        </div>
        {output && (
          <div>
            <label className="text-sm text-navy-600">结果</label>
            <div className="relative mt-1">
              <textarea value={output} readOnly rows={5} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm bg-navy-50 resize-y" />
              <button onClick={copy} className="absolute top-2 right-2 px-2 py-1 text-xs bg-brand-50 text-brand-600 rounded">{copied ? '已复制' : '复制'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

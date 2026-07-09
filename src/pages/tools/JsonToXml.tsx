import { useState, useRef } from 'react';
import { Upload, Download, Code } from 'lucide-react';

export default function JsonToXml() {
  const [xmlOutput, setXmlOutput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const jsonToXml = (obj: unknown, rootTag = 'root'): string => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>`;
    xml += convertNode(obj, 'item');
    xml += `\n</${rootTag}>`;
    return xml;
  };

  const convertNode = (obj: unknown, tag: string, indent = '\n  '): string => {
    if (obj === null || obj === undefined) return `${indent}<${tag}/>`;
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return `${indent}<${tag}>${String(obj).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${tag}>`;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => convertNode(item, tag, indent)).join('');
    }
    if (typeof obj === 'object') {
      const rec = obj as Record<string, unknown>;
      let xml = `${indent}<${tag}>`;
      for (const [key, val] of Object.entries(rec)) {
        xml += convertNode(val, key, indent + '  ');
      }
      xml += `${indent}</${tag}>`;
      return xml;
    }
    return `${indent}<${tag}/>`;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.json$/i, ''));
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setJsonInput(text);
      try {
        const obj = JSON.parse(text);
        setError('');
        setXmlOutput(jsonToXml(obj));
      } catch (err) {
        setError('JSON格式错误: ' + (err as Error).message);
        setXmlOutput('');
      }
    };
    reader.readAsText(file);
  };

  const handleConvert = () => {
    const blob = new Blob([xmlOutput], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'converted'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">JSON转XML</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept=".json" ref={fileRef} onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择JSON文件，或直接粘贴JSON内容</p>
        </div>
        <textarea
          value={jsonInput}
          onChange={e => {
            setJsonInput(e.target.value);
            try {
              const obj = JSON.parse(e.target.value);
              setError('');
              setXmlOutput(jsonToXml(obj));
            } catch (err) {
              setError('JSON格式错误');
              setXmlOutput('');
            }
          }}
          className="w-full h-40 p-3 border rounded-lg font-mono text-sm"
          placeholder="粘贴JSON内容..."
        />
        {error && <p className="text-red-500">{error}</p>}
        {xmlOutput && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code size={20} />
              <span className="font-medium">XML输出</span>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm">{xmlOutput}</pre>
            <button onClick={handleConvert} className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              <Download size={20} />
              下载XML文件
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

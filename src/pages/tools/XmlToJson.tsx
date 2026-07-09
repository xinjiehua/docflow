import { useState, useRef } from 'react';
import { Upload, Download, Code } from 'lucide-react';

export default function XmlToJson() {
  const [jsonOutput, setJsonOutput] = useState('');
  const [xmlInput, setXmlInput] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const parseXml = (xmlStr: string): unknown => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) throw new Error('XML格式错误: ' + errorNode.textContent);
    return xmlNodeToJson(doc.documentElement);
  };

  const xmlNodeToJson = (node: Element): unknown => {
    if (node.nodeType === 3) return node.textContent?.trim() || '';
    if (!node.attributes || node.attributes.length === 0) {
      const children = Array.from(node.children);
      if (children.length === 0) return node.textContent?.trim() || '';
      if (children.length === 1 && children[0].tagName === node.tagName) {
        return [xmlNodeToJson(children[0])];
      }
      const result: Record<string, unknown> = {};
      for (const child of children) {
        const val = xmlNodeToJson(child);
        if (result[child.tagName] !== undefined) {
          if (!Array.isArray(result[child.tagName])) {
            result[child.tagName] = [result[child.tagName]];
          }
          (result[child.tagName] as unknown[]).push(val);
        } else {
          result[child.tagName] = val;
        }
      }
      return result;
    }
    const result: Record<string, unknown> = { _attrs: {} };
    for (const attr of Array.from(node.attributes)) {
      result._attrs[attr.name] = attr.value;
    }
    const children = Array.from(node.children);
    if (children.length === 0) {
      result._text = node.textContent?.trim() || '';
    } else {
      for (const child of children) {
        result[child.tagName] = xmlNodeToJson(child);
      }
    }
    return result;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.(xml)$/i, ''));
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setXmlInput(text);
      try {
        const json = parseXml(text);
        setJsonOutput(JSON.stringify(json, null, 2));
      } catch (err) {
        setJsonOutput('错误: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleConvert = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'converted'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">XML转JSON</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <input type="file" accept=".xml" ref={fileRef} onChange={handleFile} className="mx-auto" />
          <p className="mt-2 text-gray-500">选择XML文件，或直接粘贴XML内容</p>
        </div>
        <textarea
          value={xmlInput}
          onChange={e => {
            setXmlInput(e.target.value);
            try { setJsonOutput(JSON.stringify(parseXml(e.target.value), null, 2)); }
            catch (err) { setJsonOutput('错误: ' + (err as Error).message); }
          }}
          className="w-full h-40 p-3 border rounded-lg font-mono text-sm"
          placeholder="粘贴XML内容..."
        />
        {jsonOutput && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code size={20} />
              <span className="font-medium">JSON输出</span>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm">{jsonOutput}</pre>
            <button onClick={handleConvert} className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              <Download size={20} />
              下载JSON文件
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

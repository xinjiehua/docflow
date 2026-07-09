import { useState, useRef, useEffect } from 'react';

interface DecodeResult {
  text: string;
  type: string;
}

export default function QrCodeDecoder() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    setError('');
    setResult(null);
    await decodeQrCode(url);
  };

  const decodeQrCode = async (url: string) => {
    setLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        // Try to use jsQR library for decoding
        try {
          const { default: jsQR } = await import('jsqr');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            const text = code.data;
            let type = '文本';
            if (text.startsWith('http://') || text.startsWith('https://')) type = '网址';
            else if (text.startsWith('BEGIN:VCARD')) type = '名片(vCard)';
            else if (text.startsWith('WIFI:')) type = 'WiFi配置';
            else if (text.startsWith('mailto:')) type = '邮箱';
            else if (text.startsWith('tel:')) type = '电话';
            else if (/^\d{6,20}$/.test(text)) type = '数字';
            setResult({ text, type });
          } else {
            setError('未能识别二维码，请确保图片中包含有效的二维码');
          }
        } catch {
          setError('二维码解码库加载失败，请检查网络后重试');
        }
        setLoading(false);
      };
      img.onerror = () => { setError('图片加载失败'); setLoading(false); };
      img.src = url;
    } catch {
      setError('处理图片时出错');
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) navigator.clipboard.writeText(result.text);
  };

  const detectTypeIcon = (type: string) => {
    const map: Record<string, string> = { '网址': '🔗', '名片(vCard)': '👤', 'WiFi配置': '📶', '邮箱': '📧', '电话': '📞', '数字': '🔢', '文本': '📝' };
    return map[type] || '📝';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🔍 二维码解码</h1>
          <p className="text-gray-500 mt-2">上传二维码图片识别内容（URL/文本/联系方式等）</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <label className="block w-full py-12 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 transition-colors mb-6">
            <span className="text-5xl block mb-3">📷</span>
            <p className="text-lg font-medium text-gray-700">点击上传二维码图片</p>
            <p className="text-sm text-gray-400 mt-1">支持 PNG, JPG, WebP 格式</p>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>

          {imageUrl && (
            <div className="flex justify-center mb-6">
              <img src={imageUrl} alt="二维码" className="max-w-xs rounded-xl shadow-sm border border-gray-100" />
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {loading && (
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                正在识别...
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{detectTypeIcon(result.type)}</span>
                <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{result.type}</span>
              </div>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-gray-800 break-all font-mono text-sm leading-relaxed">{result.text}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copyResult} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">复制内容</button>
                {result.type === '网址' && (
                  <a href={result.text} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors no-underline">打开链接</a>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 rounded-xl p-6 text-center">
              <span className="text-3xl block mb-2">❌</span>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 text-center">
            <label className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors">
              重新上传
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

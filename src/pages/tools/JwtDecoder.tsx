import { useState } from 'react';

interface JwtPart {
  raw: string;
  decoded: string;
  parsed: Record<string, any>;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  return decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

function colorJson(json: string): string {
  return json.replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
    let color = '#e53e3e'; // number
    if (/^"/.test(match)) {
      if (/:$/.test(match)) color = '#3182ce'; // key
      else color = '#38a169'; // string
    } else if (/true|false/.test(match)) color = '#dd6b20'; // boolean
    else if (/null/.test(match)) color = '#718096'; // null
    return `<span style="color:${color}">${match}</span>`;
  });
}

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [parts, setParts] = useState<JwtPart[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'decoded' | 'payload'>('decoded');

  const decode = () => {
    setError('');
    setParts([]);
    if (!token.trim()) return;

    const segments = token.trim().split('.');
    if (segments.length !== 3) {
      setError('无效的 JWT Token: JWT 由三部分组成，用 "." 分隔（Header.Payload.Signature）');
      return;
    }

    const [headerB64, payloadB64, signatureB64] = segments;
    try {
      const headerRaw = base64UrlDecode(headerB64);
      const payloadRaw = base64UrlDecode(payloadB64);

      const header = JSON.parse(headerRaw);
      const payload = JSON.parse(payloadRaw);

      setParts([
        { raw: headerB64, decoded: headerRaw, parsed: header },
        { raw: payloadB64, decoded: payloadRaw, parsed: payload },
        { raw: signatureB64, decoded: '(无法解码签名，签名用于验证Token完整性)', parsed: {} },
      ]);
    } catch (e: any) {
      setError(`解码失败: ${e.message}`);
    }
  };

  const formatTimestamp = (val: number): string => {
    if (val > 1e12) val = Math.floor(val / 1000);
    return new Date(val * 1000).toLocaleString('zh-CN');
  };

  const isExpired = (exp?: number): boolean | null => {
    if (!exp) return null;
    if (exp > 1e12) exp = Math.floor(exp / 1000);
    return Date.now() / 1000 > exp;
  };

  const payload = parts[1]?.parsed || {};
  const expired = isExpired(payload.exp);
  const issuedAt = payload.iat ? formatTimestamp(payload.iat) : null;
  const expiresAt = payload.exp ? formatTimestamp(payload.exp) : null;

  const copyPart = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🔓 JWT 解析器</h1>
          <p className="text-gray-500 mt-2">解析JWT Token的Header/Payload/Signature</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <label className="text-sm font-medium text-gray-600 mb-2 block">输入 JWT Token</label>
          <textarea value={token} onChange={e => setToken(e.target.value)} rows={4} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            className="w-full p-4 border border-gray-200 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-3 mt-3">
            <button onClick={decode} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">解析 Token</button>
            <button onClick={() => { setToken(''); setParts([]); setError(''); }} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">清空</button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 rounded-xl p-6 mb-6 text-center">
            <span className="text-3xl block mb-2">❌</span>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {parts.length > 0 && (
          <>
            {/* Payload Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {issuedAt && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <span className="text-xs text-blue-500">签发时间 (iat)</span>
                  <p className="text-sm font-medium text-blue-700 mt-1">{issuedAt}</p>
                </div>
              )}
              {expiresAt && (
                <div className={`rounded-xl p-4 ${expired === true ? 'bg-red-50' : expired === false ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <span className={`text-xs ${expired === true ? 'text-red-500' : expired === false ? 'text-green-500' : 'text-gray-500'}`}>过期时间 (exp)</span>
                  <p className={`text-sm font-medium mt-1 ${expired === true ? 'text-red-700' : expired === false ? 'text-green-700' : 'text-gray-700'}`}>
                    {expiresAt}
                    {expired === true && <span className="ml-1 text-xs">(已过期)</span>}
                    {expired === false && <span className="ml-1 text-xs">(有效)</span>}
                  </p>
                </div>
              )}
              {payload.sub && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <span className="text-xs text-purple-500">主题 (sub)</span>
                  <p className="text-sm font-medium text-purple-700 mt-1">{payload.sub}</p>
                </div>
              )}
              {payload.iss && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <span className="text-xs text-amber-500">签发者 (iss)</span>
                  <p className="text-sm font-medium text-amber-700 mt-1">{payload.iss}</p>
                </div>
              )}
            </div>

            {/* Token Parts */}
            <div className="space-y-4">
              {[
                { title: 'Header', color: 'blue', part: parts[0] },
                { title: 'Payload', color: 'green', part: parts[1] },
                { title: 'Signature', color: 'purple', part: parts[2] },
              ].map(({ title, color, part }) => (
                <div key={title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">{title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => copyPart(part.decoded)} className="text-xs text-blue-500 hover:underline">复制解码</button>
                      <button onClick={() => copyPart(JSON.stringify(part.parsed, null, 2))} className="text-xs text-blue-500 hover:underline">复制JSON</button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-xs text-gray-400 mb-1 block">Base64 (Raw)</label>
                    <code className="block bg-gray-50 p-3 rounded-lg text-sm font-mono text-gray-600 break-all">{part.raw}</code>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Decoded</label>
                    <pre className="bg-gray-900 rounded-lg p-4 text-sm leading-relaxed overflow-x-auto">
                      <code dangerouslySetInnerHTML={{ __html: colorJson(JSON.stringify(part.parsed, null, 2)) }} />
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Full Payload Fields Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="font-semibold text-gray-700 mb-4">Payload 全部字段</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50"><th className="px-4 py-2 text-left text-gray-600">字段</th><th className="px-4 py-2 text-left text-gray-600">值</th><th className="px-4 py-2 text-left text-gray-600">说明</th></tr></thead>
                  <tbody>
                    {Object.entries(payload).map(([key, val]) => (
                      <tr key={key} className="border-t border-gray-100">
                        <td className="px-4 py-2 font-mono text-blue-600">{key}</td>
                        <td className="px-4 py-2 font-mono text-gray-800 max-w-xs truncate">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {key === 'exp' ? '过期时间' : key === 'iat' ? '签发时间' : key === 'nbf' ? '生效时间' : key === 'sub' ? '主题/用户ID' : key === 'iss' ? '签发者' : key === 'aud' ? '接收者' : key === 'jti' ? 'Token ID' : '-'}
                        </td>
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

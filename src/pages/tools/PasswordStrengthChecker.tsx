import { useState, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const analysis = useMemo(() => {
    if (!password) return null;
    let score = 0;
    const checks: {label: string; pass: boolean}[] = [];

    checks.push({ label: '长度 >= 8', pass: password.length >= 8 }); if (password.length >= 8) score++;
    checks.push({ label: '长度 >= 12', pass: password.length >= 12 }); if (password.length >= 12) score++;
    checks.push({ label: '包含小写字母', pass: /[a-z]/.test(password) }); if (/[a-z]/.test(password)) score++;
    checks.push({ label: '包含大写字母', pass: /[A-Z]/.test(password) }); if (/[A-Z]/.test(password)) score++;
    checks.push({ label: '包含数字', pass: /\d/.test(password) }); if (/\d/.test(password)) score++;
    checks.push({ label: '包含特殊字符', pass: /[^a-zA-Z0-9]/.test(password) }); if (/[^a-zA-Z0-9]/.test(password)) score++;
    checks.push({ label: '无连续重复', pass: !/(.)\1{2,}/.test(password) }); if (!/(.)\1{2,}/.test(password)) score++;

    let level: string, color: string, pct: number;
    if (score <= 2) { level = '弱'; color = 'bg-red-500'; pct = 25; }
    else if (score <= 4) { level = '中等'; color = 'bg-yellow-500'; pct = 50; }
    else if (score <= 5) { level = '强'; color = 'bg-green-500'; pct = 75; }
    else { level = '非常强'; color = 'bg-emerald-600'; pct = 100; }

    return { score, checks, level, color, pct };
  }, [password]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> 密码强度检测</h2>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="输入要检测的密码" className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm pr-20" />
          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-navy-400">{showPassword ? '隐藏' : '显示'}</button>
        </div>
        {analysis && (
          <>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-navy-600">强度: {analysis.level}</span><span className="text-navy-400">{analysis.score}/{analysis.checks.length} 项通过</span></div>
              <div className="w-full bg-navy-100 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${analysis.color} transition-all`} style={{width: `${analysis.pct}%`}} /></div>
            </div>
            <div className="space-y-1">
              {analysis.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${c.pass ? 'bg-green-500 text-white' : 'bg-navy-200 text-navy-500'}`}>{c.pass ? '✓' : '✗'}</span>
                  <span className={c.pass ? 'text-navy-600' : 'text-navy-400'}>{c.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="card !p-4 text-xs text-navy-400">
        <p>提示：所有检测均在浏览器本地完成，密码不会被发送到任何服务器。</p>
      </div>
    </div>
  );
}

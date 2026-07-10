import { useState } from 'react';
import { Database } from 'lucide-react';

export default function SqlFormatter() {
  const [sql, setSql] = useState('');
  const [formatted, setFormatted] = useState('');
  const [error, setError] = useState('');
  const [uppercase, setUppercase] = useState(true);

  const formatSql = () => {
    setError('');
    try {
      let q = sql.trim();
      if (uppercase) {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'IF', 'BEGIN', 'COMMIT', 'ROLLBACK'];
        keywords.forEach(kw => {
          q = q.replace(new RegExp('\\b' + kw + '\\b', 'gi'), kw);
        });
      }
      q = q.replace(/\s+/g, ' ');
      const clauses = [/\b(SELECT)\b/i, /\b(FROM)\b/i, /\b(WHERE)\b/i, /\b(GROUP\s+BY)\b/i, /\b(HAVING)\b/i, /\b(ORDER\s+BY)\b/i, /\b(LIMIT)\b/i, /\b(SET)\b/i, /\b(VALUES)\b/i, /\b(AND)\b/i, /\b(OR)\b/i, /\b(JOIN)\b/i, /\b(LEFT\s+JOIN)\b/i, /\b(RIGHT\s+JOIN)\b/i, /\b(INNER\s+JOIN)\b/i, /\b(UNION)\b/i];
      
      clauses.forEach(clause => {
        q = q.replace(clause, (match) => {
          if (match.match(/^(GROUP|ORDER|LIMIT|SET|VALUES|AND|OR|JOIN|LEFT|RIGHT|INNER|UNION)/i)) {
            return '\n  ' + match;
          }
          return '\n' + match;
        });
      });
      q = q.replace(/,(?=[^\s])/g, ',\n  ');
      q = q.replace(/\n\s*\n/g, '\n');
      q = q.trim();
      setFormatted(q);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '格式化失败');
    }
  };

  const copy = () => navigator.clipboard.writeText(formatted);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Database className="w-5 h-5" /> SQL 格式化</h2>
        <label className="flex items-center gap-2 text-sm text-navy-600"><input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} /> 关键字大写</label>
        <div><label className="text-sm text-navy-600">输入 SQL</label><textarea value={sql} onChange={e => setSql(e.target.value)} rows={6} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm font-mono resize-y" placeholder="SELECT id, name FROM users WHERE age > 18 AND status = 'active' ORDER BY name ASC LIMIT 10" /></div>
        <div className="flex gap-2"><button onClick={formatSql} className="btn-primary text-sm">格式化</button><button onClick={() => { setSql(''); setFormatted(''); }} className="btn-secondary text-sm">清空</button></div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {formatted && (
          <div className="relative">
            <label className="text-sm text-navy-600">格式化结果</label>
            <pre className="bg-navy-50 rounded-lg p-3 mt-1 text-sm font-mono text-navy-700 whitespace-pre-wrap overflow-x-auto">{formatted}</pre>
            <button onClick={copy} className="absolute top-6 right-2 px-2 py-1 text-xs bg-white text-brand-600 rounded shadow border">复制</button>
          </div>
        )}
      </div>
    </div>
  );
}

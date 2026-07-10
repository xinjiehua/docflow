import { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';

const FIELDS = [
  { label: '分钟', key: 'minute', min: 0, max: 59, options: ['*', '0', '*/5', '*/10', '*/15', '*/30'] },
  { label: '小时', key: 'hour', min: 0, max: 23, options: ['*', '0', '*/2', '*/4', '*/6', '*/12'] },
  { label: '日', key: 'day', min: 1, max: 31, options: ['*', '1', '*/5', '*/10', '*/15'] },
  { label: '月', key: 'month', min: 1, max: 12, options: ['*', '1', '*/3', '*/6'] },
  { label: '周', key: 'weekday', min: 0, max: 6, options: ['*', '1-5', '0,6'] },
];

const PRESETS = [
  { label: '每分钟', cron: '* * * * *' },
  { label: '每小时', cron: '0 * * * *' },
  { label: '每天0点', cron: '0 0 * * *' },
  { label: '每天12点', cron: '0 12 * * *' },
  { label: '工作日9点', cron: '0 9 * * 1-5' },
  { label: '每周一0点', cron: '0 0 * * 1' },
  { label: '每月1号0点', cron: '0 0 1 * *' },
  { label: '每5分钟', cron: '*/5 * * * *' },
  { label: '每15分钟', cron: '*/15 * * * *' },
  { label: '每30分钟', cron: '*/30 * * * *' },
];

export default function CronExpression() {
  const [cron, setCron] = useState(['*', '*', '*', '*', '*']);
  const [customCron, setCustomCron] = useState('* * * * *');

  const description = useMemo(() => {
    const parts = cron;
    const desc: string[] = [];
    if (parts[4] !== '*') {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      if (parts[4] === '1-5') desc.push('工作日');
      else if (parts[4] === '0,6') desc.push('周末');
      else desc.push(weekdays[parseInt(parts[4])] || `第${parts[4]}天`);
    }
    if (parts[3] !== '*') desc.push(`${parts[3]}月`);
    if (parts[2] !== '*') desc.push(`${parts[2]}日`);
    if (parts[1] !== '*') desc.push(`${parts[1]}点`);
    if (parts[0] === '*') desc.push('每分钟');
    else if (parts[0].startsWith('*/')) desc.push(`每${parts[0].slice(2)}分钟`);
    else desc.push(`${parts[0]}分`);
    return desc.join(' ');
  }, [cron]);

  const setCronField = (idx: number, val: string) => {
    const newCron = [...cron];
    newCron[idx] = val;
    setCron(newCron);
  };

  const applyPreset = (preset: string) => {
    const parts = preset.split(' ');
    if (parts.length === 5) setCron(parts);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Clock className="w-5 h-5" /> Cron 表达式生成器</h2>
        <div className="bg-navy-50 rounded-xl p-4 text-center">
          <code className="text-2xl font-mono font-bold text-brand-600">{cron.join(' ')}</code>
          <p className="text-sm text-navy-600 mt-2">{description}</p>
        </div>
        <div className="space-y-3">
          {FIELDS.map((field, idx) => (
            <div key={field.key}>
              <label className="text-sm text-navy-600">{field.label}</label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {field.options.map(opt => (
                  <button key={opt} onClick={() => setCronField(idx, opt)} className={`px-2.5 py-1 rounded-lg text-xs ${cron[idx] === opt ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-white text-navy-500 border border-navy-200 hover:border-brand-300'}`}>{opt}</button>
                ))}
                <input type="text" value={cron[idx]} onChange={e => setCronField(idx, e.target.value)} className="w-16 px-2 py-1 rounded-lg border border-navy-200 text-xs text-center font-mono" />
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-medium text-navy-700 mb-2">常用预设</h3>
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.map(p => <button key={p.cron} onClick={() => applyPreset(p.cron)} className="px-2.5 py-1.5 rounded-lg text-xs bg-navy-50 text-navy-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">{p.label}</button>)}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-navy-700 mb-2">自定义解析</h3>
          <input type="text" value={customCron} onChange={e => setCustomCron(e.target.value)} placeholder="输入Cron表达式" className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm font-mono" />
          <button onClick={() => { const parts = customCron.trim().split(/\s+/); if (parts.length === 5) setCron(parts); }} className="btn-secondary text-sm mt-2">应用到上方</button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';

export default function PomodoroTimer() {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const totalForPhase = phase === 'work' ? workMin * 60 : breakMin * 60;

  const tick = useCallback(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        if (phase === 'work') { setRounds(r => r + 1); setPhase('break'); return breakMin * 60; }
        else { setPhase('work'); return workMin * 60; }
      }
      return prev - 1;
    });
  }, [phase, workMin, breakMin]);

  useEffect(() => {
    if (running) timerRef.current = window.setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, tick]);

  const toggle = () => setRunning(!running);
  const reset = () => { setRunning(false); setPhase('work'); setRemaining(workMin * 60); setRounds(0); };
  const skip = () => {
    setRunning(false);
    if (phase === 'work') { setPhase('break'); setRemaining(breakMin * 60); }
    else { setPhase('work'); setRemaining(workMin * 60); }
  };

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const pct = ((totalForPhase - remaining) / totalForPhase) * 100;
  const isWork = phase === 'work';

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card space-y-6 text-center">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center justify-center gap-2"><Clock className="w-5 h-5" /> 番茄钟</h2>
        <div className={`inline-flex px-4 py-1 rounded-full text-sm font-medium ${isWork ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {isWork ? '专注时间' : '休息时间'}
        </div>
        <div className={`text-6xl font-mono font-bold ${isWork ? 'text-red-600' : 'text-green-600'}`}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
        <div className="w-full bg-navy-100 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all duration-1000 ${isWork ? 'bg-red-400' : 'bg-green-400'}`} style={{width: `${pct}%`}} />
        </div>
        <div className="text-sm text-navy-500">已完成 {rounds} 个番茄</div>
        <div className="flex justify-center gap-2">
          <button onClick={toggle} className={`btn-primary text-sm`}>{running ? '暂停' : '开始'}</button>
          <button onClick={skip} className="btn-secondary text-sm">跳过</button>
          <button onClick={reset} className="btn-secondary text-sm">重置</button>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-navy-100">
          <div><label className="text-xs text-navy-500">专注 (分钟)</label><input type="number" min="1" max="120" value={workMin} onChange={e => { setWorkMin(+e.target.value); if (phase === 'work' && !running) setRemaining(+e.target.value * 60); }} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-center" /></div>
          <div><label className="text-xs text-navy-500">休息 (分钟)</label><input type="number" min="1" max="60" value={breakMin} onChange={e => { setBreakMin(+e.target.value); if (phase === 'break' && !running) setRemaining(+e.target.value * 60); }} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-center" /></div>
        </div>
      </div>
    </div>
  );
}

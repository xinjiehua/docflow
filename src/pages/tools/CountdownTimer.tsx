import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [inputH, setInputH] = useState('0');
  const [inputM, setInputM] = useState(5);
  const [inputS, setInputS] = useState('0');
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        setRunning(false);
        setFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (running) { timerRef.current = window.setInterval(tick, 1000); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, tick]);

  const start = () => {
    if (remaining === 0) {
      const total = parseInt(inputH) * 3600 + parseInt(inputM) * 60 + parseInt(inputS);
      if (total <= 0) return;
      setTotalSeconds(total);
      setRemaining(total);
    }
    setRunning(true);
    setFinished(false);
  };

  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(0); setTotalSeconds(0); setFinished(false); };

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pct = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card space-y-6 text-center">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center justify-center gap-2"><Clock className="w-5 h-5" /> 倒计时器</h2>
        <div className="space-y-4">
          <div className={`text-5xl font-mono font-bold ${finished ? 'text-red-500 animate-pulse' : 'text-navy-800'}`}>
            {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </div>
          {totalSeconds > 0 && (
            <div className="w-full bg-navy-100 rounded-full h-2">
              <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{width: `${pct}%`}} />
            </div>
          )}
          {finished && <p className="text-lg font-medium text-red-500">时间到！</p>}
        </div>
        {remaining === 0 && !running && (
          <div className="flex justify-center gap-2">
            {[{val: inputH, set: setInputH, label: '时'}, {val: inputM, set: setInputM, label: '分'}, {val: inputS, set: setInputS, label: '秒'}].map(({val, set, label}) => (
              <div key={label} className="text-center">
                <input type="number" min="0" max={label === '时' ? 23 : 59} value={val} onChange={e => set(e.target.value)} className="w-16 text-center px-2 py-2 rounded-lg border border-navy-200 text-lg font-mono" />
                <div className="text-xs text-navy-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center gap-2">
          {!running ? <button onClick={start} className="btn-primary text-sm">开始</button> : <button onClick={pause} className="btn-secondary text-sm">暂停</button>}
          <button onClick={reset} className="btn-secondary text-sm">重置</button>
        </div>
      </div>
    </div>
  );
}

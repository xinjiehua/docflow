import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [startTs, setStartTs] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setElapsed(Date.now() - startTs);
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, startTs]);

  const start = () => { setStartTs(Date.now() - elapsed); setRunning(true); };
  const stop = () => setRunning(false);
  const reset = () => { setRunning(false); setElapsed(0); setLaps([]); };
  const lap = () => setLaps(prev => [elapsed, ...prev]);

  const fmt = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const cents = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cents).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card space-y-6 text-center">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center justify-center gap-2"><Clock className="w-5 h-5" /> 秒表</h2>
        <div className="text-5xl font-mono font-bold text-navy-800">{fmt(elapsed)}</div>
        <div className="flex justify-center gap-2">
          {!running ? <button onClick={start} className="btn-primary text-sm">{elapsed === 0 ? '开始' : '继续'}</button> : <button onClick={stop} className="btn-secondary text-sm">暂停</button>}
          {running && <button onClick={lap} className="btn-secondary text-sm">计次</button>}
          <button onClick={reset} className="btn-secondary text-sm">重置</button>
        </div>
        {laps.length > 0 && (
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-navy-100"><th className="py-1 text-navy-400 font-normal">#</th><th className="py-1 text-navy-400 font-normal">分段时间</th><th className="py-1 text-navy-400 font-normal">总时间</th></tr></thead>
              <tbody>
                {laps.map((l, i) => (
                  <tr key={i} className="border-b border-navy-50">
                    <td className="py-1.5 text-navy-500">{laps.length - i}</td>
                    <td className="py-1.5 font-mono text-navy-700">{fmt(i === 0 ? l : laps[i] - laps[i - 1])}</td>
                    <td className="py-1.5 font-mono text-brand-600">{fmt(l)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

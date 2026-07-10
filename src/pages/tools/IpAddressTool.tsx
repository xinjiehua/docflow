import { useState } from 'react';
import { Globe } from 'lucide-react';

function ipToNum(ip: string): bigint {
  const parts = ip.split('.').map(Number);
  return BigInt(parts[0]) * 256n ** 3n + BigInt(parts[1]) * 256n ** 2n + BigInt(parts[2]) * 256n + BigInt(parts[3]);
}

function numToIp(num: bigint): string {
  return `${Number(num >> 24n) % 256}.${Number(num >> 16n) % 256}.${Number(num >> 8n) % 256}.${Number(num) % 256}`;
}

function getMask(mask: number): string {
  return numToIp((0xFFFFFFFFn << BigInt(32 - mask)) & 0xFFFFFFFFn);
}

function getNetwork(ip: string, mask: number): string {
  return numToIp(ipToNum(ip) & ((0xFFFFFFFFn << BigInt(32 - mask)) & 0xFFFFFFFFn));
}

function getBroadcast(ip: string, mask: number): string {
  return numToIp(ipToNum(ip) | ~(0xFFFFFFFFn << BigInt(32 - mask)) & 0xFFFFFFFFn);
}

function getHostRange(ip: string, mask: number): [string, string] {
  const network = ipToNum(ip) & ((0xFFFFFFFFn << BigInt(32 - mask)) & 0xFFFFFFFFn);
  const broadcast = network | ~(0xFFFFFFFFn << BigInt(32 - mask)) & 0xFFFFFFFFn;
  return [numToIp(network + 1n), numToIp(broadcast - 1n)];
}

const PRIVATE_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255', label: 'A类私有' },
  { start: '172.16.0.0', end: '172.31.255.255', label: 'B类私有' },
  { start: '192.168.0.0', end: '192.168.255.255', label: 'C类私有' },
  { start: '127.0.0.0', end: '127.255.255.255', label: '回环地址' },
];

function isPrivate(ip: string): string | null {
  const num = ipToNum(ip);
  for (const r of PRIVATE_RANGES) {
    if (num >= ipToNum(r.start) && num <= ipToNum(r.end)) return r.label;
  }
  return null;
}

export default function IpAddressTool() {
  const [ip, setIp] = useState('192.168.1.100');
  const [cidr, setCidr] = useState('24');
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState('');

  const analyze = () => {
    setError('');
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) { setError('无效的IP地址格式'); return; }
    const parts = ip.split('.').map(Number);
    if (parts.some(p => p > 255 || p < 0)) { setError('IP地址数值超出范围'); return; }
    const mask = parseInt(cidr);
    if (isNaN(mask) || mask < 0 || mask > 32) { setError('子网掩码必须在0-32之间'); return; }
    const priv = isPrivate(ip);
    const [hostStart, hostEnd] = getHostRange(ip, mask);
    setResult({
      'IP地址': ip,
      'CIDR表示': `${ip}/${mask}`,
      '子网掩码': getMask(mask),
      '网络地址': getNetwork(ip, mask),
      '广播地址': getBroadcast(ip, mask),
      '主机范围': `${hostStart} - ${hostEnd}`,
      '可用主机数': (2n ** BigInt(32 - mask) - 2n).toString(),
      '地址类型': priv || '公网地址',
      '二进制': parts.map(p => p.toString(2).padStart(8, '0')).join('.'),
      '十进制': ipToNum(ip).toString(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2"><Globe className="w-5 h-5" /> IP 地址计算器</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><label className="text-sm text-navy-600">IP 地址</label><input type="text" value={ip} onChange={e => setIp(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm font-mono" /></div>
          <div><label className="text-sm text-navy-600">CIDR</label><input type="number" min="0" max="32" value={cidr} onChange={e => setCidr(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy-200 text-sm font-mono" /></div>
        </div>
        <button onClick={analyze} className="btn-primary text-sm">分析</button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {result && (
          <div className="bg-navy-50 rounded-xl overflow-hidden">
            {Object.entries(result).map(([key, val]) => (
              <div key={key} className="flex border-b border-navy-100 last:border-0">
                <span className="w-28 px-3 py-2 text-xs font-medium text-navy-500 bg-navy-50 shrink-0">{key}</span>
                <span className="px-3 py-2 text-sm font-mono text-navy-700 break-all">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

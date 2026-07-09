import { useState, useRef } from 'react';
import { Download, Plus, Trash2, Play, Square, ChevronRight, Circle } from 'lucide-react';

interface FlowNode {
  id: string;
  text: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'io';
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FlowConn {
  from: string;
  to: string;
  label?: string;
}

export default function FlowChart() {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [conns, setConns] = useState<FlowConn[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOff, setDragOff] = useState({ x: 0, y: 0 });
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const addNode = (type: FlowNode['type']) => {
    const id = 'n_' + Date.now();
    const labels: Record<string, string> = { start: '开始', end: '结束', process: '处理', decision: '判断', io: '输入/输出' };
    const newNode: FlowNode = {
      id, text: labels[type],
      type, x: 100 + nodes.length * 30, y: 100 + nodes.length * 30,
      w: type === 'decision' ? 140 : 150, h: type === 'decision' ? 80 : 50,
    };
    setNodes([...nodes, newNode]);
    setSelectedId(id);
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setConns(conns.filter(c => c.from !== id && c.to !== id));
    setSelectedId(null);
  };

  const updateText = (text: string) => {
    setNodes(nodes.map(n => n.id === selectedId ? { ...n, text } : n));
  };

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    if (connectMode && connectFrom) {
      if (connectFrom !== id) {
        setConns([...conns, { from: connectFrom, to: id }]);
      }
      setConnectMode(false);
      setConnectFrom(null);
      return;
    }
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setDragging(id);
    setSelectedId(id);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setDragOff({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setNodes(nodes.map(n => n.id === dragging ? { ...n, x: e.clientX - rect.left - dragOff.x, y: e.clientY - rect.top - dragOff.y } : n));
  };

  const handleMouseUp = () => { setDragging(null); };

  const startConnect = () => {
    if (!selectedId) return;
    setConnectMode(true);
    setConnectFrom(selectedId);
  };

  const drawShape = (node: FlowNode, isSelected: boolean) => {
    const { x, y, w, h, type } = node;
    const common = `fill:#E0E7FF;stroke:${isSelected ? '#3B82F6' : '#6366F1'};strokeWidth:${isSelected ? 3 : 2}`;
    switch (type) {
      case 'start': case 'end': return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...{ style: common.split('strokeWidth')[0] }} />;
      case 'process': return <rect x={x} y={y} width={w} height={h} rx={4} style={common.replace('fill:', 'fill:').replace('stroke', 'stroke')} />;
      case 'decision': return <polygon points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`} style={common.replace('fill:#E0E7FF', 'fill:#FEF3C7')} />;
      case 'io': return <polygon points={`${x + 20},${y} ${x + w},${y} ${x + w - 20},${y + h} ${x},${y + h}`} style={common.replace('fill:#E0E7FF', 'fill:#D1FAE5')} />;
      default: return <rect x={x} y={y} width={w} height={h} rx={4} style={common} />;
    }
  };

  const exportSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'flowchart.svg';
    a.click();
  };

  const selectedNode = nodes.find(n => n.id === selectedId);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">流程图</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => addNode('start')} className="flex items-center gap-1 px-3 py-2 rounded border text-sm bg-green-50 hover:bg-green-100"><Play size={14} />开始</button>
          <button onClick={() => addNode('process')} className="flex items-center gap-1 px-3 py-2 rounded border text-sm bg-blue-50 hover:bg-blue-100"><Square size={14} />处理</button>
          <button onClick={() => addNode('decision')} className="flex items-center gap-1 px-3 py-2 rounded border text-sm bg-yellow-50 hover:bg-yellow-100"><ChevronRight size={14} />判断</button>
          <button onClick={() => addNode('io')} className="flex items-center gap-1 px-3 py-2 rounded border text-sm bg-emerald-50 hover:bg-emerald-100"><Circle size={14} />输入/输出</button>
          <button onClick={() => addNode('end')} className="flex items-center gap-1 px-3 py-2 rounded border text-sm bg-red-50 hover:bg-red-100"><Square size={14} />结束</button>
          {selectedId && (
            <>
              <button onClick={startConnect} className={`px-3 py-2 rounded border text-sm ${connectMode ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-50'}`}>
                {connectMode ? '点击目标节点连线...' : '连线'}
              </button>
              <button onClick={() => deleteNode(selectedId)} className="flex items-center gap-1 px-3 py-2 rounded border text-sm bg-red-500 text-white hover:bg-red-600"><Trash2 size={14} />删除</button>
              <input value={selectedNode?.text || ''} onChange={e => updateText(e.target.value)} className="border rounded px-2 py-1 text-sm w-36" placeholder="文本" />
            </>
          )}
          <button onClick={exportSvg} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"><Download size={14} />导出SVG</button>
        </div>
        <div className="border rounded-lg bg-white" style={{ height: 500 }}>
          <svg ref={svgRef} className="w-full h-full" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <defs>
              <marker id="arrowhead" markerWidth={10} markerHeight={7} refX={10} refY={3.5} orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
              </marker>
            </defs>
            {conns.map((c, i) => {
              const from = nodes.find(n => n.id === c.from);
              const to = nodes.find(n => n.id === c.to);
              if (!from || !to) return null;
              return <line key={i} x1={from.x + from.w / 2} y1={from.y + from.h / 2} x2={to.x + to.w / 2} y2={to.y + to.h / 2} stroke="#6366F1" strokeWidth={2} markerEnd="url(#arrowhead)" />;
            })}
            {nodes.map(node => (
              <g key={node.id} onMouseDown={e => handleMouseDown(node.id, e)} className="cursor-move">
                {drawShape(node, selectedId === node.id)}
                <text x={node.x + node.w / 2} y={node.y + node.h / 2 + 5} textAnchor="middle" fontSize={13} fill="#1E293B" className="pointer-events-none select-none">
                  {node.text}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

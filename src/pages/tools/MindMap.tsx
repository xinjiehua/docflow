import { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  children: string[];
  parent: string | null;
  color: string;
}

export default function MindMap() {
  const [nodes, setNodes] = useState<MindNode[]>([
    { id: 'root', text: '中心主题', x: 400, y: 300, children: [], parent: null, color: '#3B82F6' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

  const addNode = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;
    const newId = 'node_' + Date.now();
    const angle = (parent.children.length * 60 - 90) * Math.PI / 180;
    const dist = 150;
    const newNode: MindNode = {
      id: newId,
      text: '新节点',
      x: parent.x + Math.cos(angle) * dist,
      y: parent.y + Math.sin(angle) * dist,
      children: [],
      parent: parentId,
      color: colors[nodes.length % colors.length],
    };
    setNodes([...nodes, newNode]);
    setNodes(prev => prev.map(n => n.id === parentId ? { ...n, children: [...n.children, newId] } : n));
    setSelectedId(newId);
  };

  const deleteNode = (id: string) => {
    if (id === 'root') return;
    const toDelete = new Set<string>();
    const collect = (nid: string) => {
      toDelete.add(nid);
      nodes.find(n => n.id === nid)?.children.forEach(collect);
    };
    collect(id);
    const parent = nodes.find(n => n.children.includes(id));
    setNodes(nodes.filter(n => !toDelete.has(n.id)).map(n =>
      parent && n.id === parent.id ? { ...n, children: n.children.filter(c => c !== id) } : n
    ));
    setSelectedId(null);
  };

  const updateText = (id: string, text: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  };

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setDragging(id);
    setSelectedId(id);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left - node.x * zoom, y: e.clientY - rect.top - node.y * zoom });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;
    setNodes(nodes.map(n => n.id === dragging ? { ...n, x, y } : n));
  };

  const handleMouseUp = () => { setDragging(null); };

  const exportImage = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 800, 600);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'mindmap.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const selectedNode = nodes.find(n => n.id === selectedId);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">思维导图</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {selectedId && (
            <>
              <button onClick={() => addNode(selectedId)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm">
                <Plus size={16} />添加子节点
              </button>
              <button onClick={() => deleteNode(selectedId)} className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm">
                <Trash2 size={16} />删除
              </button>
              <input
                value={selectedNode?.text || ''}
                onChange={e => updateText(selectedId!, e.target.value)}
                className="border rounded px-3 py-2 text-sm w-48"
                placeholder="节点文本"
              />
            </>
          )}
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-2 border rounded-lg hover:bg-gray-50">
            <ZoomIn size={18} />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="p-2 border rounded-lg hover:bg-gray-50">
            <ZoomOut size={18} />
          </button>
          <button onClick={exportImage} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm">
            <Download size={16} />导出图片
          </button>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white" style={{ height: 500 }}>
          <svg ref={svgRef} className="w-full h-full" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {nodes.map(node => {
              const parent = node.parent ? nodes.find(n => n.id === node.parent) : null;
              return (
                <g key={node.id}>
                  {parent && (
                    <line x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} stroke={node.color} strokeWidth={2} opacity={0.5} />
                  )}
                  <g transform={`translate(${node.x},${node.y}) scale(${zoom})`} style={{ transformOrigin: 'center' }}>
                    <rect
                      x={-60} y={-20} width={120} height={40} rx={10}
                      fill={node.color} stroke={selectedId === node.id ? '#000' : 'none'} strokeWidth={selectedId === node.id ? 2 : 0}
                      className="cursor-pointer" onMouseDown={e => handleMouseDown(node.id, e)} opacity={0.9}
                    />
                    <text x={0} y={5} textAnchor="middle" fill="white" fontSize={14} fontWeight="500" className="pointer-events-none select-none">
                      {node.text.length > 8 ? node.text.slice(0, 8) + '...' : node.text}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-gray-500 text-sm">点击节点选中，拖拽移动位置，双击编辑文本。</p>
      </div>
    </div>
  );
}

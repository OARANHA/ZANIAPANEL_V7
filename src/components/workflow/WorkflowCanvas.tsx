"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Move, 
  Settings, 
  Save,
  Play,
  Eye,
  Edit,
  RefreshCw
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type: string;
    category: string;
    [key: string]: any;
  };
}

interface WorkflowEdge {
  source: string;
  target: string;
}

interface WorkflowCanvasProps {
  workflow: {
    id: string;
    name: string;
    flowData: string;
    type: string;
    complexityScore: number;
    nodeCount: number;
    edgeCount: number;
  };
  onNodeClick?: (node: WorkflowNode) => void;
  onEditNode?: (node: WorkflowNode) => void;
  onSave?: () => void;
  onPreview?: () => void;
  className?: string;
}

export default function WorkflowCanvas({
  workflow,
  onNodeClick,
  onEditNode,
  onSave,
  onPreview,
  className = ""
}: WorkflowCanvasProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse workflow data
  useEffect(() => {
    try {
      const flowData = JSON.parse(workflow.flowData);
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);
    } catch (error) {
      console.error('Error parsing workflow data:', error);
    }
  }, [workflow.flowData]);

  // Get node color based on type
  const getNodeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'Start': '#10b981',      // green
      'Agent': '#06b6d4',     // cyan
      'Condition': '#f59e0b', // amber
      'LLM': '#8b5cf6',       // violet
      'Loop': '#ef4444',      // red
      'Tool': '#f97316',      // orange
      'Document': '#84cc16',  // lime
      'Memory': '#ec4899',    // pink
      'API': '#6366f1',       // indigo
    };
    return colors[type] || '#6b7280'; // gray
  };

  // Get node icon based on type
  const getNodeIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      'Start': '▶',
      'Agent': '🤖',
      'Condition': '🔀',
      'LLM': '🧠',
      'Loop': '🔄',
      'Tool': '🔧',
      'Document': '📄',
      'Memory': '💾',
      'API': '🌐',
    };
    return icons[type] || '⚪';
  };

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Left
      setIsPanning(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, scale * delta));
    setScale(newScale);
  };

  // Reset view
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Fit to screen
  const fitToScreen = () => {
    if (!containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate bounds of all nodes
    const bounds = nodes.reduce((acc, node) => {
      return {
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x + 120), // Approximate node width
        maxY: Math.max(acc.maxY, node.position.y + 80)   // Approximate node height
      };
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (containerRect.width - 100) / contentWidth;
    const scaleY = (containerRect.height - 100) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1);
    
    setScale(newScale);
    setPosition({
      x: (containerRect.width - contentWidth * newScale) / 2 - bounds.minX * newScale,
      y: (containerRect.height - contentHeight * newScale) / 2 - bounds.minY * newScale
    });
  };

  // Handle node click
  const handleNodeClick = (node: WorkflowNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  // Handle node edit
  const handleNodeEdit = (node: WorkflowNode, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditNode?.(node);
  };

  return (
    <Card className={`w-full h-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{workflow.name}</CardTitle>
            <Badge variant="outline">{workflow.type}</Badge>
            <Badge variant="secondary">
              Complexidade: {workflow.complexityScore}/100
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              title="Resetar visualização"
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fitToScreen}
              title="Ajustar à tela"
            >
              <Maximize className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(s => Math.max(0.1, s * 0.9))}
              title="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(s => Math.min(3, s * 1.1))}
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Zoom: {Math.round(scale * 100)}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {nodes.length} nós • {edges.length} conexões
          </div>
          
          <div className="flex items-center gap-2">
            {onPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            )}
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="relative w-full h-[600px] bg-gray-50 border-t cursor-move overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            ref={canvasRef}
            className="absolute inset-0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Render edges */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {edges.map((edge, index) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;
                
                const sourceX = sourceNode.position.x + 60;
                const sourceY = sourceNode.position.y + 40;
                const targetX = targetNode.position.x + 60;
                const targetY = targetNode.position.y + 40;
                
                return (
                  <g key={index}>
                    <line
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r="4"
                      fill="#64748b"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#64748b"
                  />
                </marker>
              </defs>
            </svg>
            
            {/* Render nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  transform: 'scale(1)',
                  zIndex: selectedNode?.id === node.id ? 10 : 2
                }}
                onClick={(e) => handleNodeClick(node, e)}
              >
                <div
                  className="w-[120px] bg-white rounded-lg shadow-md border-2 hover:border-blue-300 transition-colors"
                  style={{ borderColor: getNodeColor(node.data.type) }}
                >
                  <div
                    className="h-2 rounded-t-lg"
                    style={{ backgroundColor: getNodeColor(node.data.type) }}
                  />
                  <div className="p-3">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{getNodeIcon(node.data.type)}</div>
                      <div className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">
                        {node.data.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {node.data.type}
                      </div>
                    </div>
                  </div>
                  <div className="px-2 pb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 text-xs"
                      onClick={(e) => handleNodeEdit(node, e)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Instructions overlay */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
            <div>🖱️ Arraste para pan • Ctrl+arraste para pan • Scroll para zoom</div>
            <div>📋 Clique nos nós para selecionar • Clique em Editar para configurar</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
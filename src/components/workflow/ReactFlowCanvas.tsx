"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Edge,
  Node,
  NodeTypes,
  MarkerType,
  Position,
  Connection,
  addEdge,
  ConnectionMode,
  Handle,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Save,
  Play,
  Eye,
  Edit,
  Settings,
  Bot,
  Cpu,
  GitBranch,
  Database,
  MemoryStick,
  Globe,
  AlertTriangle,
  CheckCircle,
  RotateCcw
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

interface ReactFlowCanvasProps {
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

// Custom Node Component - Enhanced with better connections and improved icons
const CustomNode = ({ data, selected, sourcePosition, targetPosition }: NodeProps) => {
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

  const getNodeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Start': <CheckCircle className="w-4 h-4" />,
      'Agent': <Bot className="w-4 h-4" />,
      'Condition': <GitBranch className="w-4 h-4" />,
      'LLM': <Cpu className="w-4 h-4" />,
      'Loop': <AlertTriangle className="w-4 h-4" />,
      'Tool': <Database className="w-4 h-4" />,
      'Document': <Database className="w-4 h-4" />,
      'Memory': <MemoryStick className="w-4 h-4" />,
      'API': <Globe className="w-4 h-4" />,
    };
    return icons[type] || <AlertTriangle className="w-4 h-4" />;
  };

  const nodeColor = getNodeColor(data.type);
  
  return (
    <div 
      className={`px-4 py-3 shadow-lg rounded-xl border-2 bg-white min-w-[160px] transition-all duration-300 hover:shadow-xl ${
        selected ? 'ring-4 ring-blue-400 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'
      }`}
      style={{ 
        borderColor: nodeColor,
        boxShadow: selected ? `0 0 0 4px ${nodeColor}20` : undefined
      }}
    >
      {/* ReactFlow Connection Handles */}
      {data.type !== 'Start' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 !border-white !border-2"
          style={{
            background: nodeColor,
          }}
        />
      )}
      
      {data.type !== 'Generate Final Answer' && data.type !== 'End' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-gray-400 !border-white !border-2"
          style={{
            background: nodeColor,
          }}
        />
      )}
      
      {/* Enhanced visual connection handles */}
      <div 
        className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-200 hover:scale-125 cursor-crosshair"
        style={{ 
          backgroundColor: nodeColor,
          display: data.type === 'Start' ? 'none' : 'block'
        }}
        title="Conexão de entrada"
      />
      <div 
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-200 hover:scale-125 cursor-crosshair"
        style={{ 
          backgroundColor: nodeColor,
          display: data.type === 'Generate Final Answer' ? 'none' : 'block'
        }}
        title="Conexão de saída"
      />
      
      {/* Node content */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="p-1.5 rounded-lg shadow-sm transition-all duration-200 hover:scale-110"
          style={{ backgroundColor: nodeColor }}
        >
          <div className="text-white">
            {getNodeIcon(data.type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
            {data.label}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {data.type}
          </div>
        </div>
      </div>
      
      {/* Status and actions */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <Badge 
          variant="secondary" 
          className="text-xs font-medium"
          style={{ 
            backgroundColor: `${nodeColor}20`,
            color: nodeColor,
            borderColor: `${nodeColor}40`
          }}
        >
          {data.category}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs px-3 hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit?.();
          }}
        >
          <Edit className="w-3 h-3 mr-1" />
          Editar
        </Button>
      </div>
    </div>
  );
};

// Node types configuration
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function ReactFlowCanvas({
  workflow,
  onNodeClick,
  onEditNode,
  onSave,
  onPreview,
  className = ""
}: ReactFlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialWorkflowData, setInitialWorkflowData] = useState<string | null>(null);

  // Parse workflow data and convert to ReactFlow format (only on initial load or workflow change)
  useEffect(() => {
    // Only initialize if workflow data has changed and we haven't initialized yet
    if (workflow.flowData === initialWorkflowData && isInitialized) {
      return;
    }
    
    try {
      const flowData = JSON.parse(workflow.flowData);
      console.log('🔍 Workflow data loaded:', flowData);
      
      // Try different possible structures for nodes and edges
      let workflowNodes = [];
      let workflowEdges = [];
      
      // Case 1: Direct nodes and edges
      if (flowData.nodes && flowData.edges) {
        workflowNodes = flowData.nodes;
        workflowEdges = flowData.edges;
      }
      // Case 2: Nested structure
      else if (flowData.data && flowData.data.nodes && flowData.data.edges) {
        workflowNodes = flowData.data.nodes;
        workflowEdges = flowData.data.edges;
      }
      // Case 3: Only nodes, try to infer edges from node connections
      else if (flowData.nodes) {
        workflowNodes = flowData.nodes;
        // Try to create edges from node connections if they exist
        workflowEdges = [];
        flowData.nodes.forEach((node: any) => {
          if (node.data && node.data.connections) {
            node.data.connections.forEach((targetId: string) => {
              workflowEdges.push({
                source: node.id,
                target: targetId
              });
            });
          }
        });
      }
      
      console.log('📊 Nodes found:', workflowNodes.length);
      console.log('🔗 Edges found:', workflowEdges.length);
      
      // If no edges found but we have nodes, create some default connections
      if (workflowEdges.length === 0 && workflowNodes.length > 1) {
        console.log('🔗 No edges found, creating default connections...');
        for (let i = 0; i < workflowNodes.length - 1; i++) {
          const sourceNode = workflowNodes[i];
          const targetNode = workflowNodes[i + 1];
          
          // Skip creating connection if target node is 'Start' or source is 'End'
          if (targetNode.data?.type === 'Start' || sourceNode.data?.type === 'Generate Final Answer' || sourceNode.data?.type === 'End') {
            continue;
          }
          
          workflowEdges.push({
            source: sourceNode.id,
            target: targetNode.id
          });
        }
        console.log('🔗 Created default edges:', workflowEdges.length);
      }

      // Convert nodes to ReactFlow format
      const reactFlowNodes: Node[] = workflowNodes.map((node: WorkflowNode) => {
        console.log(`📦 Processing node ${node.id}:`, node);
        return {
          id: node.id,
          type: 'custom',
          position: node.position || { x: Math.random() * 400, y: Math.random() * 300 },
          data: {
            ...node.data,
            onEdit: () => onEditNode?.(node),
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          // Habilitar arrastar nós
          draggable: true,
          connectable: true,
        };
      });

      // Convert edges to ReactFlow format - Enhanced white connection lines
      const reactFlowEdges: Edge[] = workflowEdges.map((edge: WorkflowEdge, index: number) => {
        console.log(`🔗 Creating edge ${index}:`, edge);
        console.log(`🔗 Edge source: ${edge.source}, target: ${edge.target}`);
        
        // Verify that source and target nodes exist
        const sourceNode = workflowNodes.find(n => n.id === edge.source);
        const targetNode = workflowNodes.find(n => n.id === edge.target);
        
        if (!sourceNode) {
          console.warn(`⚠️ Source node ${edge.source} not found for edge ${index}`);
        }
        if (!targetNode) {
          console.warn(`⚠️ Target node ${edge.target} not found for edge ${index}`);
        }
        
        return {
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: false,
          style: { 
            stroke: '#ffffff', 
            strokeWidth: 4,
            filter: 'drop-shadow(0 0 12px rgba(255,255,255,1))'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#ffffff',
            width: 15,
            height: 15,
          },
          // Habilitar edição de arestas
          selectable: true,
          updatable: true,
          deletable: true,
          className: 'transition-all duration-200',
          zIndex: 10,
        };
      });

      console.log('✅ Setting ReactFlow nodes:', reactFlowNodes.length);
      console.log('✅ Setting ReactFlow edges:', reactFlowEdges.length);
      
      // Log node positions for debugging
      reactFlowNodes.forEach(node => {
        console.log(`📍 Node ${node.id} position:`, node.position);
      });
      
      // Log edge connections for debugging
      reactFlowEdges.forEach(edge => {
        console.log(`🔗 Edge ${edge.id}: ${edge.source} -> ${edge.target}`);
      });
      
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
      
      // Mark as initialized and store initial workflow data
      setIsInitialized(true);
      setInitialWorkflowData(workflow.flowData);
    } catch (error) {
      console.error('❌ Error parsing workflow data:', error);
      console.error('❌ Workflow data string:', workflow.flowData);
      
      // Create a default workflow if parsing fails
      console.log('🔄 Creating default workflow...');
      const defaultNodes = [
        {
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: {
            label: 'Start',
            type: 'Start',
            category: 'Entry Point',
            onEdit: () => {}
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          draggable: true,
        },
        {
          id: 'node-2',
          type: 'custom',
          position: { x: 300, y: 100 },
          data: {
            label: 'Process',
            type: 'Agent',
            category: 'Processing',
            onEdit: () => {}
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          draggable: true,
        }
      ];
      
      const defaultEdges = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
          type: 'smoothstep',
          animated: false,
          style: { 
            stroke: '#ffffff', 
            strokeWidth: 4,
            filter: 'drop-shadow(0 0 12px rgba(255,255,255,1))'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#ffffff',
            width: 15,
            height: 15,
          },
          selectable: true,
          updatable: true,
          deletable: true,
          className: 'transition-all duration-200',
          zIndex: 10,
        }
      ];
      
      setNodes(defaultNodes);
      setEdges(defaultEdges);
      
      // Mark as initialized even for default workflow
      setIsInitialized(true);
      setInitialWorkflowData(workflow.flowData);
    }
  }, [workflow.flowData, onEditNode, initialWorkflowData, isInitialized]);

  // Debug: Log current state
  useEffect(() => {
    console.log('🎯 Current nodes state:', nodes.length, nodes);
    console.log('🔗 Current edges state:', edges.length, edges);
  }, [nodes, edges]);

  // Handle node position changes to persist them
  const onNodesChangeHandler = useCallback(
    (changes) => {
      console.log('🔄 Nodes changed:', changes);
      
      // Apply the changes to update the internal state
      onNodesChange(changes);
      
      // Log position changes specifically
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          console.log(`📍 Node ${change.id} moved to:`, change.position);
        }
      });
    },
    [onNodesChange]
  );

  // Handle edges changes
  const onEdgesChangeHandler = useCallback(
    (changes) => {
      console.log('🔄 Edges changed:', changes);
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  // Handle node click
  const onNodeClickHandler = useCallback((event: React.MouseEvent, node: Node) => {
    const workflowNode: WorkflowNode = {
      id: node.id,
      type: node.data.type,
      position: node.position,
      data: node.data,
    };
    setSelectedNode(workflowNode);
    onNodeClick?.(workflowNode);
  }, [onNodeClick]);

  // Handle connection creation
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${edges.length}-${Date.now()}`,
        type: 'smoothstep',
        animated: false,
        style: { 
          stroke: '#ffffff', 
          strokeWidth: 4,
          filter: 'drop-shadow(0 0 12px rgba(255,255,255,1))'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ffffff',
          width: 15,
          height: 15,
        },
        selectable: true,
        updatable: true,
        deletable: true,
        className: 'transition-all duration-200',
        zIndex: 10,
      };
      
      console.log('🔗 Creating new connection:', newEdge);
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges.length]
  );

  // Initialize ReactFlow instance
  const onInit = useCallback((instance: any) => {
    setReactFlowInstance(instance);
    // Fit view to show all nodes
    setTimeout(() => {
      instance.fitView();
    }, 100);
  }, []);

  // Fit view to screen
  const fitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  };

  // Reset view
  const resetView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.setTransform({ x: 0, y: 0, zoom: 1 });
    }
  };

  // Zoom controls
  const zoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };

  const zoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };

  return (
    <Card className={`w-full h-full bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader className="pb-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Settings className="w-5 h-5 text-blue-400" />
              {workflow.name}
            </CardTitle>
            <Badge variant="outline" className="border-gray-600 text-gray-300">{workflow.type}</Badge>
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              Complexidade: {workflow.complexityScore}/100
            </Badge>
            <Badge variant="outline" className="bg-green-900/50 text-green-300 border-green-700">
              {workflow.nodeCount} nós • {workflow.edgeCount} conexões
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              title="Resetar visualização"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fitView}
              title="Ajustar à tela"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Maximize className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              title="Diminuir zoom"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              title="Aumentar zoom"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            {onPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
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
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 bg-black">
        <div 
          ref={reactFlowWrapper}
          className="w-full h-[600px] border-t border-gray-800 relative"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeHandler}
            onEdgesChange={onEdgesChangeHandler}
            onNodeClick={onNodeClickHandler}
            onConnect={onConnect}
            onInit={onInit}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            // Habilitar todas as interações
            nodesDraggable={true}
            nodesConnectable={true}
            edgesUpdatable={true}
            elementsSelectable={true}
            connectionLineType="smoothstep"
            connectionLineStyle={{ 
              stroke: '#ffffff', 
              strokeWidth: 4,
              strokeDasharray: '5,5',
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,1))'
            }}
            attributionPosition="bottom-left"
            defaultEdgeOptions={{
              style: { 
                stroke: '#ffffff', 
                strokeWidth: 4,
                filter: 'drop-shadow(0 0 12px rgba(255,255,255,1))'
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#ffffff',
                width: 15,
                height: 15,
              },
              zIndex: 10,
            }}
          >
            <Controls 
              className="bg-gray-800 border-gray-700 text-white"
              showInteractive={false}
            />
            
            {/* Fundo preto com pontinhos */}
            <Background 
              color="#4a5568" 
              gap={20} 
              variant="dots"
              size={1}
            />
          </ReactFlow>
        </div>
        
        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs px-4 py-3 rounded-lg backdrop-blur-sm border border-gray-700">
          <div className="font-semibold mb-1">Controles:</div>
          <div>🖱️ Scroll para zoom • Arraste para pan</div>
          <div>🔗 Arraste entre nós para conectar</div>
          <div>✏️ Clique em "Editar" para configurar o conteúdo</div>
          <div>📦 Arraste as caixas para reposicionar</div>
        </div>
      </CardContent>
    </Card>
  );
}
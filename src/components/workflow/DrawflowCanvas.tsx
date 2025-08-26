"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
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
  RefreshCw,
  Download,
  Link,
  Unlink,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Plus,
  Info,
  Undo,
  Redo
} from 'lucide-react';

// Dynamically import Drawflow to avoid SSR issues
const Drawflow = dynamic(() => import('drawflow'), { ssr: false });

// Import Drawflow CSS
import 'drawflow/dist/drawflow.min.css';
import { WorkflowHistoryManager } from '@/lib/workflow-history';

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

interface DrawflowCanvasProps {
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
  onWorkflowChange?: (updatedFlowData: string) => void;
  onSave?: () => void;
  onPreview?: () => void;
  className?: string;
}

export default function DrawflowCanvas({
  workflow,
  onNodeClick,
  onEditNode,
  onWorkflowChange,
  onSave,
  onPreview,
  className = ""
}: DrawflowCanvasProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'edit' | 'view'>('edit');
  const [contextMenuNode, setContextMenuNode] = useState<WorkflowNode | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const drawflowRef = useRef<any>(null);
  const historyManagerRef = useRef<WorkflowHistoryManager | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y or Cmd+Y
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
      
      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode && drawflowRef.current) {
          // Remove the selected node
          drawflowRef.current.removeNodeId(selectedNode.id);
          setSelectedNode(null);
          notifyWorkflowChange();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNode, canUndo, canRedo]);

  // Parse workflow data and initialize history
  useEffect(() => {
    try {
      const flowData = JSON.parse(workflow.flowData);
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);
      
      // Initialize history manager
      if (!historyManagerRef.current) {
        historyManagerRef.current = new WorkflowHistoryManager({
          nodes: flowData.nodes || [],
          edges: flowData.edges || [],
          timestamp: Date.now()
        });
        updateHistoryButtons();
      }
    } catch (error) {
      console.error('Error parsing workflow data:', error);
    }
  }, [workflow.flowData]);

  // Initialize Drawflow
  useEffect(() => {
    if (typeof window !== 'undefined' && Drawflow && !isInitialized && nodes.length > 0) {
      initializeDrawflow();
    }
  }, [Drawflow, isInitialized, nodes, edges]);

  const initializeDrawflow = async () => {
    if (!containerRef.current) return;

    try {
      // Import Drawflow dynamically
      const DrawflowModule = await import('drawflow');
      const DrawflowClass = DrawflowModule.default;
      
      // Create Drawflow instance with editor mode enabled
      drawflowRef.current = new DrawflowClass(containerRef.current, 'vue', false, false);
      
      // Enable editor mode
      drawflowRef.current.editorMode = 'edit';
      
      // Start Drawflow
      drawflowRef.current.start();
      
      // Enable node dragging
      drawflowRef.current.draggable = true;
      
      // Enable connection creation
      drawflowRef.current.connectionMode = true;
      
      // Enable connection deletion
      drawflowRef.current.connectionDeletion = true;
      
      // Register custom node types
      registerNodeTypes();
      
      // Load existing workflow data
      loadWorkflowData();
      
      // Set up event listeners
      setupEventListeners();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing Drawflow:', error);
      // Fallback to simple canvas if Drawflow fails
      setIsInitialized(true);
    }
  };

  const registerNodeTypes = () => {
    if (!drawflowRef.current) return;

    // For now, we'll use the default node types and customize them with CSS classes
    // This is simpler than registering custom node types
    console.log('Drawflow initialized with default node types');
  };

  const loadWorkflowData = () => {
    if (!drawflowRef.current) return;

    // Clear existing nodes
    drawflowRef.current.clear();
    
    // Add nodes to Drawflow using default node type
    nodes.forEach(node => {
      try {
        drawflowRef.current.addNode(
          'default', // Use default node type
          node.position.x,
          node.position.y,
          {},
          'default',
          {
            ...node.data,
            id: node.id,
            type: node.type,
            position: node.position
          },
          node.id
        );
      } catch (error) {
        console.error('Error adding node:', error);
      }
    });
    
    // Add connections to Drawflow
    edges.forEach(edge => {
      try {
        drawflowRef.current.addConnection(
          edge.source,
          edge.target,
          'output_1',
          'input_1'
        );
      } catch (error) {
        console.error('Error adding connection:', error);
      }
    });
  };

  const setupEventListeners = () => {
    if (!drawflowRef.current) return;

    // Node created event
    drawflowRef.current.on('nodeCreated', (nodeId: string) => {
      console.log('Node created:', nodeId);
      notifyWorkflowChange();
    });

    // Node removed event
    drawflowRef.current.on('nodeRemoved', (nodeId: string) => {
      console.log('Node removed:', nodeId);
      notifyWorkflowChange();
    });

    // Node selected event
    drawflowRef.current.on('nodeSelected', (nodeId: string) => {
      console.log('Node selected:', nodeId);
      const node = drawflowRef.current.getNodeFromId(nodeId);
      if (node) {
        const workflowNode = convertDrawflowNodeToWorkflowNode(node);
        setSelectedNode(workflowNode);
        onNodeClick?.(workflowNode);
      }
    });

    // Node moved event
    drawflowRef.current.on('nodeMoved', (nodeId: string) => {
      console.log('Node moved:', nodeId);
      notifyWorkflowChange();
    });

    // Connection started event
    drawflowRef.current.on('connectionStart', (connection: any) => {
      console.log('Connection started:', connection);
      setIsConnecting(true);
    });

    // Connection ended event
    drawflowRef.current.on('connectionEnd', (connection: any) => {
      console.log('Connection ended:', connection);
      setIsConnecting(false);
    });

    // Connection created event
    drawflowRef.current.on('connectionCreated', (connection: any) => {
      console.log('Connection created:', connection);
      setIsConnecting(false);
      notifyWorkflowChange();
    });

    // Connection removed event
    drawflowRef.current.on('connectionRemoved', (connection: any) => {
      console.log('Connection removed:', connection);
      notifyWorkflowChange();
    });

    // Module changed event (any change in the canvas)
    drawflowRef.current.on('moduleChanged', (module: any) => {
      console.log('Module changed:', module);
      notifyWorkflowChange();
    });
  };

  // Convert Drawflow data to workflow format
  const convertDrawflowToWorkflow = () => {
    if (!drawflowRef.current) return null;

    try {
      const drawflowData = drawflowRef.current.export();
      const workflowNodes: WorkflowNode[] = [];
      const workflowEdges: WorkflowEdge[] = [];

      // Convert nodes
      Object.values(drawflowData.drawflow.Home.data).forEach((nodeData: any) => {
        if (nodeData.name) {
          workflowNodes.push({
            id: nodeData.id,
            type: nodeData.name,
            position: { x: nodeData.pos_x, y: nodeData.pos_y },
            data: {
              label: nodeData.data.label || nodeData.name,
              type: nodeData.name,
              category: nodeData.data.category || 'General',
              ...nodeData.data
            }
          });
        }
      });

      // Convert edges
      Object.values(drawflowData.drawflow.Home.data).forEach((nodeData: any) => {
        if (nodeData.outputs && nodeData.outputs.output_1) {
          nodeData.outputs.output_1.connections.forEach((connection: any) => {
            workflowEdges.push({
              source: nodeData.id,
              target: connection.node
            });
          });
        }
      });

      return {
        nodes: workflowNodes,
        edges: workflowEdges
      };
    } catch (error) {
      console.error('Error converting Drawflow data:', error);
      return null;
    }
  };

  // Notify parent component of workflow changes
  const notifyWorkflowChange = () => {
    if (onWorkflowChange) {
      const workflowData = convertDrawflowToWorkflow();
      if (workflowData) {
        const flowDataString = JSON.stringify({
          nodes: workflowData.nodes,
          edges: workflowData.edges
        });
        
        // Save state to history
        if (historyManagerRef.current) {
          historyManagerRef.current.saveState({
            nodes: workflowData.nodes,
            edges: workflowData.edges,
            timestamp: Date.now()
          });
          updateHistoryButtons();
        }
        
        onWorkflowChange(flowDataString);
      }
    }
  };

  // Convert Drawflow node to workflow node format
  const convertDrawflowNodeToWorkflowNode = (drawflowNode: any): WorkflowNode => {
    return {
      id: drawflowNode.id,
      type: drawflowNode.name,
      position: { x: drawflowNode.pos_x, y: drawflowNode.pos_y },
      data: {
        label: drawflowNode.data.label || drawflowNode.name,
        type: drawflowNode.name,
        category: drawflowNode.data.category || 'General',
        ...drawflowNode.data
      }
    };
  };

  // Drawflow control functions
  const zoomIn = () => {
    if (drawflowRef.current) {
      drawflowRef.current.zoom_in();
    }
  };

  const zoomOut = () => {
    if (drawflowRef.current) {
      drawflowRef.current.zoom_out();
    }
  };

  const zoomReset = () => {
    if (drawflowRef.current) {
      drawflowRef.current.zoom_reset();
    }
  };

  const exportData = () => {
    if (drawflowRef.current) {
      const data = drawflowRef.current.export();
      console.log('Exported Drawflow data:', data);
      // Here you could save the data or update the workflow
    }
  };

  // Toggle connection mode
  const toggleConnectionMode = () => {
    if (drawflowRef.current) {
      const newMode = connectionMode === 'edit' ? 'view' : 'edit';
      setConnectionMode(newMode);
      drawflowRef.current.connectionMode = newMode === 'edit';
      console.log(`Connection mode: ${newMode}`);
    }
  };

  // Clear all connections
  const clearAllConnections = () => {
    if (drawflowRef.current) {
      const data = drawflowRef.current.export();
      Object.values(data.drawflow.Home.data).forEach((nodeData: any) => {
        if (nodeData.outputs && nodeData.outputs.output_1) {
          nodeData.outputs.output_1.connections.forEach((connection: any) => {
            drawflowRef.current.removeSingleConnection(
              nodeData.id,
              connection.node,
              'output_1',
              'input_1'
            );
          });
        }
      });
      notifyWorkflowChange();
      console.log('All connections cleared');
    }
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (selectedNode && drawflowRef.current) {
      drawflowRef.current.removeNodeId(selectedNode.id);
      setSelectedNode(null);
      notifyWorkflowChange();
    }
  };

  // Delete selected connection (if any)
  const deleteSelectedConnection = () => {
    if (drawflowRef.current) {
      // This would need to be implemented based on how Drawflow handles connection selection
      console.log('Delete selected connection - to be implemented');
    }
  };

  // Context menu actions
  const handleContextMenuEdit = (node: WorkflowNode) => {
    onEditNode?.(node);
  };

  const handleContextMenuDelete = (node: WorkflowNode) => {
    if (drawflowRef.current) {
      drawflowRef.current.removeNodeId(node.id);
      setSelectedNode(null);
      notifyWorkflowChange();
    }
  };

  const handleContextMenuDuplicate = (node: WorkflowNode) => {
    if (drawflowRef.current) {
      const newNodeId = `node_${Date.now()}`;
      drawflowRef.current.addNode(
        'default',
        node.position.x + 50,
        node.position.y + 50,
        {},
        'default',
        {
          ...node.data,
          label: `${node.data.label} (cópia)`
        },
        newNodeId
      );
      notifyWorkflowChange();
    }
  };

  const handleContextMenuInfo = (node: WorkflowNode) => {
    alert(`Informações do nó:\nID: ${node.id}\nTipo: ${node.data.type}\nPosição: (${node.position.x}, ${node.position.y})`);
  };

  // Update history button states
  const updateHistoryButtons = () => {
    if (historyManagerRef.current) {
      setCanUndo(historyManagerRef.current.canUndo());
      setCanRedo(historyManagerRef.current.canRedo());
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (historyManagerRef.current && drawflowRef.current) {
      const previousState = historyManagerRef.current.undo();
      if (previousState) {
        // Clear canvas
        drawflowRef.current.clear();
        
        // Restore nodes
        previousState.nodes.forEach((node: any) => {
          drawflowRef.current.addNode(
            'default',
            node.position.x,
            node.position.y,
            {},
            'default',
            {
              ...node.data,
              id: node.id,
              type: node.type,
              position: node.position
            },
            node.id
          );
        });
        
        // Restore edges
        previousState.edges.forEach((edge: any) => {
          drawflowRef.current.addConnection(
            edge.source,
            edge.target,
            'output_1',
            'input_1'
          );
        });
        
        // Update local state
        setNodes(previousState.nodes);
        setEdges(previousState.edges);
        updateHistoryButtons();
        notifyWorkflowChange();
      }
    }
  };

  // Redo next action
  const handleRedo = () => {
    if (historyManagerRef.current && drawflowRef.current) {
      const nextState = historyManagerRef.current.redo();
      if (nextState) {
        // Clear canvas
        drawflowRef.current.clear();
        
        // Restore nodes
        nextState.nodes.forEach((node: any) => {
          drawflowRef.current.addNode(
            'default',
            node.position.x,
            node.position.y,
            {},
            'default',
            {
              ...node.data,
              id: node.id,
              type: node.type,
              position: node.position
            },
            node.id
          );
        });
        
        // Restore edges
        nextState.edges.forEach((edge: any) => {
          drawflowRef.current.addConnection(
            edge.source,
            edge.target,
            'output_1',
            'input_1'
          );
        });
        
        // Update local state
        setNodes(nextState.nodes);
        setEdges(nextState.edges);
        updateHistoryButtons();
        notifyWorkflowChange();
      }
    }
  };

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
              onClick={handleUndo}
              disabled={!canUndo}
              title="Desfazer (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              title="Refazer (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomReset}
              title="Resetar zoom"
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              title="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleConnectionMode}
              title={connectionMode === 'edit' ? 'Desabilitar conexões' : 'Habilitar conexões'}
            >
              {connectionMode === 'edit' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllConnections}
              title="Limpar todas as conexões"
            >
              <Unlink className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              title="Exportar dados"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (drawflowRef.current) {
                  drawflowRef.current.clear();
                  console.log('Canvas cleared');
                }
              }}
              title="Limpar canvas"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {nodes.length} nós • {edges.length} conexões • 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              connectionMode === 'edit' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {connectionMode === 'edit' ? 'Modo Edição' : 'Modo Visualização'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedNode && (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedNode}
                title="Deletar nó selecionado"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
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
        <div className="flex h-[600px]">
          {/* Sidebar with node types */}
          <div className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
            <h3 className="font-semibold text-sm mb-4">Node Types</h3>
            <div className="space-y-2">
              {['Start', 'Agent', 'Condition', 'LLM', 'Loop', 'Tool', 'Document', 'Memory', 'API'].map((nodeType) => (
                <div
                  key={nodeType}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('nodeType', nodeType);
                  }}
                  className="p-3 bg-white rounded-lg border cursor-move hover:shadow-md transition-shadow"
                  style={{ borderLeft: `4px solid ${getNodeColor(nodeType)}` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getNodeIcon(nodeType)}</span>
                    <div>
                      <div className="font-medium text-sm">{nodeType}</div>
                      <div className="text-xs text-gray-500">Drag to canvas</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main canvas area */}
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                ref={containerRef}
                className="flex-1 relative bg-gray-50"
                style={{
                  background: '#f9fafb',
                  backgroundImage: `
                    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const nodeType = e.dataTransfer.getData('nodeType');
                  if (nodeType && drawflowRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Add new node to Drawflow
                    const newNodeId = `node_${Date.now()}`;
                    drawflowRef.current.addNode(
                      'default',
                      x,
                      y,
                      {},
                      'default',
                      {
                        label: nodeType,
                        type: nodeType,
                        category: 'General'
                      },
                      newNodeId
                    );
                    
                    console.log(`Added ${nodeType} node at (${x}, ${y})`);
                    
                    // Notify parent component of the change
                    notifyWorkflowChange();
                  }
                }}
              >
                {!isInitialized && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando editor Drawflow...</p>
                    </div>
                  </div>
                )}
                
                {/* Connection mode indicator */}
                {isConnecting && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg pointer-events-none">
                    🔗 Modo de conexão ativo - Clique em um nó para conectar
                  </div>
                )}
                
                {/* Instructions overlay */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg pointer-events-none">
                  <div>🖱️ Arraste nós da sidebar • Arraste nós para reposicionar</div>
                  <div>🔗 Conecte nós clicando nos pontos de conexão • Delete com Delete/Backspace ou botão 🗑️</div>
                  <div>📋 Use o scroll para zoom • Clique nos nós para selecionar</div>
                  <div>🖱️ Botão direito nos nós para menu de contexto</div>
                </div>
              </div>
            </ContextMenuTrigger>
            
            <ContextMenuContent className="w-64">
              {contextMenuNode && (
                <>
                  <ContextMenuItem 
                    onClick={() => handleContextMenuEdit(contextMenuNode)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Nó
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => handleContextMenuDuplicate(contextMenuNode)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar Nó
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem 
                    onClick={() => handleContextMenuInfo(contextMenuNode)}
                    className="flex items-center gap-2"
                  >
                    <Info className="w-4 h-4" />
                    Informações
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem 
                    onClick={() => handleContextMenuDelete(contextMenuNode)}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar Nó
                  </ContextMenuItem>
                </>
              )}
              
              {!contextMenuNode && (
                <>
                  <ContextMenuItem 
                    onClick={() => {
                      const newNodeId = `node_${Date.now()}`;
                      if (drawflowRef.current) {
                        drawflowRef.current.addNode(
                          'default',
                          100,
                          100,
                          {},
                          'default',
                          {
                            label: 'Novo Nó',
                            type: 'Agent',
                            category: 'General'
                          },
                          newNodeId
                        );
                        notifyWorkflowChange();
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Nó
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={clearAllConnections}
                    className="flex items-center gap-2"
                  >
                    <Unlink className="w-4 h-4" />
                    Limpar Conexões
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowVisualization } from '.';
import { WorkflowComplexityIndicator } from './WorkflowComplexityIndicator';
import { 
  Settings, 
  Play, 
  Download, 
  Eye,
  GitBranch,
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  type?: string;
  status?: string;
  exportedToFlowise?: boolean;
  flowiseId?: string;
  workspace?: {
    name: string;
  };
}

interface FlowiseNode {
  path: string;
  label: string;
  desc: string;
  categoria: string;
  inputs: string | string[];
  outputs: string | string[];
}

interface WorkflowConfig {
  workflowName: string;
  workflowDescription: string;
  autoConnect: boolean;
  optimizeLayout: boolean;
  includeMemory: boolean;
  includeTools: boolean;
}

interface WorkflowData {
  nodes: FlowiseNode[];
  config: WorkflowConfig;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
  createdAt?: string;
  lastModified?: string;
}

interface WorkflowCardProps {
  agent: Agent;
  workflow: WorkflowData;
  showVisualization?: boolean;
  onEdit?: () => void;
  onExport?: () => void;
  onExecute?: () => void;
  className?: string;
}

export function WorkflowCard({
  agent,
  workflow,
  showVisualization = false,
  onEdit,
  onExport,
  onExecute,
  className = ''
}: WorkflowCardProps) {
  const [isVisualizationOpen, setIsVisualizationOpen] = useState(showVisualization);
  const [selectedNode, setSelectedNode] = useState<FlowiseNode | null>(null);

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple': return <Zap className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'complex': return <AlertTriangle className="h-4 w-4" />;
      default: return <GitBranch className="h-4 w-4" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNodeClick = (node: FlowiseNode) => {
    setSelectedNode(node);
    console.log('Node clicado:', node);
  };

  const handleEditWorkflow = () => {
    setIsVisualizationOpen(false);
    onEdit?.();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Card Principal do Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {workflow.config.workflowName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {workflow.config.workflowDescription}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getComplexityColor(workflow.complexity)}>
                {getComplexityIcon(workflow.complexity)}
                <span className="ml-1">
                  {workflow.complexity === 'simple' ? 'Simples' : 
                   workflow.complexity === 'medium' ? 'Médio' : 'Complexo'}
                </span>
              </Badge>
              {agent.exportedToFlowise && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Exportado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informações do Agente */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="font-medium text-sm">Agente</div>
              <div className="text-sm text-muted-foreground">{agent.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-sm">Workspace</div>
              <div className="text-sm text-muted-foreground">{agent.workspace?.name || 'N/A'}</div>
            </div>
          </div>

          {/* Indicador de Complexidade */}
          <WorkflowComplexityIndicator
            complexity={workflow.complexity}
            estimatedTime={workflow.estimatedTime}
            nodeCount={workflow.nodes.length}
          />

          {/* Resumo dos Nodes */}
          <div>
            <h4 className="font-medium text-sm mb-2">Nodes Configurados</h4>
            <div className="flex flex-wrap gap-2">
              {workflow.nodes.slice(0, 6).map((node, index) => (
                <Badge key={node.path} variant="outline" className="text-xs">
                  {node.label}
                </Badge>
              ))}
              {workflow.nodes.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{workflow.nodes.length - 6} mais
                </Badge>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisualizationOpen(!isVisualizationOpen)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isVisualizationOpen ? 'Ocultar' : 'Ver'} Fluxo
            </Button>
            
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Editar
              </Button>
            )}
            
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            )}
            
            {onExecute && (
              <Button
                size="sm"
                onClick={onExecute}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Executar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visualização do Workflow (Modal) */}
      {isVisualizationOpen && (
        <WorkflowVisualization
          workflow={{
            id: agent.id,
            name: workflow.config.workflowName,
            type: agent.type || 'AGENTFLOW',
            flowData: JSON.stringify({
              nodes: workflow.nodes,
              edges: [], // TODO: Generate edges based on node connections
              viewport: { x: 0, y: 0, zoom: 1 }
            }),
            nodeCount: workflow.nodes.length,
            edgeCount: 0, // TODO: Calculate actual edge count
            complexityScore: workflow.complexity === 'simple' ? 3 : 
                           workflow.complexity === 'medium' ? 8 : 15,
            deployed: agent.exportedToFlowise || false
          }}
        />
      )}
    </div>
  );
}
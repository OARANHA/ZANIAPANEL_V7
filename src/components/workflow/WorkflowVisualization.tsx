"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Eye, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Zap, 
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import ReactFlowCanvas from './ReactFlowCanvas';

interface WorkflowVisualizationProps {
  workflow: {
    id: string;
    name: string;
    type: string;
    flowData: string;
    nodeCount: number;
    edgeCount: number;
    complexityScore: number;
    deployed: boolean;
  };
}

export default function WorkflowVisualization({ workflow }: WorkflowVisualizationProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidData, setHasValidData] = useState(false);

  useEffect(() => {
    console.log('🎯 WorkflowVisualization rendered with:', {
      id: workflow.id,
      name: workflow.name,
      type: workflow.type,
      flowDataLength: workflow.flowData?.length || 0,
      flowDataPreview: workflow.flowData?.substring(0, 100) + '...',
      nodeCount: workflow.nodeCount,
      edgeCount: workflow.edgeCount,
      complexityScore: workflow.complexityScore,
      deployed: workflow.deployed
    });

    // Check if workflow has valid data
    const hasData = workflow.flowData && 
                   workflow.flowData !== '{}' && 
                   workflow.flowData !== 'null' && 
                   workflow.flowData !== 'undefined' &&
                   workflow.flowData.trim() !== '';
    
    setHasValidData(hasData);
    setIsLoading(false);
  }, [workflow]);

  const VisualizationContent = () => (
    <div className="space-y-4">
      {/* Workflow Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{workflow.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{workflow.type}</Badge>
            <Badge variant={workflow.deployed ? "default" : "secondary"}>
              {workflow.deployed ? "Deployed" : "Not Deployed"}
            </Badge>
            <Badge 
              className={
                workflow.complexityScore > 20 ? "bg-red-100 text-red-800" :
                workflow.complexityScore > 10 ? "bg-yellow-100 text-yellow-800" :
                "bg-green-100 text-green-800"
              }
            >
              Complexidade: {workflow.complexityScore}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Carregando visualização...</span>
          </div>
        ) : !hasValidData ? (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium mb-2">Nenhum dado de visualização encontrado</p>
              <p className="text-sm">O workflow pode não possuir dados estruturais válidos.</p>
              <p className="text-xs mt-1">ID: {workflow.id}</p>
              <p className="text-xs">Tipo: {workflow.type}</p>
              <p className="text-xs">Dados: {workflow.flowData?.substring(0, 50) || 'vazio'}</p>
            </div>
          </div>
        ) : (
          <div className="h-96">
            <ReactFlowCanvas
              workflow={workflow}
              className="w-full h-full"
              onNodeClick={(node) => {
                console.log('Node clicked:', node);
              }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{workflow.nodeCount}</div>
          <div className="text-sm text-blue-800">Nós</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{workflow.edgeCount}</div>
          <div className="text-sm text-green-800">Conexões</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{workflow.complexityScore}</div>
          <div className="text-sm text-purple-800">Complexidade</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{workflow.type}</div>
          <div className="text-sm text-orange-800">Tipo</div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4" />
          Visualizar
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-6xl ${isFullscreen ? 'max-h-[90vh]' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Visualização do Workflow
          </DialogTitle>
          <DialogDescription>
            Visualização estrutural do workflow {workflow.name}
          </DialogDescription>
        </DialogHeader>
        <VisualizationContent />
      </DialogContent>
    </Dialog>
  );
}

// Create a proper named export by re-exporting the default
const WorkflowVisualizationNamed = WorkflowVisualization;
export { WorkflowVisualizationNamed as WorkflowVisualization };
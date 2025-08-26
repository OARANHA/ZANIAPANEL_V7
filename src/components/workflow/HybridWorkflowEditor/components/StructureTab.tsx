import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FlowiseWorkflow } from '../types';

interface StructureTabProps {
  workflowData: FlowiseWorkflow;
}

export default function StructureTab({ workflowData }: StructureTabProps) {
  const renderNodes = () => {
    try {
      const flowData = JSON.parse(workflowData.flowData);
      return flowData.nodes?.map((node: any, index: number) => (
        <div key={index} className="flex items-center justify-between p-2 border rounded">
          <div>
            <div className="font-medium">{node.data?.label || 'Nó sem nome'}</div>
            <div className="text-sm text-gray-600">{node.data?.type}</div>
          </div>
          <Badge variant="outline">{node.type}</Badge>
        </div>
      ));
    } catch {
      return <div className="text-gray-500">Erro ao carregar estrutura</div>;
    }
  };

  const renderEdges = () => {
    try {
      const flowData = JSON.parse(workflowData.flowData);
      return flowData.edges?.map((edge: any, index: number) => (
        <div key={index} className="flex items-center justify-between p-2 border rounded">
          <div className="text-sm">
            {edge.source} → {edge.target}
          </div>
          <div className="text-xs text-gray-500">conexão</div>
        </div>
      ));
    } catch {
      return <div className="text-gray-500">Erro ao carregar conexões</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estrutura do Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Nós ({workflowData.nodeCount})</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {renderNodes()}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Conexões ({workflowData.edgeCount})</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {renderEdges()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Code, Shield, Zap, Info } from 'lucide-react';
import CanvasTab from './CanvasTab';
import StructureTab from './StructureTab';
import ValidationTab from './ValidationTab';
import CapabilitiesTab from './CapabilitiesTab';
import type { FlowiseWorkflow } from '../types';
import type { ValidationResult } from '@/lib/workflow-validator';
import { useMemo } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { WorkflowValidationMessages } from '@/components/workflow/WorkflowValidationMessages';

interface WorkflowTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  workflowData: FlowiseWorkflow;
  validationResults: ValidationResult | null;
  isValidating: boolean;
  onNodeClick: (node: any) => void;
  onEditNode: (node: any) => void;
  onSave: () => void;
  onPreview?: () => void;
  onValidate: () => void;
}

export default function WorkflowTabs({
  activeTab,
  onTabChange,
  workflowData,
  validationResults,
  isValidating,
  onNodeClick,
  onEditNode,
  onSave,
  onPreview,
  onValidate
}: WorkflowTabsProps) {
  const validationMessages = useMemo(() => {
    if (!validationResults) return [];
    
    const messages: any[] = [];
    
    // Converter erros
    validationResults.errors.forEach(error => {
      messages.push({
        id: error.id,
        type: 'error',
        title: error.message,
        description: error.description,
        nodeId: error.nodeId,
        nodeName: error.nodeId ? getNodeNameById(error.nodeId) : undefined,
        fix: error.fix
      });
    });
    
    // Converter avisos
    validationResults.warnings.forEach(warning => {
      messages.push({
        id: warning.id,
        type: 'warning',
        title: warning.message,
        description: warning.description,
        nodeId: warning.nodeId,
        nodeName: warning.nodeId ? getNodeNameById(warning.nodeId) : undefined,
        suggestion: warning.suggestion
      });
    });
    
    // Converter sugestões
    validationResults.suggestions.forEach(suggestion => {
      messages.push({
        id: suggestion.id,
        type: 'info',
        title: suggestion.message,
        description: suggestion.description,
        suggestion: suggestion.implementation
      });
    });
    
    return messages;
  }, [validationResults]);

  const getNodeNameById = (nodeId: string) => {
    try {
      const flowData = JSON.parse(workflowData.flowData);
      const node = flowData.nodes?.find((n: any) => n.id === nodeId);
      return node?.data?.name || node?.data?.label || nodeId;
    } catch {
      return nodeId;
    }
  };

  // Verificar se o workflow é um Chatflow (não requer nó de início)
  const isChatflow = useMemo(() => {
    try {
      const flowData = JSON.parse(workflowData.flowData);
      const nodes = flowData.nodes || [];
      
      // Verificar se há nós de Agent Flow
      const hasAgentNodes = nodes.some((n: any) => 
        n.data?.category === 'Agent Flow' ||
        n.data?.type?.toLowerCase().includes('agent') ||
        n.data?.name?.toLowerCase().includes('agent')
      );
      
      return !hasAgentNodes;
    } catch {
      return true; // Assume Chatflow by default
    }
  }, [workflowData]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="code">Código</TabsTrigger>
        <TabsTrigger value="validation">Validação</TabsTrigger>
        <TabsTrigger value="analysis">Análise</TabsTrigger>
      </TabsList>
      
      <TabsContent value="visual" className="mt-4">
        <CanvasTab
          workflowData={workflowData}
          onNodeClick={onNodeClick}
          onEditNode={onEditNode}
          onSave={onSave}
          onPreview={onPreview}
        />
      </TabsContent>
      
      <TabsContent value="code" className="mt-4">
        <StructureTab workflowData={workflowData} />
      </TabsContent>
      
      <TabsContent value="validation" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Validação do Workflow</CardTitle>
            <CardDescription>
              Verifique erros, avisos e sugestões de otimização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isValidating ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Validando workflow...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={validationResults?.valid ? "default" : "destructive"}
                      className="text-sm"
                    >
                      {validationResults?.valid ? 'Válido' : 'Inválido'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {validationResults?.errors.length || 0} erros, 
                      {validationResults?.warnings.length || 0} avisos, 
                      {validationResults?.suggestions.length || 0} sugestões
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onValidate}
                    disabled={isValidating}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
                    Revalidar
                  </Button>
                </div>
                
                {isChatflow && (
                  <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                    <Info className="h-4 w-4 inline mr-1" />
                    Este é um Chatflow. Nós de entrada como ChatOpenAI, Text File, etc. podem servir como pontos de início.
                  </div>
                )}
                
                <WorkflowValidationMessages 
                  messages={validationMessages}
                  onNodeSelect={onNodeClick}
                />
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="analysis" className="mt-4">
        <CapabilitiesTab workflowData={workflowData} />
      </TabsContent>
    </Tabs>
  );
}
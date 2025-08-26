'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCw,
  Eye,
  BarChart3,
  Zap,
  Clock,
  DollarSign,
  MemoryStick,
  Workflow,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import { FlowiseNode, FlowiseEdge } from '@/lib/agent-to-flowise-transformer';
import { 
  WorkflowPreview, 
  ValidationResult, 
  OptimizationSuggestion,
  WorkflowMetrics 
} from '@/lib/workflow-validator';

interface WorkflowValidationInterfaceProps {
  nodes: FlowiseNode[];
  edges: FlowiseEdge[];
  onValidationComplete?: (preview: WorkflowPreview) => void;
}

export default function WorkflowValidationInterface({
  nodes,
  edges,
  onValidationComplete
}: WorkflowValidationInterfaceProps) {
  
  const [preview, setPreview] = useState<WorkflowPreview | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationOptions, setValidationOptions] = useState({
    strictMode: false,
    includePerformanceAnalysis: true,
    includeCostAnalysis: true
  });

  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0) {
      validateWorkflow();
    }
  }, [nodes, edges]);

  const validateWorkflow = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/admin/api/workflows/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
          options: validationOptions
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreview(data.preview);
          if (onValidationComplete) {
            onValidationComplete(data.preview);
          }
        } else {
          throw new Error('Falha na validação');
        }
      } else {
        throw new Error('Falha na requisição');
      }
    } catch (error) {
      console.error('Erro ao validar workflow:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  const getSeverityColor = (type: 'critical' | 'error' | 'warning') => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
    }
  };

  if (!preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Validação de Workflow</span>
          </CardTitle>
          <CardDescription>
            Analise e valide a estrutura e configurações do seu workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              {isValidating ? (
                <div className="space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                  <p>Validando workflow...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Adicione nós e conexões para validar o workflow
                  </p>
                  <Button onClick={validateWorkflow} disabled={nodes.length === 0}>
                    Validar Workflow
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { validation, metrics } = preview;

  return (
    <div className="space-y-6">
      {/* Header com Score e Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Validação de Workflow</span>
                <Badge variant={validation.valid ? 'default' : 'destructive'}>
                  {validation.valid ? 'Válido' : 'Inválido'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Análise completa da estrutura, configurações e performance do workflow
              </CardDescription>
            </div>
            <Button onClick={validateWorkflow} disabled={isValidating}>
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Revalidar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score</span>
                <span className="text-lg font-bold">{validation.score}/100</span>
              </div>
              <Progress value={validation.score} className="h-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{validation.errors.length}</div>
              <div className="text-xs text-muted-foreground">Erros</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{validation.warnings.length}</div>
              <div className="text-xs text-muted-foreground">Avisos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{validation.suggestions.length}</div>
              <div className="text-xs text-muted-foreground">Sugestões</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Problemas</span>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>Sugestões</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Métricas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Resumo dos Nós */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Nós</CardTitle>
              <CardDescription>
                Status de cada nó no workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preview.nodes.map((node) => (
                  <Card key={node.id} className={`p-4 ${getStatusColor(node.status)}`}>
                    <div className="flex items-start justify-between space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(node.status)}
                          <span className="font-medium">{node.name}</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {node.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {node.connections.incoming}→{node.connections.outgoing}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {node.executionTime} • {node.cost}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fluxo do Workflow */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxo do Workflow</CardTitle>
              <CardDescription>
                Caminhos de execução identificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preview.flow.map((path, index) => (
                  <Card key={path.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={path.type === 'main' ? 'default' : 'secondary'}>
                          {path.type === 'main' ? 'Principal' : 'Alternativo'}
                        </Badge>
                        <span className="font-medium">{path.description}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Ordem: {path.executionOrder}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <span>Nós: {path.nodes.length}</span>
                        <span>•</span>
                        <span>Conexões: {path.edges.length}</span>
                      </div>
                      <div className="mt-1 text-xs">
                        Caminho: {path.nodes.join(' → ')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          {/* Erros */}
          {validation.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>Erros ({validation.errors.length})</span>
                </CardTitle>
                <CardDescription>
                  Problemas críticos que impedem a execução do workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {validation.errors.map((error) => (
                    <Alert key={error.id} variant="destructive">
                      <AlertTitle className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4" />
                        <span>{error.message}</span>
                        <Badge variant={getSeverityColor(error.type)} className="ml-auto">
                          {error.type}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        <div className="space-y-2">
                          <p>{error.description}</p>
                          {error.fix && (
                            <div className="bg-red-50 p-2 rounded text-sm">
                              <strong>Solução:</strong> {error.fix}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Avisos ({validation.warnings.length})</span>
                </CardTitle>
                <CardDescription>
                  Alertas que não impedem a execução mas merecem atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {validation.warnings.map((warning) => (
                    <Alert key={warning.id}>
                      <AlertTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{warning.message}</span>
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        <div className="space-y-2">
                          <p>{warning.description}</p>
                          <div className="bg-yellow-50 p-2 rounded text-sm">
                            <strong>Sugestão:</strong> {warning.suggestion}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {validation.errors.length === 0 && validation.warnings.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-600">Nenhum problema encontrado</h3>
                  <p className="text-muted-foreground">
                    Seu workflow está configurado corretamente
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Sugestões de Otimização ({validation.suggestions.length})</span>
              </CardTitle>
              <CardDescription>
                Recomendações para melhorar performance, estrutura e reduzir custos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validation.suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="p-4">
                    <div className="flex items-start justify-between space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{suggestion.message}</h4>
                          <Badge variant={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority}
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        <div className="bg-blue-50 p-3 rounded text-sm">
                          <div className="font-medium text-blue-800 mb-1">Impacto Esperado:</div>
                          <p className="text-blue-700">{suggestion.impact}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded text-sm mt-2">
                          <div className="font-medium text-green-800 mb-1">Implementação:</div>
                          <p className="text-green-700">{suggestion.implementation}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Complexidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.complexityScore}/100</div>
                <Progress value={metrics.complexityScore} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tempo Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.estimatedExecutionTime}</div>
                <p className="text-xs text-muted-foreground">Execução</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{metrics.memoryUsage}</div>
                <p className="text-xs text-muted-foreground">Consumo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Custo Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{metrics.costEstimate}</div>
                <p className="text-xs text-muted-foreground">Mensal</p>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Workflow className="h-5 w-5" />
                  <span>Estrutura</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total de Nós</span>
                  <span className="font-medium">{metrics.nodeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total de Conexões</span>
                  <span className="font-medium">{metrics.edgeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profundidade Máxima</span>
                  <span className="font-medium">{metrics.maxDepth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Caminhos Paralelos</span>
                  <span className="font-medium">{metrics.parallelPaths}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comprimento do Caminho Crítico</span>
                  <span className="font-medium">{metrics.criticalPathLength}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Score de Validação</span>
                  <span className="font-medium">{validation.score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Erros Críticos</span>
                  <span className="font-medium text-red-600">{validation.errors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avisos</span>
                  <span className="font-medium text-yellow-600">{validation.warnings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Oportunidades de Otimização</span>
                  <span className="font-medium text-blue-600">{validation.suggestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo de Execução</span>
                  <span className="font-medium">{metrics.estimatedExecutionTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
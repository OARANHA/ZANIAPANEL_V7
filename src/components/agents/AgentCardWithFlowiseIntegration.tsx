"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FunctionalCard from '@/components/FunctionalCard';
import { FlowiseChat } from '@/components/flowise-chat';
import { AgentCardWithFlowiseStats } from '@/components/AgentCardWithFlowiseStats';
import { FlowiseNodeCatalog } from '@/components/FlowiseNodeCatalog';
import { AgentNodeConfigDialog } from '@/components/agents/AgentNodeConfigDialog';
import { WorkflowCard } from '@/components/workflow';
import { 
  Brain, 
  Settings, 
  Play, 
  Archive, 
  Loader2, 
  MessageSquare,
  Activity,
  BarChart3,
  Zap,
  RefreshCw,
  GitBranch
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  roleDefinition: string;
  groups: any[];
  customInstructions: string;
  workspaceId: string;
  workspace?: {
    name: string;
    description: string;
  };
  config?: string;
  knowledge?: string;
  status?: 'active' | 'inactive' | 'training';
  chatflowUrl?: string;
  flowiseId?: string;
  exportedToFlowise?: boolean;
  exportedAt?: string;
}

interface AgentCardWithFlowiseIntegrationProps {
  agent: Agent;
  viewMode: 'functional' | 'traditional';
  onExecute: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onViewDetails: (agent: Agent) => void;
  onExportToFlowise: (agent: Agent) => void;
  onArchive: (agent: Agent) => void;
  onStatsUpdate?: (stats: any) => void;
}

export function AgentCardWithFlowiseIntegration({
  agent,
  viewMode,
  onExecute,
  onEdit,
  onViewDetails,
  onExportToFlowise,
  onArchive,
  onStatsUpdate
}: AgentCardWithFlowiseIntegrationProps) {
  const [showFlowiseStats, setShowFlowiseStats] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRecommendedNodes, setShowRecommendedNodes] = useState(false);
  const [showNodeConfigDialog, setShowNodeConfigDialog] = useState(false);
  const [showWorkflowVisualization, setShowWorkflowVisualization] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [agentActions, setAgentActions] = useState<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  }>>([]);
  const [recommendedNodes, setRecommendedNodes] = useState<Array<{
    categoria: string;
    label: string;
    desc: string;
    path: string;
    inputs: string;
    outputs: string;
  }>>([]);

  // Estado para dados do workflow
  const [workflowData, setWorkflowData] = useState<{
    nodes: Array<{
      label: string;
      desc: string;
      path: string;
      categoria: string;
      inputs: string[];
      outputs: string[];
    }>;
    config: {
      workflowName: string;
      workflowDescription: string;
      autoConnect: boolean;
      optimizeLayout: boolean;
      includeMemory: boolean;
      includeTools: boolean;
    };
    complexity: 'simple' | 'medium' | 'complex';
    estimatedTime: string;
  } | null>(null);

  // Extrair ações do agente da configuração
  useEffect(() => {
    const actions = extractAgentActions(agent);
    setAgentActions(actions);
  }, [agent]);

  // Verificar se o agente está conectado ao Flowise
  const isFlowiseConnected = !!(agent.flowiseId || agent.chatflowUrl);
  const flowiseChatflowId = agent.flowiseId || extractChatflowIdFromUrl(agent.chatflowUrl || '');

  // Carregar nodes reais do workflow do Flowise (se disponível)
  const loadActualWorkflowNodes = async () => {
    try {
      if (!flowiseChatflowId) return;
      
      console.log('🎯 Loading actual workflow nodes for:', flowiseChatflowId);
      const response = await fetch(`/api/flowise-workflow/${flowiseChatflowId}/nodes`);
      
      if (response.ok) {
        const data: any = await response.json();
        console.log('🎯 Actual workflow nodes loaded:', data.nodes);
        setRecommendedNodes(data.nodes || []);
      } else {
        console.warn('⚠️ Failed to load workflow nodes from Flowise');
        setRecommendedNodes([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar nodes do workflow:', error);
      setRecommendedNodes([]);
    }
  };

  useEffect(() => {
    if (flowiseChatflowId) {
      loadActualWorkflowNodes();
    } else {
      setRecommendedNodes([]);
    }
  }, [flowiseChatflowId]);

  const extractAgentType = (agent: Agent): string => {
    if (agent.name.toLowerCase().includes('chat') || agent.description?.toLowerCase().includes('chat')) return 'chat';
    if (agent.name.toLowerCase().includes('assistant') || agent.description?.toLowerCase().includes('assistant')) return 'assistant';
    if (agent.name.toLowerCase().includes('rag') || agent.description?.toLowerCase().includes('rag')) return 'rag';
    if (agent.name.toLowerCase().includes('workflow') || agent.description?.toLowerCase().includes('workflow')) return 'workflow';
    if (agent.name.toLowerCase().includes('api') || agent.description?.toLowerCase().includes('api')) return 'api';
    return 'default';
  };

  // Extrair ações da configuração do agente
  const extractAgentActions = (agent: Agent) => {
    const defaultActions = [
      {
        id: 'analyze',
        name: 'Analisar',
        description: 'Analisar dados e informações',
        icon: 'Brain',
        category: 'analysis'
      },
      {
        id: 'advise',
        name: 'Aconselhar',
        description: 'Fornecer recomendações',
        icon: 'Settings',
        category: 'consulting'
      }
    ];

    try {
      if (agent.config) {
        // Tentar fazer parse da configuração
        const config = typeof agent.config === 'string' ? JSON.parse(agent.config) : agent.config;
        
        if (config.actions && Array.isArray(config.actions)) {
          return config.actions.map((action: any, index: number) => ({
            id: action.id || `action_${index}`,
            name: action.name || `Ação ${index + 1}`,
            description: action.description || 'Descrição não disponível',
            icon: action.icon || 'Zap',
            category: action.category || 'general'
          }));
        }
      }
    } catch (error) {
      console.warn('Erro ao extrair ações do agente:', error);
    }

    return defaultActions;
  };

  // Extrair chatflow ID da URL
  function extractChatflowIdFromUrl(url: string): string | null {
    if (!url) return null;
    
    try {
      const match = url.match(/\/agentflows\/([a-f0-9-]{36})/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  // Exportar para Flowise
  const handleExportToFlowise = async () => {
    setIsExporting(true);
    try {
      await onExportToFlowise(agent);
    } finally {
      setIsExporting(false);
    }
  };

  // Funções para o diálogo de configuração de nodes
  const handleSaveNodeConfig = (selectedNodes: any[], config: any) => {
    console.log('Configuração de nodes salva:', { selectedNodes, config });
    
    // Gerar dados do workflow para visualização
    const workflowComplexity: 'simple' | 'medium' | 'complex' = selectedNodes.length > 3 ? 'complex' : 
                               selectedNodes.length > 1 ? 'medium' : 'simple';
    
    const estimatedTime = selectedNodes.length > 3 ? '2-5 minutos' : 
                         selectedNodes.length > 1 ? '1-2 minutos' : '< 1 minuto';
    
    const workflowData = {
      nodes: selectedNodes.map(node => ({
        label: node.label,
        desc: node.desc,
        path: node.path,
        categoria: node.categoria,
        inputs: node.inputs || [],
        outputs: node.outputs || []
      })),
      config: {
        workflowName: config.workflowName || `${agent.name} Workflow`,
        workflowDescription: config.workflowDescription || `Workflow exportado do agente ${agent.name}`,
        autoConnect: config.autoConnect || true,
        optimizeLayout: config.optimizeLayout || true,
        includeMemory: config.includeMemory !== false,
        includeTools: config.includeTools !== false
      },
      complexity: workflowComplexity,
      estimatedTime: estimatedTime
    };
    
    setWorkflowData(workflowData);
    console.log('Dados do workflow gerados:', workflowData);
    
    // Aqui podemos salvar a configuração no agente ou em um storage separado
    // Por enquanto, apenas geramos os dados para visualização
  };

  const handleExportWithNodeConfig = async (selectedNodes: any[], config: any) => {
    try {
      // Preparar dados para exportação com a configuração personalizada
      const exportData = {
        agent,
        selectedNodes,
        workflowConfig: config
      };
      
      // Chamar a API de exportação com a configuração personalizada
      const response = await fetch('/api/agents/export-to-flowise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Exportação com configuração personalizada:', result);
        // Atualizar o agente com o flowiseId se necessário
      }
    } catch (error) {
      console.error('Erro ao exportar com configuração personalizada:', error);
    }
  };

  // Se estiver no modo funcional, usa o FunctionalCard existente
  if (viewMode === 'functional') {
    return (
      <div className="space-y-4">
        {/* Card Funcional Principal */}
        <FunctionalCard
          key={agent.id}
          agent={{
            id: agent.id,
            name: agent.name,
            description: agent.description,
            type: agent.type,
            config: agent.config,
            knowledge: agent.knowledge,
            status: agent.status
          }}
        />

        {/* Controles do Flowise */}
        {isFlowiseConnected && (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Integração Flowise</h4>
                    <p className="text-sm text-muted-foreground">
                      Estatísticas e chat em tempo real
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={showFlowiseStats ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFlowiseStats(!showFlowiseStats)}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {showFlowiseStats ? 'Ocultar Estatísticas' : 'Mostrar Estatísticas'}
                  </Button>
                  
                  <Button
                    variant={showChat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowChat(!showChat)}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {showChat ? 'Ocultar Chat' : 'Mostrar Chat'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nodes Recomendados */}
        {recommendedNodes.length > 0 ? (
          <Card className="border-dashed border-2 border-purple-300 dark:border-purple-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold">
                      {isFlowiseConnected ? 'Nodes do Workflow' : 'Aguardando Conexão Flowise'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isFlowiseConnected 
                        ? 'Nodes utilizados no workflow do Flowise'
                        : 'Conecte este agente ao Flowise para ver os nodes'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={showRecommendedNodes ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRecommendedNodes(!showRecommendedNodes)}
                    className="flex items-center gap-2"
                    disabled={!isFlowiseConnected || recommendedNodes.length === 0}
                  >
                    <Brain className="h-4 w-4" />
                    {showRecommendedNodes ? 'Ocultar Nodes' : 
                     isFlowiseConnected ? 'Ver Nodes' : 'Conectar ao Flowise'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🔧 Configurar button clicked!');
                      console.log('🔧 showNodeConfigDialog before:', showNodeConfigDialog);
                      setShowNodeConfigDialog(true);
                      console.log('🔧 showNodeConfigDialog after:', showNodeConfigDialog);
                      // Forçar uma atualização do estado
                      setTimeout(() => {
                        console.log('🔧 showNodeConfigDialog after timeout:', showNodeConfigDialog);
                      }, 100);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Configurar
                  </Button>
                  
                  {workflowData && (
                    <Button
                      variant={showWorkflowVisualization ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowWorkflowVisualization(!showWorkflowVisualization)}
                      className="flex items-center gap-2"
                    >
                      <GitBranch className="h-4 w-4" />
                      {showWorkflowVisualization ? 'Ocultar Workflow' : 'Ver Workflow'}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Preview dos nodes do workflow */}
              {!showRecommendedNodes && (
                <div className="flex flex-wrap gap-2">
                  {isFlowiseConnected ? (
                    recommendedNodes.length > 0 ? (
                      <>
                        {recommendedNodes.slice(0, 3).map((node, index) => (
                          <Badge 
                            key={node.path || index} 
                            variant="secondary" 
                            className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          >
                            {node.label}
                          </Badge>
                        ))}
                        {recommendedNodes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{recommendedNodes.length - 3} mais
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Carregando nodes...
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="text-xs text-red-600">
                      Agente não conectado ao Flowise
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Lista detalhada dos nodes do workflow */}
              {showRecommendedNodes && (
                <div className="space-y-2 mt-3">
                  {isFlowiseConnected ? (
                    recommendedNodes.length > 0 ? (
                      recommendedNodes.map((node, index) => (
                        <div key={node.path || index} className="p-2 bg-muted/50 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-sm">{node.label}</h5>
                              <p className="text-xs text-muted-foreground">{node.desc || 'Node do workflow'}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {node.categoria || 'Workflow'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">Carregando nodes do workflow...</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">Conecte o agente ao Flowise para ver os nodes</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Mensagem quando não há conexão com Flowise */
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-semibold">Agente Não Conectado</h4>
                    <p className="text-sm text-muted-foreground">
                      Este agente precisa ser conectado ao Flowise para mostrar nodes reais
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔧 Export to Flowise button clicked');
                    handleExportToFlowise();
                  }}
                  className="flex items-center gap-2"
                  disabled={isExporting}
                >
                  <Settings className="h-4 w-4" />
                  {isExporting ? 'Conectando...' : 'Conectar ao Flowise'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visualização do Workflow - Fase 3 */}
        {workflowData && showWorkflowVisualization && (
          <WorkflowCard
            agent={{
              id: agent.id,
              name: agent.name,
              description: agent.description,
              type: agent.type,
              status: agent.status,
              exportedToFlowise: agent.exportedToFlowise,
              flowiseId: agent.flowiseId,
              workspace: agent.workspace
            }}
            workflow={workflowData}
            showVisualization={true}
            onEdit={() => setShowNodeConfigDialog(true)}
            onExport={handleExportToFlowise}
          />
        )}

        {/* Estatísticas do Flowise */}
        {showFlowiseStats && flowiseChatflowId && (
          <AgentCardWithFlowiseStats
            agent={{
              id: agent.id,
              name: agent.name,
              description: agent.description,
              actions: agentActions
            }}
            flowiseChatflowId={flowiseChatflowId || ''}
            onStatsUpdate={onStatsUpdate}
          />
        )}

        {/* Chat do Flowise */}
        {showChat && flowiseChatflowId && (
          <Card>
            <CardContent className="p-4">
              <FlowiseChat
                flowiseId={flowiseChatflowId}
                title={agent.name}
                description={`Converse diretamente com ${agent.name} via Flowise`}
                placeholder="Digite sua mensagem aqui..."
              />
            </CardContent>
          </Card>
        )}

        {/* Diálogo de configuração de nodes (disponível em ambos os modos) */}
        <AgentNodeConfigDialog
          agent={agent}
          isOpen={showNodeConfigDialog}
          onClose={() => {
            console.log('🔧 Dialog onClose called');
            setShowNodeConfigDialog(false);
          }}
          onSave={(selectedNodes, config) => {
            console.log('🔧 Dialog onSave called');
            handleSaveNodeConfig(selectedNodes, config);
          }}
          onExport={(selectedNodes, config) => {
            console.log('🔧 Dialog onExport called');
            handleExportWithNodeConfig(selectedNodes, config);
          }}
        />
      </div>
    );
  }

  // Modo tradicional - usa o card com estatísticas integradas
  return (
    <>
      <AgentCardWithFlowiseStats
        agent={{
          id: agent.id,
          name: agent.name,
          description: agent.description,
          actions: agentActions
        }}
        flowiseChatflowId={flowiseChatflowId || ''}
        onStatsUpdate={onStatsUpdate}
      />
      
      {/* Diálogo de configuração de nodes (disponível em ambos os modos) */}
      <AgentNodeConfigDialog
        agent={agent}
        isOpen={showNodeConfigDialog}
        onClose={() => {
          console.log('🔧 Dialog onClose called');
          setShowNodeConfigDialog(false);
        }}
        onSave={(selectedNodes, config) => {
          console.log('🔧 Dialog onSave called');
          handleSaveNodeConfig(selectedNodes, config);
        }}
        onExport={(selectedNodes, config) => {
          console.log('🔧 Dialog onExport called');
          handleExportWithNodeConfig(selectedNodes, config);
        }}
      />
    </>
  );
}

// Funções auxiliares
function extractAgentCategory(agent: Agent): string {
  if (agent.name.toLowerCase().includes('analista')) return 'business';
  if (agent.name.toLowerCase().includes('consultor')) return 'consulting';
  if (agent.name.toLowerCase().includes('especialista')) return 'expert';
  return 'general';
}

function extractAgentDifficulty(agent: Agent): 'beginner' | 'intermediate' | 'advanced' {
  if (agent.type === 'template') return 'beginner';
  if (agent.type === 'custom') return 'intermediate';
  return 'advanced';
}

function getActionIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    'Brain': Brain,
    'Settings': Settings,
    'Play': Play,
    'Archive': Archive,
    'Zap': Zap,
    'BarChart3': BarChart3,
    'Activity': Activity,
    'MessageSquare': MessageSquare,
    'RefreshCw': RefreshCw
  };
  
  return iconMap[iconName] || Zap;
}

function extractAgentType(agent: Agent): string {
  if (agent.name.toLowerCase().includes('chat') || agent.description?.toLowerCase().includes('chat')) return 'chat';
  if (agent.name.toLowerCase().includes('assistant') || agent.description?.toLowerCase().includes('assistant')) return 'assistant';
  if (agent.name.toLowerCase().includes('rag') || agent.description?.toLowerCase().includes('rag')) return 'rag';
  if (agent.name.toLowerCase().includes('workflow') || agent.description?.toLowerCase().includes('workflow')) return 'workflow';
  if (agent.name.toLowerCase().includes('api') || agent.description?.toLowerCase().includes('api')) return 'api';
  return 'default';
}
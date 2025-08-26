import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Agent } from '../types';

export const useAgents = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [flowiseConnectionStatus, setFlowiseConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const loadAgents = async () => {
    try {
      console.log('🔄 Carregando agentes diretamente do Flowise...');
      
      // Buscar workflows do Flowise diretamente
      const flowiseResponse = await fetch('/api/flowise-external-sync?action=get_workflows', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (flowiseResponse.ok) {
        const flowiseData = await flowiseResponse.json() as any;
        console.log('✅ Dados do Flowise recebidos:', flowiseData);
        
        // Verificar múltiplas estruturas possíveis de resposta do Flowise
        const workflows = flowiseData.workflows || 
                         flowiseData.data || 
                         flowiseData.chatflows || 
                         flowiseData || 
                         [];
        
        if (!Array.isArray(workflows)) {
          console.warn('⚠️ Dados do Flowise não estão em formato de array:', workflows);
          setAgents([]);
          return;
        }
        
        // Transformar dados do Flowise para o formato de agentes V2
        const flowiseAgents = workflows.map((workflow: any) => {
          // Extrair metadados V2 se existirem
          let metadata: any = {};
          try {
            if (typeof workflow.metadata === 'string') {
              metadata = JSON.parse(workflow.metadata);
            } else if (typeof workflow.metadata === 'object') {
              metadata = workflow.metadata || {};
            }
          } catch (e) {
            console.warn('Erro ao parsear metadata:', e);
            metadata = {};
          }
          
          // Extrair dados técnicos do flowData se disponível
          let nodeCount = 0;
          let edgeCount = 0;
          try {
            if (workflow.flowData) {
              const flowData = typeof workflow.flowData === 'string' 
                ? JSON.parse(workflow.flowData) 
                : workflow.flowData;
              nodeCount = flowData.nodes?.length || 0;
              edgeCount = flowData.edges?.length || 0;
            }
          } catch (e) {
            console.warn('Erro ao extrair dados técnicos:', e);
          }
          
          return {
            id: workflow.id || workflow.chatflowId || workflow._id,
            name: workflow.name || workflow.title || 'Workflow sem nome',
            description: workflow.description || 'Workflow importado do Flowise',
            type: 'workflow' as const,
            status: ((workflow.deployed || workflow.isPublic) ? 'active' : 'inactive') as 'active' | 'inactive' | 'training',
            
            // Dados técnicos do Flowise
            studioMetadata: {
              nodeCount,
              edgeCount,
              complexityScore: nodeCount + edgeCount,
              workflowId: workflow.id || workflow.chatflowId,
              category: workflow.category || 'general',
              tags: workflow.tags || []
            },
            
            // Campos específicos V2 - buscar dos metadados ou usar padrões
            cliente: metadata.clienteId ? {
              id: metadata.clienteId,
              name: metadata.clienteName || 'Cliente não identificado'
            } : undefined,
            disponivel: Boolean(metadata.disponivel),
            inputTypes: Array.isArray(metadata.inputTypes) ? metadata.inputTypes : [],
            
            // Status de sincronização do Flowise
            flowiseConfig: {
              exported: true, // Já está no Flowise
              flowiseId: workflow.id || workflow.chatflowId,
              exportedAt: workflow.updatedDate || workflow.createdDate || new Date().toISOString(),
              syncStatus: 'synced' as const
            },
            
            // Dados originais do Flowise preservados
            chatflowUrl: workflow.chatflowUrl,
            exportedToFlowise: true,
            config: typeof workflow.flowData === 'string' ? workflow.flowData : JSON.stringify(workflow.flowData || {}),
            originalFlowiseData: workflow // Preservar dados originais para debugging
          };
        }).filter(agent => agent.id); // Filtrar agentes sem ID válido
        
        console.log(`✅ ${flowiseAgents.length} agentes carregados do Flowise`);
        setAgents(flowiseAgents);
        setFlowiseConnectionStatus('connected');
        setLastUpdate(new Date());
        
        if (flowiseAgents.length === 0) {
          toast({
            title: "Nenhum workflow encontrado",
            description: "Não foram encontrados workflows no Flowise. Verifique se há workflows criados.",
            variant: "default",
          });
        }
      } else {
        const errorText = await flowiseResponse.text();
        console.warn('⚠️ Erro ao buscar workflows do Flowise:', flowiseResponse.status, errorText);
        
        toast({
          title: "Erro ao conectar com Flowise",
          description: `Falha ao buscar workflows: ${flowiseResponse.status}`,
          variant: "destructive",
        });
        
        setAgents([]);
        setFlowiseConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar agentes do Flowise:', error);
      
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao Flowise. Verifique se o serviço está funcionando.",
        variant: "destructive",
      });
      
      setAgents([]);
      setFlowiseConnectionStatus('disconnected');
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await loadAgents();
      toast({
        title: "Dados atualizados",
        description: "Workflows do Flowise foram recarregados com sucesso",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados do Flowise",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClienteChange = async (agentId: string, clienteId: string, clientes: any[]) => {
    try {
      const cliente = clientes.find(c => c.id === clienteId);
      
      // Atualizar estado local
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, cliente: cliente ? { id: cliente.id, name: cliente.name } : undefined }
          : agent
      ));

      // Sincronizar de volta para o Flowise
      const agent = agents.find(a => a.id === agentId);
      if (agent && agent.flowiseConfig?.flowiseId) {
        const updatedMetadata = {
          sourceV2: true,
          clienteId: cliente?.id,
          clienteName: cliente?.name,
          disponivel: agent.disponivel,
          inputTypes: agent.inputTypes,
          updatedAt: new Date().toISOString()
        };

        // Atualizar workflow no Flowise com novos metadados
        const updateResponse = await fetch('/api/flowise-external-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_workflow_metadata',
            canvasId: agent.flowiseConfig.flowiseId,
            metadata: updatedMetadata
          })
        });

        if (!updateResponse.ok) {
          console.warn('Erro ao atualizar metadados no Flowise:', updateResponse.status);
        }
      }

      toast({
        title: "Cliente atualizado",
        description: cliente 
          ? `Cliente "${cliente.name}" associado ao agente`
          : "Cliente removido do agente",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Não foi possível associar o cliente ao agente",
        variant: "destructive",
      });
    }
  };

  const handleDisponibilidadeChange = async (agentId: string, disponivel: boolean) => {
    // Atualizar estado local
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, disponivel }
        : agent
    ));

    // Sincronizar com Flowise
    try {
      const agent = agents.find(a => a.id === agentId);
      if (agent && agent.flowiseConfig?.flowiseId) {
        const updatedMetadata = {
          sourceV2: true,
          clienteId: agent.cliente?.id,
          clienteName: agent.cliente?.name,
          disponivel: disponivel,
          inputTypes: agent.inputTypes,
          updatedAt: new Date().toISOString()
        };

        await fetch('/api/flowise-external-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_workflow_metadata',
            canvasId: agent.flowiseConfig.flowiseId,
            metadata: updatedMetadata
          })
        });
      }
    } catch (error) {
      console.warn('Erro ao sincronizar disponibilidade com Flowise:', error);
    }

    toast({
      title: "Disponibilidade atualizada",
      description: disponivel 
        ? "Agente marcado como disponível"
        : "Agente marcado como indisponível",
      variant: "default",
    });
  };

  const handleInputTypesChange = (agentId: string, inputTypes: ('prompt' | 'prompt_system')[]) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, inputTypes }
        : agent
    ));
  };

  const sendToFlowise = async (agentId: string, data: { clienteId: string; workflow: string }) => {
    try {
      const response = await fetch('/api/flowise-external-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_client_data',
          data: {
            agentId,
            clienteId: data.clienteId,
            workflow: data.workflow,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        console.log('✅ Dados enviados para o Flowise com sucesso');
        return true;
      } else {
        throw new Error(`Erro na resposta: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar dados para o Flowise:', error);
      throw error;
    }
  };

  const handleExportToFlowise = async (agent: Agent) => {
    try {
      if (!agent.cliente) {
        toast({
          title: "Cliente não selecionado",
          description: "Selecione um cliente antes de exportar para o Flowise",
          variant: "destructive",
        });
        return;
      }

      if (!agent.disponivel) {
        toast({
          title: "Agente não disponível",
          description: "Marque o agente como disponível antes de exportar",
          variant: "destructive",
        });
        return;
      }

      setAgents(prev => prev.map(a => 
        a.id === agent.id 
          ? { 
              ...a, 
              flowiseConfig: { 
                ...a.flowiseConfig, 
                exported: false, 
                syncStatus: 'pending' as const 
              } 
            }
          : a
      ));

      const exportData = {
        name: agent.name,
        description: agent.description,
        type: 'CHATFLOW',
        flowData: JSON.stringify({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 }
        }),
        deployed: true,
        isPublic: true,
        category: 'agents',
        metadata: {
          sourceV2: true,
          clienteId: agent.cliente.id,
          clienteName: agent.cliente.name,
          disponivel: agent.disponivel,
          inputTypes: agent.inputTypes,
          exportedAt: new Date().toISOString()
        }
      };

      const response = await fetch('/api/flowise-external-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export_workflow',
          canvasId: agent.id,
          workflowData: exportData
        }),
      });

      if (response.ok) {
        const result = await response.json() as any;
        
        setAgents(prev => prev.map(a => 
          a.id === agent.id 
            ? { 
                ...a, 
                flowiseConfig: { 
                  exported: true,
                  flowiseId: result.data?.canvasId || agent.id,
                  exportedAt: new Date().toISOString(),
                  syncStatus: 'synced' as const 
                },
                versionInfo: {
                  ...a.versionInfo,
                  originalFlowiseId: result.data?.canvasId || agent.id,
                  isCustomized: false
                }
              }
            : a
        ));

        toast({
          title: "Exportação bem-sucedida!",
          description: `Agente "${agent.name}" exportado para o Flowise com sucesso`,
          variant: "default",
        });
      } else {
        throw new Error('Falha na exportação');
      }
    } catch (error) {
      console.error('Erro ao exportar para Flowise:', error);
      
      setAgents(prev => prev.map(a => 
        a.id === agent.id 
          ? { 
              ...a, 
              flowiseConfig: { 
                exported: false,
                ...a.flowiseConfig, 
                syncStatus: 'error' as const 
              } 
            }
          : a
      ));

      toast({
        title: "Erro na exportação",
        description: `Não foi possível exportar o agente "${agent.name}" para o Flowise`,
        variant: "destructive",
      });
    }
  };

  const handleSaveCustomConfig = async (agentId: string, customConfig: any) => {
    try {
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { 
              ...agent, 
              customConfig,
              versionInfo: {
                ...agent.versionInfo,
                modifiedAt: new Date().toISOString(),
                isCustomized: true,
                version: (agent.versionInfo?.version || 0) + 1
              }
            }
          : agent
      ));

      // Sincronizar configurações personalizadas com o Flowise
      const agent = agents.find(a => a.id === agentId);
      if (agent && agent.flowiseConfig?.flowiseId) {
        const updatedMetadata = {
          ...agent.customConfig,
          sourceV2: true,
          clienteId: agent.cliente?.id,
          clienteName: agent.cliente?.name,
          disponivel: agent.disponivel,
          inputTypes: agent.inputTypes,
          customConfig: customConfig,
          versionInfo: {
            modifiedAt: new Date().toISOString(),
            isCustomized: true,
            version: (agent.versionInfo?.version || 0) + 1
          }
        };

        await fetch('/api/flowise-external-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_workflow_metadata',
            canvasId: agent.flowiseConfig.flowiseId,
            metadata: updatedMetadata
          })
        });
      }

      toast({
        title: "Configurações salvas",
        description: "As configurações personalizadas foram salvas com sucesso",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações personalizadas:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações personalizadas",
        variant: "destructive",
      });
    }
  };

  const handleReExportToFlowise = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) {
        throw new Error('Agente não encontrado');
      }

      if (!agent.cliente) {
        toast({
          title: "Cliente não selecionado",
          description: "Selecione um cliente antes de re-exportar",
          variant: "destructive",
        });
        return;
      }

      // Atualizar status para exportando
      setAgents(prev => prev.map(a => 
        a.id === agentId 
          ? { 
              ...a, 
              reExportStatus: {
                status: 'exporting',
                exportedAt: new Date().toISOString()
              }
            }
          : a
      ));

      // Preparar dados para re-exportação com configurações personalizadas
      const reExportData = {
        name: agent.customConfig?.name || agent.name,
        description: agent.customConfig?.description || agent.description,
        type: 'CHATFLOW',
        flowData: agent.config || JSON.stringify({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 }
        }),
        deployed: true,
        isPublic: true,
        category: agent.customConfig?.category || agent.studioMetadata?.category || 'agents',
        metadata: {
          sourceV2: true,
          isReExport: true,
          originalFlowiseId: agent.flowiseConfig?.flowiseId,
          clienteId: agent.cliente.id,
          clienteName: agent.cliente.name,
          disponivel: agent.disponivel,
          inputTypes: agent.inputTypes,
          customConfig: agent.customConfig,
          versionInfo: agent.versionInfo,
          reExportedAt: new Date().toISOString()
        }
      };

      const response = await fetch('/api/flowise-external-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reexport_workflow',
          originalCanvasId: agent.flowiseConfig?.flowiseId,
          workflowData: reExportData
        }),
      });

      if (response.ok) {
        const result = await response.json() as any;
        
        setAgents(prev => prev.map(a => 
          a.id === agentId 
            ? { 
                ...a, 
                reExportStatus: {
                  status: 'success',
                  newFlowiseId: result.data?.canvasId,
                  exportedAt: new Date().toISOString()
                },
                versionInfo: {
                  ...a.versionInfo,
                  modifiedAt: new Date().toISOString(),
                  parentVersion: a.flowiseConfig?.flowiseId,
                  version: (a.versionInfo?.version || 0) + 1
                }
              }
            : a
        ));

        toast({
          title: "Re-exportação bem-sucedida!",
          description: `Workflow re-exportado para o Flowise com novo ID: ${result.data?.canvasId}`,
          variant: "default",
        });
      } else {
        throw new Error('Falha na re-exportação');
      }
    } catch (error) {
      console.error('Erro ao re-exportar para Flowise:', error);
      
      setAgents(prev => prev.map(a => 
        a.id === agentId 
          ? { 
              ...a, 
              reExportStatus: {
                status: 'error',
                exportedAt: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Erro desconhecido'
              }
            }
          : a
      ));

      toast({
        title: "Erro na re-exportação",
        description: "Não foi possível re-exportar o workflow para o Flowise",
        variant: "destructive",
      });
    }
  };

  return {
    agents,
    isLoading,
    isRefreshing,
    lastUpdate,
    flowiseConnectionStatus,
    loadAgents,
    refreshData,
    handleClienteChange,
    handleDisponibilidadeChange,
    handleInputTypesChange,
    sendToFlowise,
    handleExportToFlowise,
    handleSaveCustomConfig,
    handleReExportToFlowise,
    setIsLoading,
    setFlowiseConnectionStatus,
    setLastUpdate
  };
};
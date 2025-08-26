"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import EditWorkflowDialog from '@/components/EditWorkflowDialog';
import WorkflowComplexityBadge from '@/components/workflow/WorkflowComplexityBadge';
import { 
  RefreshCw, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  BarChart3, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Database,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Brain,
  Archive,
  Shield,
  AlertCircle,
  Save,
  FileText,
  Code,
  Copy,
  ExternalLink,
  Workflow
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlowiseWorkflow {
  id: string;
  flowiseId: string;
  name: string;
  description?: string;
  type: 'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT';
  deployed: boolean;
  isPublic: boolean;
  category?: string;
  complexityScore: number;
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;
  capabilities: WorkflowCapabilities;
  nodes?: string; // JSON string
  connections?: string; // JSON string
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  // Campos para agentes transformados
  isFromAgent?: boolean;
  originalAgentId?: string;
  originalAgentType?: string;
}

interface WorkflowCapabilities {
  canHandleFileUpload: boolean;
  hasStreaming: boolean;
  supportsMultiLanguage: boolean;
  hasMemory: boolean;
  usesExternalAPIs: boolean;
  hasAnalytics: boolean;
  supportsParallelProcessing: boolean;
  hasErrorHandling: boolean;
}

interface SyncStats {
  totalWorkflows: number;
  syncedWorkflows: number;
  failedSyncs: number;
  avgComplexity: number;
  lastSync?: string;
}

// Funções utilitárias
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'CHATFLOW': return <Users className="w-4 h-4" />;
    case 'AGENTFLOW': return <Zap className="w-4 h-4" />;
    case 'MULTIAGENT': return <BarChart3 className="w-4 h-4" />;
    case 'ASSISTANT': return <Database className="w-4 h-4" />;
    default: return <Settings className="w-4 h-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'CHATFLOW': return 'Chatbot';
    case 'AGENTFLOW': return 'Agente IA';
    case 'MULTIAGENT': return 'Multi-Agentes';
    case 'ASSISTANT': return 'Assistente';
    default: return type;
  }
};

export default function FlowiseWorkflowManager() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<FlowiseWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    minComplexity: '',
    maxComplexity: '',
    search: ''
  });
  const [showAgents, setShowAgents] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [exportLogs, setExportLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Estados para o modal de visualização
  const [visualizationWorkflow, setVisualizationWorkflow] = useState<FlowiseWorkflow | null>(null);
  const [isVisualizationDialogOpen, setIsVisualizationDialogOpen] = useState(false);
  
  // Estados para o modal de exclusão avançado
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<FlowiseWorkflow | null>(null);
  const [deleteOptions, setDeleteOptions] = useState({
    deleteFromZanAI: true,
    deleteFromFlowise: false,
    createBackup: false
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para o modal de edição de workflow
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<FlowiseWorkflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    deployed: false,
    isPublic: false
  });

  useEffect(() => {
    loadWorkflows();
    loadStats();
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [showAgents]);

  const loadExportLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch('/api/admin/flowise-workflows/export-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_export_logs',
          data: { limit: 20 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExportLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Erro ao carregar logs de exportação:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const clearExportLogs = async () => {
    try {
      const response = await fetch('/api/admin/flowise-workflows/export-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_export_logs'
        })
      });

      if (response.ok) {
        setExportLogs([]);
        toast({
          title: "Logs Limpos",
          description: "Logs de exportação antigos foram removidos.",
        });
      }
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
    }
  };

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/flowise-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_workflows',
          data: { filters, page: 1, limit: 50, includeAgents: showAgents }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar workflows",
        description: "Não foi possível carregar os workflows do Flowise.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/v1/flowise-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_workflows',
          data: { page: 1, limit: 1, includeAgents: false }
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Calcular estatísticas básicas
        const totalWorkflows = data.pagination?.total || 0;
        const avgComplexity = workflows.length > 0 
          ? Math.round(workflows.reduce((sum, w) => sum + w.complexityScore, 0) / workflows.length)
          : 0;
        
        setStats({
          totalWorkflows,
          syncedWorkflows: workflows.filter(w => w.lastSyncAt).length,
          failedSyncs: workflows.filter(w => !w.lastSyncAt).length,
          avgComplexity,
          lastSync: workflows.length > 0 
            ? workflows.reduce((latest, w) => 
                w.lastSyncAt && (!latest || new Date(w.lastSyncAt) > new Date(latest)) 
                  ? w.lastSyncAt 
                  : latest, 
                workflows[0]?.lastSyncAt || null
              )
            : undefined
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleWorkflowSelect = (workflow: FlowiseWorkflow) => {
    // Validate workflow before selection
    if (!workflow.id || !workflow.name) {
      toast({
        title: "Workflow inválido",
        description: "O workflow selecionado possui dados incompletos.",
        variant: "destructive",
      });
      return;
    }
    
    if (workflow.complexityScore > 50) {
      const confirmSelect = confirm(
        `Este workflow tem alta complexidade (${workflow.complexityScore}). Deseja continuar com a seleção?`
      );
      if (!confirmSelect) return;
    }
    
    // Here you can add logic to handle the selected workflow
    // For example, navigate to an edit page or open a modal
    toast({
      title: "Workflow Selecionado",
      description: `O workflow "${workflow.name}" foi selecionado com sucesso.`,
    });
    
    console.log('Workflow selecionado:', workflow);
  };

  const handleWorkflowVisualization = (workflow: FlowiseWorkflow) => {
    // Abrir modal com visualização do workflow
    setVisualizationWorkflow(workflow);
    setIsVisualizationDialogOpen(true);
  };

  const sendToLearning = async (workflow: FlowiseWorkflow) => {
    try {
      // Enviar workflow para o learning
      const response = await fetch('/api/v1/learning/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_from_flowise',
          data: {
            workflow: workflow,
            source: 'flowise_workflows'
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Enviado para Learning",
          description: `O workflow "${workflow.name}" foi enviado para análise no Learning.`,
        });
        
        // Opcional: redirecionar para o learning
        setTimeout(() => {
          window.location.href = '/admin/learning';
        }, 1500);
      } else {
        throw new Error(result.error || 'Falha ao enviar para Learning');
      }
    } catch (error) {
      console.error('Erro ao enviar para Learning:', error);
      toast({
        title: "Erro ao enviar",
        description: `Não foi possível enviar o workflow para o Learning: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const syncWithFlowise = async () => {
    setSyncing(true);
    try {
      // Testar conexão primeiro
      const testResponse = await fetch('/api/flowise-external-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection' })
      });

      const testResult = await testResponse.json();
      
      if (!testResult.success) {
        throw new Error(testResult.message || 'Falha na conexão com o Flowise');
      }

      // Obter workflows do Flowise externo
      const workflowsResponse = await fetch('/api/flowise-external-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_workflows' })
      });

      const workflowsResult = await workflowsResponse.json();
      
      if (!workflowsResult.success) {
        throw new Error(workflowsResult.message || 'Falha ao obter workflows');
      }

      // Processar workflows obtidos
      const externalWorkflows = workflowsResult.data || [];
      let syncedCount = 0;
      let errorCount = 0;

      // Sincronizar cada workflow
      for (const workflow of externalWorkflows) {
        try {
          const syncResponse = await fetch('/api/v1/flowise-workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'register_workflow',
              data: {
                id: workflow.id,
                name: workflow.name,
                flowData: workflow.flowData || '{}',
                type: workflow.type || 'CHATFLOW',
                deployed: workflow.deployed || false,
                isPublic: workflow.isPublic || false,
                category: workflow.category || 'general',
                workspaceId: workflow.workspaceId,
                createdDate: new Date(workflow.createdDate || Date.now()),
                updatedDate: new Date(workflow.updatedDate || Date.now())
              }
            })
          });

          if (syncResponse.ok) {
            syncedCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Erro ao sincronizar workflow:', error);
          errorCount++;
        }
      }

      toast({
        title: "Sincronização Concluída",
        description: `${syncedCount} workflows sincronizados com sucesso!${errorCount > 0 ? ` ${errorCount} erros.` : ''}`,
      });
      
      // Recarregar dados
      await Promise.all([loadWorkflows(), loadStats()]);
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: `Não foi possível sincronizar com o Flowise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Função para abrir o modal de exclusão avançado
  const openDeleteDialog = (workflow: FlowiseWorkflow) => {
    setSelectedWorkflow(workflow);
    setDeleteOptions({
      deleteFromZanAI: true,
      deleteFromFlowise: false,
      createBackup: false
    });
    setDeleteDialogOpen(true);
  };

  // Função para criar backup antes da exclusão
  const createWorkflowBackup = async (workflow: FlowiseWorkflow) => {
    try {
      const backupData = {
        id: workflow.id,
        flowiseId: workflow.flowiseId,
        name: workflow.name,
        description: workflow.description,
        type: workflow.type,
        flowData: workflow.flowData,
        deployed: workflow.deployed,
        isPublic: workflow.isPublic,
        category: workflow.category,
        workspaceId: workflow.workspaceId,
        complexityScore: workflow.complexityScore,
        nodeCount: workflow.nodeCount,
        edgeCount: workflow.edgeCount,
        maxDepth: workflow.maxDepth,
        capabilities: workflow.capabilities,
        nodes: workflow.nodes,
        connections: workflow.connections,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        backupCreatedAt: new Date().toISOString()
      };

      // Criar blob para download
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow_backup_${workflow.name}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Backup criado com sucesso!",
        description: `O backup do workflow "${workflow.name}" foi baixado.`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao criar backup",
        description: `Não foi possível criar o backup do workflow "${workflow.name}".`,
        variant: "destructive",
      });
      console.error('Erro ao criar backup:', error);
      return false;
    }
  };

  // Função principal de exclusão com opções avançadas
  const executeAdvancedDelete = async () => {
    if (!selectedWorkflow) return;

    setIsDeleting(true);
    
    try {
      // Criar backup se solicitado
      if (deleteOptions.createBackup) {
        const backupSuccess = await createWorkflowBackup(selectedWorkflow);
        if (!backupSuccess) {
          // Se falhar o backup, perguntar se quer continuar
          if (!confirm('O backup falhou. Deseja continuar com a exclusão anyway?')) {
            setIsDeleting(false);
            return;
          }
        }
      }

      let results = {
        deletedFromZanAI: false,
        deletedFromFlowise: false,
        errors: [] as string[]
      };

      // Excluir do Flowise se solicitado
      if (deleteOptions.deleteFromFlowise) {
        try {
          const flowiseBaseUrl = "https://aaranha-zania.hf.space";
          const deleteUrl = `${flowiseBaseUrl}/api/v1/chatflows/${selectedWorkflow.flowiseId}`;
          
          console.log(`🗑️ Excluindo workflow do Flowise externo: ${deleteUrl}`);
          
          const flowiseResponse = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer wNFL5HJcOA3RwJdKiVTUWqdzigK7OCUwRKo9KEgjenw`,
              'Content-Type': 'application/json'
            }
          });

          if (flowiseResponse.ok) {
            results.deletedFromFlowise = true;
            console.log('✅ Workflow excluído com sucesso do Flowise externo');
          } else {
            const errorText = await flowiseResponse.text();
            const error = `Falha ao excluir do Flowise: ${flowiseResponse.status} - ${errorText}`;
            results.errors.push(error);
            console.warn('⚠️ Não foi possível excluir do Flowise:', error);
          }
        } catch (error) {
          const errorMsg = `Erro ao excluir do Flowise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
          results.errors.push(errorMsg);
          console.error('❌ Erro ao excluir do Flowise:', error);
        }
      }

      // Excluir do ZanAI se solicitado
      if (deleteOptions.deleteFromZanAI) {
        try {
          const response = await fetch('/api/v1/flowise-workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete_workflow',
              data: { 
                flowiseId: selectedWorkflow.flowiseId,
                skipFlowiseDelete: !deleteOptions.deleteFromFlowise // Não tentar excluir do Flowise novamente se já fizemos
              }
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              results.deletedFromZanAI = true;
              console.log('✅ Workflow excluído com sucesso do ZanAI');
            } else {
              results.errors.push(result.error || 'Falha ao excluir do ZanAI');
            }
          } else {
            const errorText = await response.text();
            results.errors.push(`Falha na API do ZanAI: ${response.status} - ${errorText}`);
          }
        } catch (error) {
          const errorMsg = `Erro ao excluir do ZanAI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
          results.errors.push(errorMsg);
          console.error('❌ Erro ao excluir do ZanAI:', error);
        }
      }

      // Mostrar resultado ao usuário
      showDeleteResult(results);

      // Fechar modal e recarregar dados
      setDeleteDialogOpen(false);
      setSelectedWorkflow(null);
      await loadWorkflows();
      await loadStats();

    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o processo de exclusão.",
        variant: "destructive",
      });
      console.error('Erro na exclusão avançada:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para mostrar o resultado da exclusão
  const showDeleteResult = (results: { deletedFromZanAI: boolean; deletedFromFlowise: boolean; errors: string[] }) => {
    const { deletedFromZanAI, deletedFromFlowise, errors } = results;
    
    if (deletedFromZanAI && deletedFromFlowise && errors.length === 0) {
      // Sucesso completo
      toast({
        title: "✅ Exclusão completa!",
        description: `O workflow "${selectedWorkflow?.name}" foi excluído do ZanAI e do Flowise com sucesso.`,
      });
    } else if (deletedFromZanAI && !deletedFromFlowise) {
      // Excluído apenas do ZanAI
      if (errors.length > 0) {
        toast({
          title: "⚠️ Exclusão parcial com erros",
          description: `O workflow foi excluído do ZanAI, mas ocorreram erros ao excluir do Flowise.`,
          variant: "default",
        });
      } else {
        toast({
          title: "✅ Excluído do ZanAI",
          description: `O workflow "${selectedWorkflow?.name}" foi excluído apenas do banco ZanAI.`,
        });
      }
    } else if (!deletedFromZanAI && deletedFromFlowise) {
      // Excluído apenas do Flowise
      toast({
        title: "✅ Excluído do Flowise",
        description: `O workflow "${selectedWorkflow?.name}" foi excluído apenas do Flowise.`,
      });
    } else if (errors.length > 0) {
      // Apenas erros
      toast({
        title: "❌ Falha na exclusão",
        description: `Não foi possível excluir o workflow. Erros: ${errors.join(', ')}`,
        variant: "destructive",
      });
    } else {
      // Nenhuma ação realizada
      toast({
        title: "ℹ️ Nenhuma ação realizada",
        description: "Nenhuma opção de exclusão foi selecionada.",
      });
    }

    // Mostrar erros no console
    if (errors.length > 0) {
      console.error('Erros durante a exclusão:', errors);
    }
  };

  // Função deleteWorkflow original (mantida para compatibilidade)
  const deleteWorkflow = async (workflow: FlowiseWorkflow) => {
    openDeleteDialog(workflow);
  };

  // Funções para edição de workflow
  const openEditDialog = (workflow: FlowiseWorkflow) => {
    setEditingWorkflow(workflow);
    setEditForm({
      name: workflow.name,
      description: workflow.description || '',
      category: workflow.category || '',
      deployed: workflow.deployed,
      isPublic: workflow.isPublic
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveWorkflowEdit = async () => {
    if (!editingWorkflow) return;

    setIsEditing(true);
    try {
      const response = await fetch('/api/v1/flowise-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_workflow',
          data: {
            flowiseId: editingWorkflow.flowiseId,
            ...editForm
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: "✅ Workflow atualizado!",
            description: `O workflow "${editForm.name}" foi atualizado com sucesso.`,
          });
          
          // Fechar modal e recarregar dados
          setEditDialogOpen(false);
          setEditingWorkflow(null);
          await loadWorkflows();
          await loadStats();
        } else {
          toast({
            title: "Erro ao atualizar",
            description: result.error || "Não foi possível atualizar o workflow.",
            variant: "destructive",
          });
        }
      } else {
        const errorText = await response.text();
        toast({
          title: "Erro na API",
          description: `Falha na comunicação: ${response.status} - ${errorText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante a atualização do workflow.",
        variant: "destructive",
      });
      console.error('Erro na edição do workflow:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const openWorkflowInCanvas = (workflow: FlowiseWorkflow) => {
    const flowiseBaseUrl = "https://aaranha-zania.hf.space";
    const canvasUrl = `${flowiseBaseUrl}/canvas/${workflow.flowiseId}`;
    window.open(canvasUrl, '_blank');
  };

  const verifyExportedWorkflow = async (workflowId: string, workflowName: string) => {
    try {
      const flowiseBaseUrl = "https://aaranha-zania.hf.space";
      const verifyUrl = `${flowiseBaseUrl}/api/v1/chatflows/${workflowId}`;
      
      console.log('🔍 Verificando workflow exportado:', verifyUrl);
      
      const response = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer wNFL5HJcOA3RwJdKiVTUWqdzigK7OCUwRKo9KEgjenw`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Workflow verificado com sucesso:', {
          id: data.id,
          name: data.name,
          type: data.type,
          category: data.category,
          isPublic: data.isPublic,
          deployed: data.deployed
        });
        
        // Verificar se o workflow está configurado corretamente para ser visível
        const visibilityCheck = {
          isVisible: data.isPublic || data.type === 'CHATFLOW',
          type: data.type,
          category: data.category,
          isPublic: data.isPublic,
          deployed: data.deployed,
          issues: []
        } as any;
        
        // Identificar possíveis problemas de visibilidade
        if (!data.isPublic && data.type !== 'CHATFLOW') {
          visibilityCheck.issues.push('Workflow não é público e não é do tipo CHATFLOW');
        }
        if (data.category === 'Assistants') {
          visibilityCheck.issues.push('Workflow está na categoria "Assistants" que pode não ser mostrada na lista principal');
        }
        if (data.type === 'ASSISTANT') {
          visibilityCheck.issues.push('Workflow é do tipo "ASSISTANT" que pode não ser mostrado na lista de chatflows');
        }
        
        console.log('🔍 Verificação de visibilidade:', visibilityCheck);
        
        return {
          success: true,
          exists: true,
          workflow: data,
          visibility: visibilityCheck,
          urls: {
            chat: `${flowiseBaseUrl}/chat/${workflowId}`,
            edit: `${flowiseBaseUrl}/canvas/${workflowId}`,
            list: `${flowiseBaseUrl}/chatflows`
          }
        };
      } else {
        console.warn('⚠️ Workflow não encontrado ou não acessível:', response.status);
        return {
          success: false,
          exists: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      console.error('❌ Erro ao verificar workflow exportado:', error);
      return {
        success: false,
        exists: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  };

  const exportToFlowise = async (workflow: FlowiseWorkflow) => {
    setExporting(workflow.id);
    try {
      toast({
        title: "Exportando para Flowise",
        description: `Exportando workflow "${workflow.name}"...`,
      });

      // Verificar se é um agente transformado e preparar dados apropriados
      let exportData;
      let canvasId = workflow.flowiseId;
      
      if (workflow.isFromAgent) {
        // Se é um agente transformado, precisamos obter os dados originais do agente
        console.log('🔄 Exportando agente transformado:', workflow.originalAgentId);
        
        try {
          // Buscar dados completos do agente original
          const agentResponse = await fetch('/admin/api/agents/' + workflow.originalAgentId);
          if (agentResponse.ok) {
            const agentData = await agentResponse.json();
            console.log('✅ Dados do agente obtidos:', agentData);
            
            // Preparar dados completos do agente para transformação
            exportData = {
              id: agentData.id,
              name: agentData.name,
              slug: agentData.slug,
              description: agentData.description,
              type: agentData.type,
              config: agentData.config,
              knowledge: agentData.knowledge,
              workspaceId: agentData.workspaceId,
              roleDefinition: agentData.roleDefinition,
              customInstructions: agentData.customInstructions,
              groups: agentData.groups
            };
            
            // Usar o slug como canvasId para agentes
            canvasId = `agent_${agentData.slug}`;
          } else {
            throw new Error('Não foi possível obter dados do agente original');
          }
        } catch (agentError) {
          console.error('❌ Erro ao obter dados do agente:', agentError);
          throw new Error('Falha ao preparar dados do agente para exportação');
        }
      } else {
        // Se é um workflow Flowise normal, usar os dados existentes
        console.log('🔄 Exportando workflow Flowise existente:', workflow.id);
        
        // Preparar dados para exportação - analisar os campos JSON
        let nodes = [];
        let connections = [];
        
        try {
          nodes = workflow.nodes ? JSON.parse(workflow.nodes) : [];
        } catch (e) {
          console.warn('Erro ao fazer parse dos nodes:', e);
          nodes = [];
        }
        
        try {
          connections = workflow.connections ? JSON.parse(workflow.connections) : [];
        } catch (e) {
          console.warn('Erro ao fazer parse das connections:', e);
          connections = [];
        }

        const flowData = {
          nodes: nodes,
          edges: connections,
          viewport: { x: 0, y: 0, zoom: 1 }
        };

        exportData = {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description || '',
          type: workflow.type,
          flowData: JSON.stringify(flowData), // Converter para string JSON
          deployed: workflow.deployed,
          isPublic: workflow.isPublic,
          category: workflow.category || 'general'
        };
      }

      // Fazer requisição para a API externa do Flowise
      console.log('🚀 Enviando requisição de exportação:', {
        action: 'export_workflow',
        canvasId: canvasId,
        workflowData: exportData,
        isFromAgent: workflow.isFromAgent
      });
      
      const startTime = Date.now();
      const response = await fetch('/api/flowise-external-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_workflow',
          canvasId: canvasId,
          workflowData: exportData
        })
      });
      
      const duration = Date.now() - startTime;

      console.log('📝 Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        duration: duration
      });

      const result = await response.json();
      console.log('📊 Dados da resposta:', result);

      if (response.ok && result.success) {
        // Obter o ID real do workflow exportado da resposta
        const exportedWorkflowId = result.data?.canvasId || result.data?.flowiseResponse?.id || canvasId;
        const workflowName = result.data?.flowiseResponse?.name || workflow.name;
        
        // Verificar se o workflow realmente foi exportado e está acessível
        console.log('🔍 Verificando se o workflow foi realmente exportado...');
        const verification = await verifyExportedWorkflow(exportedWorkflowId, workflowName);
        
        // Construir URLs para acesso direto
        const flowiseBaseUrl = "https://aaranha-zania.hf.space";
        const directChatUrl = `${flowiseBaseUrl}/chat/${exportedWorkflowId}`;
        const directEditUrl = `${flowiseBaseUrl}/canvas/${exportedWorkflowId}`;
        const chatflowsListUrl = `${flowiseBaseUrl}/chatflows`;
        
        if (verification.success && verification.exists) {
          // Verificar se há problemas de visibilidade
          const hasVisibilityIssues = verification.visibility?.issues && verification.visibility.issues.length > 0;
          
          if (hasVisibilityIssues) {
            // Workflow exportado mas com possíveis problemas de visibilidade
            toast({
              title: "⚠️ Exportado com Problemas de Visibilidade",
              description: (
                <div className="space-y-2">
                  <p>Workflow "{workflowName}" foi exportado, mas pode não aparecer na lista principal:</p>
                  <div className="text-sm text-yellow-700 space-y-1">
                    {verification.visibility.issues.map((issue: string, index: number) => (
                      <div key={index}>• {issue}</div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <a 
                      href={verification.urls.chat} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      🔄 Testar workflow no chat
                    </a>
                    <a 
                      href={verification.urls.edit} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      ✏️ Editar workflow no canvas
                    </a>
                    <a 
                      href={verification.urls.list} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      📋 Ver lista de workflows (pode não estar visível)
                    </a>
                  </div>
                  <p className="text-xs text-gray-500">
                    ID: {exportedWorkflowId} | Tipo: {verification.visibility.type} | Categoria: {verification.visibility.category}
                  </p>
                </div>
              ),
              duration: 25000,
            });
          } else {
            // Exportado com sucesso e sem problemas de visibilidade
            toast({
              title: "✅ Exportação Concluída e Verificada",
              description: (
                <div className="space-y-2">
                  <p className="text-green-700 font-medium">Workflow "{workflowName}" exportado e verificado com sucesso!</p>
                  <div className="flex flex-col gap-1 text-sm">
                    <a 
                      href={verification.urls.chat} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      🔄 Testar workflow no chat
                    </a>
                    <a 
                      href={verification.urls.edit} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      ✏️ Editar workflow no canvas
                    </a>
                    <a 
                      href={verification.urls.list} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      📋 Ver lista completa de workflows
                    </a>
                  </div>
                  <p className="text-xs text-gray-500">
                    ID do workflow: {exportedWorkflowId}
                  </p>
                </div>
              ),
              duration: 20000,
            });
          }
        } else {
          // Exportação aparentemente bem-sucedida, mas verificação falhou
          toast({
            title: "⚠️ Exportação Concluída com Avisos",
            description: (
              <div className="space-y-2">
                <p>Workflow "{workflowName}" foi exportado, mas não foi possível verificar o acesso.</p>
                <p className="text-sm text-yellow-700">
                  Detalhes: {verification.error || 'Erro desconhecido na verificação'}
                </p>
                <div className="flex flex-col gap-1 text-sm">
                  <a 
                    href={directChatUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    🔄 Tentar acessar chat diretamente
                  </a>
                  <a 
                    href={chatflowsListUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    📋 Ver lista de workflows
                  </a>
                </div>
              </div>
            ),
            duration: 20000,
          });
        }
        
        // Mostrar detalhes adicionais se disponíveis
        if (result.data?.performance) {
          console.log('📈 Performance da exportação:', result.data.performance);
        }
        
        // Se houve transformação, mostrar detalhes
        if (result.data?.transformation?.applied) {
          console.log('🔄 Detalhes da transformação:', result.data.transformation);
        }
      } else {
        console.error('❌ Erro na exportação:', result);
        
        // Obter logs detalhados do erro
        let errorDetails = null;
        try {
          const logsResponse = await fetch('/api/admin/flowise-workflows/export-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'get_export_logs',
              data: {
                workflowId: workflow.id,
                status: 'ERROR',
                limit: 5
              }
            })
          });
          
          if (logsResponse.ok) {
            const logsResult = await logsResponse.json();
            errorDetails = logsResult.logs;
          }
        } catch (logError) {
          console.warn('Erro ao obter logs de erro:', logError);
        }
        
        // Preparar mensagem de erro detalhada
        let errorMessage = result.error || 'Erro na exportação';
        let errorDebug = '';
        
        if (result.debug) {
          if (result.debug.updateError) {
            errorMessage += ` (Falha na atualização: ${result.debug.updateError.status})`;
          }
          if (result.debug.createError) {
            errorMessage += ` (Falha na criação: ${result.debug.createError.status})`;
          }
        }
        
        if (errorDetails && errorDetails.length > 0) {
          const latestError = errorDetails[0];
          try {
            const details = JSON.parse(latestError.details);
            errorDebug = `\n\n🔍 Detalhes do erro:\n${details.message}`;
            if (details.stack) {
              errorDebug += `\n\n📋 Stack trace disponível nos logs.`;
            }
          } catch (e) {
            errorDebug = `\n\n🔍 Ver logs para mais detalhes.`;
          }
        }
        
        toast({
          title: "❌ Erro na Exportação",
          description: `${errorMessage}${errorDebug}`,
          variant: "destructive",
          duration: 10000, // 10 segundos para permitir leitura
        });
      }
    } catch (error) {
      console.error('💥 Erro crítico na exportação:', error);
      
      // Tentar registrar o erro nos logs
      try {
        await fetch('/api/admin/flowise-workflows/export-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'log_export_error',
            data: {
              workflowId: workflow.id,
              workflowName: workflow.name,
              canvasId: workflow.flowiseId,
              error: {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : '',
                type: 'FRONTEND_ERROR'
              },
              exportData: {
                name: workflow.name,
                type: workflow.type,
                isFromAgent: workflow.isFromAgent
              }
            }
          })
        });
      } catch (logError) {
        console.warn('Erro ao registrar log de erro:', logError);
      }
      
      toast({
        title: "💥 Erro Crítico na Exportação",
        description: `Não foi possível exportar o workflow "${workflow.name}". Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setExporting(null);
    }
  };

  // Funções de exportação avançada
  const exportWorkflowAsJSON = (workflow: FlowiseWorkflow) => {
    try {
      const exportData = {
        id: workflow.id,
        flowiseId: workflow.flowiseId,
        name: workflow.name,
        description: workflow.description,
        type: workflow.type,
        deployed: workflow.deployed,
        isPublic: workflow.isPublic,
        category: workflow.category,
        complexityScore: workflow.complexityScore,
        nodeCount: workflow.nodeCount,
        edgeCount: workflow.edgeCount,
        maxDepth: workflow.maxDepth,
        capabilities: typeof workflow.capabilities === 'string' 
          ? JSON.parse(workflow.capabilities) 
          : workflow.capabilities || {},
        nodes: typeof workflow.nodes === 'string' 
          ? JSON.parse(workflow.nodes) 
          : workflow.nodes || [],
        connections: typeof workflow.connections === 'string' 
          ? JSON.parse(workflow.connections) 
          : workflow.connections || [],
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow_${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Workflow exportado como JSON",
        description: `O workflow "${workflow.name}" foi exportado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: `Não foi possível exportar o workflow como JSON.`,
        variant: "destructive",
      });
      console.error('Erro ao exportar workflow como JSON:', error);
    }
  };

  const exportWorkflowAsConfig = (workflow: FlowiseWorkflow) => {
    try {
      const configData = {
        name: workflow.name,
        description: workflow.description || '',
        type: workflow.type,
        category: workflow.category || 'general',
        deployed: workflow.deployed,
        isPublic: workflow.isPublic,
        flowiseId: workflow.flowiseId,
        settings: {
          complexity: {
            score: workflow.complexityScore,
            nodeCount: workflow.nodeCount,
            edgeCount: workflow.edgeCount,
            maxDepth: workflow.maxDepth
          },
          capabilities: typeof workflow.capabilities === 'string' 
            ? JSON.parse(workflow.capabilities) 
            : workflow.capabilities || {}
        },
        urls: {
          chat: `https://aaranha-zania.hf.space/chat/${workflow.flowiseId}`,
          edit: `https://aaranha-zania.hf.space/canvas/${workflow.flowiseId}`,
          api: `https://aaranha-zania.hf.space/api/v1/chatflows/${workflow.flowiseId}`
        },
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `config_${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Configuração exportada",
        description: `A configuração do workflow "${workflow.name}" foi exportada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: `Não foi possível exportar a configuração do workflow.`,
        variant: "destructive",
      });
      console.error('Erro ao exportar configuração do workflow:', error);
    }
  };

  const copyWorkflowIdToClipboard = (workflow: FlowiseWorkflow) => {
    try {
      const clipboardData = {
        id: workflow.flowiseId,
        name: workflow.name,
        type: workflow.type,
        chatUrl: `https://aaranha-zania.hf.space/chat/${workflow.flowiseId}`,
        editUrl: `https://aaranha-zania.hf.space/canvas/${workflow.flowiseId}`
      };
      
      navigator.clipboard.writeText(JSON.stringify(clipboardData, null, 2));
      
      toast({
        title: "✅ ID copiado!",
        description: `O ID do workflow "${workflow.name}" foi copiado para a área de transferência.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: `Não foi possível copiar o ID do workflow.`,
        variant: "destructive",
      });
      console.error('Erro ao copiar ID do workflow:', error);
    }
  };

  const getComplexityColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filters.type && filters.type !== 'all' && workflow.type !== filters.type) return false;
    if (filters.category && filters.category !== 'all' && workflow.category !== filters.category) return false;
    if (filters.minComplexity && workflow.complexityScore < parseInt(filters.minComplexity)) return false;
    if (filters.maxComplexity && workflow.complexityScore > parseInt(filters.maxComplexity)) return false;
    if (filters.search && !workflow.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Modal de confirmação de exclusão avançado
  const DeleteConfirmationModal = () => (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Confirmar Exclusão do Workflow
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir o workflow <strong>"{selectedWorkflow?.name}"</strong>. 
            Escolha as opções de exclusão abaixo:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Opções de exclusão */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-zanai"
                checked={deleteOptions.deleteFromZanAI}
                onCheckedChange={(checked) => 
                  setDeleteOptions(prev => ({ ...prev, deleteFromZanAI: checked as boolean }))
                }
              />
              <Label htmlFor="delete-zanai" className="flex items-center gap-2 cursor-pointer">
                <Database className="w-4 h-4" />
                Excluir do banco ZanAI
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-flowise"
                checked={deleteOptions.deleteFromFlowise}
                onCheckedChange={(checked) => 
                  setDeleteOptions(prev => ({ ...prev, deleteFromFlowise: checked as boolean }))
                }
              />
              <Label htmlFor="delete-flowise" className="flex items-center gap-2 cursor-pointer">
                <Shield className="w-4 h-4" />
                Excluir do motor ZanAI (Flowise)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-backup"
                checked={deleteOptions.createBackup}
                onCheckedChange={(checked) => 
                  setDeleteOptions(prev => ({ ...prev, createBackup: checked as boolean }))
                }
              />
              <Label htmlFor="create-backup" className="flex items-center gap-2 cursor-pointer">
                <Archive className="w-4 h-4" />
                Criar backup antes de excluir
              </Label>
            </div>
          </div>
          
          {/* Aviso importante */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Atenção:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>A exclusão do Flowise é permanente e não pode ser desfeita</li>
                  <li>O backup será baixado como arquivo JSON</li>
                  <li>Verifique as opções antes de confirmar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              executeAdvancedDelete();
            }}
            disabled={isDeleting || (!deleteOptions.deleteFromZanAI && !deleteOptions.deleteFromFlowise)}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Confirmar Exclusão
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciador de Workflows Flowise</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e sincronize workflows complexos entre Flowise e Zanai
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={syncWithFlowise} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar com Flowise'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowDebugPanel(!showDebugPanel);
              if (!showDebugPanel) {
                loadExportLogs();
              }
            }}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {showDebugPanel ? 'Esconder Debug' : 'Mostrar Debug'}
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Novo Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                Workflows registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.syncedWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalWorkflows > 0 ? Math.round((stats.syncedWorkflows / stats.totalWorkflows) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complexidade Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgComplexity}/100</div>
              <p className="text-xs text-muted-foreground">
                Score de complexidade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.lastSync ? new Date(stats.lastSync).toLocaleDateString() : 'Nunca'}
              </div>
              <p className="text-xs text-muted-foreground">
                Data da última sincronização
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar workflows..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="CHATFLOW">Chatbot</SelectItem>
                <SelectItem value="AGENTFLOW">Agente IA</SelectItem>
                <SelectItem value="MULTIAGENT">Multi-Agentes</SelectItem>
                <SelectItem value="ASSISTANT">Assistente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="business">Negócios</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
                <SelectItem value="creative">Criativo</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Complexidade mín"
              value={filters.minComplexity}
              onChange={(e) => setFilters({...filters, minComplexity: e.target.value})}
              min="0"
              max="100"
            />

            <Input
              type="number"
              placeholder="Complexidade máxima"
              value={filters.maxComplexity}
              onChange={(e) => setFilters({...filters, maxComplexity: e.target.value})}
              min="0"
              max="100"
            />

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox
                id="show-agents"
                checked={showAgents}
                onCheckedChange={(checked) => setShowAgents(checked as boolean)}
              />
              <Label htmlFor="show-agents" className="flex items-center gap-2 cursor-pointer">
                <Brain className="w-4 h-4" />
                Mostrar Agentes Transformados
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <Card>
        <CardHeader>
          <CardTitle>Workflows Registrados</CardTitle>
          <CardDescription>
            {filteredWorkflows.length} workflows encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="ml-2">Carregando workflows...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(workflow.type)}
                        <h3 className="font-semibold text-lg">{workflow.name || `Workflow ${workflow.id}`}</h3>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeLabel(workflow.type)}
                        </Badge>
                        {workflow.isFromAgent && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Brain className="w-3 h-3 mr-1" />
                            Agente
                          </Badge>
                        )}
                        <Badge className={getComplexityColor(workflow.complexityScore)}>
                          Complexidade: {workflow.complexityScore}/100
                        </Badge>
                        {workflow.deployed && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Deployed
                          </Badge>
                        )}
                        {workflow.lastSyncAt && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Sincronizado
                          </Badge>
                        )}
                      </div>
                      
                      {workflow.description && (
                        <p className="text-muted-foreground mb-3">{workflow.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Database className="w-4 h-4" />
                          {workflow.nodeCount} nós
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          {workflow.edgeCount} conexões
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Profundidade: {workflow.maxDepth}
                        </span>
                      </div>

                      {/* Capacidades */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(() => {
                          try {
                            const capabilities = typeof workflow.capabilities === 'string' 
                              ? JSON.parse(workflow.capabilities) 
                              : workflow.capabilities || {};
                            
                            return (
                              <>
                                {capabilities.canHandleFileUpload && (
                                  <Badge variant="secondary" className="text-xs">
                                    Upload de Arquivos
                                  </Badge>
                                )}
                                {capabilities.hasStreaming && (
                                  <Badge variant="secondary" className="text-xs">
                                    Streaming
                                  </Badge>
                                )}
                                {capabilities.supportsMultiLanguage && (
                                  <Badge variant="secondary" className="text-xs">
                                    Multi-idioma
                                  </Badge>
                                )}
                                {capabilities.hasMemory && (
                                  <Badge variant="secondary" className="text-xs">
                                    Memória
                                  </Badge>
                                )}
                                {capabilities.usesExternalAPIs && (
                                  <Badge variant="secondary" className="text-xs">
                                    APIs Externas
                                  </Badge>
                                )}
                                {capabilities.hasAnalytics && (
                                  <Badge variant="secondary" className="text-xs">
                                    Analytics
                                  </Badge>
                                )}
                                {capabilities.supportsParallelProcessing && (
                                  <Badge variant="secondary" className="text-xs">
                                    Processamento Paralelo
                                  </Badge>
                                )}
                                {capabilities.hasErrorHandling && (
                                  <Badge variant="secondary" className="text-xs">
                                    Tratamento de Erros
                                  </Badge>
                                )}
                              </>
                            );
                          } catch (error) {
                            console.warn('Erro ao fazer parse das capabilities:', error);
                            return null;
                          }
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWorkflowVisualization(workflow);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(workflow);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendToLearning(workflow);
                        }}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Enviar para Learning
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkflow(workflow);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredWorkflows.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum workflow encontrado com os filtros atuais.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setFilters({
                    type: '',
                    category: '',
                    minComplexity: '',
                    maxComplexity: '',
                    search: ''
                  })}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Panel */}
      {showDebugPanel && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-5 h-5" />
                Painel de Debug - Exportação de Workflows
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={loadExportLogs} disabled={loadingLogs}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${loadingLogs ? 'animate-spin' : ''}`} />
                  Atualizar Logs
                </Button>
                <Button size="sm" variant="outline" onClick={clearExportLogs}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar Logs
                </Button>
              </div>
            </div>
            <CardDescription>
              Logs detalhados de exportação para diagnóstico de problemas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingLogs ? (
                <div className="text-center py-4">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                  <p>Carregando logs...</p>
                </div>
              ) : exportLogs.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum log de exportação encontrado.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {exportLogs.map((log) => {
                    let details = {};
                    try {
                      details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                    } catch (e) {
                      // Ignorar erro de parse
                    }

                    const isError = log.status === 'ERROR';
                    const isSuccess = log.status === 'SUCCESS';

                    return (
                      <div 
                        key={log.id} 
                        className={`p-3 rounded-lg border ${
                          isError 
                            ? 'border-red-200 bg-red-100 dark:bg-red-900/20 dark:border-red-800' 
                            : isSuccess 
                              ? 'border-green-200 bg-green-100 dark:bg-green-900/20 dark:border-green-800'
                              : 'border-gray-200 bg-gray-100 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isError ? (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            ) : isSuccess ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-600" />
                            )}
                            <span className="font-medium text-sm">
                              {log.action}
                            </span>
                            <Badge variant={isError ? "destructive" : isSuccess ? "default" : "secondary"}>
                              {log.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          {log.workflowName && (
                            <p><strong>Workflow:</strong> {log.workflowName}</p>
                          )}
                          {log.canvasId && (
                            <p><strong>Canvas ID:</strong> {log.canvasId}</p>
                          )}
                          
                          {details.message && (
                            <p className={`${isError ? 'text-red-700 dark:text-red-300' : ''}`}>
                              <strong>Mensagem:</strong> {details.message}
                            </p>
                          )}
                          
                          {details.error && (
                            <p className="text-red-700 dark:text-red-300 text-xs">
                              <strong>Erro:</strong> {details.error}
                            </p>
                          )}
                          
                          {details.updateError && (
                            <div className="text-xs">
                              <strong>Erro na atualização:</strong> HTTP {details.updateError.status}
                            </div>
                          )}
                          
                          {details.createError && (
                            <div className="text-xs">
                              <strong>Erro na criação:</strong> HTTP {details.createError.status}
                            </div>
                          )}
                          
                          {details.performance && (
                            <div className="text-xs">
                              <strong>Performance:</strong> {details.performance.duration}ms
                            </div>
                          )}
                        </div>
                        
                        {details.stack && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">
                              Ver Stack Trace
                            </summary>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                              {details.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modal de visualização de workflow */}
      <Dialog open={isVisualizationDialogOpen} onOpenChange={setIsVisualizationDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visualização do Workflow
            </DialogTitle>
            <DialogDescription>
              Estrutura visual do workflow com nós e conexões
            </DialogDescription>
          </DialogHeader>

          {visualizationWorkflow && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(visualizationWorkflow.type)}
                      <h3 className="font-semibold">{visualizationWorkflow.name}</h3>
                    </div>
                    <Badge variant="outline">{getTypeLabel(visualizationWorkflow.type)}</Badge>
                    <WorkflowComplexityBadge score={visualizationWorkflow.complexityScore} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Estatísticas</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Nós:</span>
                        <span className="font-medium">{visualizationWorkflow.nodeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conexões:</span>
                        <span className="font-medium">{visualizationWorkflow.edgeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profundidade:</span>
                        <span className="font-medium">{visualizationWorkflow.maxDepth}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {visualizationWorkflow.deployed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                        )}
                        <span className="text-sm">
                          {visualizationWorkflow.deployed ? 'Deployed' : 'Não Deployed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {visualizationWorkflow.isPublic ? (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                        )}
                        <span className="text-sm">
                          {visualizationWorkflow.isPublic ? 'Público' : 'Privado'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Canvas do Workflow */}
              <Card>
                <CardHeader>
                  <CardTitle>Canvas do Workflow</CardTitle>
                  <CardDescription>
                    Visualização gráfica da estrutura do workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted border-2 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Workflow className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Visualização do Workflow</h3>
                      <p className="text-muted-foreground mb-4">
                        Esta área mostrará o canvas visual do workflow com nós e conexões
                      </p>
                      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                        <div className="p-2 bg-background border rounded">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                          <span>Nós de Entrada</span>
                        </div>
                        <div className="p-2 bg-background border rounded">
                          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                          <span>Nós de Processamento</span>
                        </div>
                        <div className="p-2 bg-background border rounded">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div>
                          <span>Nós de Saída</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Descrição */}
              {visualizationWorkflow.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{visualizationWorkflow.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Ações */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  ID: {visualizationWorkflow.flowiseId}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsVisualizationDialogOpen(false)}
                  >
                    Fechar
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsVisualizationDialogOpen(false);
                      sendToLearning(visualizationWorkflow);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar para Learning
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de edição de workflow */}
      <EditWorkflowDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editingWorkflow={editingWorkflow}
        editForm={editForm}
        onFormChange={handleEditFormChange}
        onSave={saveWorkflowEdit}
        isEditing={isEditing}
        onOpenCanvas={openWorkflowInCanvas}
        onExportToFlowise={exportToFlowise}
        exporting={exporting}
        onExportAsJSON={exportWorkflowAsJSON}
        onExportAsConfig={exportWorkflowAsConfig}
        onCopyToClipboard={copyWorkflowIdToClipboard}
      />
      
      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmationModal />
    </div>
  );
}
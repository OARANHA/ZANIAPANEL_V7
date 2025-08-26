'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  Play, 
  Settings, 
  Download, 
  Upload, 
  Code, 
  FileText, 
  GitBranch, 
  Lightbulb, 
  Zap, 
  Server, 
  Bot,
  Workflow,
  Users,
  ArrowLeft,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Search,
  BarChart3,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ElegantCard from '@/components/ui/ElegantCard';
import WorkflowComplexityBadge from '@/components/workflow/WorkflowComplexityBadge';

// 🚀 Lazy Loading para Componentes Pesados
const MCPManager = lazy(() => import('@/components/admin/MCPManager'));
const MCPAgentIntegration = lazy(() => import('@/components/admin/MCPAgentIntegration'));
const HybridWorkflowEditor = lazy(() => import('@/components/workflow/HybridWorkflowEditor'));

// 📊 Loading Component para Suspense
const LoadingComponent = ({ text = 'Carregando...' }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin mr-2" />
    <span className="text-muted-foreground">{text}</span>
  </div>
);

interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  status: 'active' | 'inactive' | 'deployed';
  lastSynced: string;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  status: 'active' | 'inactive' | 'training';
}

interface ExportedWorkflow {
  id: string;
  name: string;
  description?: string;
  type: 'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT';
  complexityScore: number;
  nodeCount: number;
  edgeCount: number;
  exportedAt: string;
  source: 'learning' | 'flowise';
  status: 'draft' | 'ready' | 'deployed';
  flowData: string;
}

export default function StudioPage() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [exportedWorkflows, setExportedWorkflows] = useState<ExportedWorkflow[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ExportedWorkflow | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    language: '',
    framework: ''
  });

  useEffect(() => {
    loadProjects();
    loadAgents();
    loadExportedWorkflows();
  }, []);

  const loadProjects = async () => {
    try {
      // Simular projetos por enquanto
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'API de E-commerce',
          description: 'API RESTful para plataforma de e-commerce',
          language: 'TypeScript',
          framework: 'Next.js',
          status: 'active',
          lastSynced: new Date().toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Dashboard Analytics',
          description: 'Dashboard de análise de dados em tempo real',
          language: 'JavaScript',
          framework: 'React',
          status: 'deployed',
          lastSynced: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setProjects(mockProjects);
      if (mockProjects.length > 0) {
        setSelectedProject(mockProjects[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data: any = await response.json();
        // The API returns { agents: [...] } so we need to extract the agents array
        const agentsArray = data.agents || [];
        setAgents(Array.isArray(agentsArray) ? agentsArray.filter(agent => agent.status === 'active') : []);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      // Set empty array on error to prevent filter errors
      setAgents([]);
    }
  };

  const loadExportedWorkflows = async () => {
    try {
      // Buscar workflows que foram realmente importados via learning
      const response = await fetch('/api/v1/studio/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_imported_workflows',
          data: { source: 'learning' }
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        const importedWorkflows = data.workflows || [];
        
        // Transformar os workflows importados para o formato esperado
        const transformedWorkflows: ExportedWorkflow[] = importedWorkflows.map((workflow: any) => ({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          type: workflow.type,
          complexityScore: workflow.complexityScore || 0,
          nodeCount: workflow.nodeCount || 0,
          edgeCount: workflow.edgeCount || 0,
          exportedAt: workflow.importedAt || workflow.updatedAt || new Date().toISOString(),
          source: 'learning',
          status: workflow.status || 'draft',
          flowData: workflow.flowData || '{}'
        }));
        
        setExportedWorkflows(transformedWorkflows);
      } else {
        // Se a API falhar, mostrar array vazio em vez de dados mockados
        setExportedWorkflows([]);
      }
    } catch (error) {
      console.error('Erro ao carregar workflows exportados:', error);
      setExportedWorkflows([]);
    }
  };

  const createProject = async () => {
    if (!newProject.name) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      language: newProject.language,
      framework: newProject.framework,
      status: 'active',
      lastSynced: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setProjects([...projects, project]);
    setIsCreateProjectOpen(false);
    setNewProject({
      name: '',
      description: '',
      language: '',
      framework: ''
    });
  };

  const deployWorkflow = async (workflow: ExportedWorkflow) => {
    try {
      console.log('🚀 Iniciando deployment do workflow para Admin/Agents:', workflow.name);
      
      // Preparar dados do agente baseado no workflow
      const agentData = {
        name: workflow.name,
        description: workflow.description || `Agente baseado no workflow ${workflow.name}`,
        type: 'workflow', // Indica que veio do Studio
        category: workflow.type.toLowerCase(),
        
        // Configuração do workflow
        workflowConfig: {
          flowiseId: workflow.id,
          flowData: workflow.flowData,
          nodeCount: workflow.nodeCount,
          edgeCount: workflow.edgeCount,
          complexityScore: workflow.complexityScore
        },
        
        // Metadados para o Admin/Agents
        metadata: {
          sourceStudio: true,
          deployedAt: new Date().toISOString(),
          version: '1.0.0',
          status: 'ready_for_client'
        },
        
        // Configurações padrão para clientes
        clientConfig: {
          customizable: true,
          parameters: [],
          pricing: {
            model: 'freemium',
            basePrice: 0
          }
        }
      };
      
      // Enviar para API do Admin/Agents
      const response = await fetch('/api/v1/admin/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_from_studio',
          data: agentData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Atualizar status local
        setExportedWorkflows(prev => 
          prev.map(w => w.id === workflow.id ? { ...w, status: 'deployed' as const } : w)
        );
        
        // Mostrar confirmação com próximos passos
        if (confirm(
          `✅ Workflow "${workflow.name}" deployado com sucesso para Admin/Agents!\n\n` +
          `🎯 Próximos passos:\n` +
          `1. Card criado em Admin/Agents\n` +
          `2. Configure pricing e parâmetros\n` +
          `3. Associe a clientes\n` +
          `4. Deploy final para Flowise\n\n` +
          `Deseja ir para Admin/Agents agora?`
        )) {
          // Navegar para Admin/Agents
          window.location.href = '/admin/agents';
        }
        
        console.log('✅ Workflow deployado com sucesso:', result.agent);
      } else {
        throw new Error(result.error || 'Falha no deployment');
      }
      
    } catch (error) {
      console.error('❌ Erro ao deployar workflow:', error);
      alert(
        `❌ Erro no deployment:\n${error instanceof Error ? error.message : 'Erro desconhecido'}\n\n` +
        `Verifique a conexão e tente novamente.`
      );
    }
  };

  const deleteWorkflow = async (workflow: ExportedWorkflow) => {
    try {
      // Confirmar exclusão
      const confirmed = typeof window !== 'undefined' && window.confirm(`Tem certeza que deseja excluir o workflow "${workflow.name}"?\n\nEsta ação não pode ser desfeita.`);
      
      if (!confirmed) {
        return;
      }
      
      console.log('🗑️ Excluindo workflow do Studio:', workflow.name);
      
      // Chamar API para excluir o workflow
      const response = await fetch('/api/v1/studio/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_workflow',
          data: { 
            workflowId: workflow.id,
            source: 'learning'
          }
        })
      });
      
      if (response.ok) {
        console.log('✅ Workflow excluído com sucesso do banco de dados');
        
        // Remover da lista local
        setExportedWorkflows(prev => prev.filter(w => w.id !== workflow.id));
        
        // Se o workflow excluído estava selecionado, limpar seleção
        if (selectedWorkflow?.id === workflow.id) {
          setSelectedWorkflow(null);
        }
        
        toast({
          title: "Workflow excluído com sucesso!",
          description: `O workflow "${workflow.name}" foi removido permanentemente.`,
          variant: "default",
        });
      } else {
        const errorData: any = await response.json();
        console.error('❌ Erro ao excluir workflow:', errorData);
        toast({
          title: "Erro ao excluir workflow",
          description: `Erro: ${errorData.error || 'Erro desconhecido'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao excluir workflow:', error);
      toast({
        title: "Erro ao excluir workflow",
        description: "Verifique a conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'deployed': return 'bg-blue-500';
      case 'ready': return 'bg-yellow-500';
      case 'draft': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'deployed': return 'Deployado';
      case 'ready': return 'Pronto';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  return (
    <MainLayout currentPath={pathname}>
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ElegantCard
            title="Total Projetos"
            description="Projetos criados"
            icon={Code}
            iconColor="text-blue-600"
            bgColor="bg-blue-100 dark:bg-blue-900/20"
            value={projects.length}
            badge={projects.length > 0 ? "Ativos" : undefined}
            badgeColor="bg-blue-50 text-blue-700 border-blue-200"
          />
          
          <ElegantCard
            title="Workflows Importados"
            description="Do Learning (Aprovados)"
            icon={Workflow}
            iconColor="text-purple-600"
            bgColor="bg-purple-100 dark:bg-purple-900/20"
            value={exportedWorkflows.length}
            badge={`${exportedWorkflows.filter(w => w.status === 'ready').length} prontos`}
            badgeColor="bg-purple-50 text-purple-700 border-purple-200"
          />
          
          <ElegantCard
            title="Workflows Deployados"
            description="Em produção"
            icon={Upload}
            iconColor="text-green-600"
            bgColor="bg-green-100 dark:bg-green-900/20"
            value={exportedWorkflows.filter(w => w.status === 'deployed').length}
            badge="Produção"
            badgeColor="bg-green-50 text-green-700 border-green-200"
          />
          
          <ElegantCard
            title="Agentes IA"
            description="Disponíveis"
            icon={Target}
            iconColor="text-orange-600"
            bgColor="bg-orange-100 dark:bg-orange-900/20"
            value={Array.isArray(agents) ? agents.length : 0}
            badge={Array.isArray(agents) && agents.length > 0 ? "Prontos para uso" : undefined}
            badgeColor="bg-orange-50 text-orange-700 border-orange-200"
          />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Visual Studio</h1>
            <p className="text-lg text-muted-foreground">
              Ambiente de desenvolvimento integrado com agentes de IA e workflows exportados
            </p>
          </div>
          
          {selectedWorkflow ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedWorkflow(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                variant="outline"
                onClick={() => deployWorkflow(selectedWorkflow)}
                disabled={selectedWorkflow.status === 'deployed'}
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedWorkflow.status === 'deployed' ? 'Deployado' : 'Deployar'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
                    Novo Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Projeto</DialogTitle>
                    <DialogDescription>
                      Configure um novo projeto para integração com agentes de IA
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="Nome do projeto"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder="Descrição do projeto"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Linguagem</label>
                        <Input
                          value={newProject.language}
                          onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
                          placeholder="Ex: TypeScript"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Framework</label>
                        <Input
                          value={newProject.framework}
                          onChange={(e) => setNewProject({ ...newProject, framework: e.target.value })}
                          placeholder="Ex: Next.js"
                        />
                      </div>
                    </div>
                    <Button onClick={createProject} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      Criar Projeto
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Main Content */}
        {selectedWorkflow ? (
          /* Workflow Editor View */
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você está editando o workflow exportado <strong>{selectedWorkflow.name}</strong>. 
                Este workflow está pronto para ser deployado em produção.
              </AlertDescription>
            </Alert>
            
            <Suspense fallback={<LoadingComponent text="Carregando editor de workflow..." />}>
              <HybridWorkflowEditor
                workflow={{
                  id: selectedWorkflow.id,
                  flowiseId: selectedWorkflow.id,
                  name: selectedWorkflow.name,
                  description: selectedWorkflow.description,
                  type: selectedWorkflow.type,
                  deployed: selectedWorkflow.status === 'deployed',
                  isPublic: true,
                  category: 'exported',
                  complexityScore: selectedWorkflow.complexityScore,
                  nodeCount: selectedWorkflow.nodeCount,
                  edgeCount: selectedWorkflow.edgeCount,
                  maxDepth: 3,
                  capabilities: {
                    canHandleFileUpload: true,
                    hasStreaming: true,
                    supportsMultiLanguage: true,
                    hasMemory: true,
                    usesExternalAPIs: false,
                    hasAnalytics: false,
                    supportsParallelProcessing: true,
                    hasErrorHandling: true
                  },
                  lastSyncAt: selectedWorkflow.exportedAt,
                  createdAt: selectedWorkflow.exportedAt,
                  updatedAt: new Date().toISOString(),
                  flowData: selectedWorkflow.flowData
                }}
                onSave={async (updatedWorkflow) => {
                  console.log('Workflow salvo:', updatedWorkflow.name);
                  
                  // Atualizar o workflow no estado local
                  setExportedWorkflows(prev => 
                    prev.map(w => w.id === updatedWorkflow.id ? {
                      ...w,
                      name: updatedWorkflow.name,
                      description: updatedWorkflow.description,
                      flowData: updatedWorkflow.flowData,
                      updatedAt: new Date().toISOString()
                    } : w)
                  );
                  
                  // Atualizar o workflow selecionado
                  setSelectedWorkflow(prev => prev ? {
                    ...prev,
                    name: updatedWorkflow.name,
                    description: updatedWorkflow.description,
                    flowData: updatedWorkflow.flowData
                  } : null);
                  
                  // Recarregar workflows do servidor para garantir sincronização
                  await loadExportedWorkflows();
                }}
                onExport={() => {
                  console.log('Exportar workflow');
                }}
                onPublishToAgents={() => {
                  console.log('Publicar para agentes');
                }}
              />
            </Suspense>
          </div>
        ) : (
          /* Default Studio View */
          <Tabs defaultValue="workflows" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-lg border">
              <TabsTrigger value="workflows" className="flex items-center space-x-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 rounded-lg transition-all">
                <Workflow className="w-4 h-4" />
                <span>Workflows</span>
              </TabsTrigger>
              <TabsTrigger value="workspace" className="flex items-center space-x-2 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 rounded-lg transition-all">
                <Code className="w-4 h-4" />
                <span>Workspace</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center space-x-2 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 rounded-lg transition-all">
                <Target className="w-4 h-4" />
                <span>Agentes IA</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center space-x-2 data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900 rounded-lg transition-all">
                <Zap className="w-4 h-4" />
                <span>Automação</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-yellow-100 dark:data-[state=active]:bg-yellow-900 rounded-lg transition-all">
                <Lightbulb className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="mcp" className="flex items-center space-x-2 data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900 rounded-lg transition-all">
                <Server className="w-4 h-4" />
                <span>MCP</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Workflows Importados do Learning</CardTitle>
                  <CardDescription>
                    Workflows que foram analisados e aprovados no Learning, prontos para desenvolvimento e deploy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {exportedWorkflows.length === 0 ? (
                    <div className="text-center py-12">
                      <Workflow className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum workflow importado</h3>
                      <p className="text-muted-foreground mb-4">
                        Nenhum workflow foi importado do Learning ainda. 
                        Analise e aprove workflows na seção de Learning primeiro.
                      </p>
                      <Link href="/admin/learning">
                        <Button>
                          Ir para Learning
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {exportedWorkflows.map((workflow) => (
                        <Card key={workflow.id} className="shadow-md hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{workflow.name}</CardTitle>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.status)}`} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{workflow.type}</Badge>
                              <Badge variant="secondary">{getStatusText(workflow.status)}</Badge>
                              <WorkflowComplexityBadge score={workflow.complexityScore} />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                              {workflow.description || 'Sem descrição'}
                            </p>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{workflow.nodeCount} nós</span>
                                <span>{workflow.edgeCount} conexões</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Importado: {new Date(workflow.exportedAt).toLocaleDateString()}</span>
                                <span>Aprovado no Learning</span>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedWorkflow(workflow)}
                                  className="flex-1"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Editar
                                </Button>
                                
                                {workflow.status !== 'deployed' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => deployWorkflow(workflow)}
                                    className="flex-1"
                                  >
                                    <Upload className="w-3 h-3 mr-1" />
                                    Deploy
                                  </Button>
                                )}
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteWorkflow(workflow)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workspace" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project List */}
                <div className="lg:col-span-1">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Projetos</CardTitle>
                      <CardDescription>Seus projetos ativos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedProject === project.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedProject(project.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{project.name}</h4>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span>{project.language} • {project.framework}</span>
                            <span>{new Date(project.lastSynced).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Workspace Area */}
                <div className="lg:col-span-2">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Área de Trabalho</CardTitle>
                          <CardDescription>
                            {projects.find(p => p.id === selectedProject)?.name || 'Selecione um projeto'}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Upload className="w-4 h-4 mr-1" />
                            Sync
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Code className="w-4 h-4" />
                            <span className="font-medium">Editor de Código</span>
                          </div>
                          <Textarea
                            placeholder="Seu código aparecerá aqui..."
                            className="min-h-64 font-mono text-sm"
                            defaultValue={`// Exemplo de código integrado com IA
function processData(data) {
  // Agentes de IA podem ajudar a otimizar esta função
  return data.map(item => ({
    ...item,
    processed: true,
    timestamp: new Date().toISOString()
  }));
}`}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <ElegantCard
                            title="Sugestões de IA"
                            description="Otimizações sugeridas"
                            icon={Lightbulb}
                            iconColor="text-yellow-600"
                            bgColor="bg-yellow-100 dark:bg-yellow-900/20"
                            badge="3 sugestões"
                            badgeColor="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            <div className="space-y-2">
                              <div className="text-sm">
                                • Use map() em vez de forEach() para melhor performance
                              </div>
                              <div className="text-sm">
                                • Adicione validação de dados de entrada
                              </div>
                              <div className="text-sm">
                                • Considere usar async/await para operações assíncronas
                              </div>
                            </div>
                          </ElegantCard>
                          
                          <ElegantCard
                            title="Análise de Código"
                            description="Métricas e qualidade"
                            icon={BarChart3}
                            iconColor="text-blue-600"
                            bgColor="bg-blue-100 dark:bg-blue-900/20"
                            badge="Excelente"
                            badgeColor="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Complexidade</span>
                                <span className="font-medium text-green-600">Baixa</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Manutenibilidade</span>
                                <span className="font-medium text-green-600">Alta</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Performance</span>
                                <span className="font-medium text-blue-600">Boa</span>
                              </div>
                            </div>
                          </ElegantCard>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Agentes IA Disponíveis</CardTitle>
                  <CardDescription>
                    Conecte agentes de IA aos seus projetos para aumentar a produtividade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {agents.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum agente disponível</h3>
                      <p className="text-muted-foreground mb-4">
                        Crie agentes na página de agentes para que eles apareçam aqui.
                      </p>
                      <Link href="/admin/agents">
                        <Button>
                          Ir para Agentes
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {agents.map((agent) => (
                        <Card key={agent.id} className="shadow-md hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{agent.type}</Badge>
                              <Badge variant="secondary">{getStatusText(agent.status)}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                              {agent.description || 'Sem descrição'}
                            </p>
                            
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Executar
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                              >
                                <Settings className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Automação e Integração</CardTitle>
                  <CardDescription>
                    Configure automações e integrações com serviços externos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Automação Inteligente</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure fluxos de automação, webhooks e integrações com APIs externas.
                    </p>
                    <Button variant="outline">
                      Em breve disponível
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Analytics e Métricas</CardTitle>
                  <CardDescription>
                    Acompanhe o desempenho e métricas dos seus projetos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Análise Avançada</h3>
                    <p className="text-muted-foreground mb-4">
                      Dashboards, gráficos e relatórios detalhados sobre o desempenho dos projetos.
                    </p>
                    <Button variant="outline">
                      Em breve disponível
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcp" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">MCP - Model Context Protocol</CardTitle>
                  <CardDescription>
                    Gerencie servidores MCP e integrações com modelos de linguagem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="servers" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="servers">Servidores MCP</TabsTrigger>
                      <TabsTrigger value="integration">Integração</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="servers">
                      <Suspense fallback={<LoadingComponent text="Carregando MCP Manager..." />}>
                        <MCPManager />
                      </Suspense>
                    </TabsContent>
                    
                    <TabsContent value="integration">
                      <Suspense fallback={<LoadingComponent text="Carregando integração MCP..." />}>
                        <MCPAgentIntegration />
                      </Suspense>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
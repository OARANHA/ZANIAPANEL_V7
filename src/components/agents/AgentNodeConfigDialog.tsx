'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Settings, 
  Brain, 
  Check, 
  X, 
  Plus, 
  Filter,
  RefreshCw,
  Save,
  Download,
  Info
} from 'lucide-react';

interface FlowiseNode {
  categoria: string;
  label: string;
  desc: string;
  path: string;
  inputs: string;
  outputs: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  config?: string;
  knowledge?: string;
}

interface AgentNodeConfigDialogProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedNodes: FlowiseNode[], config: any) => void;
  onExport?: (selectedNodes: FlowiseNode[], config: any) => void;
}

export function AgentNodeConfigDialog({
  agent,
  isOpen,
  onClose,
  onSave,
  onExport
}: AgentNodeConfigDialogProps) {
  console.log('🔧 AgentNodeConfigDialog rendered with isOpen:', isOpen, 'agent:', agent.name);
  const [selectedNodes, setSelectedNodes] = useState<FlowiseNode[]>([]);
  const [availableNodes, setAvailableNodes] = useState<FlowiseNode[]>([]);
  const [recommendedNodes, setRecommendedNodes] = useState<FlowiseNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [config, setConfig] = useState({
    workflowName: `${agent.name} Workflow`,
    workflowDescription: `Workflow exportado do agente ${agent.name}`,
    autoConnect: true,
    optimizeLayout: true,
    includeMemory: true,
    includeTools: true
  });

  // Carregar nodes quando o diálogo abrir
  useEffect(() => {
    console.log('🔧 AgentNodeConfigDialog useEffect called with isOpen:', isOpen);
    if (isOpen) {
      console.log('🔧 Dialog is opening, loading nodes...');
      loadNodes();
    } else {
      console.log('🔧 Dialog is closed or not opening');
    }
  }, [isOpen, agent]);

  const loadNodes = async () => {
    console.log('🚀 AgentNodeConfigDialog: loadNodes called, isOpen:', isOpen);
    setLoading(true);
    try {
      // Carregar catálogo completo
      console.log('📋 Loading catalog...');
      const catalogResponse = await fetch('/api/flowise-nodes?action=catalog');
      console.log('📋 Catalog response status:', catalogResponse.status);
      if (catalogResponse.ok) {
        const catalogData = await catalogResponse.json();
        console.log('📋 Catalog data:', catalogData);
        setAvailableNodes(catalogData.nodes);
        setCategories(catalogData.categories);
      } else {
        console.error('📋 Catalog response not OK:', catalogResponse.status, catalogResponse.statusText);
        const errorText = await catalogResponse.text();
        console.error('📋 Error response:', errorText);
      }

      // Carregar nodes recomendados
      console.log('🎯 Loading recommended nodes...');
      const agentType = extractAgentType(agent);
      console.log('🎯 Agent type:', agentType);
      const recommendedResponse = await fetch(`/api/flowise-nodes?action=recommended&agentType=${agentType}`);
      console.log('🎯 Recommended response status:', recommendedResponse.status);
      if (recommendedResponse.ok) {
        const recommendedData = await recommendedResponse.json();
        console.log('🎯 Recommended data:', recommendedData);
        setRecommendedNodes(recommendedData.nodes);
        
        // Pré-selecionar nodes recomendados
        setSelectedNodes(recommendedData.nodes.slice(0, 3));
      } else {
        console.error('🎯 Recommended response not OK:', recommendedResponse.status, recommendedResponse.statusText);
        const errorText = await recommendedResponse.text();
        console.error('🎯 Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar nodes:', error);
      // Adicionar nodes de fallback para teste
      setAvailableNodes([
        {
          categoria: 'Chat',
          label: 'Chat Input',
          desc: 'Chat input node',
          path: 'test/chat-input',
          inputs: '',
          outputs: ''
        }
      ]);
      setCategories(['Chat']);
      setRecommendedNodes([]);
    } finally {
      setLoading(false);
    }
  };

  const extractAgentType = (agent: Agent): string => {
    if (agent.name.toLowerCase().includes('chat') || agent.description?.toLowerCase().includes('chat')) return 'chat';
    if (agent.name.toLowerCase().includes('assistant') || agent.description?.toLowerCase().includes('assistant')) return 'assistant';
    if (agent.name.toLowerCase().includes('rag') || agent.description?.toLowerCase().includes('rag')) return 'rag';
    if (agent.name.toLowerCase().includes('workflow') || agent.description?.toLowerCase().includes('workflow')) return 'workflow';
    if (agent.name.toLowerCase().includes('api') || agent.description?.toLowerCase().includes('api')) return 'api';
    return 'default';
  };

  const filteredNodes = () => {
    let nodes = activeTab === 'recommended' ? recommendedNodes : availableNodes;
    
    if (selectedCategory && selectedCategory !== 'all') {
      nodes = nodes.filter(node => node.categoria === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(node => 
        node.label.toLowerCase().includes(query) ||
        node.desc.toLowerCase().includes(query) ||
        node.categoria.toLowerCase().includes(query)
      );
    }
    
    return nodes;
  };

  const handleNodeSelect = (node: FlowiseNode) => {
    setSelectedNodes(prev => {
      const isSelected = prev.some(n => n.path === node.path);
      if (isSelected) {
        return prev.filter(n => n.path !== node.path);
      } else {
        return [...prev, node];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedNodes, config);
    onClose();
  };

  const handleExport = () => {
    if (onExport) {
      onExport(selectedNodes, config);
    }
    onClose();
  };

  const isNodeSelected = (node: FlowiseNode) => {
    return selectedNodes.some(n => n.path === node.path);
  };

  const getNodeCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Chat': '💬',
      'Prompt': '📝',
      'Memory': '🧠',
      'LLM': '🤖',
      'Document': '📄',
      'Embeddings': '🔤',
      'Vector Store': '🗄️',
      'Retriever': '🔍',
      'Logic': '🔄',
      'Condition': '🔀',
      'Loop': '🔁',
      'Variable': '📊',
      'HTTP Request': '🌐',
      'Webhook': '🎣',
      'API': '🔌',
      'Function': '⚙️',
      'Assistant': '🎯',
      'Tools': '🛠️',
      'Agent': '👤'
    };
    
    return iconMap[category] || '📦';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🔧 Dialog onOpenChange called with:', open);
      onClose();
    }}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar Nodes Flowise - {agent.name}
          </DialogTitle>
          <DialogDescription>
            Selecione e configure os nodes Flowise que serão utilizados no workflow deste agente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Configurações do Workflow */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Configurações do Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nome do Workflow</label>
                  <Input
                    value={config.workflowName}
                    onChange={(e) => setConfig(prev => ({ ...prev, workflowName: e.target.value }))}
                    placeholder="Nome do workflow"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Descrição</label>
                  <Input
                    value={config.workflowDescription}
                    onChange={(e) => setConfig(prev => ({ ...prev, workflowDescription: e.target.value }))}
                    placeholder="Descrição do workflow"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Conexão Automática</label>
                  <Select value={config.autoConnect ? 'true' : 'false'} onValueChange={(value) => setConfig(prev => ({ ...prev, autoConnect: value === 'true' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="optimizeLayout"
                    checked={config.optimizeLayout}
                    onChange={(e) => setConfig(prev => ({ ...prev, optimizeLayout: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="optimizeLayout" className="text-sm">Otimizar Layout</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeMemory"
                    checked={config.includeMemory}
                    onChange={(e) => setConfig(prev => ({ ...prev, includeMemory: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="includeMemory" className="text-sm">Incluir Memória</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeTools"
                    checked={config.includeTools}
                    onChange={(e) => setConfig(prev => ({ ...prev, includeTools: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="includeTools" className="text-sm">Incluir Ferramentas</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Nodes */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Lista de Nodes */}
            <div className="flex-1 min-h-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Catálogo de Nodes</CardTitle>
                    <Button variant="outline" size="sm" onClick={loadNodes}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Atualizar
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar nodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                      <TabsTrigger value="recommended">Recomendados</TabsTrigger>
                      <TabsTrigger value="all">Todos os Nodes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={activeTab} className="m-0 p-4 flex-1 overflow-y-auto">
                      {loading ? (
                        <div className="flex items-center justify-center h-64">
                          <RefreshCw className="h-8 w-8 animate-spin" />
                          <span className="ml-2">Carregando nodes...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredNodes().map(node => (
                            <NodeCard
                              key={node.path}
                              node={node}
                              isSelected={isNodeSelected(node)}
                              onSelect={() => handleNodeSelect(node)}
                              getCategoryIcon={getNodeCategoryIcon}
                            />
                          ))}
                          {filteredNodes().length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Info className="h-8 w-8 mx-auto mb-2" />
                              <p>Nenhum node encontrado</p>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Nodes Selecionados */}
            <div className="w-80 min-h-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-lg">Nodes Selecionados</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedNodes.length} nodes selecionados
                    </span>
                    {selectedNodes.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedNodes([])}
                      >
                        <X className="h-4 w-4" />
                        Limpar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 overflow-y-auto">
                  {selectedNodes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Selecione nodes para começar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedNodes.map((node, index) => (
                        <div key={node.path} className="p-3 bg-muted rounded-lg border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getNodeCategoryIcon(node.categoria)}</span>
                              <div>
                                <h5 className="font-medium text-sm">{node.label}</h5>
                                <Badge variant="secondary" className="text-xs">
                                  {node.categoria}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNodeSelect(node)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {node.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {onExport && selectedNodes.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Agora
            </Button>
          )}
          <Button onClick={handleSave} disabled={selectedNodes.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface NodeCardProps {
  node: FlowiseNode;
  isSelected: boolean;
  onSelect: () => void;
  getCategoryIcon: (category: string) => string;
}

function NodeCard({ node, isSelected, onSelect, getCategoryIcon }: NodeCardProps) {
  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{getCategoryIcon(node.categoria)}</span>
            <h4 className="font-medium text-sm">{node.label}</h4>
            <Badge variant="secondary" className="text-xs">
              {node.categoria}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {node.desc}
          </p>
          <div className="flex gap-1 mt-1">
            {node.inputs && (
              <Badge variant="outline" className="text-xs">
                I: {node.inputs.length > 15 ? node.inputs.substring(0, 15) + '...' : node.inputs}
              </Badge>
            )}
            {node.outputs && (
              <Badge variant="outline" className="text-xs">
                O: {node.outputs.length > 15 ? node.outputs.substring(0, 15) + '...' : node.outputs}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {isSelected ? <Check className="h-4 w-4 text-primary" /> : ''}
        </div>
      </div>
    </div>
  );
}
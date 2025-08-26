'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Wand2, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Target,
  Zap,
  Database,
  Brain,
  FileText,
  MessageSquare,
  Workflow,
  Hash,
  Sliders
} from 'lucide-react';
import { FlowiseNode, FlowiseEdge } from '@/lib/agent-to-flowise-transformer';
import { NodeModification, NodeModificationContext } from '@/lib/node-modifier-service';
import { useToast } from '@/hooks/use-toast';

interface NodeModifierInterfaceProps {
  nodes: FlowiseNode[];
  edges: FlowiseEdge[];
  onNodesModified: (modifiedNodes: FlowiseNode[]) => void;
  workflowType?: 'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT';
  agentCapabilities?: string[];
}

interface NodeConfig {
  id: string;
  name: string;
  type: string;
  category: string;
  currentConfig: Record<string, any>;
  availableModifications: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    options?: string[];
    currentValue: any;
    description: string;
  }>;
}

export default function NodeModifierInterface({
  nodes,
  edges,
  onNodesModified,
  workflowType = 'CHATFLOW',
  agentCapabilities = []
}: NodeModifierInterfaceProps) {
  
  const { toast } = useToast();
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [nodeConfigs, setNodeConfigs] = useState<NodeConfig[]>([]);
  const [modifications, setModifications] = useState<NodeModification[]>([]);
  const [suggestions, setSuggestions] = useState<NodeModification[]>([]);
  const [isModifying, setIsModifying] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [context, setContext] = useState<NodeModificationContext>({
    workflowType,
    agentCapabilities,
    businessRules: {},
    userPreferences: {},
    performanceMetrics: {}
  });

  // Inicializar configurações dos nós
  useEffect(() => {
    const configs = nodes.map(node => ({
      id: node.id,
      name: node.data.name,
      type: node.data.type,
      category: node.data.category,
      currentConfig: node.data.inputs || {},
      availableModifications: getAvailableModifications(node)
    }));
    setNodeConfigs(configs);
    
    if (configs.length > 0 && !selectedNode) {
      setSelectedNode(configs[0].id);
    }
  }, [nodes]);

  // Gerar sugestões automaticamente
  useEffect(() => {
    if (nodes.length > 0) {
      generateSuggestions();
    }
  }, [nodes, context]);

  const getAvailableModifications = (node: FlowiseNode) => {
    const modifications: Array<{
      key: string;
      label: string;
      type: 'string' | 'number' | 'boolean' | 'select';
      options?: string[];
      currentValue: any;
      description: string;
    }> = [];

    const inputs = node.data.inputs || {};

    // Modificações baseadas na categoria do nó
    switch (node.data.category) {
      case 'Chat Models':
        modifications.push(
          {
            key: 'modelName',
            label: 'Modelo',
            type: 'select',
            options: ['gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-haiku', 'claude-3-sonnet'],
            currentValue: inputs.modelName,
            description: 'Modelo de linguagem a ser usado'
          },
          {
            key: 'temperature',
            label: 'Temperatura',
            type: 'number',
            currentValue: inputs.temperature,
            description: 'Controla a aleatoriedade das respostas (0-1)'
          },
          {
            key: 'maxTokens',
            label: 'Max Tokens',
            type: 'number',
            currentValue: inputs.maxTokens,
            description: 'Número máximo de tokens na resposta'
          },
          {
            key: 'streaming',
            label: 'Streaming',
            type: 'boolean',
            currentValue: inputs.streaming,
            description: 'Habilitar respostas em streaming'
          },
          {
            key: 'allowImageUploads',
            label: 'Permitir Upload de Imagens',
            type: 'boolean',
            currentValue: inputs.allowImageUploads,
            description: 'Permitir upload de imagens como entrada'
          }
        );
        break;

      case 'LLM':
        modifications.push(
          {
            key: 'model',
            label: 'Modelo LLM',
            type: 'select',
            options: ['gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-haiku', 'claude-3-sonnet'],
            currentValue: inputs.llmModel,
            description: 'Modelo de linguagem para o nó LLM'
          }
        );
        break;

      case 'Prompts':
        modifications.push(
          {
            key: 'template',
            label: 'Template',
            type: 'string',
            currentValue: inputs.template,
            description: 'Template do prompt a ser usado'
          }
        );
        break;

      case 'Memory':
        modifications.push(
          {
            key: 'memoryType',
            label: 'Tipo de Memória',
            type: 'select',
            options: ['Buffer Memory', 'Conversation Buffer Memory', 'Conversation Summary Memory'],
            currentValue: inputs.memoryType,
            description: 'Tipo de memória a ser utilizada'
          },
          {
            key: 'bufferSize',
            label: 'Tamanho do Buffer',
            type: 'number',
            currentValue: inputs.bufferSize,
            description: 'Número máximo de mensagens na memória'
          }
        );
        break;

      case 'Tools':
        modifications.push(
          {
            key: 'tool',
            label: 'Ferramenta',
            type: 'select',
            options: ['Search', 'Calculator', 'Weather', 'Wikipedia', 'Web Scraping'],
            currentValue: inputs.toolAgentflowSelectedTool,
            description: 'Ferramenta a ser utilizada'
          }
        );
        break;

      case 'Document Stores':
        modifications.push(
          {
            key: 'documentStore',
            label: 'Document Store',
            type: 'select',
            options: ['Pinecone', 'Chroma', 'FAISS', 'Weaviate', 'Qdrant'],
            currentValue: inputs.documentStore,
            description: 'Base de dados vetorial para documentos'
          }
        );
        break;

      case 'Embeddings':
        modifications.push(
          {
            key: 'embeddingsModel',
            label: 'Modelo de Embeddings',
            type: 'select',
            options: ['text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'],
            currentValue: inputs.embeddingsModel,
            description: 'Modelo para gerar embeddings'
          }
        );
        break;

      case 'Text Splitters':
        modifications.push(
          {
            key: 'chunkSize',
            label: 'Tamanho do Chunk',
            type: 'number',
            currentValue: inputs.chunkSize,
            description: 'Tamanho máximo de cada chunk de texto'
          },
          {
            key: 'chunkOverlap',
            label: 'Sobreposição do Chunk',
            type: 'number',
            currentValue: inputs.chunkOverlap,
            description: 'Sobreposição entre chunks consecutivos'
          }
        );
        break;

      default:
        // Modificações genéricas para outros tipos de nós
        Object.keys(inputs).forEach(key => {
          if (typeof inputs[key] === 'string') {
            modifications.push({
              key,
              label: key,
              type: 'string',
              currentValue: inputs[key],
              description: `Parâmetro ${key}`
            });
          } else if (typeof inputs[key] === 'number') {
            modifications.push({
              key,
              label: key,
              type: 'number',
              currentValue: inputs[key],
              description: `Parâmetro ${key}`
            });
          } else if (typeof inputs[key] === 'boolean') {
            modifications.push({
              key,
              label: key,
              type: 'boolean',
              currentValue: inputs[key],
              description: `Parâmetro ${key}`
            });
          }
        });
        break;
    }

    return modifications;
  };

  const generateSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch(`/admin/api/nodes/modify?action=suggestions&nodes=${encodeURIComponent(JSON.stringify(nodes))}&context=${encodeURIComponent(JSON.stringify(context))}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.suggestions);
          toast({
            title: "Sugestões geradas!",
            description: `${data.suggestions.length} sugestões de modificação foram geradas.`,
            variant: "default",
          });
        }
      } else {
        throw new Error('Falha ao gerar sugestões');
      }
    } catch (error) {
      toast({
        title: "Erro ao gerar sugestões",
        description: "Não foi possível gerar sugestões de modificação.",
        variant: "destructive",
      });
      console.error('Erro ao gerar sugestões:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const addModification = (nodeId: string, key: string, value: any) => {
    const existingModIndex = modifications.findIndex(m => m.nodeId === nodeId);
    
    if (existingModIndex >= 0) {
      const updatedModifications = [...modifications];
      updatedModifications[existingModIndex] = {
        ...updatedModifications[existingModIndex],
        modifications: {
          ...updatedModifications[existingModIndex].modifications,
          [key]: value
        }
      };
      setModifications(updatedModifications);
    } else {
      setModifications([
        ...modifications,
        {
          nodeId,
          modifications: { [key]: value }
        }
      ]);
    }
  };

  const applyModifications = async () => {
    if (modifications.length === 0) {
      toast({
        title: "Nenhuma modificação",
        description: "Adicione pelo menos uma modificação para aplicar.",
        variant: "destructive",
      });
      return;
    }

    setIsModifying(true);
    try {
      const response = await fetch('/admin/api/nodes/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
          modifications,
          context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onNodesModified(data.modifiedNodes);
          setModifications([]);
          toast({
            title: "Modificações aplicadas!",
            description: `${data.result.modifiedNodes.length} nós foram modificados com sucesso.`,
            variant: "default",
          });
        } else {
          throw new Error(data.result.validationErrors?.join(', ') || 'Falha ao aplicar modificações');
        }
      } else {
        throw new Error('Falha na requisição');
      }
    } catch (error) {
      toast({
        title: "Erro ao aplicar modificações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      console.error('Erro ao aplicar modificações:', error);
    } finally {
      setIsModifying(false);
    }
  };

  const applySuggestion = (suggestion: NodeModification) => {
    setModifications([...modifications, suggestion]);
    toast({
      title: "Sugestão aplicada!",
      description: "A sugestão foi adicionada às modificações pendentes.",
      variant: "default",
    });
  };

  const selectedNodeConfig = nodeConfigs.find(config => config.id === selectedNode);

  const getNodeIcon = (category: string) => {
    switch (category) {
      case 'Chat Models': return <Brain className="h-4 w-4" />;
      case 'LLM': return <Target className="h-4 w-4" />;
      case 'Prompts': return <FileText className="h-4 w-4" />;
      case 'Memory': return <Database className="h-4 w-4" />;
      case 'Tools': return <Zap className="h-4 w-4" />;
      case 'Document Stores': return <MessageSquare className="h-4 w-4" />;
      case 'Embeddings': return <Hash className="h-4 w-4" />;
      case 'Text Splitters': return <Sliders className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Modificador de Nós</span>
          </CardTitle>
          <CardDescription>
            Modifique parâmetros de diferentes tipos de nós dentro do contexto do workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seletor de Nós */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selecionar Nó</h3>
              <Select value={selectedNode} onValueChange={setSelectedNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um nó para modificar" />
                </SelectTrigger>
                <SelectContent>
                  {nodeConfigs.map(config => (
                    <SelectItem key={config.id} value={config.id}>
                      <div className="flex items-center space-x-2">
                        {getNodeIcon(config.category)}
                        <span>{config.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {config.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sugestões */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Sugestões</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSuggestions}
                    disabled={isGeneratingSuggestions}
                  >
                    {isGeneratingSuggestions ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Gerar
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <Card key={index} className="p-2">
                      <div className="flex items-start justify-between space-x-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {suggestion.nodeId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.reason}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Configurações do Nó Selecionado */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações do Nó</h3>
              {selectedNodeConfig && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      {getNodeIcon(selectedNodeConfig.category)}
                      <span>{selectedNodeConfig.name}</span>
                    </CardTitle>
                    <CardDescription>
                      {selectedNodeConfig.type} • {selectedNodeConfig.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedNodeConfig.availableModifications.map((mod) => (
                      <div key={mod.key} className="space-y-2">
                        <label className="text-sm font-medium">
                          {mod.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {mod.description}
                        </p>
                        {mod.type === 'select' && (
                          <Select
                            value={mod.currentValue || ''}
                            onValueChange={(value) => addModification(selectedNodeConfig.id, mod.key, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Selecione ${mod.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {mod.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {mod.type === 'string' && (
                          <Textarea
                            value={mod.currentValue || ''}
                            onChange={(e) => addModification(selectedNodeConfig.id, mod.key, e.target.value)}
                            placeholder={`Digite ${mod.label}`}
                          />
                        )}
                        {mod.type === 'number' && (
                          <Input
                            type="number"
                            value={mod.currentValue || ''}
                            onChange={(e) => addModification(selectedNodeConfig.id, mod.key, parseFloat(e.target.value))}
                            placeholder={`Digite ${mod.label}`}
                          />
                        )}
                        {mod.type === 'boolean' && (
                          <Select
                            value={mod.currentValue?.toString() || 'false'}
                            onValueChange={(value) => addModification(selectedNodeConfig.id, mod.key, value === 'true')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Sim</SelectItem>
                              <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Modificações Pendentes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Modificações Pendentes</h3>
                <Badge variant="outline">
                  {modifications.length}
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {modifications.map((mod, index) => {
                  const nodeConfig = nodeConfigs.find(config => config.id === mod.nodeId);
                  return (
                    <Card key={index} className="p-3">
                      <div className="flex items-start justify-between space-x-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {nodeConfig?.name}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {Object.entries(mod.modifications).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedModifications = modifications.filter((_, i) => i !== index);
                            setModifications(updatedModifications);
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {modifications.length > 0 && (
                <Button
                  className="w-full"
                  onClick={applyModifications}
                  disabled={isModifying}
                >
                  {isModifying ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Aplicar Modificações
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
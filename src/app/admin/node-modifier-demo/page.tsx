'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NodeModifierInterface from '@/components/workflow/NodeModifierInterface';
import { FlowiseNode, FlowiseEdge } from '@/lib/agent-to-flowise-transformer';
import { 
  Settings, 
  Workflow, 
  Brain, 
  Target, 
  Zap,
  ArrowLeft,
  Play,
  Save,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

// Dados de exemplo para demonstração
const sampleNodes: FlowiseNode[] = [
  {
    id: 'chatOpenAI_0',
    type: 'customNode',
    position: { x: 74.4955, y: 35.2848 },
    positionAbsolute: { x: 74.4955, y: 35.2848 },
    width: 300,
    height: 771,
    selected: false,
    dragging: false,
    data: {
      id: 'chatOpenAI_0',
      label: 'ChatOpenAI',
      version: 8.2,
      name: 'chatOpenAI',
      type: 'ChatOpenAI',
      baseClasses: ['ChatOpenAI', 'BaseChatModel', 'BaseLanguageModel', 'Runnable'],
      category: 'Chat Models',
      description: 'Wrapper around OpenAI large language models that use the Chat endpoint',
      inputParams: [],
      inputAnchors: [],
      inputs: {
        cache: '',
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2000,
        allowImageUploads: false,
        streaming: false
      },
      outputAnchors: [],
      outputs: {},
      selected: false
    }
  },
  {
    id: 'humanMessage_0',
    type: 'customNode',
    position: { x: 450.5125, y: 72.4059 },
    positionAbsolute: { x: 450.5125, y: 72.4059 },
    width: 300,
    height: 200,
    selected: false,
    dragging: false,
    data: {
      id: 'humanMessage_0',
      label: 'Human Message',
      version: 1,
      name: 'humanMessage',
      type: 'HumanMessage',
      baseClasses: ['HumanMessage', 'BaseMessage'],
      category: 'Messages',
      description: 'Human message input',
      inputParams: [],
      inputAnchors: [],
      inputs: {
        text: '{{chatInput}}'
      },
      outputAnchors: [],
      outputs: {},
      selected: false
    }
  },
  {
    id: 'promptTemplate_0',
    type: 'customNode',
    position: { x: 800.5125, y: 72.4059 },
    positionAbsolute: { x: 800.5125, y: 72.4059 },
    width: 300,
    height: 300,
    selected: false,
    dragging: false,
    data: {
      id: 'promptTemplate_0',
      label: 'Prompt Template',
      version: 1,
      name: 'promptTemplate',
      type: 'PromptTemplate',
      baseClasses: ['PromptTemplate', 'BasePromptTemplate'],
      category: 'Prompts',
      description: 'Schema to represent a prompt for an LLM',
      inputParams: [],
      inputAnchors: [],
      inputs: {
        template: 'Você é um assistente útil. Responda: {input}'
      },
      outputAnchors: [],
      outputs: {},
      selected: false
    }
  },
  {
    id: 'memory_0',
    type: 'customNode',
    position: { x: 1200.6757, y: 208.1858 },
    positionAbsolute: { x: 1200.6757, y: 208.1858 },
    width: 300,
    height: 400,
    selected: false,
    dragging: false,
    data: {
      id: 'memory_0',
      label: 'Buffer Memory',
      version: 1,
      name: 'bufferMemory',
      type: 'BufferMemory',
      baseClasses: ['BufferMemory', 'BaseChatMemory'],
      category: 'Memory',
      description: 'Buffer for storing conversation history',
      inputParams: [],
      inputAnchors: [],
      inputs: {
        memoryType: 'Buffer Memory',
        bufferSize: 10,
        returnMessages: true
      },
      outputAnchors: [],
      outputs: {},
      selected: false
    }
  }
];

const sampleEdges: FlowiseEdge[] = [
  {
    id: 'edge_0',
    source: 'humanMessage_0',
    target: 'promptTemplate_0',
    sourceHandle: 'humanMessage',
    targetHandle: 'promptTemplate',
    type: 'default'
  },
  {
    id: 'edge_1',
    source: 'promptTemplate_0',
    target: 'chatOpenAI_0',
    sourceHandle: 'promptTemplate',
    targetHandle: 'chatOpenAI',
    type: 'default'
  },
  {
    id: 'edge_2',
    source: 'chatOpenAI_0',
    target: 'memory_0',
    sourceHandle: 'chatOpenAI',
    targetHandle: 'memory',
    type: 'default'
  }
];

export default function NodeModifierDemoPage() {
  const [nodes, setNodes] = useState<FlowiseNode[]>(sampleNodes);
  const [edges, setEdges] = useState<FlowiseEdge[]>(sampleEdges);
  const [workflowType, setWorkflowType] = useState<'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT'>('CHATFLOW');
  const [agentCapabilities, setAgentCapabilities] = useState<string[]>([
    'llm',
    'memory',
    'function_calling',
    'advanced_reasoning'
  ]);

  const handleNodesModified = (modifiedNodes: FlowiseNode[]) => {
    setNodes(modifiedNodes);
    console.log('🔧 Nós modificados:', modifiedNodes.length);
  };

  const resetToSample = () => {
    setNodes(sampleNodes);
    setEdges(sampleEdges);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Settings className="h-8 w-8" />
              <span>Modificador de Nós - Demo</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Demonstra a modificação de diferentes tipos de nós dentro do contexto do workflow
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetToSample}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Nós</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {nodes.filter(n => n.data.category === 'Chat Models').length} Chat Models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conexões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{edges.length}</div>
            <p className="text-xs text-muted-foreground">
              Workflow conectado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowType}</div>
            <p className="text-xs text-muted-foreground">
              Tipo de workflow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Capacidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentCapabilities.length}</div>
            <p className="text-xs text-muted-foreground">
              Habilidades do agente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="modifier" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modifier" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Modificador de Nós</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center space-x-2">
            <Workflow className="h-4 w-4" />
            <span>Visualização do Workflow</span>
          </TabsTrigger>
          <TabsTrigger value="context" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Contexto</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modifier" className="space-y-6">
          <NodeModifierInterface
            nodes={nodes}
            edges={edges}
            onNodesModified={handleNodesModified}
            workflowType={workflowType}
            agentCapabilities={agentCapabilities}
          />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Workflow</CardTitle>
              <CardDescription>
                Estrutura atual do workflow com nós e conexões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de Nós */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Nós</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {nodes.map((node) => (
                      <Card key={node.id} className="p-3">
                        <div className="flex items-start justify-between space-x-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{node.data.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {node.data.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {node.data.description}
                            </p>
                            <div className="mt-2 text-xs space-y-1">
                              <div><strong>Posição:</strong> ({node.position.x}, {node.position.y})</div>
                              <div><strong>Tipo:</strong> {node.data.type}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Lista de Conexões */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Conexões</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {edges.map((edge) => (
                      <Card key={edge.id} className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-medium">{edge.source}</span>
                              <span className="mx-2">→</span>
                              <span className="font-medium">{edge.target}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {edge.id} • Tipo: {edge.type}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contexto do Workflow</CardTitle>
              <CardDescription>
                Configurações e capacidades que influenciam as modificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configurações</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Tipo de Workflow</label>
                      <select 
                        value={workflowType}
                        onChange={(e) => setWorkflowType(e.target.value as any)}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="CHATFLOW">Chatflow</option>
                        <option value="AGENTFLOW">Agentflow</option>
                        <option value="MULTIAGENT">Multi-Agent</option>
                        <option value="ASSISTANT">Assistant</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Capacidades do Agente</h3>
                  <div className="space-y-2">
                    {[
                      'llm',
                      'memory',
                      'function_calling',
                      'advanced_reasoning',
                      'streaming',
                      'file_handling',
                      'api_integration',
                      'long_term_memory'
                    ].map((capability) => (
                      <label key={capability} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={agentCapabilities.includes(capability)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAgentCapabilities([...agentCapabilities, capability]);
                            } else {
                              setAgentCapabilities(agentCapabilities.filter(c => c !== capability));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{capability.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
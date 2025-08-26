"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HybridWorkflowEditor from '@/components/workflow/HybridWorkflowEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Eye, Download, Upload, Save } from 'lucide-react';
import Link from 'next/link';

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
  flowData: string; // JSON com estrutura completa
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

export default function HybridEditorDemoPage() {
  const [workflow, setWorkflow] = useState<FlowiseWorkflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemoWorkflow();
  }, []);

  const loadDemoWorkflow = async () => {
    setLoading(true);
    try {
      // Carregar o workflow de exemplo que analisamos anteriormente
      const response = await fetch('/api/v1/flowise-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_workflows',
          data: { 
            filters: { search: 'Combinação Soft.Eng.+Revisor Codigo' }, 
            page: 1, 
            limit: 1 
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const workflows = data.workflows || [];
        
        if (workflows.length > 0) {
          setWorkflow(workflows[0]);
        } else {
          // Se não encontrar, criar um workflow de demonstração
          setWorkflow(createDemoWorkflow());
        }
      } else {
        // Se falhar, criar um workflow de demonstração
        setWorkflow(createDemoWorkflow());
      }
    } catch (error) {
      console.error('Erro ao carregar workflow:', error);
      // Criar um workflow de demonstração em caso de erro
      setWorkflow(createDemoWorkflow());
    } finally {
      setLoading(false);
    }
  };

  const createDemoWorkflow = (): FlowiseWorkflow => {
    return {
      id: "demo-workflow-id",
      flowiseId: "9d465978-6cca-4e9e-960b-c3636613a8a6",
      name: "Combinação Soft.Eng.+Revisor Codigo",
      description: "Workflow demonstrativo combinando Software Engineer e Code Reviewer",
      type: "CHATFLOW",
      deployed: true,
      isPublic: true,
      category: "demonstration",
      complexityScore: 75,
      nodeCount: 8,
      edgeCount: 7,
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
      nodes: JSON.stringify([
        {
          id: "startAgentflow_0",
          type: "agentFlow",
          position: { x: -198.4357561998925, y: 90.62378754136287 },
          data: {
            label: "Start",
            type: "Start",
            category: "Agent Flows"
          }
        },
        {
          id: "llmAgentflow_0",
          type: "agentFlow",
          position: { x: -60.01488766486309, y: 87.88377139143167 },
          data: {
            label: "Supervisor",
            type: "LLM",
            category: "Agent Flows",
            modelName: "gpt-4o",
            prompt: "You are a Supervisor AI responsible for coordinating and managing the workflow between different specialized agents. Your role includes:\n\n1. Analyzing the incoming request and determining the appropriate agents to involve\n2. Coordinating the sequence of operations and information flow\n3. Making decisions about routing tasks to the most suitable agents\n4. Monitoring the progress and quality of outputs from each agent\n5. Ensuring consistency and coherence across all agent contributions\n6. Making final determinations about when the process is complete\n\nFor each request, you should:\n- Understand the requirements thoroughly\n- Identify which specialized agents are needed\n- Determine the optimal sequence of operations\n- Provide clear instructions to each agent\n- Review and synthesize the results\n- Ensure the final output meets all requirements\n\nAlways maintain high-level oversight while allowing specialized agents to handle their domains of expertise."
          }
        },
        {
          id: "conditionAgentflow_0",
          type: "agentFlow",
          position: { x: 128.47781848153903, y: 73.36847122134466 },
          data: {
            label: "Check next worker",
            type: "Condition",
            category: "Agent Flows"
          }
        },
        {
          id: "agentAgentflow_1",
          type: "agentFlow",
          position: { x: 352.5679347768288, y: -23.510778245391947 },
          data: {
            label: "Software Engineer",
            type: "Agent",
            category: "Agent Flows",
            agentModel: "gpt-4o",
            temperature: 0.7,
            maxTokens: 4000,
            systemPrompt: "You are a Senior Software Engineer with extensive experience in software development, system design, and best practices. Your role is to:\n\n1. Analyze requirements and technical specifications\n2. Design robust and scalable solutions\n3. Write clean, efficient, and well-documented code\n4. Follow industry best practices and coding standards\n5. Consider performance, security, and maintainability\n6. Provide technical explanations and rationale for decisions\n\nAlways structure your responses with:\n- Analysis of the problem\n- Proposed solution approach\n- Implementation details\n- Code examples when appropriate\n- Considerations for testing and deployment",
            enableMemory: true
          }
        },
        {
          id: "agentAgentflow_2",
          type: "agentFlow",
          position: { x: 359.32908043399146, y: 88.11650145737843 },
          data: {
            label: "Code Reviewer",
            type: "Agent",
            category: "Agent Flows",
            agentModel: "gpt-4o",
            temperature: 0.3,
            maxTokens: 4000,
            systemPrompt: "You are an expert Code Reviewer specializing in code quality, security, and best practices. Your role is to:\n\n1. Review code for correctness, efficiency, and maintainability\n2. Identify potential bugs, security vulnerabilities, and performance issues\n3. Ensure adherence to coding standards and architectural patterns\n4. Provide constructive feedback with specific suggestions\n5. Check for proper error handling and edge cases\n6. Verify documentation and code comments\n\nFocus on these areas in your reviews:\n- Code structure and organization\n- Algorithm efficiency and complexity\n- Security implications\n- Testing coverage and quality\n- Documentation clarity\n- Consistency with project standards\n\nAlways provide:\n- Summary of findings\n- Specific line-by-line feedback\n- Suggestions for improvement\n- Positive reinforcement for good practices",
            enableMemory: true
          }
        },
        {
          id: "agentAgentflow_3",
          type: "agentFlow",
          position: { x: 357.60470406099364, y: 192.61532204982643 },
          data: {
            label: "Generate Final Answer",
            type: "Agent",
            category: "Agent Flows",
            agentModel: "gpt-4o",
            temperature: 0.5,
            maxTokens: 4000,
            systemPrompt: "You are responsible for synthesizing information from multiple sources and generating comprehensive, well-structured final answers. Your role is to:\n\n1. Collect and analyze inputs from all previous agents and steps\n2. Identify key insights, recommendations, and conclusions\n3. Resolve any conflicts or inconsistencies in the information\n4. Structure the final response in a clear, logical manner\n5. Ensure completeness and accuracy of the final output\n6. Provide appropriate context and explanations\n\nYour approach should:\n- Integrate multiple perspectives and inputs\n- Prioritize clarity and comprehensiveness\n- Maintain consistency with the original requirements\n- Include supporting evidence and rationale\n- Address potential follow-up questions or concerns\n- Format the output for maximum readability and usability",
            enableMemory: true
          }
        },
        {
          id: "loopAgentflow_0",
          type: "agentFlow",
          position: { x: 572.5888618465789, y: -20.827003962303266 },
          data: {
            label: "Loop to Supervisor",
            type: "Loop",
            category: "Agent Flows"
          }
        },
        {
          id: "loopAgentflow_1",
          type: "agentFlow",
          position: { x: 566.7568359277939, y: 90.98824734487103 },
          data: {
            label: "Loop to Supervisor",
            type: "Loop",
            category: "Agent Flows"
          }
        }
      ]),
      connections: JSON.stringify([
        { source: "startAgentflow_0", target: "llmAgentflow_0" },
        { source: "llmAgentflow_0", target: "conditionAgentflow_0" },
        { source: "conditionAgentflow_0", target: "agentAgentflow_1" },
        { source: "conditionAgentflow_0", target: "agentAgentflow_2" },
        { source: "conditionAgentflow_0", target: "agentAgentflow_3" },
        { source: "agentAgentflow_1", target: "loopAgentflow_0" },
        { source: "agentAgentflow_2", target: "loopAgentflow_1" }
      ]),
      lastSyncAt: new Date().toISOString(),
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString(),
      flowData: JSON.stringify({
        nodes: [
          {
            id: "startAgentflow_0",
            type: "agentFlow",
            position: { x: -198.4357561998925, y: 90.62378754136287 },
            data: {
              label: "Start",
              type: "Start",
              category: "Agent Flows"
            }
          },
          {
            id: "llmAgentflow_0",
            type: "agentFlow",
            position: { x: -60.01488766486309, y: 87.88377139143167 },
            data: {
              label: "Supervisor",
              type: "LLM",
              category: "Agent Flows",
              modelName: "gpt-4o",
              prompt: "You are a Supervisor AI responsible for coordinating and managing the workflow between different specialized agents. Your role includes:\n\n1. Analyzing the incoming request and determining the appropriate agents to involve\n2. Coordinating the sequence of operations and information flow\n3. Making decisions about routing tasks to the most suitable agents\n4. Monitoring the progress and quality of outputs from each agent\n5. Ensuring consistency and coherence across all agent contributions\n6. Making final determinations about when the process is complete\n\nFor each request, you should:\n- Understand the requirements thoroughly\n- Identify which specialized agents are needed\n- Determine the optimal sequence of operations\n- Provide clear instructions to each agent\n- Review and synthesize the results\n- Ensure the final output meets all requirements\n\nAlways maintain high-level oversight while allowing specialized agents to handle their domains of expertise."
            }
          },
          {
            id: "conditionAgentflow_0",
            type: "agentFlow",
            position: { x: 128.47781848153903, y: 73.36847122134466 },
            data: {
              label: "Check next worker",
              type: "Condition",
              category: "Agent Flows"
            }
          },
          {
            id: "agentAgentflow_1",
            type: "agentFlow",
            position: { x: 352.5679347768288, y: -23.510778245391947 },
            data: {
              label: "Software Engineer",
              type: "Agent",
              category: "Agent Flows",
              agentModel: "gpt-4o",
              temperature: 0.7,
              maxTokens: 4000,
              systemPrompt: "You are a Senior Software Engineer with extensive experience in software development, system design, and best practices. Your role is to:\n\n1. Analyze requirements and technical specifications\n2. Design robust and scalable solutions\n3. Write clean, efficient, and well-documented code\n4. Follow industry best practices and coding standards\n5. Consider performance, security, and maintainability\n6. Provide technical explanations and rationale for decisions\n\nAlways structure your responses with:\n- Analysis of the problem\n- Proposed solution approach\n- Implementation details\n- Code examples when appropriate\n- Considerations for testing and deployment",
              enableMemory: true
            }
          },
          {
            id: "agentAgentflow_2",
            type: "agentFlow",
            position: { x: 359.32908043399146, y: 88.11650145737843 },
            data: {
              label: "Code Reviewer",
              type: "Agent",
              category: "Agent Flows",
              agentModel: "gpt-4o",
              temperature: 0.3,
              maxTokens: 4000,
              systemPrompt: "You are an expert Code Reviewer specializing in code quality, security, and best practices. Your role is to:\n\n1. Review code for correctness, efficiency, and maintainability\n2. Identify potential bugs, security vulnerabilities, and performance issues\n3. Ensure adherence to coding standards and architectural patterns\n4. Provide constructive feedback with specific suggestions\n5. Check for proper error handling and edge cases\n6. Verify documentation and code comments\n\nFocus on these areas in your reviews:\n- Code structure and organization\n- Algorithm efficiency and complexity\n- Security implications\n- Testing coverage and quality\n- Documentation clarity\n- Consistency with project standards\n\nAlways provide:\n- Summary of findings\n- Specific line-by-line feedback\n- Suggestions for improvement\n- Positive reinforcement for good practices",
              enableMemory: true
            }
          },
          {
            id: "agentAgentflow_3",
            type: "agentFlow",
            position: { x: 357.60470406099364, y: 192.61532204982643 },
            data: {
              label: "Generate Final Answer",
              type: "Agent",
              category: "Agent Flows",
              agentModel: "gpt-4o",
              temperature: 0.5,
              maxTokens: 4000,
              systemPrompt: "You are responsible for synthesizing information from multiple sources and generating comprehensive, well-structured final answers. Your role is to:\n\n1. Collect and analyze inputs from all previous agents and steps\n2. Identify key insights, recommendations, and conclusions\n3. Resolve any conflicts or inconsistencies in the information\n4. Structure the final response in a clear, logical manner\n5. Ensure completeness and accuracy of the final output\n6. Provide appropriate context and explanations\n\nYour approach should:\n- Integrate multiple perspectives and inputs\n- Prioritize clarity and comprehensiveness\n- Maintain consistency with the original requirements\n- Include supporting evidence and rationale\n- Address potential follow-up questions or concerns\n- Format the output for maximum readability and usability",
              enableMemory: true
            }
          },
          {
            id: "loopAgentflow_0",
            type: "agentFlow",
            position: { x: 572.5888618465789, y: -20.827003962303266 },
            data: {
              label: "Loop to Supervisor",
              type: "Loop",
              category: "Agent Flows"
            }
          },
          {
            id: "loopAgentflow_1",
            type: "agentFlow",
            position: { x: 566.7568359277939, y: 90.98824734487103 },
            data: {
              label: "Loop to Supervisor",
              type: "Loop",
              category: "Agent Flows"
            }
          }
        ],
        edges: [
          { source: "startAgentflow_0", target: "llmAgentflow_0" },
          { source: "llmAgentflow_0", target: "conditionAgentflow_0" },
          { source: "conditionAgentflow_0", target: "agentAgentflow_1" },
          { source: "conditionAgentflow_0", target: "agentAgentflow_2" },
          { source: "conditionAgentflow_0", target: "agentAgentflow_3" },
          { source: "agentAgentflow_1", target: "loopAgentflow_0" },
          { source: "agentAgentflow_2", target: "loopAgentflow_1" }
        ]
      })
    };
  };

  const handleSave = (updatedWorkflow: FlowiseWorkflow) => {
    console.log('Salvando workflow:', updatedWorkflow);
    // Aqui você implementaria a lógica de salvamento real
    alert('Workflow salvo com sucesso! (Implementação de demonstração)');
  };

  const handlePreview = () => {
    console.log('Preview do workflow');
    // Aqui você implementaria a lógica de preview
    alert('Preview do workflow! (Implementação de demonstração)');
  };

  const handleExport = () => {
    console.log('Exportando workflow');
    // Aqui você implementaria a lógica de exportação
    alert('Exportando workflow! (Implementação de demonstração)');
  };

  const handlePublishToAgents = () => {
    console.log('Publicando para agents');
    // Aqui você implementaria a lógica de publicação
    alert('Publicando para /admin/agents! (Implementação de demonstração)');
  };

  if (loading) {
    return (
      <MainLayout currentPath="/admin/hybrid-editor-demo">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando editor híbrido...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!workflow) {
    return (
      <MainLayout currentPath="/admin/hybrid-editor-demo">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar workflow</h1>
            <p className="text-gray-600 mb-6">Não foi possível carregar o workflow para demonstração.</p>
            <Link href="/admin/flowise-workflows">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Workflows
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout currentPath="/admin/hybrid-editor-demo">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/flowise-workflows">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editor Híbrido de Workflows</h1>
                <p className="text-gray-600 mt-1">
                  Demonstração do editor híbrido Canvas + Formulários para workflows Flowise
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Settings className="w-3 h-3 mr-1" />
                Demonstração
              </Badge>
            </div>
          </div>
          
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">Editor Híbrido - Fase 1</h3>
                  <p className="text-blue-700 text-sm mb-2">
                    Esta é uma demonstração do editor híbrido que combina Canvas Visual para navegação 
                    e Formulários Detalhados para configuração precisa dos nós.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-600">
                    <span>🎯 Canvas Visual: Navegue pela estrutura do workflow</span>
                    <span>📝 Formulários: Configure prompts e parâmetros</span>
                    <span>🔍 Análise: Verifique complexidade e otimizações</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Híbrido */}
        <HybridWorkflowEditor
          workflow={workflow}
          onSave={handleSave}
          onPreview={handlePreview}
          onExport={handleExport}
          onPublishToAgents={handlePublishToAgents}
        />

        {/* Informações Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Canvas Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Visualização completa da estrutura do workflow</li>
                <li>• Navegação intuitiva com zoom e pan</li>
                <li>• Identificação visual de tipos de nós</li>
                <li>• Conexões e fluxo de dados claros</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-600" />
                Formulários Detalhados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Edição precisa de system prompts</li>
                <li>• Configuração de parâmetros de LLM</li>
                <li>• Validação em tempo real</li>
                <li>• Testes de configuração</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                Integração Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Publicação para /admin/agents</li>
                <li>• Exportação otimizada para Flowise</li>
                <li>• Análise de complexidade</li>
                <li>• Sugestões de otimização</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
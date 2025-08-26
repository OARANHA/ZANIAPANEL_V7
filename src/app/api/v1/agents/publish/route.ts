import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateFlowiseConfig, AgentData } from '@/lib/flowise-config-generator';
import { createFlowiseClient, defaultFlowiseConfig } from '@/lib/flowise-client';

interface PublishAgentRequest {
  workflow: any;
  source: 'flowise_learning' | 'studio' | 'manual';
  agentConfig?: {
    name?: string;
    description?: string;
    persona?: any;
    context?: any;
    rgaConfig?: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { workflow, source, agentConfig }: PublishAgentRequest = body;

    if (!workflow || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: workflow, source' },
        { status: 400 }
      );
    }

    console.log(`🚀 Publishing agent from workflow: ${workflow.name} (${source})`);

    // 1. Criar ou encontrar workspace
    let workspace = await db.workspace.findFirst({
      where: {
        userId: session.user.id
      }
    });

    if (!workspace) {
      workspace = await db.workspace.create({
        data: {
          name: `${session.user.name || session.user.email}'s Workspace`,
          description: 'Default workspace for agent creation',
          config: '{}',
          userId: session.user.id
        }
      });
    }

    // 2. Preparar dados do agente com base no workflow
    const agentData = await prepareAgentData(workflow, source, agentConfig);

    // 3. Criar o agente no banco de dados
    const agent = await db.agent.create({
      data: {
        name: agentData.name,
        slug: agentData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: agentData.description,
        type: 'composed', // Agentes publicados a partir de workflows são do tipo 'composed'
        config: JSON.stringify(agentData.config),
        knowledge: agentData.knowledge,
        status: 'active',
        workspaceId: workspace.id,
        userId: session.user.id
      }
    });

    // 4. Integrar com Flowise
    let flowiseIntegration = await integrateWithFlowise(agent, agentData, workflow);

    // 5. Gerar links de acesso
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const links = {
      chat: `${baseUrl}/chat/${agent.id}`,
      api: `${baseUrl}/api/v1/agents/${agent.id}/chat`,
      whatsapp: agentData.rgaConfig?.autonomy === 'high' ? `${baseUrl}/api/v1/agents/${agent.id}/whatsapp` : undefined
    };

    // 6. Registrar publicação no audit log
    await db.auditLog.create({
      data: {
        action: 'publish',
        entityType: 'agent',
        entityId: agent.id,
        userId: session.user.id,
        newValues: JSON.stringify({
          name: agentData.name,
          source,
          workflowId: workflow.id,
          flowiseWorkflowId: flowiseIntegration.workflowId
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    console.log(`✅ Agent published successfully: ${agent.name} (${agent.id})`);

    return NextResponse.json({
      success: true,
      message: `Agent "${agent.name}" published successfully!`,
      agent: {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        description: agent.description,
        type: agent.type,
        status: agent.status,
        links,
        flowise: flowiseIntegration
      }
    });

  } catch (error) {
    console.error('❌ Agent publishing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function prepareAgentData(workflow: any, source: string, agentConfig?: any) {
  // Extrair informações do workflow para criar o agente
  const workflowConfig = JSON.parse(workflow.flowData || '{}');
  
  // Determinar o nome e descrição do agente
  const name = agentConfig?.name || `${workflow.name} Agent`;
  const description = agentConfig?.description || `Agent created from ${source} workflow: ${workflow.name}`;

  // Criar persona baseada no workflow
  const persona = agentConfig?.persona || {
    name: name,
    role: 'Workflow Agent',
    personality: 'Professional and efficient',
    expertise: ['Workflow Processing', 'Task Automation'],
    communicationStyle: 'Clear and concise',
    language: 'pt'
  };

  // Criar contexto baseado no workflow
  const context = agentConfig?.context || {
    businessDomain: 'Workflow Automation',
    industry: 'Technology',
    targetAudience: 'Internal Users',
    knowledgeBase: [`Workflow: ${workflow.name}`, `Source: ${source}`]
  };

  // Configuração RGA baseada na complexidade do workflow
  const rgaConfig = agentConfig?.rgaConfig || {
    reasoningLevel: workflow.complexityScore > 15 ? 'expert' : workflow.complexityScore > 8 ? 'advanced' : 'basic',
    autonomy: workflow.complexityScore > 10 ? 'high' : 'medium',
    learningCapability: true,
    decisionMaking: 'assisted'
  };

  // Configuração do agente
  const config = {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: generateSystemPrompt(persona, context, workflow),
    tools: extractToolsFromWorkflow(workflowConfig),
    memory: {
      type: 'hybrid',
      capacity: 1000
    }
  };

  // Gerar base de conhecimento
  const knowledge = generateKnowledgeBase(persona, context, workflow, source);

  return {
    name,
    description,
    persona,
    context,
    rgaConfig,
    config,
    knowledge
  };
}

async function integrateWithFlowise(agent: any, agentData: any, workflow: any) {
  let flowiseIntegration = {
    status: 'pending' as const,
    workflowId: undefined as string | undefined,
    embedUrl: undefined as string | undefined,
    error: undefined as string | undefined
  };

  try {
    // Preparar dados do agente para o Flowise
    const flowiseAgentData: AgentData = {
      id: agent.id,
      name: agentData.name,
      description: agentData.description,
      type: 'composed',
      persona: agentData.persona,
      context: agentData.context,
      rgaConfig: agentData.rgaConfig,
      config: agentData.config
    };

    // Gerar configuração Flowise baseada no workflow existente
    const flowiseConfig = generateFlowiseConfig(flowiseAgentData);

    // Usar o flowData do workflow original se disponível
    if (workflow.flowData && workflow.flowData !== '{}') {
      flowiseConfig.flowData = workflow.flowData;
    }

    // Criar cliente Flowise
    const flowiseClient = createFlowiseClient(defaultFlowiseConfig);

    // Criar workflow no Flowise
    const flowiseWorkflow = await flowiseClient.createChatflow({
      name: flowiseConfig.name,
      flowData: flowiseConfig.flowData,
      type: flowiseConfig.type,
      category: flowiseConfig.category,
      deployed: true, // Agentes publicados devem ser deployed automaticamente
      isPublic: false,
      chatbotConfig: flowiseConfig.chatbotConfig,
      apiConfig: flowiseConfig.apiConfig
    });

    // Registrar workflow no banco de dados local
    await db.flowiseWorkflow.create({
      data: {
        flowiseId: flowiseWorkflow.id,
        name: flowiseWorkflow.name,
        description: `Workflow for published agent: ${agent.name}`,
        type: flowiseWorkflow.type,
        flowData: flowiseWorkflow.flowData,
        deployed: flowiseWorkflow.deployed || false,
        isPublic: flowiseWorkflow.isPublic || false,
        category: flowiseWorkflow.category || 'general',
        workspaceId: agent.workspaceId,
        lastSyncAt: new Date(),
        createdAt: flowiseWorkflow.createdDate,
        updatedAt: flowiseWorkflow.updatedDate
      }
    });

    // Atualizar status da integração
    flowiseIntegration = {
      status: 'created',
      workflowId: flowiseWorkflow.id,
      embedUrl: `${defaultFlowiseConfig.baseUrl}/chat/${flowiseWorkflow.id}`,
      error: undefined
    };

    console.log(`✅ Flowise workflow created for agent: ${flowiseWorkflow.id}`);

  } catch (flowiseError) {
    console.error('❌ Flowise integration error for agent:', flowiseError);
    flowiseIntegration = {
      status: 'failed',
      workflowId: undefined,
      embedUrl: undefined,
      error: flowiseError instanceof Error ? flowiseError.message : 'Unknown Flowise error'
    };
  }

  return flowiseIntegration;
}

function generateSystemPrompt(persona: any, context: any, workflow: any): string {
  return `Você é ${persona.name}, um agente especializado em automação de workflows.

**Personalidade e Estilo de Comunicação:**
- Personalidade: ${persona.personality}
- Estilo de comunicação: ${persona.communicationStyle}
- Idioma: ${persona.language === 'pt' ? 'Português' : persona.language === 'es' ? 'Espanhol' : 'Inglês'}

**Expertise:**
${persona.expertise.map((exp: string) => `- ${exp}`).join('\n')}

**Contexto de Atuação:**
- Domínio: ${context.businessDomain}
- Indústria: ${context.industry}
- Público-alvo: ${context.targetAudience}

**Workflow Especializado:**
- Nome: ${workflow.name}
- Tipo: ${workflow.type}
- Complexidade: ${workflow.complexityScore || 'Desconhecida'}
- Nós: ${workflow.nodeCount || 'Desconhecido'}

**Diretrizes:**
1. Execute as tarefas do workflow de forma eficiente e precisa
2. Mantenha comunicação clara e profissional
3. Adapte-se às necessidades específicas do usuário
4. Forneça feedback sobre o progresso das tarefas
5. Documente quaisquer problemas ou anomalias encontradas

Responda sempre em ${persona.language === 'pt' ? 'português' : persona.language === 'es' ? 'espanhol' : 'inglês'}.`;
}

function generateKnowledgeBase(persona: any, context: any, workflow: any, source: string): string {
  return `# Base de Conhecimento: ${persona.name}

## Perfil do Agente
**Nome:** ${persona.name}
**Função:** Agente de Workflow
**Personalidade:** ${persona.personality}
**Estilo de Comunicação:** ${persona.communicationStyle}

## Áreas de Expertise
${persona.expertise.map((exp: string) => `- ${exp}`).join('\n')}

## Workflow Especializado
### Informações do Workflow
- **Nome:** ${workflow.name}
- **Tipo:** ${workflow.type}
- **Origem:** ${source}
- **Complexidade:** ${workflow.complexityScore || 'Desconhecida'}
- **Número de Nós:** ${workflow.nodeCount || 'Desconhecido'}
- **Status:** ${workflow.deployed ? 'Deployed' : 'Não Deployed'}

### Contexto de Atuação
- **Domínio de Negócio:** ${context.businessDomain}
- **Indústria:** ${context.industry}
- **Público-alvo:** ${context.targetAudience}

${context.knowledgeBase ? `
### Base de Conhecimento Adicional
${context.knowledgeBase.map((item: string) => `- ${item}`).join('\n')}
` : ''}

## Funcionalidades
1. **Execução de Workflows:** Processar e executar tarefas automatizadas
2. **Tomada de Decisão:** Avaliar situações e tomar decisões apropriadas
3. **Comunicação:** Interagir com usuários de forma clara e eficaz
4. **Aprendizado:** Adaptar-se com base nas interações e feedback
5. **Documentação:** Registrar atividades e resultados

## Objetivos Principais
- Executar workflows de forma eficiente e precisa
- Manter alta qualidade nas interações com usuários
- Adaptar-se a diferentes cenários e necessidades
- Fornecer feedback construtivo e acionável
- Contribuir para a melhoria contínua dos processos
`;
}

function extractToolsFromWorkflow(workflowConfig: any): string[] {
  // Extrair ferramentas baseadas nos nós do workflow
  const tools: string[] = [];
  
  if (workflowConfig.nodes && Array.isArray(workflowConfig.nodes)) {
    workflowConfig.nodes.forEach((node: any) => {
      if (node.type) {
        // Mapear tipos de nós para ferramentas
        switch (node.type.toLowerCase()) {
          case 'documentloader':
          case 'pdfloader':
            tools.push('document_processing');
            break;
          case 'textsplitter':
            tools.push('text_processing');
            break;
          case 'embedding':
            tools.push('vector_search');
            break;
          case 'retriever':
            tools.push('information_retrieval');
            break;
          case 'tool':
          case 'function':
            tools.push('function_calling');
            break;
          case 'memory':
            tools.push('memory_management');
            break;
          default:
            if (node.type.includes('search') || node.type.includes('retrieval')) {
              tools.push('search');
            }
        }
      }
    });
  }

  // Remover duplicatas e retornar
  return [...new Set(tools)];
}
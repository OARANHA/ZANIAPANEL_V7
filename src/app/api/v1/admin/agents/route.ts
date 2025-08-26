import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

interface AdminAgentRequest {
  action: 'create_from_studio' | 'update_agent' | 'delete_agent' | 'get_agents';
  data?: any;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as AdminAgentRequest;
    const { action, data } = body;

    console.log('🔍 Admin Agents API:', { action, data: data ? 'provided' : 'missing' });

    switch (action) {
      case 'create_from_studio':
        return await handleCreateFromStudio(data, session.user.id);
      
      case 'get_agents':
        return await handleGetAgents(session.user.id);
      
      case 'update_agent':
        return await handleUpdateAgent(data, session.user.id);
      
      case 'delete_agent':
        return await handleDeleteAgent(data, session.user.id);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Ação não suportada' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Admin Agents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleCreateFromStudio(agentData: any, userId: string) {
  try {
    console.log('🏗️ Criando agente do Studio:', agentData.name);

    // Buscar usuário com workspaces
    let user = await db.user.findUnique({
      where: { id: userId },
      include: { workspaces: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    let workspaceId: string;

    // Se o usuário não tem workspace, criar um padrão (especialmente para superadmin)
    if (!user.workspaces.length) {
      console.log('👑 Criando workspace padrão para usuário:', user.email);
      
      const defaultWorkspace = await db.workspace.create({
        data: {
          name: user.email === 'superadmin@zanai.com' ? 'Workspace Principal' : `Workspace de ${user.name || user.email}`,
          description: 'Workspace padrão criado automaticamente',
          config: JSON.stringify({
            autoCreated: true,
            createdAt: new Date().toISOString(),
            type: user.email === 'superadmin@zanai.com' ? 'admin' : 'user'
          }),
          userId: userId
        }
      });
      
      workspaceId = defaultWorkspace.id;
      console.log('✅ Workspace criado:', { id: workspaceId, name: defaultWorkspace.name });
    } else {
      workspaceId = user.workspaces[0].id;
      console.log('📁 Usando workspace existente:', workspaceId);
    }

    // Criar o agente no banco
    const agent = await db.agent.create({
      data: {
        name: agentData.name,
        slug: agentData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-') + '-' + Date.now(),
        description: agentData.description,
        type: agentData.type || 'workflow',
        
        // Configuração específica do workflow
        config: JSON.stringify(agentData.workflowConfig),
        knowledge: JSON.stringify({
          source: 'studio_workflow',
          workflowId: agentData.workflowConfig?.flowiseId,
          capabilities: agentData.workflowConfig?.flowData ? extractCapabilities(agentData.workflowConfig.flowData) : {},
          complexity: agentData.workflowConfig?.complexityScore || 0,
          category: agentData.category,
          metadata: agentData.metadata,
          pricing: agentData.clientConfig?.pricing
        }),
        
        // Relacionamentos
        workspaceId: workspaceId,
        userId: userId,
        
        // Status
        status: 'active'
      }
    });

    // Log da criação
    console.log('✅ Agente criado:', {
      id: agent.id,
      name: agent.name,
      type: agent.type
    });

    // Criar entrada no log de sincronização
    await db.syncLog.create({
      data: {
        action: 'AGENT_CREATED_FROM_STUDIO',
        details: JSON.stringify({
          agentId: agent.id,
          workflowId: agentData.workflowConfig.flowiseId,
          name: agent.name,
          userId: userId
        }),
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Agente criado com sucesso a partir do workflow do Studio',
      agent: {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        description: agent.description,
        type: agent.type,
        status: agent.status,
        createdAt: agent.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar agente do Studio:', error);
    
    // Log do erro
    await db.syncLog.create({
      data: {
        action: 'AGENT_CREATED_FROM_STUDIO',
        details: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          workflowId: agentData?.workflowConfig?.flowiseId,
          userId: userId
        }),
        status: 'ERROR'
      }
    });

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

async function handleGetAgents(userId: string) {
  try {
    // Buscar usuário com workspaces
    let user = await db.user.findUnique({
      where: { id: userId },
      include: { workspaces: true }
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        agents: []
      });
    }

    let workspaceId: string;

    // Se o usuário não tem workspace, criar um padrão
    if (!user.workspaces.length) {
      console.log('👑 Criando workspace padrão para busca de agentes:', user.email);
      
      const defaultWorkspace = await db.workspace.create({
        data: {
          name: user.email === 'superadmin@zanai.com' ? 'Workspace Principal' : `Workspace de ${user.name || user.email}`,
          description: 'Workspace padrão criado automaticamente',
          config: JSON.stringify({
            autoCreated: true,
            createdAt: new Date().toISOString(),
            type: user.email === 'superadmin@zanai.com' ? 'admin' : 'user'
          }),
          userId: userId
        }
      });
      
      workspaceId = defaultWorkspace.id;
      console.log('✅ Workspace criado para busca:', { id: workspaceId, name: defaultWorkspace.name });
    } else {
      workspaceId = user.workspaces[0].id;
    }

    // Buscar agentes do workspace
    const agents = await db.agent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        config: true,
        knowledge: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Processar metadados do knowledge
    const processedAgents = agents.map(agent => {
      let metadata = {};
      let category = '';
      
      try {
        if (agent.knowledge) {
          const knowledgeData = JSON.parse(agent.knowledge);
          metadata = knowledgeData.metadata || {};
          category = knowledgeData.category || '';
        }
      } catch (error) {
        console.warn('Erro ao processar knowledge do agente:', agent.id);
      }
      
      return {
        ...agent,
        category,
        metadata,
        isFromStudio: metadata && (metadata as any).sourceStudio === true
      };
    });

    return NextResponse.json({
      success: true,
      agents: processedAgents
    });

  } catch (error) {
    console.error('❌ Erro ao buscar agentes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar agentes' },
      { status: 500 }
    );
  }
}

async function handleUpdateAgent(data: any, userId: string) {
  try {
    const { agentId, updates } = data;

    const agent = await db.agent.update({
      where: { id: agentId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Agente atualizado com sucesso',
      agent
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar agente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar agente' },
      { status: 500 }
    );
  }
}

async function handleDeleteAgent(data: any, userId: string) {
  try {
    const { agentId } = data;

    await db.agent.delete({
      where: { id: agentId }
    });

    return NextResponse.json({
      success: true,
      message: 'Agente removido com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover agente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao remover agente' },
      { status: 500 }
    );
  }
}

// Função auxiliar para extrair capacidades do flowData
function extractCapabilities(flowData: string): any {
  try {
    const parsed = JSON.parse(flowData);
    const nodes = parsed.nodes || [];
    
    const capabilities = {
      hasLLM: false,
      hasMemory: false,
      hasDocuments: false,
      hasAPI: false,
      hasChat: false,
      nodeTypes: new Set()
    };

    nodes.forEach((node: any) => {
      const category = node.data?.category || '';
      const type = node.data?.type || '';
      
      if (category.includes('LLM') || category.includes('Chat')) {
        capabilities.hasLLM = true;
        capabilities.hasChat = true;
      }
      
      if (category.includes('Memory')) {
        capabilities.hasMemory = true;
      }
      
      if (category.includes('Document') || category.includes('Vector')) {
        capabilities.hasDocuments = true;
      }
      
      if (category.includes('API') || category.includes('Tool')) {
        capabilities.hasAPI = true;
      }
      
      capabilities.nodeTypes.add(type);
    });

    return {
      ...capabilities,
      nodeTypes: Array.from(capabilities.nodeTypes),
      totalNodes: nodes.length
    };

  } catch (error) {
    console.error('❌ Erro ao extrair capacidades:', error);
    return {
      hasLLM: false,
      hasMemory: false,
      hasDocuments: false,
      hasAPI: false,
      hasChat: false,
      nodeTypes: [],
      totalNodes: 0
    };
  }
}
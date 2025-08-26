import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SyncService } from '@/lib/sync-service';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { action, data } = await request.json();

    switch (action) {
      case 'sync_agent':
        return await handleSyncAgent(data, session.user.id);
      
      case 'sync_studio_workflow':
        return await handleSyncStudioWorkflow(data, session.user.id);
      
      case 'sync_all':
        return await handleSyncAll(session.user.id);
      
      default:
        return NextResponse.json(
          { error: 'Ação não suportada' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API de sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleSyncAgent(data: any, userId: string) {
  try {
    const { agentId } = data;
    
    // Validação de campos obrigatórios
    if (!agentId) {
      return NextResponse.json(
        { error: 'Campo obrigatório: agentId' },
        { status: 400 }
      );
    }

    // Sincronizar agente com Flowise
    const result = await SyncService.syncAgentWithFlowise(agentId, userId);

    return NextResponse.json({
      success: true,
      message: 'Agente sincronizado com sucesso',
      result
    });
  } catch (error) {
    console.error('Erro ao sincronizar agente:', error);
    return NextResponse.json(
      { error: 'Falha ao sincronizar agente', details: error.message },
      { status: 500 }
    );
  }
}

async function handleSyncStudioWorkflow(data: any, userId: string) {
  try {
    const { studioWorkflowId } = data;
    
    // Validação de campos obrigatórios
    if (!studioWorkflowId) {
      return NextResponse.json(
        { error: 'Campo obrigatório: studioWorkflowId' },
        { status: 400 }
      );
    }

    // Sincronizar workflow Studio com Flowise
    const result = await SyncService.syncStudioWorkflowWithFlowise(studioWorkflowId, userId);

    return NextResponse.json({
      success: true,
      message: 'Workflow Studio sincronizado com sucesso',
      result
    });
  } catch (error) {
    console.error('Erro ao sincronizar workflow Studio:', error);
    return NextResponse.json(
      { error: 'Falha ao sincronizar workflow Studio', details: error.message },
      { status: 500 }
    );
  }
}

async function handleSyncAll(userId: string) {
  try {
    // Sincronização em lote de todos os recursos
    const results = await SyncService.syncAllUserResources(userId);

    return NextResponse.json({
      success: true,
      message: 'Sincronização em lote concluída',
      results
    });
  } catch (error) {
    console.error('Erro na sincronização em lote:', error);
    return NextResponse.json(
      { error: 'Falha na sincronização em lote', details: error.message },
      { status: 500 }
    );
  }
}
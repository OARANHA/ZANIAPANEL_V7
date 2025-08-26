import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { IDLinkingService } from '@/lib/id-linking-service';

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
      case 'create_link':
        return await handleCreateLink(data, session.user.id);
      
      case 'get_flowise_id':
        return await handleGetFlowiseId(data);
      
      case 'get_zanai_id':
        return await handleGetZanaiId(data);
      
      case 'update_link':
        return await handleUpdateLink(data, session.user.id);
      
      case 'remove_link':
        return await handleRemoveLink(data, session.user.id);
      
      case 'list_links':
        return await handleListLinks(session.user.id);
      
      default:
        return NextResponse.json(
          { error: 'Ação não suportada' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API de vinculação de IDs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleCreateLink(data: any, userId: string) {
  try {
    const { zanaiId, flowiseId, resourceType } = data;
    
    // Validação de campos obrigatórios
    if (!zanaiId || !flowiseId || !resourceType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: zanaiId, flowiseId, resourceType' },
        { status: 400 }
      );
    }

    // Criar vínculo usando o serviço
    const link = await IDLinkingService.createLink(zanaiId, flowiseId, resourceType, userId);

    return NextResponse.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Erro ao criar vínculo:', error);
    return NextResponse.json(
      { error: 'Falha ao criar vínculo' },
      { status: 500 }
    );
  }
}

async function handleGetFlowiseId(data: any) {
  try {
    const { zanaiId, resourceType } = data;
    
    // Validação de campos obrigatórios
    if (!zanaiId || !resourceType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: zanaiId, resourceType' },
        { status: 400 }
      );
    }

    // Obter ID do Flowise
    const flowiseId = await IDLinkingService.getFlowiseId(zanaiId, resourceType);

    return NextResponse.json({
      success: true,
      flowiseId
    });
  } catch (error) {
    console.error('Erro ao obter ID do Flowise:', error);
    return NextResponse.json(
      { error: 'Falha ao obter ID do Flowise' },
      { status: 500 }
    );
  }
}

async function handleGetZanaiId(data: any) {
  try {
    const { flowiseId, resourceType } = data;
    
    // Validação de campos obrigatórios
    if (!flowiseId || !resourceType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: flowiseId, resourceType' },
        { status: 400 }
      );
    }

    // Obter ID do ZanAI
    const zanaiId = await IDLinkingService.getZanaiId(flowiseId, resourceType);

    return NextResponse.json({
      success: true,
      zanaiId
    });
  } catch (error) {
    console.error('Erro ao obter ID do ZanAI:', error);
    return NextResponse.json(
      { error: 'Falha ao obter ID do ZanAI' },
      { status: 500 }
    );
  }
}

async function handleUpdateLink(data: any, userId: string) {
  try {
    const { zanaiId, newFlowiseId, resourceType } = data;
    
    // Validação de campos obrigatórios
    if (!zanaiId || !newFlowiseId || !resourceType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: zanaiId, newFlowiseId, resourceType' },
        { status: 400 }
      );
    }

    // Verificar se o vínculo existe e pertence ao usuário
    const existingLink = await db.idLink.findFirst({
      where: {
        zanaiId,
        resourceType,
        userId
      }
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: 'Vínculo não encontrado ou acesso negado' },
        { status: 404 }
      );
    }

    // Atualizar vínculo usando o serviço
    const link = await IDLinkingService.updateLink(zanaiId, newFlowiseId, resourceType);

    return NextResponse.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Erro ao atualizar vínculo:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar vínculo' },
      { status: 500 }
    );
  }
}

async function handleRemoveLink(data: any, userId: string) {
  try {
    const { zanaiId, resourceType } = data;
    
    // Validação de campos obrigatórios
    if (!zanaiId || !resourceType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: zanaiId, resourceType' },
        { status: 400 }
      );
    }

    // Verificar se o vínculo existe e pertence ao usuário
    const existingLink = await db.idLink.findFirst({
      where: {
        zanaiId,
        resourceType,
        userId
      }
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: 'Vínculo não encontrado ou acesso negado' },
        { status: 404 }
      );
    }

    // Remover vínculo usando o serviço
    await IDLinkingService.removeLink(zanaiId, resourceType);

    return NextResponse.json({
      success: true,
      message: 'Vínculo removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover vínculo:', error);
    return NextResponse.json(
      { error: 'Falha ao remover vínculo' },
      { status: 500 }
    );
  }
}

async function handleListLinks(userId: string) {
  try {
    // Listar vínculos do usuário usando o serviço
    const links = await IDLinkingService.listUserLinks(userId);

    return NextResponse.json({
      success: true,
      links
    });
  } catch (error) {
    console.error('Erro ao listar vínculos:', error);
    return NextResponse.json(
      { error: 'Falha ao listar vínculos' },
      { status: 500 }
    );
  }
}
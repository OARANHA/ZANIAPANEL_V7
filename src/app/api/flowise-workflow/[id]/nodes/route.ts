import { NextRequest, NextResponse } from 'next/server';

/**
 * API para buscar nodes reais de um workflow do Flowise
 * GET /api/flowise-workflow/[id]/nodes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: chatflowId } = params;

    if (!chatflowId) {
      return NextResponse.json(
        { error: 'ID do chatflow é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🎯 Buscando nodes do workflow:', chatflowId);

    // Verificar se temos URL do Flowise configurada
    const flowiseUrl = process.env.FLOWISE_URL || 'http://localhost:3000';
    const flowiseApiKey = process.env.FLOWISE_API_KEY;

    if (!flowiseUrl) {
      return NextResponse.json(
        { error: 'URL do Flowise não configurada' },
        { status: 500 }
      );
    }

    // Buscar o workflow do Flowise
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (flowiseApiKey) {
      headers['Authorization'] = `Bearer ${flowiseApiKey}`;
    }

    const flowiseResponse = await fetch(
      `${flowiseUrl}/api/v1/chatflows/${chatflowId}`,
      {
        method: 'GET',
        headers
      }
    );

    if (!flowiseResponse.ok) {
      console.warn('⚠️ Erro ao buscar workflow do Flowise:', flowiseResponse.status);
      return NextResponse.json(
        { 
          error: 'Workflow não encontrado no Flowise',
          nodes: []
        },
        { status: 404 }
      );
    }

    const workflowData = await flowiseResponse.json();
    console.log('✅ Workflow encontrado:', workflowData.name);

    // Extrair nodes do flowData
    let extractedNodes: any[] = [];
    
    try {
      const flowData = typeof workflowData.flowData === 'string' 
        ? JSON.parse(workflowData.flowData) 
        : workflowData.flowData;

      if (flowData && flowData.nodes && Array.isArray(flowData.nodes)) {
        extractedNodes = flowData.nodes.map((node: any) => ({
          id: node.id,
          label: node.data?.label || node.type || 'Unnamed Node',
          type: node.type,
          category: getNodeCategory(node.type),
          description: getNodeDescription(node.type),
          inputs: node.data?.inputs || [],
          outputs: node.data?.outputs || [],
          position: node.position,
          // Dados específicos do node
          nodeData: {
            ...node.data,
            // Não incluir dados sensíveis
            credentials: undefined,
            apiKey: undefined
          }
        }));

        console.log(`✅ Extraídos ${extractedNodes.length} nodes do workflow`);
      }
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do flowData:', parseError);
    }

    return NextResponse.json({
      success: true,
      chatflowId,
      workflowName: workflowData.name,
      nodes: extractedNodes,
      metadata: {
        nodeCount: extractedNodes.length,
        workflowId: workflowData.id,
        category: workflowData.category || 'unknown',
        lastModified: workflowData.updatedDate
      }
    });

  } catch (error) {
    console.error('❌ Erro na API flowise-workflow/nodes:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        nodes: []
      },
      { status: 500 }
    );
  }
}

/**
 * Determina a categoria do node baseado no tipo
 */
function getNodeCategory(nodeType: string): string {
  if (!nodeType) return 'unknown';
  
  const type = nodeType.toLowerCase();
  
  if (type.includes('llm') || type.includes('model')) return 'LLM';
  if (type.includes('chat') || type.includes('conversation')) return 'Chat';
  if (type.includes('memory') || type.includes('buffer')) return 'Memory';
  if (type.includes('retriever') || type.includes('vector')) return 'Retrieval';
  if (type.includes('tool') || type.includes('function')) return 'Tools';
  if (type.includes('prompt') || type.includes('template')) return 'Prompts';
  if (type.includes('parser') || type.includes('output')) return 'Output';
  if (type.includes('chain') || type.includes('agent')) return 'Chains';
  if (type.includes('embeddings')) return 'Embeddings';
  if (type.includes('document') || type.includes('loader')) return 'Documents';
  
  return 'Other';
}

/**
 * Gera uma descrição amigável para o tipo de node
 */
function getNodeDescription(nodeType: string): string {
  if (!nodeType) return 'Node do workflow';
  
  const type = nodeType.toLowerCase();
  
  if (type.includes('llm')) return 'Modelo de linguagem para geração de respostas';
  if (type.includes('chat')) return 'Interface de chat para interação';
  if (type.includes('memory')) return 'Gerenciamento de memória da conversa';
  if (type.includes('retriever')) return 'Busca e recuperação de informações';
  if (type.includes('tool')) return 'Ferramenta externa integrada';
  if (type.includes('prompt')) return 'Template de prompt para o modelo';
  if (type.includes('parser')) return 'Processamento de saída';
  if (type.includes('chain')) return 'Cadeia de processamento';
  if (type.includes('embeddings')) return 'Geração de embeddings vetoriais';
  if (type.includes('document')) return 'Carregamento de documentos';
  
  return `Node do tipo ${nodeType}`;
}
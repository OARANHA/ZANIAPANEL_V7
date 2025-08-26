import { NextRequest, NextResponse } from 'next/server';
import { nodeModifierService } from '@/lib/node-modifier-service';
import { FlowiseNode, FlowiseEdge } from '@/lib/agent-to-flowise-transformer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nodes, 
      edges, 
      modifications, 
      context 
    }: { 
      nodes: FlowiseNode[]; 
      edges: FlowiseEdge[]; 
      modifications: any[]; 
      context: any; 
    } = body;

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Nodes são obrigatórios e devem ser um array' },
        { status: 400 }
      );
    }

    if (!modifications || !Array.isArray(modifications)) {
      return NextResponse.json(
        { error: 'Modifications são obrigatórias e devem ser um array' },
        { status: 400 }
      );
    }

    console.log('🔧 Recebida requisição de modificação de nós:', {
      nodesCount: nodes.length,
      modificationsCount: modifications.length,
      context: context ? 'present' : 'absent'
    });

    // Modificar os nós
    const result = await nodeModifierService.modifyNodes(
      nodes,
      edges || [],
      modifications,
      context || {}
    );

    console.log('✅ Modificação de nós concluída:', {
      success: result.result.success,
      modifiedNodesCount: result.result.modifiedNodes.length,
      changesCount: Object.keys(result.result.changes).length
    });

    return NextResponse.json({
      success: result.result.success,
      modifiedNodes: result.nodes,
      result: result.result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na API de modificação de nós:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao modificar nós',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'suggestions') {
      const nodesParam = searchParams.get('nodes');
      const contextParam = searchParams.get('context');

      if (!nodesParam) {
        return NextResponse.json(
          { error: 'Nodes são obrigatórios para gerar sugestões' },
          { status: 400 }
        );
      }

      const nodes = JSON.parse(nodesParam);
      const context = contextParam ? JSON.parse(contextParam) : {};

      console.log('💡 Gerando sugestões de modificação:', {
        nodesCount: nodes.length,
        context: context ? 'present' : 'absent'
      });

      const suggestions = await nodeModifierService.generateModificationSuggestions(nodes, context);

      console.log('✅ Sugestões geradas:', suggestions.length);

      return NextResponse.json({
        success: true,
        suggestions,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Ação não suportada' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erro na API de sugestões:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
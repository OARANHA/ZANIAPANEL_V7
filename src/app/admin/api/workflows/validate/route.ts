import { NextRequest, NextResponse } from 'next/server';
import { workflowValidator } from '@/lib/workflow-validator';
import { FlowiseNode, FlowiseEdge } from '@/lib/agent-to-flowise-transformer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nodes, 
      edges, 
      options 
    }: { 
      nodes: FlowiseNode[]; 
      edges: FlowiseEdge[]; 
      options?: {
        strictMode?: boolean;
        includePerformanceAnalysis?: boolean;
        includeCostAnalysis?: boolean;
      };
    } = body;

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Nodes são obrigatórios e devem ser um array' },
        { status: 400 }
      );
    }

    if (!edges || !Array.isArray(edges)) {
      return NextResponse.json(
        { error: 'Edges são obrigatórios e devem ser um array' },
        { status: 400 }
      );
    }

    console.log('🔍 Recebida requisição de validação de workflow:', {
      nodesCount: nodes.length,
      edgesCount: edges.length,
      options: options || {}
    });

    // Validar e gerar preview do workflow
    const preview = await workflowValidator.validateAndPreview(
      nodes,
      edges,
      options || {}
    );

    console.log('✅ Validação concluída:', {
      valid: preview.validation.valid,
      errorsCount: preview.validation.errors.length,
      warningsCount: preview.validation.warnings.length,
      suggestionsCount: preview.validation.suggestions.length,
      score: preview.validation.score
    });

    return NextResponse.json({
      success: true,
      preview,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na API de validação de workflow:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao validar workflow',
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

    if (action === 'metrics') {
      const nodesParam = searchParams.get('nodes');
      const edgesParam = searchParams.get('edges');

      if (!nodesParam || !edgesParam) {
        return NextResponse.json(
          { error: 'Nodes e edges são obrigatórios para calcular métricas' },
          { status: 400 }
        );
      }

      const nodes = JSON.parse(nodesParam);
      const edges = JSON.parse(edgesParam);

      console.log('📊 Calculando métricas do workflow:', {
        nodesCount: nodes.length,
        edgesCount: edges.length
      });

      const preview = await workflowValidator.validateAndPreview(nodes, edges, {
        includePerformanceAnalysis: true,
        includeCostAnalysis: true
      });

      return NextResponse.json({
        success: true,
        metrics: preview.metrics,
        validation: {
          valid: preview.validation.valid,
          score: preview.validation.score,
          errorsCount: preview.validation.errors.length,
          warningsCount: preview.validation.warnings.length
        },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Ação não suportada' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erro na API de métricas:', error);
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
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

interface StudioWorkflowRequest {
  action: string;
  data?: any;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as StudioWorkflowRequest;
    const { action, data } = body;

    console.log('🔍 Learning Workflows API:', { action, data });

    switch (action) {
      case 'get_sent_workflows':
        return await handleGetSentWorkflows(data);
      
      case 'import_from_flowise':
        return await handleImportFromFlowise(data);
      
      case 'deep_analysis':
        return await handleDeepAnalysis(data);
      
      case 'generate_optimizations':
        return await handleGenerateOptimizations(data);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Ação não suportada' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API de learning workflows:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleGetSentWorkflows(data: any) {
  try {
    const { source } = data || {};
    
    console.log(`📋 Searching for workflows sent to learning from source: ${source || 'all'}`);
    
    // Buscar workflows do flowise_workflows que foram enviados para learning
    const workflows = await db.flowiseWorkflow.findMany({
      where: {
        // Filtrar por workflows que têm configuração indicando envio para learning
        OR: [
          {
            category: {
              contains: 'learning'
            }
          },
          {
            description: {
              contains: 'Learning'
            }
          },
          {
            description: {
              contains: 'Imported from'
            }
          }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 100, // Increased limit
      distinct: ['flowiseId'] // Ensure unique workflows by flowiseId
    });

    console.log(`📋 Found ${workflows.length} unique workflows for analysis`);

    // Remove duplicates based on flowiseId and name combination
    const uniqueWorkflows = workflows.reduce((acc, workflow) => {
      const key = `${workflow.flowiseId}-${workflow.name}`;
      if (!acc.has(key)) {
        acc.set(key, workflow);
      }
      return acc;
    }, new Map());

    const deduplicatedWorkflows = Array.from(uniqueWorkflows.values());
    console.log(`📝 After deduplication: ${deduplicatedWorkflows.length} workflows`);

    // Formatar workflows para o formato esperado
    const formattedWorkflows = deduplicatedWorkflows.map(workflow => ({
      id: workflow.id,
      flowiseId: workflow.flowiseId,
      name: workflow.name,
      description: workflow.description,
      type: workflow.type,
      category: workflow.category,
      complexityScore: workflow.complexityScore,
      nodeCount: workflow.nodeCount,
      edgeCount: workflow.edgeCount,
      maxDepth: workflow.maxDepth,
      flowData: workflow.flowData,
      deployed: workflow.deployed,
      isPublic: workflow.isPublic,
      capabilities: workflow.capabilities,
      nodes: workflow.nodes,
      connections: workflow.connections,
      lastSyncAt: workflow.lastSyncAt,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      sentToLearning: true,
      analysisStatus: 'pending',
      analysisResult: null
    }));

    return NextResponse.json({
      success: true,
      workflows: formattedWorkflows,
      total: formattedWorkflows.length,
      metadata: {
        totalFound: workflows.length,
        afterDeduplication: formattedWorkflows.length,
        source: source || 'all'
      }
    });

  } catch (error) {
    console.error('Erro ao buscar workflows enviados:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar workflows' },
      { status: 500 }
    );
  }
}

async function handleDeepAnalysis(data: any) {
  try {
    const { workflowId, flowData, includePerformance, includeSecurity, includeOptimization } = data;
    
    if (!workflowId || !flowData) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos para análise' },
        { status: 400 }
      );
    }

    // Simular análise detalhada
    const insights = [];
    const parsedFlowData = JSON.parse(flowData);
    
    // Análise de performance
    if (includePerformance) {
      const nodeCount = parsedFlowData.nodes?.length || 0;
      const edgeCount = parsedFlowData.edges?.length || 0;
      
      if (nodeCount > 20) {
        insights.push({
          type: 'performance',
          severity: 'warning',
          message: 'Workflow com muitos nós pode ter performance impactada',
          suggestion: 'Considere dividir em sub-workflows'
        });
      }
      
      if (edgeCount > nodeCount * 2) {
        insights.push({
          type: 'performance',
          severity: 'info',
          message: 'Alta conectividade detectada',
          suggestion: 'Verifique se todas as conexões são necessárias'
        });
      }
    }

    // Análise de segurança
    if (includeSecurity) {
      const hasExternalAPIs = parsedFlowData.nodes?.some((node: any) => 
        node.data?.category === 'documentloaders' || 
        node.data?.category === 'tools'
      );
      
      if (hasExternalAPIs) {
        insights.push({
          type: 'security',
          severity: 'warning',
          message: 'Workflow utiliza APIs externas',
          suggestion: 'Implemente validação de entrada e tratamento de erros'
        });
      }
    }

    // Análise de otimização
    if (includeOptimization) {
      const hasLLMNodes = parsedFlowData.nodes?.some((node: any) => 
        node.data?.category === 'llm'
      );
      
      if (hasLLMNodes) {
        insights.push({
          type: 'optimization',
          severity: 'info',
          message: 'Workflow contém nós LLM',
          suggestion: 'Considere usar cache para respostas similares'
        });
      }
    }

    // Atualizar status de análise no workflow
    await db.flowiseWorkflow.update({
      where: { id: workflowId },
      data: {
        category: 'analyzed',
        // Em um cenário real, salvaríamos os insights em um campo separado
      }
    });

    return NextResponse.json({
      success: true,
      insights,
      analysisSummary: {
        totalInsights: insights.length,
        performanceIssues: insights.filter(i => i.type === 'performance').length,
        securityIssues: insights.filter(i => i.type === 'security').length,
        optimizationOpportunities: insights.filter(i => i.type === 'optimization').length
      }
    });

  } catch (error) {
    console.error('Erro na análise detalhada:', error);
    return NextResponse.json(
      { success: false, error: 'Erro na análise detalhada' },
      { status: 500 }
    );
  }
}

async function handleGenerateOptimizations(data: any) {
  try {
    const { workflowId, flowData, currentComplexity } = data;
    
    if (!workflowId || !flowData) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos para otimização' },
        { status: 400 }
      );
    }

    const suggestions = [];
    const parsedFlowData = JSON.parse(flowData);
    const nodeCount = parsedFlowData.nodes?.length || 0;
    const edgeCount = parsedFlowData.edges?.length || 0;

    // Gerar sugestões baseadas na complexidade
    if (currentComplexity > 15) {
      suggestions.push({
        type: 'complexity',
        priority: 'high',
        title: 'Reduzir Complexidade',
        description: 'Workflow muito complexo. Divida em sub-workflows menores.',
        impact: 'Alto',
        effort: 'Médio'
      });
    }

    if (nodeCount > 10) {
      suggestions.push({
        type: 'structure',
        priority: 'medium',
        title: 'Otimizar Estrutura',
        description: 'Agrupe nós similares para melhor organização.',
        impact: 'Médio',
        effort: 'Baixo'
      });
    }

    if (edgeCount > nodeCount * 1.5) {
      suggestions.push({
        type: 'connections',
        priority: 'low',
        title: 'Simplificar Conexões',
        description: 'Reduza o número de conexões desnecessárias.',
        impact: 'Baixo',
        effort: 'Baixo'
      });
    }

    // Sugestões específicas para tipos de nós
    const hasLLMNodes = parsedFlowData.nodes?.some((node: any) => 
      node.data?.category === 'llm'
    );
    
    if (hasLLMNodes) {
      suggestions.push({
        type: 'performance',
        priority: 'medium',
        title: 'Adicionar Cache LLM',
        description: 'Implemente cache para respostas LLM similares.',
        impact: 'Alto',
        effort: 'Médio'
      });
    }

    const hasDocumentLoaders = parsedFlowData.nodes?.some((node: any) => 
      node.data?.category === 'documentloaders'
    );
    
    if (hasDocumentLoaders) {
      suggestions.push({
        type: 'performance',
        priority: 'low',
        title: 'Otimizar Carregamento',
        description: 'Use pré-processamento para documentos grandes.',
        impact: 'Médio',
        effort: 'Alto'
      });
    }

    return NextResponse.json({
      success: true,
      suggestions,
      summary: {
        totalSuggestions: suggestions.length,
        highPriority: suggestions.filter(s => s.priority === 'high').length,
        mediumPriority: suggestions.filter(s => s.priority === 'medium').length,
        lowPriority: suggestions.filter(s => s.priority === 'low').length
      }
    });

  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar sugestões' },
      { status: 500 }
    );
  }
}

async function handleImportFromFlowise(data: any) {
  try {
    const { workflow, source } = data;
    
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow não fornecido' },
        { status: 400 }
      );
    }

    console.log(`📥 Importando workflow para Learning: ${workflow.name}`);

    // Check if workflow already exists in learning system by flowiseId or id
    const workflowId = workflow.flowiseId || workflow.id;
    const existingWorkflow = await db.flowiseWorkflow.findFirst({
      where: {
        OR: [
          { flowiseId: workflowId },
          { id: workflowId }
        ]
      }
    });

    if (existingWorkflow) {
      // Check if it's already marked for learning
      if (existingWorkflow.category === 'learning' || 
          (existingWorkflow.description && existingWorkflow.description.includes('Learning'))) {
        console.log(`📝 Workflow already in learning system: ${existingWorkflow.id}`);
        
        return NextResponse.json({
          success: true,
          message: 'Workflow já foi enviado para Learning anteriormente',
          workflowId: existingWorkflow.id,
          status: 'already_exists'
        });
      }
      
      // Update the existing workflow to mark it as sent to learning
      const updatedWorkflow = await db.flowiseWorkflow.update({
        where: { id: existingWorkflow.id },
        data: {
          category: 'learning',
          description: `${existingWorkflow.description || workflow.name} - Sent to Learning for analysis`,
          lastSyncAt: new Date()
        }
      });
      
      console.log(`✅ Existing workflow marked for learning: ${updatedWorkflow.id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Workflow enviado para Learning com sucesso',
        workflowId: updatedWorkflow.id,
        status: 'updated'
      });
    }

    // If workflow doesn't exist, create it with unique validation
    try {
      const newWorkflow = await db.flowiseWorkflow.create({
        data: {
          flowiseId: workflowId,
          name: workflow.name,
          description: `Imported from ${source} for Learning analysis`,
          type: workflow.type || 'CHATFLOW',
          flowData: workflow.flowData || '{}',
          deployed: workflow.deployed || false,
          isPublic: workflow.isPublic || false,
          category: 'learning',
          workspaceId: workflow.workspaceId || null,
          complexityScore: workflow.complexityScore || 0,
          nodeCount: workflow.nodeCount || 0,
          edgeCount: workflow.edgeCount || 0,
          maxDepth: workflow.maxDepth || 0,
          capabilities: JSON.stringify(workflow.capabilities || {}),
          nodes: JSON.stringify(workflow.nodes || []),
          connections: JSON.stringify(workflow.connections || []),
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ New workflow created and sent to Learning: ${newWorkflow.id}`);

      return NextResponse.json({
        success: true,
        message: 'Workflow enviado para Learning com sucesso',
        workflowId: newWorkflow.id,
        status: 'created'
      });
    } catch (createError: any) {
      // Handle unique constraint violation
      if (createError.code === 'P2002') {
        console.log(`🔄 Workflow already exists (unique constraint), finding existing...`);
        
        const existingByConstraint = await db.flowiseWorkflow.findFirst({
          where: { flowiseId: workflowId }
        });
        
        if (existingByConstraint) {
          return NextResponse.json({
            success: true,
            message: 'Workflow já existe no sistema',
            workflowId: existingByConstraint.id,
            status: 'already_exists'
          });
        }
      }
      throw createError;
    }

  } catch (error) {
    console.error('Erro ao importar workflow para Learning:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao importar workflow para Learning' },
      { status: 500 }
    );
  }
}
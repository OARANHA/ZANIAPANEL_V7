import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { FlowiseConverter } from '@/lib/flowise-converter';

export async function POST(request: NextRequest) {
  try {
    const { agentId, selectedNodes, workflowConfig } = await request.json();

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Buscar o agente completo
    const agent = await db.agent.findUnique({
      where: { id: agentId },
      include: { workspace: true }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    console.log(`🚀 Exportando agente para Flowise: ${agent.name} (${agent.id})`);
    console.log(`📋 Configuração personalizada:`, { selectedNodes: selectedNodes?.length || 0, workflowConfig });

    // Gerar workflow a partir do agente com configuração personalizada
    const baseNodes = [
      {
        id: 'start_node',
        type: 'StartNode',
        name: 'Início',
        description: 'Ponto de entrada do workflow',
        config: {}
      }
    ];

    // Adicionar nodes personalizados se fornecidos
    let customNodes = [];
    if (selectedNodes && selectedNodes.length > 0) {
      customNodes = selectedNodes.map((node, index) => ({
        id: `custom_node_${index}`,
        type: node.path,
        name: node.label,
        description: node.desc,
        category: node.categoria,
        config: {
          inputs: node.inputs,
          outputs: node.outputs,
          // Adicionar configuração específica baseada no tipo de node
          ...(node.categoria === 'LLM' && {
            modelName: workflowConfig?.modelName || 'gpt-3.5-turbo',
            temperature: workflowConfig?.temperature || 0.7
          }),
          ...(node.categoria === 'Memory' && {
            includeMemory: workflowConfig?.includeMemory !== false
          }),
          ...(node.categoria === 'Tools' && {
            includeTools: workflowConfig?.includeTools !== false
          })
        }
      }));
    }

    // Node do agente principal
    const agentNode = {
      id: 'agent_node',
      type: 'CustomNode',
      name: agent.name,
      description: agent.description || '',
      config: {
        agentId: agent.id,
        agentName: agent.name,
        agentConfig: agent.config || '{}',
        agentKnowledge: agent.knowledge || '',
        // Incluir configuração do workflow
        workflowConfig: workflowConfig || {}
      }
    };

    const endNode = {
      id: 'end_node',
      type: 'EndNode',
      name: 'Fim',
      description: 'Ponto de saída do workflow',
      config: {}
    };

    const allNodes = [...baseNodes, ...customNodes, agentNode, endNode];

    // Gerar edges (conexões) baseado na configuração
    const edges = [];
    let previousNodeId = 'start_node';

    // Conectar nodes personalizados em sequência
    customNodes.forEach(node => {
      edges.push({
        source: previousNodeId,
        target: node.id,
        type: 'sequential'
      });
      previousNodeId = node.id;
    });

    // Conectar último node personalizado ao agente
    edges.push({
      source: previousNodeId,
      target: 'agent_node',
      type: 'sequential'
    });

    // Conectar agente ao fim
    edges.push({
      source: 'agent_node',
      target: 'end_node',
      type: 'sequential'
    });

    const generatedWorkflow = {
      name: workflowConfig?.workflowName || agent.name,
      description: workflowConfig?.workflowDescription || `Agente: ${agent.name}`,
      nodes: allNodes,
      edges: edges,
      agents: [agent.id],
      complexity: selectedNodes && selectedNodes.length > 3 ? 'complex' : selectedNodes && selectedNodes.length > 1 ? 'medium' : 'simple',
      estimatedTime: selectedNodes && selectedNodes.length > 3 ? '2-5 minutos' : selectedNodes && selectedNodes.length > 1 ? '1-2 minutos' : '< 1 minuto',
      customNodes: selectedNodes || [],
      workflowConfig: workflowConfig || {}
    };

    // Converter para formato Flowise
    const flowiseWorkflow = await FlowiseConverter.convertToFlowiseFormat(
      generatedWorkflow,
      agent.workspaceId
    );

    // Preparar dados para exportação
    const flowData = {
      nodes: flowiseWorkflow.nodes,
      edges: flowiseWorkflow.edges,
      viewport: { x: 0, y: 0, zoom: 1 }
    };

    const exportData = {
      id: agent.id,
      name: workflowConfig?.workflowName || agent.name,
      description: workflowConfig?.workflowDescription || agent.description || '',
      type: 'CHATFLOW', // Importante: deve ser CHATFLOW para aparecer na lista
      flowData: JSON.stringify(flowData),
      deployed: true,
      isPublic: true,
      category: 'agentes',
      workspaceId: agent.workspaceId
    };

    // Exportar para o Flowise externo
    const flowiseResponse = await exportToFlowiseExternal(exportData, agent.slug);

    if (!flowiseResponse.success) {
      throw new Error(flowiseResponse.error || 'Failed to export to Flowise');
    }

    // Atualizar o agente com o link do Flowise
    const chatUrl = flowiseResponse.data?.chatUrl || 
                   `https://aaranha-zania.hf.space/chat/${flowiseResponse.data?.canvasId}`;
    
    const embedCode = generateEmbedCode(flowiseResponse.data?.canvasId || agent.slug);

    await db.agent.update({
      where: { id: agent.id },
      data: {
        chatflowUrl: chatUrl,
        flowiseId: flowiseResponse.data?.canvasId,
        exportedToFlowise: true,
        exportedAt: new Date()
      }
    });

    // Gerar estatísticas iniciais
    const stats = {
      totalExecutions: 0,
      successRate: '100%',
      lastExecution: null,
      avgResponseTime: '0ms'
    };

    console.log(`✅ Agente exportado com sucesso: ${agent.name} -> ${chatUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Agent exported to Flowise successfully',
      data: {
        agentId: agent.id,
        agentName: agent.name,
        canvasId: flowiseResponse.data?.canvasId,
        chatUrl: chatUrl,
        embedCode: embedCode,
        stats: stats,
        exportedAt: new Date().toISOString(),
        flowiseResponse: flowiseResponse.data,
        customWorkflow: {
          nodesUsed: selectedNodes?.length || 0,
          workflowConfig: workflowConfig,
          complexity: generatedWorkflow.complexity
        }
      }
    });

  } catch (error) {
    console.error('Error exporting agent to Flowise:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export agent to Flowise',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function exportToFlowiseExternal(exportData: any, agentSlug: string) {
  try {
    const canvasId = `agent_${agentSlug}_${Date.now()}`;
    
    console.log('🚀 Enviando requisição de exportação para Flowise:', {
      action: 'export_workflow',
      canvasId: canvasId,
      workflowData: exportData
    });

    // Corrigir a URL para usar o caminho completo da API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('🔧 Base URL for Flowise export:', baseUrl); // Debug log
    const apiUrl = `${baseUrl}/api/flowise-external-sync`;
    
    // Validate URL before making request
    try {
      new URL(apiUrl); // This will throw if the URL is malformed
    } catch (urlError) {
      console.error('❌ Invalid URL for Flowise export:', apiUrl);
      return {
        success: false,
        error: `Invalid API URL: ${apiUrl}`
      };
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'export_workflow',
        canvasId: canvasId,
        workflowData: exportData
      })
    });

    console.log('📝 Resposta da API Flowise:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    const result = await response.json();
    console.log('📊 Dados da resposta Flowise:', result);

    if (response.ok && result.success) {
      return {
        success: true,
        data: {
          canvasId: result.data?.canvasId || result.data?.flowiseResponse?.id || canvasId,
          chatUrl: `https://aaranha-zania.hf.space/chat/${result.data?.canvasId || result.data?.flowiseResponse?.id || canvasId}`,
          flowiseResponse: result.data?.flowiseResponse || result.data
        }
      };
    } else {
      return {
        success: false,
        error: result.message || result.error || 'Failed to export to Flowise'
      };
    }
  } catch (error) {
    console.error('❌ Erro ao exportar para Flowise:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function generateEmbedCode(canvasId: string): string {
  const baseUrl = 'https://aaranha-zania.hf.space';
  
  return `<iframe
  src="${baseUrl}/chat/${canvasId}"
  width="100%"
  height="600px"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  allow="microphone; camera"
></iframe>`;
}
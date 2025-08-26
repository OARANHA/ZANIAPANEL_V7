import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface WorkflowPattern {
  commonNodes: string[];
  connectionPatterns: string[];
  configPatterns: Record<string, any>;
}

interface ZanaiConfig {
  simpleDescription: string;
  requiredCapabilities: string[];
  estimatedSetupTime: string;
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'analyze_workflow':
        return await analyzeWorkflow(data);
      
      case 'create_learned_template':
        return await createLearnedTemplate(data);
      
      case 'get_learned_templates':
        return await getLearnedTemplates();
      
      case 'analyze_all_patterns':
        return await analyzeAllPatterns();
      
      case 'validate_template':
        return await validateTemplate(data);
      
      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API de aprendizado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function analyzeWorkflow(data: any) {
  try {
    const { workflowId, flowData, type } = data;
    
    console.log('🔍 Analisando workflow:', workflowId);
    
    // Parse do flowData
    const parsedFlowData = JSON.parse(flowData);
    const nodes = parsedFlowData.nodes || [];
    const edges = parsedFlowData.edges || [];
    
    // Extrair padrões
    const patterns = extractPatterns(nodes, edges);
    
    // Gerar configuração Zanai simplificada
    const zanaiConfig = generateZanaiConfig(workflowId, nodes, type);
    
    console.log('✅ Análise concluída:', {
      workflowId,
      nodesCount: nodes.length,
      edgesCount: edges.length,
      patternsFound: patterns.commonNodes.length,
      zanaiConfig
    });
    
    return NextResponse.json({
      success: true,
      patterns,
      zanaiConfig
    });
    
  } catch (error) {
    console.error('Erro ao analisar workflow:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

async function createLearnedTemplate(data: any) {
  try {
    const { sourceWorkflowId, name, category, complexity, patterns, zanaiConfig } = data;
    
    console.log('📝 Criando template aprendido:', name);
    
    // Salvar no banco de dados
    const template = await db.learnedTemplate.create({
      data: {
        sourceWorkflowId,
        name,
        category,
        complexity,
        patterns: JSON.stringify(patterns),
        zanaiConfig: JSON.stringify(zanaiConfig),
        validated: false,
        usageCount: 0
      }
    });
    
    console.log('✅ Template criado:', template.id);
    
    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        complexity: template.complexity,
        validated: template.validated,
        usageCount: template.usageCount,
        createdAt: template.createdAt
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

async function getLearnedTemplates() {
  try {
    const templates = await db.learnedTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      sourceWorkflowId: template.sourceWorkflowId,
      category: template.category,
      complexity: template.complexity,
      patterns: JSON.parse(template.patterns || '{}'),
      zanaiConfig: JSON.parse(template.zanaiConfig || '{}'),
      validated: template.validated,
      usageCount: template.usageCount,
      createdAt: template.createdAt
    }));
    
    return NextResponse.json({
      success: true,
      templates: formattedTemplates
    });
    
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

async function analyzeAllPatterns() {
  try {
    console.log('🧠 Iniciando análise de padrões em todos os workflows...');
    
    // Buscar todos os workflows
    const workflows = await db.flowiseWorkflow.findMany({
      where: { nodes: { not: null } },
      take: 100
    });
    
    let totalPatterns = 0;
    const allPatterns: WorkflowPattern[] = [];
    
    for (const workflow of workflows) {
      try {
        const nodes = JSON.parse(workflow.nodes || '[]');
        const edges = JSON.parse(workflow.connections || '[]');
        
        const patterns = extractPatterns(nodes, edges);
        allPatterns.push(patterns);
        totalPatterns += patterns.commonNodes.length;
        
      } catch (error) {
        console.warn('Erro ao analisar workflow:', workflow.id, error);
      }
    }
    
    // Consolidar padrões
    const consolidatedPatterns = consolidatePatterns(allPatterns);
    
    console.log('✅ Análise de padrões concluída:', {
      workflowsAnalyzed: workflows.length,
      totalPatterns,
      consolidatedPatterns: Object.keys(consolidatedPatterns).length
    });
    
    return NextResponse.json({
      success: true,
      workflowsAnalyzed: workflows.length,
      patternsFound: totalPatterns,
      consolidatedPatterns
    });
    
  } catch (error) {
    console.error('Erro na análise de padrões:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

async function validateTemplate(data: any) {
  try {
    const { templateId } = data;
    
    console.log('✅ Validando template:', templateId);
    
    // Marcar template como validado
    const template = await db.learnedTemplate.update({
      where: { id: templateId },
      data: { validated: true }
    });
    
    console.log('✅ Template validado:', template.id);
    
    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        validated: template.validated
      }
    });
    
  } catch (error) {
    console.error('Erro ao validar template:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

function extractPatterns(nodes: any[], edges: any[]): WorkflowPattern {
  // Extrair nodes comuns
  const commonNodes = nodes
    .filter(node => node.data && node.data.category)
    .map(node => node.data.category)
    .filter((category, index, self) => self.indexOf(category) === index)
    .slice(0, 10); // Top 10 categorias
  
  // Extrair padrões de conexão
  const connectionPatterns = edges
    .map(edge => `${edge.sourceHandle} -> ${edge.targetHandle}`)
    .filter((pattern, index, self) => self.indexOf(pattern) === index)
    .slice(0, 10); // Top 10 padrões
  
  // Extrair padrões de configuração
  const configPatterns: Record<string, any> = {};
  
  nodes.forEach(node => {
    if (node.data && node.data.inputs) {
      Object.keys(node.data.inputs).forEach(key => {
        const value = node.data.inputs[key];
        if (value && typeof value === 'string' && value.length > 0) {
          if (!configPatterns[key]) {
            configPatterns[key] = [];
          }
          if (!configPatterns[key].includes(value)) {
            configPatterns[key].push(value);
          }
        }
      });
    }
  });
  
  return {
    commonNodes,
    connectionPatterns,
    configPatterns
  };
}

function generateZanaiConfig(workflowId: string, nodes: any[], type: string): ZanaiConfig {
  // Analisar nodes para determinar capacidades
  const capabilities = new Set<string>();
  
  nodes.forEach(node => {
    if (node.data && node.data.category) {
      switch (node.data.category) {
        case 'Chat Models':
          capabilities.add('chat');
          break;
        case 'agents':
          capabilities.add('agent');
          break;
        case 'tools':
          capabilities.add('tools');
          break;
        case 'documentloaders':
          capabilities.add('document_processing');
          break;
        case 'embeddings':
          capabilities.add('embeddings');
          break;
        case 'vectorstores':
          capabilities.add('vector_search');
          break;
        case 'Memory':
          capabilities.add('memory');
          break;
      }
    }
  });
  
  // Determinar tempo de setup baseado na complexidade
  const nodeCount = nodes.length;
  let estimatedSetupTime = '5 minutos';
  
  if (nodeCount > 20) {
    estimatedSetupTime = '30+ minutos';
  } else if (nodeCount > 10) {
    estimatedSetupTime = '15 minutos';
  } else if (nodeCount > 5) {
    estimatedSetupTime = '10 minutos';
  }
  
  // Gerar descrição simplificada
  const description = `Template baseado no workflow ${workflowId} com ${nodeCount} nodes. Capacidades: ${Array.from(capabilities).join(', ')}`;
  
  return {
    simpleDescription: description,
    requiredCapabilities: Array.from(capabilities),
    estimatedSetupTime
  };
}

function consolidatePatterns(patterns: WorkflowPattern[]): Record<string, any> {
  const consolidated: Record<string, any> = {
    commonNodes: {},
    connectionPatterns: {},
    configPatterns: {}
  };
  
  patterns.forEach(pattern => {
    // Consolidar nodes comuns
    pattern.commonNodes.forEach(node => {
      consolidated.commonNodes[node] = (consolidated.commonNodes[node] || 0) + 1;
    });
    
    // Consolidar padrões de conexão
    pattern.connectionPatterns.forEach(connection => {
      consolidated.connectionPatterns[connection] = (consolidated.connectionPatterns[connection] || 0) + 1;
    });
    
    // Consolidar padrões de configuração
    Object.keys(pattern.configPatterns).forEach(key => {
      if (!consolidated.configPatterns[key]) {
        consolidated.configPatterns[key] = {};
      }
      pattern.configPatterns[key].forEach((value: string) => {
        consolidated.configPatterns[key][value] = (consolidated.configPatterns[key][value] || 0) + 1;
      });
    });
  });
  
  return consolidated;
}
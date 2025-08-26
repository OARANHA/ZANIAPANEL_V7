/**
 * Serviço para preview e validação de workflows
 * Fornece análise detalhada de workflows, detecção de problemas e sugestões de otimização
 */

import { FlowiseNode, FlowiseEdge } from './agent-to-flowise-transformer';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: OptimizationSuggestion[];
  score: number; // 0-100
  metrics: WorkflowMetrics;
}

export interface ValidationError {
  id: string;
  type: 'critical' | 'error' | 'warning';
  nodeId?: string;
  edgeId?: string;
  message: string;
  description: string;
  fix?: string;
}

export interface ValidationWarning {
  id: string;
  nodeId?: string;
  message: string;
  description: string;
  suggestion: string;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'structure' | 'configuration' | 'cost';
  priority: 'low' | 'medium' | 'high';
  targetNodes?: string[];
  message: string;
  description: string;
  impact: string;
  implementation: string;
}

export interface WorkflowMetrics {
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;
  parallelPaths: number;
  criticalPathLength: number;
  complexityScore: number;
  estimatedExecutionTime: string;
  memoryUsage: 'low' | 'medium' | 'high';
  costEstimate: 'low' | 'medium' | 'high';
}

export interface WorkflowPreview {
  nodes: PreviewNode[];
  edges: PreviewEdge[];
  flow: FlowPath[];
  metrics: WorkflowMetrics;
  validation: ValidationResult;
}

export interface PreviewNode {
  id: string;
  name: string;
  type: string;
  category: string;
  position: { x: number; y: number };
  status: 'valid' | 'warning' | 'error';
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  connections: { incoming: number; outgoing: number };
  executionTime?: string;
  cost?: string;
}

export interface PreviewEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  status: 'valid' | 'warning' | 'error';
  dataFlow?: string;
}

export interface FlowPath {
  id: string;
  nodes: string[];
  edges: string[];
  type: 'main' | 'alternative' | 'error';
  description: string;
  executionOrder: number;
}

export class WorkflowValidator {
  
  /**
   * Valida um workflow completo e gera preview
   */
  async validateAndPreview(
    nodes: FlowiseNode[],
    edges: FlowiseEdge[],
    options: {
      strictMode?: boolean;
      includePerformanceAnalysis?: boolean;
      includeCostAnalysis?: boolean;
    } = {}
  ): Promise<WorkflowPreview> {
    
    console.log('🔍 Iniciando validação e preview do workflow:', {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      options
    });

    try {
      // 1. Validar estrutura básica
      const structureValidation = this.validateStructure(nodes, edges);
      
      // 2. Analisar conexões e fluxo
      const flowAnalysis = this.analyzeFlow(nodes, edges);
      
      // 3. Validar configurações dos nós
      const nodeValidation = this.validateNodeConfigurations(nodes);
      
      // 4. Calcular métricas
      const metrics = this.calculateMetrics(nodes, edges, flowAnalysis);
      
      // 5. Gerar sugestões de otimização
      const suggestions = this.generateOptimizationSuggestions(nodes, edges, metrics);
      
      // 6. Analisar performance se solicitado
      let performanceAnalysis = {};
      if (options.includePerformanceAnalysis) {
        performanceAnalysis = this.analyzePerformance(nodes, edges);
      }
      
      // 7. Analisar custos se solicitado
      let costAnalysis = {};
      if (options.includeCostAnalysis) {
        costAnalysis = this.analyzeCosts(nodes);
      }

      // Combinar todos os resultados
      const errors = [...structureValidation.errors, ...nodeValidation.errors];
      const warnings = [...structureValidation.warnings, ...nodeValidation.warnings];
      
      const validation: ValidationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
        suggestions,
        score: this.calculateValidationScore(errors, warnings, metrics),
        metrics: {
          ...metrics,
          ...performanceAnalysis,
          ...costAnalysis
        }
      };

      // Gerar preview
      const preview = this.generatePreview(nodes, edges, validation, flowAnalysis);

      console.log('✅ Validação concluída:', {
        valid: validation.valid,
        errorsCount: errors.length,
        warningsCount: warnings.length,
        suggestionsCount: suggestions.length,
        score: validation.score
      });

      return preview;

    } catch (error) {
      console.error('❌ Erro durante validação:', error);
      throw new Error(`Falha na validação do workflow: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Valida a estrutura básica do workflow
   */
  private validateStructure(nodes: FlowiseNode[], edges: FlowiseEdge[]): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar nós duplicados
    const nodeIds = new Set<string>();
    nodes.forEach(node => {
      if (nodeIds.has(node.id)) {
        errors.push({
          id: `duplicate_node_${node.id}`,
          type: 'critical',
          nodeId: node.id,
          message: 'Nó duplicado encontrado',
          description: `O nó com ID "${node.id}" aparece múltiplas vezes no workflow.`,
          fix: 'Remova ou renomeie um dos nós duplicados.'
        });
      }
      nodeIds.add(node.id);
    });

    // Verificar conexões inválidas
    edges.forEach(edge => {
      if (!nodeIds.has(edge.source)) {
        errors.push({
          id: `invalid_source_${edge.id}`,
          type: 'error',
          edgeId: edge.id,
          message: 'Nó de origem não encontrado',
          description: `A conexão "${edge.id}" referencia um nó de origem inexistente: "${edge.source}".`,
          fix: 'Verifique se o nó de origem existe ou remova esta conexão.'
        });
      }
      
      if (!nodeIds.has(edge.target)) {
        errors.push({
          id: `invalid_target_${edge.id}`,
          type: 'error',
          edgeId: edge.id,
          message: 'Nó de destino não encontrado',
          description: `A conexão "${edge.id}" referencia um nó de destino inexistente: "${edge.target}".`,
          fix: 'Verifique se o nó de destino existe ou remova esta conexão.'
        });
      }
    });

    // Verificar nós isolados
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    nodes.forEach(node => {
      if (!connectedNodes.has(node.id) && !this.isStartNode(node)) {
        warnings.push({
          id: `isolated_node_${node.id}`,
          nodeId: node.id,
          message: 'Nó isolado detectado',
          description: `O nó "${node.data.name}" não está conectado a nenhum outro nó.`,
          suggestion: 'Conecte este nó ao fluxo principal ou remova-o se não for necessário.'
        });
      }
    });

    // Verificar se existe nó de início (com lógica inteligente)
    const hasStartNode = nodes.some(node => this.isStartNode(node));
    if (!hasStartNode) {
      // Detectar tipo de workflow baseado nos nós presentes
      const hasAgentNodes = nodes.some(n => 
        n.data.category === 'Agent Flow' ||
        n.data.type?.toLowerCase().includes('agent') ||
        n.data.name?.toLowerCase().includes('agent')
      );
      
      // Para Chatflows, não exigir nó de início se houver nós de entrada válidos
      const hasValidInputNodes = nodes.some(n => this.isValidInputNode(n));
      
      if (hasAgentNodes) {
        errors.push({
          id: 'missing_start_node_agent',
          type: 'error',
          message: 'Agentflow sem nó de início',
          description: 'Este Agentflow não possui um nó de início válido. Agentflows precisam de um nó "Start" para iniciar a execução.',
          fix: 'Adicione um nó "Start" do tipo Agentflow ou configure um nó de entrada adequado.'
        });
      } else if (!hasValidInputNodes) {
        // Apenas mostrar erro para Chatflows se não houver nós de entrada válidos
        errors.push({
          id: 'missing_start_node',
          type: 'error',
          message: 'Workflow sem nó de início',
          description: 'Este workflow não possui um nó de início válido. Todo workflow precisa de um ponto de entrada.',
          fix: 'Adicione um nó "Start", "ChatInput", "TextInput" ou similar para iniciar o workflow.'
        });
      }
    }

    // Verificar ciclos
    const cycles = this.detectCycles(nodes, edges);
    cycles.forEach((cycle, index) => {
      errors.push({
        id: `cycle_${index}`,
        type: 'error',
        message: 'Ciclo detectado no workflow',
        description: `Foi detectado um ciclo que pode causar execução infinita: ${cycle.join(' → ')}.`,
        fix: 'Quebre o ciclo adicionando um nó de condição ou removendo uma das conexões.'
      });
    });

    return { errors, warnings };
  }

  /**
   * Analisa o fluxo do workflow
   */
  private analyzeFlow(nodes: FlowiseNode[], edges: FlowiseEdge[]) {
    const graph = this.buildGraph(nodes, edges);
    const paths = this.findAllPaths(graph);
    const criticalPath = this.findCriticalPath(paths, nodes);
    
    return {
      graph,
      paths,
      criticalPath,
      maxDepth: this.calculateMaxDepth(graph),
      parallelPaths: this.countParallelPaths(paths)
    };
  }

  /**
   * Valida configurações específicas dos nós
   */
  private validateNodeConfigurations(nodes: FlowiseNode[]): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    nodes.forEach(node => {
      const category = node.data.category;
      const inputs = node.data.inputs || {};

      // Validações específicas por categoria
      switch (category) {
        case 'Chat Models':
          if (!inputs.modelName) {
            errors.push({
              id: `missing_model_${node.id}`,
              type: 'error',
              nodeId: node.id,
              message: 'Modelo não configurado',
              description: `O nó "${node.data.name}" não tem um modelo de linguagem configurado.`,
              fix: 'Selecione um modelo válido nas configurações do nó.'
            });
          }
          
          if (inputs.temperature !== undefined && (inputs.temperature < 0 || inputs.temperature > 2)) {
            warnings.push({
              id: `invalid_temperature_${node.id}`,
              nodeId: node.id,
              message: 'Temperatura fora do range recomendado',
              description: `A temperatura ${inputs.temperature} está fora do range recomendado (0-1).`,
              suggestion: 'Ajuste a temperatura para um valor entre 0 e 1 para melhores resultados.'
            });
          }
          break;

        case 'LLM':
          if (!inputs.llmModel) {
            errors.push({
              id: `missing_llm_model_${node.id}`,
              type: 'error',
              nodeId: node.id,
              message: 'Modelo LLM não configurado',
              description: `O nó "${node.data.name}" não tem um modelo LLM configurado.`,
              fix: 'Selecione um modelo LLM válido nas configurações do nó.'
            });
          }
          break;

        case 'Prompts':
          if (!inputs.template || inputs.template.trim().length === 0) {
            errors.push({
              id: `empty_template_${node.id}`,
              type: 'error',
              nodeId: node.id,
              message: 'Template vazio',
              description: `O nó "${node.data.name}" tem um template vazio.`,
              fix: 'Preencha o template com um prompt válido.'
            });
          }
          break;

        case 'Memory':
          if (inputs.bufferSize !== undefined && inputs.bufferSize > 100) {
            warnings.push({
              id: `large_buffer_${node.id}`,
              nodeId: node.id,
              message: 'Buffer de memória muito grande',
              description: `O buffer de tamanho ${inputs.bufferSize} pode consumir muita memória.`,
              suggestion: 'Considere reduzir o tamanho do buffer para melhor performance.'
            });
          }
          break;

        case 'Document Stores':
          if (!inputs.documentStore) {
            warnings.push({
              id: `missing_document_store_${node.id}`,
              nodeId: node.id,
              message: 'Document store não selecionado',
              description: `O nó "${node.data.name}" não tem um document store configurado.`,
              suggestion: 'Selecione um document store para habilitar a busca de documentos.'
            });
          }
          break;
      }

      // Validações genéricas com exceções para certos nós
      if (node.data.inputParams) {
        node.data.inputParams.forEach(param => {
          // Verificar se é um nó que pode ter parâmetros ausentes temporariamente
          const isTemporarilyOptional = this.isTemporarilyOptionalNode(node, param.name);
          
          if (!param.optional && !isTemporarilyOptional && inputs[param.name] === undefined) {
            errors.push({
              id: `missing_required_param_${node.id}_${param.name}`,
              type: 'error',
              nodeId: node.id,
              message: `Parâmetro obrigatório ausente`,
              description: `O parâmetro "${param.label}" é obrigatório mas não está configurado.`,
              fix: `Preencha o valor para "${param.label}" nas configurações do nó.`
            });
          }
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Identifica se um nó pode ser considerado um nó de início
   */
  private isStartNode(node: FlowiseNode): boolean {
    if (!node || !node.data) return false;
    
    const nodeType = node.data.type || '';
    const nodeLabel = node.data.label || node.data.name || '';
    const nodeName = node.data.name || '';
    const nodeCategory = node.data.category || '';
    
    // Verificar diferentes tipos de nós iniciais
    return (
      // Nós Start explícitos
      nodeType === 'Start' ||
      nodeType === 'start' ||
      nodeType === 'StartNode' ||
      
      // Nós de entrada de chat/texto
      nodeType === 'ChatInput' ||
      nodeType === 'TextInput' ||
      nodeType === 'Input' ||
      
      // Por nome/label
      nodeLabel.toLowerCase().includes('start') ||
      nodeName.toLowerCase().includes('start') ||
      nodeName.toLowerCase().includes('início') ||
      nodeLabel.toLowerCase().includes('início') ||
      
      // Nós específicos do Agentflow
      (nodeCategory === 'Agent Flow' && (
        nodeType.includes('Agent') ||
        nodeType.includes('Input') ||
        nodeType.includes('Trigger') ||
        nodeType.includes('Start')
      )) ||
      
      // Para Chatflows, permitir outros tipos de nós iniciais
      (!nodeCategory.includes('Agent Flow') && (
        nodeType.includes('Chat') ||
        nodeType.includes('Input') ||
        nodeLabel.includes('Input') ||
        nodeName.includes('Input')
      )) ||
      
      // Nós sem conexões de entrada (potenciais iniciais)
      (nodeType !== 'End' && nodeType !== 'Output' && 
       (!node.data.inputs || Object.keys(node.data.inputs).length === 0))
    );
  }

  /**
   * Identifica se um nó é um nó de entrada válido para Chatflows
   */
  private isValidInputNode(node: FlowiseNode): boolean {
    if (!node || !node.data) return false;
    
    const nodeType = node.data.type || '';
    const nodeLabel = node.data.label || node.data.name || '';
    const nodeName = node.data.name || '';
    const nodeCategory = node.data.category || '';
    
    // Nós de entrada válidos para Chatflows
    const validInputNodeTypes = [
      'ChatInput',
      'TextInput',
      'Input',
      'ChatOpenAI',
      'ChatOpenAI_LlamaIndex',
      'OpenAIEmbedding_LlamaIndex',
      'Pinecone',
      'Pinecone_LlamaIndex',
      'Text File'
    ];
    
    // Verificar se é um nó de entrada válido
    return (
      validInputNodeTypes.includes(nodeType) ||
      validInputNodeTypes.includes(nodeName) ||
      nodeLabel.includes('Input') ||
      nodeName.includes('Input') ||
      nodeType.includes('Chat') ||
      // Nós sem conexões de entrada
      (nodeType !== 'End' && nodeType !== 'Output' && 
       (!node.data.inputs || Object.keys(node.data.inputs).length === 0))
    );
  }

  /**
   * Identifica se um nó pode ter parâmetros ausentes temporariamente
   * Isso é útil para nós que estão em processo de configuração
   */
  private isTemporarilyOptionalNode(node: FlowiseNode, paramName: string): boolean {
    // Nós de documentos que podem não ter arquivo vinculado ainda
    if ((node.data.name === 'Text File' || node.data.label === 'Text File') && paramName === 'txtFile') {
      return true;
    }
    
    // Nós de embeddings que podem não ter credenciais configuradas ainda
    if ((node.data.name === 'OpenAI Embedding' || node.data.label?.includes('OpenAI Embedding')) && paramName === 'credential') {
      return true;
    }
    
    // Nós do Pinecone que podem não ter configurações completas ainda
    if ((node.data.name === 'Pinecone' || node.data.label?.includes('Pinecone')) && (paramName === 'credential' || paramName === 'pineconeIndex')) {
      return true;
    }
    
    // Nós do ChatOpenAI que podem ter modelo configurado de outra forma
    if ((node.data.name?.includes('ChatOpenAI') || node.data.label?.includes('ChatOpenAI')) && paramName === 'modelName') {
      // Verificar se há outros parâmetros que indicam configuração
      const inputs = node.data.inputs || {};
      return !!inputs.model || !!inputs.modelName;
    }
    
    // Nós que podem ter parâmetros configurados posteriormente
    const temporarilyOptionalNodes = [
      'Text File',
      'OpenAI Embedding',
      'OpenAI Embedding_LlamaIndex',
      'Pinecone',
      'Pinecone_LlamaIndex',
      'ChatOpenAI',
      'ChatOpenAI_LlamaIndex'
    ];
    
    const temporarilyOptionalParams = [
      'txtFile',
      'credential',
      'pineconeIndex',
      'modelName',
      'model'
    ];
    
    return temporarilyOptionalNodes.some(nodeName => 
      node.data.name?.includes(nodeName) || node.data.label?.includes(nodeName)
    ) && temporarilyOptionalParams.includes(paramName);
  }

  /**
   * Calcula métricas do workflow
   */
  private calculateMetrics(
    nodes: FlowiseNode[], 
    edges: FlowiseEdge[], 
    flowAnalysis: any
  ): WorkflowMetrics {
    
    const complexityScore = this.calculateComplexityScore(nodes, edges, flowAnalysis);
    
    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      maxDepth: flowAnalysis.maxDepth,
      parallelPaths: flowAnalysis.parallelPaths,
      criticalPathLength: flowAnalysis.criticalPath?.length || 0,
      complexityScore,
      estimatedExecutionTime: this.estimateExecutionTime(nodes, complexityScore),
      memoryUsage: this.estimateMemoryUsage(nodes, complexityScore),
      costEstimate: this.estimateCost(nodes, complexityScore)
    };
  }

  /**
   * Gera sugestões de otimização
   */
  private generateOptimizationSuggestions(
    nodes: FlowiseNode[],
    edges: FlowiseEdge[],
    metrics: WorkflowMetrics
  ): OptimizationSuggestion[] {
    
    const suggestions: OptimizationSuggestion[] = [];

    // Sugestões baseadas em complexidade
    if (metrics.complexityScore > 80) {
      suggestions.push({
        id: 'complexity_reduction',
        type: 'structure',
        priority: 'high',
        targetNodes: nodes.map(n => n.id),
        message: 'Workflow muito complexo',
        description: 'O workflow tem alta complexidade o que pode afetar a performance e manutenibilidade.',
        impact: 'Redução significativa do tempo de execução e melhora na manutenibilidade.',
        implementation: 'Divida o workflow em sub-workflows menores ou remova nós desnecessários.'
      });
    }

    // Sugestões baseadas em nós de Chat Model
    const chatModels = nodes.filter(n => n.data.category === 'Chat Models');
    chatModels.forEach(node => {
      const inputs = node.data.inputs || {};
      if (inputs.modelName === 'gpt-4' && inputs.temperature > 0.5) {
        suggestions.push({
          id: `model_optimization_${node.id}`,
          type: 'cost',
          priority: 'medium',
          targetNodes: [node.id],
          message: 'Oportunidade de otimização de custo',
          description: `O nó "${node.data.name}" usa GPT-4 com alta temperatura.`,
          impact: 'Redução de custos mantendo a qualidade.',
          implementation: 'Considere usar GPT-3.5-turbo ou reduzir a temperatura para tarefas menos complexas.'
        });
      }
    });

    // Sugestões baseadas em memória
    const memoryNodes = nodes.filter(n => n.data.category === 'Memory');
    if (memoryNodes.length > 3) {
      suggestions.push({
        id: 'memory_optimization',
        type: 'performance',
        priority: 'medium',
        targetNodes: memoryNodes.map(n => n.id),
        message: 'Múltiplos nós de memória detectados',
        description: 'Vários nós de memória podem causar redundância e aumentar o uso de memória.',
        impact: 'Melhora na performance e redução do uso de memória.',
        implementation: 'Consolide os nós de memória ou use um único nó com configuração adequada.'
      });
    }

    // Sugestões baseadas em conexões
    if (edges.length > nodes.length * 2) {
      suggestions.push({
        id: 'connection_optimization',
        type: 'structure',
        priority: 'low',
        message: 'Muitas conexões detectadas',
        description: 'O workflow tem mais conexões que o dobro de nós, o que pode indicar complexidade desnecessária.',
        impact: 'Simplificação do fluxo e melhor compreensão.',
        implementation: 'Revise as conexões e remova as que não são essenciais.'
      });
    }

    return suggestions;
  }

  /**
   * Gera o preview do workflow
   */
  private generatePreview(
    nodes: FlowiseNode[],
    edges: FlowiseEdge[],
    validation: ValidationResult,
    flowAnalysis: any
  ): WorkflowPreview {
    
    const previewNodes: PreviewNode[] = nodes.map(node => {
      const nodeErrors = validation.errors.filter(e => e.nodeId === node.id);
      const nodeWarnings = validation.warnings.filter(w => w.nodeId === node.id);
      
      let status: 'valid' | 'warning' | 'error' = 'valid';
      if (nodeErrors.length > 0) status = 'error';
      else if (nodeWarnings.length > 0) status = 'warning';

      const incomingConnections = edges.filter(e => e.target === node.id).length;
      const outgoingConnections = edges.filter(e => e.source === node.id).length;

      return {
        id: node.id,
        name: node.data.name,
        type: node.data.type,
        category: node.data.category,
        position: node.position,
        status,
        inputs: node.data.inputs || {},
        outputs: node.data.outputs || {},
        connections: {
          incoming: incomingConnections,
          outgoing: outgoingConnections
        },
        executionTime: this.estimateNodeExecutionTime(node),
        cost: this.estimateNodeCost(node)
      };
    });

    const previewEdges: PreviewEdge[] = edges.map(edge => {
      const edgeErrors = validation.errors.filter(e => e.edgeId === edge.id);
      
      let status: 'valid' | 'warning' | 'error' = 'valid';
      if (edgeErrors.length > 0) status = 'error';

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        status,
        dataFlow: this.inferDataFlow(edge, previewNodes)
      };
    });

    const flowPaths: FlowPath[] = flowAnalysis.paths.map((path: any, index: number) => ({
      id: `path_${index}`,
      nodes: path.nodes,
      edges: path.edges,
      type: index === 0 ? 'main' : 'alternative',
      description: path.description || `Caminho ${index + 1}`,
      executionOrder: index
    }));

    return {
      nodes: previewNodes,
      edges: previewEdges,
      flow: flowPaths,
      metrics: validation.metrics,
      validation
    };
  }

  // Métodos auxiliares

  private buildGraph(nodes: FlowiseNode[], edges: FlowiseEdge[]) {
    const graph: Record<string, string[]> = {};
    
    nodes.forEach(node => {
      graph[node.id] = [];
    });
    
    edges.forEach(edge => {
      if (graph[edge.source]) {
        graph[edge.source].push(edge.target);
      }
    });
    
    return graph;
  }

  private detectCycles(nodes: FlowiseNode[], edges: FlowiseEdge[]): string[][] {
    const graph = this.buildGraph(nodes, edges);
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      currentPath.push(nodeId);

      for (const neighbor of graph[nodeId] || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          // Ciclo detectado
          const cycleStart = currentPath.indexOf(neighbor);
          const cycle = currentPath.slice(cycleStart);
          cycles.push([...cycle, neighbor]);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      currentPath.pop();
      return false;
    };

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });

    return cycles;
  }

  private findAllPaths(graph: Record<string, string[]>): any[] {
    // Implementação simplificada - encontrar todos os caminhos possíveis
    const paths: any[] = [];
    const startNodes = Object.keys(graph).filter(nodeId => {
      return !Object.values(graph).some(targets => targets.includes(nodeId));
    });

    startNodes.forEach(startNode => {
      const findPaths = (currentNode: string, currentPath: string[], visited: Set<string>) => {
        const newPath = [...currentPath, currentNode];
        const newVisited = new Set(visited);
        newVisited.add(currentNode);

        const neighbors = graph[currentNode] || [];
        if (neighbors.length === 0) {
          paths.push({
            nodes: newPath,
            edges: [],
            description: `Caminho de ${startNode} para ${currentNode}`
          });
          return;
        }

        neighbors.forEach(neighbor => {
          if (!newVisited.has(neighbor)) {
            findPaths(neighbor, newPath, newVisited);
          }
        });
      };

      findPaths(startNode, [], new Set());
    });

    return paths;
  }

  private findCriticalPath(paths: any[], nodes: FlowiseNode[]): string[] {
    // Simplificado - retornar o caminho mais longo
    if (paths.length === 0) return [];
    
    let longestPath = paths[0];
    paths.forEach(path => {
      if (path.nodes.length > longestPath.nodes.length) {
        longestPath = path;
      }
    });

    return longestPath.nodes;
  }

  private calculateMaxDepth(graph: Record<string, string[]>): number {
    let maxDepth = 0;
    
    const calculateDepth = (nodeId: string, depth: number, visited: Set<string>): number => {
      if (visited.has(nodeId)) return depth;
      
      visited.add(nodeId);
      maxDepth = Math.max(maxDepth, depth);
      
      const neighbors = graph[nodeId] || [];
      neighbors.forEach(neighbor => {
        calculateDepth(neighbor, depth + 1, visited);
      });
      
      return depth;
    };

    Object.keys(graph).forEach(nodeId => {
      calculateDepth(nodeId, 0, new Set());
    });

    return maxDepth;
  }

  private countParallelPaths(paths: any[]): number {
    // Contar caminhos que podem ser executados em paralelo
    return Math.max(1, Math.floor(paths.length / 2));
  }

  private calculateComplexityScore(nodes: FlowiseNode[], edges: FlowiseEdge[], flowAnalysis: any): number {
    let score = 0;
    
    // Pontuação baseada no número de nós
    score += Math.min(nodes.length * 5, 30);
    
    // Pontuação baseada no número de arestas
    score += Math.min(edges.length * 3, 25);
    
    // Pontuação baseada na profundidade
    score += Math.min(flowAnalysis.maxDepth * 10, 20);
    
    // Pontuação baseada em caminhos paralelos
    score += Math.min(flowAnalysis.parallelPaths * 8, 15);
    
    // Pontuação baseada em categorias complexas
    const complexCategories = ['LLM', 'Agent', 'Tools'];
    const complexNodes = nodes.filter(n => complexCategories.includes(n.data.category));
    score += Math.min(complexNodes.length * 7, 10);
    
    return Math.min(score, 100);
  }

  private calculateValidationScore(errors: ValidationError[], warnings: ValidationWarning[], metrics: WorkflowMetrics): number {
    let score = 100;
    
    // Deduções por erros
    score -= errors.length * 20;
    
    // Deduções por warnings
    score -= warnings.length * 5;
    
    // Deduções por complexidade
    if (metrics.complexityScore > 80) score -= 15;
    else if (metrics.complexityScore > 60) score -= 8;
    
    return Math.max(0, score);
  }

  private estimateExecutionTime(nodes: FlowiseNode[], complexityScore: number): string {
    const baseTime = nodes.length * 0.5; // 0.5s por nó base
    const complexityMultiplier = 1 + (complexityScore / 100);
    const estimatedTime = baseTime * complexityMultiplier;
    
    if (estimatedTime < 2) return '< 2 segundos';
    if (estimatedTime < 10) return `${Math.round(estimatedTime)} segundos`;
    if (estimatedTime < 60) return `${Math.round(estimatedTime / 10) * 10} segundos`;
    return `${Math.round(estimatedTime / 60)} minutos`;
  }

  private estimateMemoryUsage(nodes: FlowiseNode[], complexityScore: number): 'low' | 'medium' | 'high' {
    const memoryIntensiveNodes = nodes.filter(n => 
      ['Memory', 'Document Stores', 'Embeddings'].includes(n.data.category)
    ).length;
    
    const memoryScore = memoryIntensiveNodes * 20 + complexityScore * 0.3;
    
    if (memoryScore < 30) return 'low';
    if (memoryScore < 70) return 'medium';
    return 'high';
  }

  private estimateCost(nodes: FlowiseNode[], complexityScore: number): 'low' | 'medium' | 'high' {
    const highCostNodes = nodes.filter(n => {
      const inputs = n.data.inputs || {};
      return inputs.modelName?.includes('gpt-4') || 
             inputs.llmModel?.includes('gpt-4');
    }).length;
    
    const costScore = highCostNodes * 25 + complexityScore * 0.2;
    
    if (costScore < 30) return 'low';
    if (costScore < 70) return 'medium';
    return 'high';
  }

  private analyzePerformance(nodes: FlowiseNode[], edges: FlowiseEdge[]) {
    // Análise simplificada de performance
    return {
      bottlenecks: this.identifyBottlenecks(nodes, edges),
      hotPaths: this.identifyHotPaths(nodes, edges)
    };
  }

  private analyzeCosts(nodes: FlowiseNode[]) {
    // Análise simplificada de custos
    return {
      estimatedMonthlyCost: this.estimateMonthlyCost(nodes),
      costBreakdown: this.getCostBreakdown(nodes)
    };
  }

  private identifyBottlenecks(nodes: FlowiseNode[], edges: FlowiseEdge[]): string[] {
    // Identificar nós que podem ser gargalos
    const bottlenecks: string[] = [];
    
    nodes.forEach(node => {
      const outgoingConnections = edges.filter(e => e.source === node.id).length;
      const incomingConnections = edges.filter(e => e.target === node.id).length;
      
      // Nós com muitas saídas podem ser gargalos
      if (outgoingConnections > 3) {
        bottlenecks.push(node.id);
      }
      
      // Nós de categoria específica podem ser gargalos
      if (['LLM', 'Agent', 'Document Stores'].includes(node.data.category)) {
        bottlenecks.push(node.id);
      }
    });
    
    return bottlenecks;
  }

  private identifyHotPaths(nodes: FlowiseNode[], edges: FlowiseEdge[]): string[][] {
    // Identificar caminhos mais utilizados (simplificado)
    return [];
  }

  private estimateMonthlyCost(nodes: FlowiseNode[]): string {
    const gpt4Nodes = nodes.filter(n => {
      const inputs = n.data.inputs || {};
      return inputs.modelName?.includes('gpt-4') || inputs.llmModel?.includes('gpt-4');
    }).length;
    
    const estimatedCost = gpt4Nodes * 50; // $50 por nó GPT-4 por mês
    
    if (estimatedCost < 50) return '< $50';
    if (estimatedCost < 200) return '$50 - $200';
    return '> $200';
  }

  private getCostBreakdown(nodes: FlowiseNode[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    nodes.forEach(node => {
      const category = node.data.category;
      breakdown[category] = (breakdown[category] || 0) + 1;
    });
    
    return breakdown;
  }

  private estimateNodeExecutionTime(node: FlowiseNode): string {
    const category = node.data.category;
    
    switch (category) {
      case 'Chat Models':
      case 'LLM':
        return '1-3s';
      case 'Document Stores':
      case 'Retrievers':
        return '0.5-2s';
      case 'Memory':
        return '< 0.1s';
      default:
        return '< 0.5s';
    }
  }

  private estimateNodeCost(node: FlowiseNode): string {
    const inputs = node.data.inputs || {};
    const modelName = inputs.modelName || inputs.llmModel;
    
    if (modelName?.includes('gpt-4')) return '$$$';
    if (modelName?.includes('gpt-3.5')) return '$$';
    return '$';
  }

  private inferDataFlow(edge: FlowiseEdge, nodes: PreviewNode[]): string {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      return `${sourceNode.category} → ${targetNode.category}`;
    }
    
    return 'data flow';
  }

  /**
   * Static method for simple workflow validation (backward compatibility)
   */
  static validateWorkflow(nodes: any[], edges: any[]): ValidationResult {
    const validator = new WorkflowValidator();
    
    // Convert nodes to FlowiseNode format if needed
    const flowiseNodes: FlowiseNode[] = nodes.map(node => {
      // Ensure node has all required properties
      const nodeId = node.id || `node-${Date.now()}-${Math.random()}`;
      const nodeType = node.type || node.data?.type || 'unknown';
      const nodeName = node.data?.label || node.data?.name || node.name || 'Unknown Node';
      const nodeCategory = node.data?.category || node.category || 'Unknown';
      
      return {
        id: nodeId,
        type: nodeType,
        position: node.position || { x: 0, y: 0 },
        data: {
          id: nodeId,
          label: nodeName,
          name: nodeName,
          type: nodeType,
          category: nodeCategory,
          description: node.data?.description || '',
          baseClasses: node.data?.baseClasses || [],
          inputs: node.data?.inputs || {},
          inputParams: node.data?.inputParams || [],
          outputs: node.data?.outputs || {},
          selected: node.data?.selected || false
        }
      };
    });

    // Convert edges to FlowiseEdge format if needed
    const flowiseEdges: FlowiseEdge[] = edges.map(edge => ({
      id: edge.id || `edge-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || 'source',
      targetHandle: edge.targetHandle || 'target'
    }));

    // Perform basic validation
    const structureValidation = validator['validateStructure'](flowiseNodes, flowiseEdges);
    const nodeValidation = validator['validateNodeConfigurations'](flowiseNodes);
    const metrics = validator['calculateMetrics'](flowiseNodes, flowiseEdges, validator['analyzeFlow'](flowiseNodes, flowiseEdges));
    const suggestions = validator['generateOptimizationSuggestions'](flowiseNodes, flowiseEdges, metrics);

    // Combine results
    const errors = [...structureValidation.errors, ...nodeValidation.errors];
    const warnings = [...structureValidation.warnings, ...nodeValidation.warnings];

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score: validator['calculateValidationScore'](errors, warnings, metrics),
      metrics
    };
  }
}

// Exportar instância única do serviço
export const workflowValidator = new WorkflowValidator();
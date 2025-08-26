/**
 * Funções utilitárias para cálculos e análises de workflow
 */

export const calculateComplexityScore = (nodes: any[], edges: any[]): number => {
  let score = 0;
  
  // Base score for nodes
  score += nodes.length * 5;
  
  // Complexity by node type
  const typeWeights: {[key: string]: number} = {
    'Agent': 15,
    'LLM': 10,
    'Condition': 8,
    'Loop': 12,
    'Tool': 6,
    'Document': 4,
    'Memory': 3,
    'API': 8,
    'Start': 1
  };
  
  nodes.forEach(node => {
    score += typeWeights[node.data?.type] || 5;
  });
  
  // Edge complexity
  score += edges.length * 3;
  
  // Depth complexity
  const maxDepth = calculateMaxDepth(nodes, edges);
  score += maxDepth * 10;
  
  return Math.min(100, Math.round(score));
};

const calculateMaxDepth = (nodes: any[], edges: any[]): number => {
  // Simple depth calculation based on node positions
  const yPositions = nodes.map(n => n.position?.y || 0);
  const minY = Math.min(...yPositions);
  const maxY = Math.max(...yPositions);
  return Math.round((maxY - minY) / 100) + 1;
};

export const identifyBottlenecks = (nodes: any[], edges: any[]): string[] => {
  const bottlenecks: string[] = [];
  
  // Find nodes with many connections
  const connectionCount: {[key: string]: number} = {};
  edges.forEach(edge => {
    connectionCount[edge.source] = (connectionCount[edge.source] || 0) + 1;
    connectionCount[edge.target] = (connectionCount[edge.target] || 0) + 1;
  });
  
  // Define thresholds based on node type
  const getConnectionThreshold = (node: any): number => {
    const nodeType = node.data?.type || '';
    const nodeCategory = node.data?.category || '';
    
    // Vector stores and databases can handle more connections
    if (nodeType.includes('VectorStore') || 
        nodeType.includes('Pinecone') ||
        nodeType.includes('Database') ||
        nodeCategory.includes('Vector') ||
        nodeCategory.includes('Document')) {
      return 6; // Allow up to 6 connections for data storage nodes
    }
    
    // Memory and document nodes can have more connections
    if (nodeType.includes('Memory') || 
        nodeType.includes('Document') ||
        nodeType.includes('Retriever')) {
      return 5; // Allow up to 5 connections
    }
    
    // LLM and Agent nodes typically have fewer connections
    if (nodeType.includes('LLM') || 
        nodeType.includes('Agent') ||
        nodeType.includes('Chat')) {
      return 4; // Allow up to 4 connections
    }
    
    // Default threshold for other nodes
    return 3;
  };
  
  Object.entries(connectionCount).forEach(([nodeId, count]) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const threshold = getConnectionThreshold(node);
      if (count > threshold) {
        bottlenecks.push(`${node.data?.label || nodeId} tem muitas conexões (${count}, limite: ${threshold})`);
      }
    }
  });
  
  return bottlenecks;
};

export const generateOptimizationSuggestions = (nodes: any[], edges: any[]): string[] => {
  const suggestions: string[] = [];
  
  // Check for complex chains
  if (edges.length > nodes.length * 1.5) {
    suggestions.push('Considere simplificar o fluxo removendo conexões desnecessárias');
  }
  
  // Check for isolated nodes
  const connectedNodes = new Set();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  
  const isolatedCount = nodes.length - connectedNodes.size;
  if (isolatedCount > 0) {
    suggestions.push(`${isolatedCount} nó(s) isolado(s) podem ser removidos ou conectados`);
  }
  
  return suggestions;
};

export const estimateExecutionTime = (nodes: any[], edges: any[]): string => {
  const complexityScore = calculateComplexityScore(nodes, edges);
  
  if (complexityScore < 20) return '< 1s';
  if (complexityScore < 40) return '1-5s';
  if (complexityScore < 60) return '5-15s';
  if (complexityScore < 80) return '15-30s';
  return '> 30s';
};

export const estimateMemoryUsage = (nodes: any[]): string => {
  const memoryIntensiveNodes = nodes.filter(n => 
    n.data?.type === 'Memory' || 
    n.data?.type === 'Document' || 
    n.data?.type === 'VectorStore'
  );
  
  if (memoryIntensiveNodes.length === 0) return 'Baixo';
  if (memoryIntensiveNodes.length <= 2) return 'Médio';
  return 'Alto';
};

export const calculateParallelizationPotential = (nodes: any[], edges: any[]): number => {
  // Simple heuristic based on independent branches
  let potential = 0;
  
  // Count independent branches (nodes that could run in parallel)
  const branchNodes = nodes.filter(n => 
    n.data?.type === 'LLM' || 
    n.data?.type === 'Agent' || 
    n.data?.type === 'Tool'
  );
  
  potential = Math.min(100, branchNodes.length * 20);
  return potential;
};

export const validateWorkflowStructure = (nodes: any[], edges: any[]): any => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for disconnected nodes
  const connectedNodes = new Set();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  
  nodes.forEach(node => {
    if (!connectedNodes.has(node.id) && !isStartNode(node)) {
      warnings.push(`Nó "${node.data?.label}" está desconectado`);
    }
  });
  
  // Check for missing start node
  const hasStartNode = nodes.some(node => isStartNode(node));
  if (!hasStartNode) {
    // Detectar tipo de workflow baseado nos nós presentes
    const hasAgentNodes = nodes.some(n => 
      n.data?.category === 'Agent Flow' ||
      n.data?.type?.toLowerCase().includes('agent') ||
      n.data?.name?.toLowerCase().includes('agent')
    );
    
    // Para Chatflows, não exigir nó de início se houver nós de entrada válidos
    const hasValidInputNodes = nodes.some(n => isValidInputNode(n));
    
    if (hasAgentNodes) {
      errors.push('Agentflow não tem nó de início. Adicione um nó "Start" do tipo Agentflow.');
    } else if (!hasValidInputNodes) {
      // Apenas mostrar erro para Chatflows se não houver nós de entrada válidos
      errors.push('Workflow não tem nó de início. Adicione um nó "Start", "ChatInput", "TextInput" ou similar.');
    }
  }
  
  // Check for circular dependencies
  if (hasCircularDependencies(nodes, edges)) {
    errors.push('Workflow tem dependências circulares');
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
};

// Função auxiliar para identificar nós de início
const isStartNode = (node: any): boolean => {
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
};

/**
 * Identifica se um nó é um nó de entrada válido para Chatflows
 */
const isValidInputNode = (node: any): boolean => {
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
};

const hasCircularDependencies = (nodes: any[], edges: any[]): boolean => {
  // Simple circular dependency detection
  // This is a basic implementation - in practice, you'd want a more robust algorithm
  return false;
};
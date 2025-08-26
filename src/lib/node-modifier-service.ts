/**
 * Serviço para modificação de diferentes tipos de nós dentro do contexto
 * Permite alterar parâmetros de nós Flowise de forma dinâmica e inteligente
 */

import { FlowiseNode, FlowiseEdge } from './agent-to-flowise-transformer';

export interface NodeModification {
  nodeId: string;
  modifications: {
    [key: string]: any;
  };
  reason?: string;
}

export interface NodeModificationContext {
  workflowType: 'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT';
  agentCapabilities: string[];
  businessRules?: any;
  userPreferences?: any;
  performanceMetrics?: any;
}

export interface ModificationResult {
  success: boolean;
  modifiedNodes: string[];
  changes: { [nodeId: string]: { [key: string]: { old: any; new: any } } };
  warnings?: string[];
  validationErrors?: string[];
}

export class NodeModifierService {
  
  /**
   * Modifica nós dentro de um workflow baseado no contexto e regras de negócio
   */
  async modifyNodes(
    nodes: FlowiseNode[],
    edges: FlowiseEdge[],
    modifications: NodeModification[],
    context: NodeModificationContext
  ): Promise<{ nodes: FlowiseNode[]; result: ModificationResult }> {
    console.log('🔧 Iniciando modificação de nós:', {
      nodeCount: nodes.length,
      modificationsCount: modifications.length,
      context
    });

    const result: ModificationResult = {
      success: true,
      modifiedNodes: [],
      changes: {}
    };

    const modifiedNodes = [...nodes];

    try {
      for (const modification of modifications) {
        const nodeIndex = modifiedNodes.findIndex(n => n.id === modification.nodeId);
        
        if (nodeIndex === -1) {
          console.warn(`⚠️ Nó não encontrado: ${modification.nodeId}`);
          continue;
        }

        const node = modifiedNodes[nodeIndex];
        const nodeChanges: { [key: string]: { old: any; new: any } } = {};

        console.log(`📝 Modificando nó ${node.id} (${node.data.name}):`, modification.modifications);

        // Aplicar modificações baseadas no tipo de nó
        const modificationResult = await this.applyNodeModifications(
          node,
          modification.modifications,
          context
        );

        if (modificationResult.success) {
          modifiedNodes[nodeIndex] = modificationResult.modifiedNode;
          
          // Registrar mudanças
          Object.keys(modificationResult.changes).forEach(key => {
            nodeChanges[key] = modificationResult.changes[key];
          });

          result.modifiedNodes.push(node.id);
          result.changes[node.id] = nodeChanges;

          console.log(`✅ Nó ${node.id} modificado com sucesso`);
        } else {
          result.success = false;
          result.validationErrors = modificationResult.errors || [];
          console.error(`❌ Falha ao modificar nó ${node.id}:`, result.validationErrors);
          break; // Parar no primeiro erro
        }
      }

      // Validar o workflow após modificações
      if (result.success) {
        const validationResult = await this.validateWorkflow(modifiedNodes, edges, context);
        
        if (!validationResult.valid) {
          result.success = false;
          result.validationErrors = validationResult.errors;
          console.error('❌ Validação do workflow falhou após modificações:', validationResult.errors);
        } else {
          console.log('✅ Workflow validado com sucesso após modificações');
        }
      }

      return { nodes: modifiedNodes, result };

    } catch (error) {
      console.error('❌ Erro durante modificação de nós:', error);
      return {
        nodes,
        result: {
          success: false,
          modifiedNodes: [],
          changes: {},
          validationErrors: [error instanceof Error ? error.message : 'Erro desconhecido']
        }
      };
    }
  }

  /**
   * Aplica modificações específicas para um nó baseado em seu tipo
   */
  private async applyNodeModifications(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    context: NodeModificationContext
  ): Promise<{ success: boolean; modifiedNode: FlowiseNode; changes: { [key: string]: { old: any; new: any } }; errors?: string[] }> {
    
    const changes: { [key: string]: { old: any; new: any } } = {};
    const modifiedNode = { ...node };
    const errors: string[] = [];

    try {
      // Modificações baseadas no tipo de nó
      switch (node.data.category) {
        case 'Chat Models':
          return this.modifyChatModelNode(modifiedNode, modifications, changes, context);
          
        case 'LLM':
          return this.modifyLLMNode(modifiedNode, modifications, changes, context);
          
        case 'Prompts':
          return this.modifyPromptNode(modifiedNode, modifications, changes, context);
          
        case 'Memory':
          return this.modifyMemoryNode(modifiedNode, modifications, changes, context);
          
        case 'Tools':
          return this.modifyToolNode(modifiedNode, modifications, changes, context);
          
        case 'Document Stores':
          return this.modifyDocumentStoreNode(modifiedNode, modifications, changes, context);
          
        case 'Embeddings':
          return this.modifyEmbeddingNode(modifiedNode, modifications, changes, context);
          
        case 'Text Splitters':
          return this.modifyTextSplitterNode(modifiedNode, modifications, changes, context);
          
        case 'Retrievers':
          return this.modifyRetrieverNode(modifiedNode, modifications, changes, context);
          
        default:
          // Modificação genérica para outros tipos de nós
          return this.modifyGenericNode(modifiedNode, modifications, changes, context);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
      return { success: false, modifiedNode, changes, errors };
    }
  }

  /**
   * Modifica nós do tipo Chat Model (ChatOpenAI, etc.)
   */
  private modifyChatModelNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('🤖 Modificando nó Chat Model:', node.data.name);

    // Modificação de modelo
    if (modifications.modelName && modifications.modelName !== node.data.inputs.modelName) {
      changes.modelName = {
        old: node.data.inputs.modelName,
        new: modifications.modelName
      };
      node.data.inputs.modelName = modifications.modelName;
    }

    // Modificação de temperatura
    if (modifications.temperature !== undefined && modifications.temperature !== node.data.inputs.temperature) {
      changes.temperature = {
        old: node.data.inputs.temperature,
        new: modifications.temperature
      };
      node.data.inputs.temperature = modifications.temperature;
    }

    // Modificação de maxTokens
    if (modifications.maxTokens !== undefined && modifications.maxTokens !== node.data.inputs.maxTokens) {
      changes.maxTokens = {
        old: node.data.inputs.maxTokens,
        new: modifications.maxTokens
      };
      node.data.inputs.maxTokens = modifications.maxTokens;
    }

    // Modificação de streaming
    if (modifications.streaming !== undefined && modifications.streaming !== node.data.inputs.streaming) {
      changes.streaming = {
        old: node.data.inputs.streaming,
        new: modifications.streaming
      };
      node.data.inputs.streaming = modifications.streaming;
    }

    // Modificação de allowImageUploads
    if (modifications.allowImageUploads !== undefined && modifications.allowImageUploads !== node.data.inputs.allowImageUploads) {
      changes.allowImageUploads = {
        old: node.data.inputs.allowImageUploads,
        new: modifications.allowImageUploads
      };
      node.data.inputs.allowImageUploads = modifications.allowImageUploads;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modifica nós do tipo LLM
   */
  private modifyLLMNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('🧠 Modificando nó LLM:', node.data.name);

    // Modificação de modelo
    if (modifications.model && modifications.model !== node.data.inputs.llmModel) {
      changes.model = {
        old: node.data.inputs.llmModel,
        new: modifications.model
      };
      node.data.inputs.llmModel = modifications.model;
    }

    // Modificação de mensagens
    if (modifications.messages && modifications.messages !== node.data.inputs.llmMessages) {
      changes.messages = {
        old: node.data.inputs.llmMessages,
        new: modifications.messages
      };
      node.data.inputs.llmMessages = modifications.messages;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modifica nós do tipo Prompt
   */
  private modifyPromptNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('📝 Modificando nó Prompt:', node.data.name);

    // Modificação de template
    if (modifications.template && modifications.template !== node.data.inputs.template) {
      changes.template = {
        old: node.data.inputs.template,
        new: modifications.template
      };
      node.data.inputs.template = modifications.template;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modifica nós do tipo Memory
   */
  private modifyMemoryNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('🧠 Modificando nó Memory:', node.data.name);

    // Modificação de tipo de memória
    if (modifications.memoryType && modifications.memoryType !== node.data.inputs.memoryType) {
      changes.memoryType = {
        old: node.data.inputs.memoryType,
        new: modifications.memoryType
      };
      node.data.inputs.memoryType = modifications.memoryType;
    }

    // Modificação de tamanho do buffer
    if (modifications.bufferSize !== undefined && modifications.bufferSize !== node.data.inputs.bufferSize) {
      changes.bufferSize = {
        old: node.data.inputs.bufferSize,
        new: modifications.bufferSize
      };
      node.data.inputs.bufferSize = modifications.bufferSize;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modifica nós do tipo Tools
   */
  private modifyToolNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('🔧 Modificando nó Tool:', node.data.name);

    // Modificação de ferramenta selecionada
    if (modifications.tool && modifications.tool !== node.data.inputs.toolAgentflowSelectedTool) {
      changes.tool = {
        old: node.data.inputs.toolAgentflowSelectedTool,
        new: modifications.tool
      };
      node.data.inputs.toolAgentflowSelectedTool = modifications.tool;
    }

    // Modificação de argumentos
    if (modifications.toolInputArgs && modifications.toolInputArgs !== node.data.inputs.toolInputArgs) {
      changes.toolInputArgs = {
        old: node.data.inputs.toolInputArgs,
        new: modifications.toolInputArgs
      };
      node.data.inputs.toolInputArgs = modifications.toolInputArgs;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modifica nós do tipo Document Store
   */
  private modifyDocumentStoreNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('📚 Modificando nó Document Store:', node.data.name);

    // Modificação de store selecionado
    if (modifications.documentStore && modifications.documentStore !== node.data.inputs.documentStore) {
      changes.documentStore = {
        old: node.data.inputs.documentStore,
        new: modifications.documentStore
      };
      node.data.inputs.documentStore = modifications.documentStore;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modifica nós do tipo Embeddings
   */
  private modifyEmbeddingNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('🔤 Modificando nó Embeddings:', node.data.name);

    // Modificação de modelo de embedding
    if (modifications.embeddingsModel && modifications.embeddingsModel !== node.data.inputs.embeddingsModel) {
      changes.embeddingsModel = {
        old: node.data.inputs.embeddingsModel,
        new: modifications.embeddingsModel
      };
      node.data.inputs.embeddingsModel = modifications.embeddingsModel;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modifica nós do tipo Text Splitter
   */
  private modifyTextSplitterNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('✂️ Modificando nó Text Splitter:', node.data.name);

    // Modificação de chunk size
    if (modifications.chunkSize !== undefined && modifications.chunkSize !== node.data.inputs.chunkSize) {
      changes.chunkSize = {
        old: node.data.inputs.chunkSize,
        new: modifications.chunkSize
      };
      node.data.inputs.chunkSize = modifications.chunkSize;
    }

    // Modificação de chunk overlap
    if (modifications.chunkOverlap !== undefined && modifications.chunkOverlap !== node.data.inputs.chunkOverlap) {
      changes.chunkOverlap = {
        old: node.data.inputs.chunkOverlap,
        new: modifications.chunkOverlap
      };
      node.data.inputs.chunkOverlap = modifications.chunkOverlap;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modifica nós do tipo Retriever
   */
  private modifyRetrieverNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('🔍 Modificando nó Retriever:', node.data.name);

    // Modificação de knowledge stores
    if (modifications.knowledgeDocumentStores && modifications.knowledgeDocumentStores !== node.data.inputs.retrieverKnowledgeDocumentStores) {
      changes.knowledgeDocumentStores = {
        old: node.data.inputs.retrieverKnowledgeDocumentStores,
        new: modifications.knowledgeDocumentStores
      };
      node.data.inputs.retrieverKnowledgeDocumentStores = modifications.knowledgeDocumentStores;
    }

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Modificação genérica para outros tipos de nós
   */
  private modifyGenericNode(
    node: FlowiseNode,
    modifications: { [key: string]: any },
    changes: { [key: string]: { old: any; new: any } },
    context: NodeModificationContext
  ) {
    console.log('🔧 Modificando nó genérico:', node.data.name);

    // Aplicar modificações genéricas nos inputs
    Object.keys(modifications).forEach(key => {
      if (node.data.inputs[key] !== undefined && modifications[key] !== node.data.inputs[key]) {
        changes[key] = {
          old: node.data.inputs[key],
          new: modifications[key]
        };
        node.data.inputs[key] = modifications[key];
      }
    });

    return { success: true, modifiedNode: node, changes };
  }

  /**
   * Valida o workflow após modificações
   */
  private async validateWorkflow(
    nodes: FlowiseNode[],
    edges: FlowiseEdge[],
    context: NodeModificationContext
  ): Promise<{ valid: boolean; errors: string[] }> {
    
    const errors: string[] = [];

    try {
      // Validar conexões
      const nodeIds = new Set(nodes.map(n => n.id));
      
      for (const edge of edges) {
        if (!nodeIds.has(edge.source)) {
          errors.push(`Nó de origem não encontrado: ${edge.source}`);
        }
        if (!nodeIds.has(edge.target)) {
          errors.push(`Nó de destino não encontrado: ${edge.target}`);
        }
      }

      // Validar nós críticos baseados no tipo de workflow
      if (context.workflowType === 'CHATFLOW') {
        const hasChatModel = nodes.some(n => n.data.category === 'Chat Models');
        if (!hasChatModel) {
          errors.push('Chatflow deve conter pelo menos um nó de Chat Model');
        }
      }

      if (context.workflowType === 'AGENTFLOW') {
        const hasLLM = nodes.some(n => n.data.category === 'LLM' || n.data.category === 'Chat Models');
        if (!hasLLM) {
          errors.push('Agentflow deve conter pelo menos um nó LLM');
        }
      }

      // Validar configurações de nós específicos
      for (const node of nodes) {
        if (node.data.category === 'Chat Models') {
          if (!node.data.inputs.modelName) {
            errors.push(`Nó ${node.id} (${node.data.name}) não tem modelo configurado`);
          }
        }
      }

      console.log('🔍 Validação do workflow:', {
        valid: errors.length === 0,
        errorsCount: errors.length,
        nodesCount: nodes.length,
        edgesCount: edges.length
      });

      return { valid: errors.length === 0, errors };

    } catch (error) {
      errors.push(`Erro durante validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { valid: false, errors };
    }
  }

  /**
   * Gera sugestões de modificação baseadas no contexto
   */
  async generateModificationSuggestions(
    nodes: FlowiseNode[],
    context: NodeModificationContext
  ): Promise<NodeModification[]> {
    
    const suggestions: NodeModification[] = [];

    try {
      // Analisar cada nó e gerar sugestões
      for (const node of nodes) {
        const nodeSuggestions = await this.analyzeNodeForSuggestions(node, context);
        suggestions.push(...nodeSuggestions);
      }

      console.log('💡 Sugestões de modificação geradas:', suggestions.length);

      return suggestions;

    } catch (error) {
      console.error('❌ Erro ao gerar sugestões:', error);
      return [];
    }
  }

  /**
   * Analisa um nó específico para gerar sugestões
   */
  private async analyzeNodeForSuggestions(
    node: FlowiseNode,
    context: NodeModificationContext
  ): Promise<NodeModification[]> {
    
    const suggestions: NodeModification[] = [];

    // Sugestões para nós de Chat Model
    if (node.data.category === 'Chat Models') {
      const currentModel = node.data.inputs.modelName;
      
      // Sugerir upgrade de modelo se for um modelo mais antigo
      if (currentModel === 'gpt-3.5-turbo' && context.agentCapabilities.includes('advanced_reasoning')) {
        suggestions.push({
          nodeId: node.id,
          modifications: {
            modelName: 'gpt-4'
          },
          reason: 'Upgrade para modelo mais avançado suportado pelas capacidades do agente'
        });
      }

      // Sugerir ajuste de temperatura baseado no tipo de workflow
      if (context.workflowType === 'AGENTFLOW' && node.data.inputs.temperature === 0.7) {
        suggestions.push({
          nodeId: node.id,
          modifications: {
            temperature: 0.1
          },
          reason: 'Temperatura mais baixa para AgentFlow para respostas mais consistentes'
        });
      }
    }

    // Sugestões para nós de Memory
    if (node.data.category === 'Memory') {
      if (context.agentCapabilities.includes('long_term_memory')) {
        suggestions.push({
          nodeId: node.id,
          modifications: {
            bufferSize: 50
          },
          reason: 'Aumentar buffer de memória para suportar memória de longo prazo'
        });
      }
    }

    return suggestions;
  }
}

// Exportar instância única do serviço
export const nodeModifierService = new NodeModifierService();
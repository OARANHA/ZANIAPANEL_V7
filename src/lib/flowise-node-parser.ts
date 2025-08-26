/**
 * Serviço para parsear nós do Flowise e extrair propriedades editáveis
 * Baseado na análise do código fonte do Flowise
 */

import flowiseCatalog from '../../catalog.flowise.nodes.json';

export interface FlowiseNodeInput {
  label: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'multiOptions' | 'asyncOptions' | 'array' | 'json' | 'credential' | 'file' | 'code' | 'tabs';
  description?: string;
  optional?: boolean;
  default?: any;
  options?: Array<{ label: string; name: string; description?: string }>;
  loadMethod?: string;
  loadConfig?: boolean;
  acceptVariable?: boolean;
  rows?: number;
  step?: number;
  min?: number;
  max?: number;
  show?: Record<string, any>;
  additionalParams?: boolean;
}

export interface FlowiseNodeDefinition {
  categoria: string;
  label: string;
  desc: string;
  path: string;
  inputs: string;
  outputs: string;
  parsedInputs?: FlowiseNodeInput[];
}

class FlowiseNodeParser {
  private catalog: FlowiseNodeDefinition[] = [];

  constructor() {
    this.catalog = flowiseCatalog as FlowiseNodeDefinition[];
  }

  /**
   * Busca um nó no catálogo por tipo/label
   */
  findNodeByType(nodeType: string): FlowiseNodeDefinition | null {
    return this.catalog.find(node => 
      node.label === nodeType || 
      node.label.toLowerCase() === nodeType.toLowerCase()
    ) || null;
  }

  /**
   * Parse a string de inputs do catálogo para objetos utilizáveis
   */
  parseInputsString(inputsString: string): FlowiseNodeInput[] {
    if (!inputsString) return [];

    try {
      // A string de inputs é um objeto JS literal, não JSON válido
      // Precisamos fazer um parse manual seguro
      
      // Remove espaços e quebras de linha desnecessárias
      const cleanString = inputsString
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Extrai inputs individuais baseado em padrões comuns
      const inputs: FlowiseNodeInput[] = [];
      
      // Pattern para encontrar inputs básicos
      const inputPattern = /\{\s*label:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]\s*,\s*type:\s*['"]([^'"]+)['"]([^}]*)\}/g;
      
      let match;
      while ((match = inputPattern.exec(cleanString)) !== null) {
        const [, label, name, type, additionalProps] = match;
        
        const input: FlowiseNodeInput = {
          label,
          name,
          type: type as FlowiseNodeInput['type']
        };

        // Parse propriedades adicionais
        if (additionalProps) {
          // Parse step
          const stepMatch = additionalProps.match(/step:\s*([0-9.]+)/);
          if (stepMatch) {
            input.step = parseFloat(stepMatch[1]);
          }

          // Parse default
          const defaultMatch = additionalProps.match(/default:\s*([^,}]+)/);
          if (defaultMatch) {
            const defaultValue = defaultMatch[1].replace(/['"]/g, '').trim();
            input.default = isNaN(Number(defaultValue)) ? defaultValue : Number(defaultValue);
          }

          // Parse optional
          if (additionalProps.includes('optional: true')) {
            input.optional = true;
          }

          // Parse acceptVariable
          if (additionalProps.includes('acceptVariable: true')) {
            input.acceptVariable = true;
          }

          // Parse loadMethod
          const loadMethodMatch = additionalProps.match(/loadMethod:\s*['"]([^'"]+)['"]/);
          if (loadMethodMatch) {
            input.loadMethod = loadMethodMatch[1];
          }

          // Parse loadConfig
          if (additionalProps.includes('loadConfig: true')) {
            input.loadConfig = true;
          }

          // Parse rows
          const rowsMatch = additionalProps.match(/rows:\s*(\d+)/);
          if (rowsMatch) {
            input.rows = parseInt(rowsMatch[1]);
          }
        }

        inputs.push(input);
      }

      return inputs;
    } catch (error) {
      console.error('Erro ao parsear inputs do nó:', error);
      return [];
    }
  }

  /**
   * Obtém inputs parseados para um tipo de nó específico
   */
  getNodeInputs(nodeType: string): FlowiseNodeInput[] {
    const nodeDefinition = this.findNodeByType(nodeType);
    if (!nodeDefinition) return [];

    // Cache dos inputs parseados
    if (nodeDefinition.parsedInputs) {
      return nodeDefinition.parsedInputs;
    }

    const parsedInputs = this.parseInputsString(nodeDefinition.inputs);
    nodeDefinition.parsedInputs = parsedInputs;
    
    return parsedInputs;
  }

  /**
   * Obtém inputs editáveis principais (excluindo parâmetros adicionais)
   */
  getEditableInputs(nodeType: string): FlowiseNodeInput[] {
    return this.getNodeInputs(nodeType).filter(input => 
      !input.additionalParams && 
      input.type !== 'credential' // Credenciais são tratadas separadamente
    );
  }

  /**
   * Verifica se um nó suporta edição de modelo
   */
  hasModelSelection(nodeType: string): boolean {
    const inputs = this.getNodeInputs(nodeType);
    return inputs.some(input => 
      input.name.includes('model') || 
      input.name.includes('Model') ||
      input.loadMethod === 'listModels'
    );
  }

  /**
   * Obtém configurações específicas para modelo
   */
  getModelConfig(nodeType: string): FlowiseNodeInput | null {
    const inputs = this.getNodeInputs(nodeType);
    return inputs.find(input => 
      input.name.includes('model') || 
      input.name.includes('Model') ||
      input.loadMethod === 'listModels'
    ) || null;
  }

  /**
   * Lista todos os tipos de nós disponíveis
   */
  getAllNodeTypes(): string[] {
    return this.catalog.map(node => node.label);
  }

  /**
   * Obtém informações básicas do nó
   */
  getNodeInfo(nodeType: string): { label: string; description: string; category: string } | null {
    const node = this.findNodeByType(nodeType);
    if (!node) return null;

    return {
      label: node.label,
      description: node.desc,
      category: node.categoria
    };
  }
}

// Exportar instância singleton
export const flowiseNodeParser = new FlowiseNodeParser();

// Exportar classe para testes
export { FlowiseNodeParser };
/**
 * Serviço para gerenciamento de modelos LLM como nós configuráveis
 * Fornece listagem, configuração e otimização de modelos de linguagem
 */

export interface LLMModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'cohere' | 'local';
  model: string;
  category: 'chat' | 'completion' | 'embedding' | 'function-calling';
  capabilities: string[];
  parameters: LLMModelParameter[];
  pricing: {
    input: number; // por 1K tokens
    output: number; // por 1K tokens
    currency: string;
  };
  performance: {
    speed: 'fast' | 'medium' | 'slow';
    quality: 'low' | 'medium' | 'high';
    contextLength: number;
    supportedLanguages: string[];
  };
  features: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
    jsonMode: boolean;
    parallelProcessing: boolean;
  };
  availability: {
    regions: string[];
    rateLimits: {
      requests: number;
      tokens: number;
    };
  };
}

export interface LLMModelParameter {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  validation?: (value: any) => boolean;
}

export interface LLMNodeConfiguration {
  nodeId: string;
  modelId: string;
  parameters: Record<string, any>;
  optimization: {
    costOptimization: boolean;
    performanceOptimization: boolean;
    qualityOptimization: boolean;
  };
  context: {
    workflowType: string;
    useCase: string;
    expectedLoad: 'low' | 'medium' | 'high';
  };
}

export interface LLMRecommendation {
  modelId: string;
  reason: string;
  confidence: number; // 0-1
  expectedImprovement: {
    cost?: number; // percentage
    performance?: number; // percentage
    quality?: number; // percentage
  };
  configuration: Record<string, any>;
}

export class LLMModelService {
  private models: LLMModel[] = [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      model: 'gpt-4o-mini',
      category: 'chat',
      capabilities: ['reasoning', 'coding', 'multilingual', 'function-calling'],
      parameters: [
        {
          name: 'temperature',
          label: 'Temperature',
          type: 'number',
          description: 'Controla a aleatoriedade das respostas (0-2)',
          required: false,
          defaultValue: 0.7,
          min: 0,
          max: 2,
          step: 0.1
        },
        {
          name: 'maxTokens',
          label: 'Max Tokens',
          type: 'number',
          description: 'Número máximo de tokens na resposta',
          required: false,
          defaultValue: 2048,
          min: 1,
          max: 128000
        },
        {
          name: 'topP',
          label: 'Top P',
          type: 'number',
          description: 'Nucleus sampling (0-1)',
          required: false,
          defaultValue: 1.0,
          min: 0,
          max: 1,
          step: 0.1
        },
        {
          name: 'frequencyPenalty',
          label: 'Frequency Penalty',
          type: 'number',
          description: 'Penalidade por repetição (-2 a 2)',
          required: false,
          defaultValue: 0,
          min: -2,
          max: 2,
          step: 0.1
        },
        {
          name: 'presencePenalty',
          label: 'Presence Penalty',
          type: 'number',
          description: 'Penalidade por presença (-2 a 2)',
          required: false,
          defaultValue: 0,
          min: -2,
          max: 2,
          step: 0.1
        }
      ],
      pricing: {
        input: 0.00015,
        output: 0.0006,
        currency: 'USD'
      },
      performance: {
        speed: 'fast',
        quality: 'high',
        contextLength: 128000,
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru']
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true,
        jsonMode: true,
        parallelProcessing: true
      },
      availability: {
        regions: ['us-east-1', 'us-west-1', 'eu-west-1', 'asia-southeast-1'],
        rateLimits: {
          requests: 10000,
          tokens: 2000000
        }
      }
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      model: 'gpt-4o',
      category: 'chat',
      capabilities: ['advanced-reasoning', 'coding', 'multilingual', 'function-calling', 'vision'],
      parameters: [
        {
          name: 'temperature',
          label: 'Temperature',
          type: 'number',
          description: 'Controla a aleatoriedade das respostas (0-2)',
          required: false,
          defaultValue: 0.7,
          min: 0,
          max: 2,
          step: 0.1
        },
        {
          name: 'maxTokens',
          label: 'Max Tokens',
          type: 'number',
          description: 'Número máximo de tokens na resposta',
          required: false,
          defaultValue: 4096,
          min: 1,
          max: 128000
        },
        {
          name: 'topP',
          label: 'Top P',
          type: 'number',
          description: 'Nucleus sampling (0-1)',
          required: false,
          defaultValue: 1.0,
          min: 0,
          max: 1,
          step: 0.1
        }
      ],
      pricing: {
        input: 0.0025,
        output: 0.01,
        currency: 'USD'
      },
      performance: {
        speed: 'medium',
        quality: 'very-high',
        contextLength: 128000,
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru', 'ar', 'hi']
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true,
        jsonMode: true,
        parallelProcessing: true
      },
      availability: {
        regions: ['us-east-1', 'us-west-1', 'eu-west-1', 'asia-southeast-1'],
        rateLimits: {
          requests: 5000,
          tokens: 1000000
        }
      }
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      category: 'chat',
      capabilities: ['reasoning', 'coding', 'multilingual'],
      parameters: [
        {
          name: 'temperature',
          label: 'Temperature',
          type: 'number',
          description: 'Controla a aleatoriedade das respostas (0-2)',
          required: false,
          defaultValue: 0.7,
          min: 0,
          max: 2,
          step: 0.1
        },
        {
          name: 'maxTokens',
          label: 'Max Tokens',
          type: 'number',
          description: 'Número máximo de tokens na resposta',
          required: false,
          defaultValue: 2048,
          min: 1,
          max: 4096
        }
      ],
      pricing: {
        input: 0.0005,
        output: 0.0015,
        currency: 'USD'
      },
      performance: {
        speed: 'fast',
        quality: 'medium',
        contextLength: 16385,
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt']
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false,
        jsonMode: true,
        parallelProcessing: false
      },
      availability: {
        regions: ['us-east-1', 'us-west-1', 'eu-west-1'],
        rateLimits: {
          requests: 20000,
          tokens: 4000000
        }
      }
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      category: 'chat',
      capabilities: ['reasoning', 'coding', 'multilingual', 'function-calling'],
      parameters: [
        {
          name: 'temperature',
          label: 'Temperature',
          type: 'number',
          description: 'Controla a aleatoriedade das respostas (0-1)',
          required: false,
          defaultValue: 0.5,
          min: 0,
          max: 1,
          step: 0.1
        },
        {
          name: 'maxTokens',
          label: 'Max Tokens',
          type: 'number',
          description: 'Número máximo de tokens na resposta',
          required: false,
          defaultValue: 1024,
          min: 1,
          max: 4096
        }
      ],
      pricing: {
        input: 0.00025,
        output: 0.00125,
        currency: 'USD'
      },
      performance: {
        speed: 'very-fast',
        quality: 'medium',
        contextLength: 200000,
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt']
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true,
        jsonMode: true,
        parallelProcessing: false
      },
      availability: {
        regions: ['us-east-1', 'us-west-2', 'eu-central-1'],
        rateLimits: {
          requests: 10000,
          tokens: 2000000
        }
      }
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      category: 'chat',
      capabilities: ['advanced-reasoning', 'coding', 'multilingual', 'function-calling', 'vision'],
      parameters: [
        {
          name: 'temperature',
          label: 'Temperature',
          type: 'number',
          description: 'Controla a aleatoriedade das respostas (0-1)',
          required: false,
          defaultValue: 0.5,
          min: 0,
          max: 1,
          step: 0.1
        },
        {
          name: 'maxTokens',
          label: 'Max Tokens',
          type: 'number',
          description: 'Número máximo de tokens na resposta',
          required: false,
          defaultValue: 4096,
          min: 1,
          max: 4096
        }
      ],
      pricing: {
        input: 0.003,
        output: 0.015,
        currency: 'USD'
      },
      performance: {
        speed: 'medium',
        quality: 'high',
        contextLength: 200000,
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja']
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true,
        jsonMode: true,
        parallelProcessing: true
      },
      availability: {
        regions: ['us-east-1', 'us-west-2', 'eu-central-1'],
        rateLimits: {
          requests: 5000,
          tokens: 1000000
        }
      }
    }
  ];

  /**
   * Lista todos os modelos LLM disponíveis
   */
  listModels(filters?: {
    provider?: string;
    category?: string;
    capabilities?: string[];
    maxPrice?: number;
  }): LLMModel[] {
    let filteredModels = [...this.models];

    if (filters) {
      if (filters.provider) {
        filteredModels = filteredModels.filter(m => m.provider === filters.provider);
      }

      if (filters.category) {
        filteredModels = filteredModels.filter(m => m.category === filters.category);
      }

      if (filters.capabilities && filters.capabilities.length > 0) {
        filteredModels = filteredModels.filter(m => 
          filters.capabilities!.some(cap => m.capabilities.includes(cap))
        );
      }

      if (filters.maxPrice) {
        filteredModels = filteredModels.filter(m => 
          m.pricing.input <= filters.maxPrice! && m.pricing.output <= filters.maxPrice!
        );
      }
    }

    return filteredModels.sort((a, b) => {
      // Ordenar por popularidade/preço
      const aScore = this.calculateModelScore(a);
      const bScore = this.calculateModelScore(b);
      return bScore - aScore;
    });
  }

  /**
   * Obtém um modelo específico por ID
   */
  getModel(modelId: string): LLMModel | undefined {
    return this.models.find(m => m.id === modelId);
  }

  /**
   * Recomenda modelos baseados no contexto e caso de uso
   */
  recommendModels(context: {
    useCase: string;
    budget: 'low' | 'medium' | 'high';
    performance: 'speed' | 'quality' | 'balanced';
    requiredCapabilities: string[];
    expectedLoad: 'low' | 'medium' | 'high';
    region?: string;
  }): LLMRecommendation[] {
    
    const recommendations: LLMRecommendation[] = [];

    this.models.forEach(model => {
      const score = this.calculateRecommendationScore(model, context);
      
      if (score > 0.3) { // Apenas recomendar se a pontuação for razoável
        const expectedImprovement = this.calculateExpectedImprovement(model, context);
        
        recommendations.push({
          modelId: model.id,
          reason: this.generateRecommendationReason(model, context, score),
          confidence: score,
          expectedImprovement,
          configuration: this.generateOptimalConfiguration(model, context)
        });
      }
    });

    // Ordenar por confiança
    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  /**
   * Gera configuração otimizada para um modelo
   */
  generateOptimalConfiguration(
    model: LLMModel,
    context: {
      useCase: string;
      performance: 'speed' | 'quality' | 'balanced';
      expectedLoad: 'low' | 'medium' | 'high';
    }
  ): Record<string, any> {
    
    const config: Record<string, any> = {};

    model.parameters.forEach(param => {
      switch (param.name) {
        case 'temperature':
          if (context.performance === 'speed') {
            config[param.name] = 0.1; // Mais determinístico
          } else if (context.performance === 'quality') {
            config[param.name] = 0.7; // Mais criativo
          } else {
            config[param.name] = param.defaultValue;
          }
          break;

        case 'maxTokens':
          if (context.useCase.includes('code') || context.useCase.includes('analysis')) {
            config[param.name] = Math.min(param.max || 4096, 4096);
          } else {
            config[param.name] = param.defaultValue;
          }
          break;

        case 'topP':
          config[param.name] = param.defaultValue;
          break;

        case 'frequencyPenalty':
        case 'presencePenalty':
          if (context.useCase.includes('creative') || context.useCase.includes('writing')) {
            config[param.name] = 0.3; // Encorajar diversidade
          } else {
            config[param.name] = 0; // Neutro
          }
          break;

        default:
          config[param.name] = param.defaultValue;
      }
    });

    return config;
  }

  /**
   * Valida configuração de um modelo
   */
  validateConfiguration(modelId: string, configuration: Record<string, any>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    
    const model = this.getModel(modelId);
    if (!model) {
      return {
        valid: false,
        errors: [`Modelo "${modelId}" não encontrado`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    model.parameters.forEach(param => {
      const value = configuration[param.name];

      // Verificar parâmetros obrigatórios
      if (param.required && (value === undefined || value === null)) {
        errors.push(`Parâmetro obrigatório "${param.label}" não fornecido`);
        return;
      }

      // Se não fornecido, usar valor padrão
      if (value === undefined || value === null) {
        if (param.defaultValue !== undefined) {
          configuration[param.name] = param.defaultValue;
        }
        return;
      }

      // Validar tipo
      if (param.type === 'number' && typeof value !== 'number') {
        errors.push(`Parâmetro "${param.label}" deve ser um número`);
        return;
      }

      if (param.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Parâmetro "${param.label}" deve ser booleano`);
        return;
      }

      if (param.type === 'string' && typeof value !== 'string') {
        errors.push(`Parâmetro "${param.label}" deve ser uma string`);
        return;
      }

      // Validar restrições numéricas
      if (param.type === 'number') {
        if (param.min !== undefined && value < param.min) {
          errors.push(`Parâmetro "${param.label}" deve ser maior ou igual a ${param.min}`);
        }
        if (param.max !== undefined && value > param.max) {
          errors.push(`Parâmetro "${param.label}" deve ser menor ou igual a ${param.max}`);
        }
      }

      // Validar opções
      if (param.options && !param.options.includes(value)) {
        errors.push(`Parâmetro "${param.label}" deve ser um dos valores: ${param.options.join(', ')}`);
      }

      // Validar customizada
      if (param.validation && !param.validation(value)) {
        errors.push(`Parâmetro "${param.label}" falhou na validação`);
      }
    });

    // Adicionar avisos de performance
    if (configuration.temperature > 1.5) {
      warnings.push('Temperatura alta pode resultar em respostas menos coerentes');
    }

    if (configuration.maxTokens > 8000) {
      warnings.push('Alto número de tokens pode aumentar o custo e o tempo de resposta');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Estima custo para uma configuração específica
   */
  estimateCost(
    modelId: string,
    configuration: Record<string, any>,
    usage: {
      requestsPerDay: number;
      averageInputTokens: number;
      averageOutputTokens: number;
      days: number;
    }
  ): {
    totalCost: number;
    breakdown: {
      inputCost: number;
      outputCost: number;
      currency: string;
    };
    optimization: {
      potentialSavings: number;
      suggestions: string[];
    };
  } {
    
    const model = this.getModel(modelId);
    if (!model) {
      throw new Error(`Modelo "${modelId}" não encontrado`);
    }

    const totalRequests = usage.requestsPerDay * usage.days;
    const totalInputTokens = totalRequests * usage.averageInputTokens;
    const totalOutputTokens = totalRequests * usage.averageOutputTokens;

    const inputCost = (totalInputTokens / 1000) * model.pricing.input;
    const outputCost = (totalOutputTokens / 1000) * model.pricing.output;
    const totalCost = inputCost + outputCost;

    // Calcular otimizações potenciais
    const potentialSavings = this.calculatePotentialSavings(model, configuration, usage);
    const suggestions = this.generateCostOptimizationSuggestions(model, configuration, usage);

    return {
      totalCost,
      breakdown: {
        inputCost,
        outputCost,
        currency: model.pricing.currency
      },
      optimization: {
        potentialSavings,
        suggestions
      }
    };
  }

  // Métodos privados auxiliares
  private calculateModelScore(model: LLMModel): number {
    let score = 0;
    
    // Pontuação baseada em performance
    if (model.performance.quality === 'very-high') score += 30;
    else if (model.performance.quality === 'high') score += 25;
    else if (model.performance.quality === 'medium') score += 15;
    else score += 5;

    if (model.performance.speed === 'very-fast') score += 20;
    else if (model.performance.speed === 'fast') score += 15;
    else if (model.performance.speed === 'medium') score += 10;
    else score += 5;

    // Pontuação baseada em recursos
    if (model.features.functionCalling) score += 10;
    if (model.features.vision) score += 10;
    if (model.features.streaming) score += 5;
    if (model.features.jsonMode) score += 5;

    // Pontuação baseada em custo (inversa)
    const costScore = Math.max(0, 20 - (model.pricing.input + model.pricing.output) * 1000);
    score += costScore;

    return score;
  }

  private calculateRecommendationScore(model: LLMModel, context: any): number {
    let score = 0.5; // Score base

    // Verificar capacidades requeridas
    const missingCapabilities = context.requiredCapabilities.filter(
      (cap: string) => !model.capabilities.includes(cap)
    );
    
    if (missingCapabilities.length > 0) {
      score -= missingCapabilities.length * 0.2;
    }

    // Verificar orçamento
    if (context.budget === 'low' && model.pricing.input > 0.001) {
      score -= 0.3;
    } else if (context.budget === 'high' && model.performance.quality === 'very-high') {
      score += 0.2;
    }

    // Verificar performance
    if (context.performance === 'speed' && model.performance.speed === 'very-fast') {
      score += 0.3;
    } else if (context.performance === 'quality' && model.performance.quality === 'very-high') {
      score += 0.3;
    } else if (context.performance === 'balanced') {
      score += 0.1;
    }

    // Verificar carga esperada
    if (context.expectedLoad === 'high' && model.performance.speed === 'slow') {
      score -= 0.2;
    }

    // Verificar região
    if (context.region && !model.availability.regions.includes(context.region)) {
      score -= 0.4;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateExpectedImprovement(model: LLMModel, context: any) {
    const improvement: any = {};

    // Melhoria de custo
    if (context.budget === 'low' && model.pricing.input < 0.001) {
      improvement.cost = 50; // 50% mais barato
    }

    // Melhoria de performance
    if (context.performance === 'speed' && model.performance.speed === 'very-fast') {
      improvement.performance = 60; // 60% mais rápido
    }

    // Melhoria de qualidade
    if (context.performance === 'quality' && model.performance.quality === 'very-high') {
      improvement.quality = 40; // 40% melhor qualidade
    }

    return improvement;
  }

  private generateRecommendationReason(model: LLMModel, context: any, score: number): string {
    const reasons: string[] = [];

    if (model.performance.quality === 'very-high') {
      reasons.push('alta qualidade');
    }
    if (model.performance.speed === 'very-fast') {
      reasons.push('alta velocidade');
    }
    if (model.pricing.input < 0.001) {
      reasons.push('baixo custo');
    }
    if (model.features.functionCalling) {
      reasons.push('suporte a function calling');
    }
    if (model.features.vision) {
      reasons.push('suporte a imagens');
    }

    return `Modelo recomendado por: ${reasons.join(', ')} (${Math.round(score * 100)}% de compatibilidade)`;
  }

  private calculatePotentialSavings(
    model: LLMModel,
    configuration: Record<string, any>,
    usage: any
  ): number {
    let savings = 0;

    // Verificar se pode usar modelo mais barato
    const cheaperModels = this.models.filter(m => 
      m.pricing.input < model.pricing.input && 
      m.provider === model.provider
    );

    if (cheaperModels.length > 0) {
      const cheapest = cheaperModels[0];
      const currentCost = this.estimateCost(model.id, configuration, usage).totalCost;
      const cheaperCost = this.estimateCost(cheapest.id, configuration, usage).totalCost;
      savings = Math.max(savings, currentCost - cheaperCost);
    }

    // Verificar otimização de parâmetros
    if (configuration.maxTokens > 2048) {
      const optimizedConfig = { ...configuration, maxTokens: 2048 };
      const currentCost = this.estimateCost(model.id, configuration, usage).totalCost;
      const optimizedCost = this.estimateCost(model.id, optimizedConfig, usage).totalCost;
      savings = Math.max(savings, currentCost - optimizedCost);
    }

    return savings;
  }

  private generateCostOptimizationSuggestions(
    model: LLMModel,
    configuration: Record<string, any>,
    usage: any
  ): string[] {
    const suggestions: string[] = [];

    // Sugerir modelos mais baratos
    const cheaperModels = this.models.filter(m => 
      m.pricing.input < model.pricing.input && 
      m.capabilities.some(cap => model.capabilities.includes(cap))
    );

    if (cheaperModels.length > 0) {
      suggestions.push(`Considere usar ${cheaperModels[0].name} para reduzir custos`);
    }

    // Sugerir otimização de parâmetros
    if (configuration.maxTokens > 2048) {
      suggestions.push('Reduza o maxTokens para o necessário para diminuir custos');
    }

    if (configuration.temperature > 1.0) {
      suggestions.push('Reduza a temperatura para respostas mais consistentes e potencialmente mais curtas');
    }

    // Sugerir cache
    if (usage.requestsPerDay > 1000) {
      suggestions.push('Implemente cache para respostas repetitivas');
    }

    return suggestions;
  }
}

// Exportar instância única do serviço
export const llmModelService = new LLMModelService();
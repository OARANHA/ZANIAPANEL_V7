// Configuração da integração com Flowise
export const FLOWISE_CONFIG = {
  baseUrl: process.env.FLOWISE_BASE_URL || process.env.NEXT_PUBLIC_FLOWISE_URL,
  apiKey: process.env.FLOWISE_API_KEY,
  chatEndpoint: '/api/v1/chatflows',
  executionEndpoint: '/api/v1/chatflows/{id}/execution',
  statsEndpoint: '/api/v1/chatflows/{id}/stats',
  timeout: 30000,
  retryAttempts: 3
};

// Classe para gerenciar a configuração do Flowise
export class FlowiseConfigManager {
  private config: typeof FLOWISE_CONFIG;

  constructor() {
    this.config = FLOWISE_CONFIG;
  }

  // Validar configuração
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.config.baseUrl) {
      errors.push('FLOWISE_BASE_URL or NEXT_PUBLIC_FLOWISE_URL environment variable is required');
    }
    
    if (!this.config.apiKey) {
      errors.push('FLOWISE_API_KEY environment variable is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Obter headers para requisições
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  // Construir URL para endpoints
  buildUrl(endpoint: string): string {
    if (!this.config.baseUrl) {
      throw new Error('Base URL is not configured');
    }

    // Remover barra final da baseUrl se existir
    const baseUrl = this.config.baseUrl.endsWith('/') 
      ? this.config.baseUrl.slice(0, -1) 
      : this.config.baseUrl;

    // Adicionar barra inicial ao endpoint se não existir
    const formattedEndpoint = endpoint.startsWith('/') 
      ? endpoint 
      : `/${endpoint}`;

    return `${baseUrl}${formattedEndpoint}`;
  }

  // Obter configuração
  getConfig() {
    return this.config;
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<typeof FLOWISE_CONFIG>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Validação da configuração
export function validateFlowiseConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!FLOWISE_CONFIG.baseUrl) {
    errors.push('FLOWISE_BASE_URL or NEXT_PUBLIC_FLOWISE_URL environment variable is required');
  }
  
  if (!FLOWISE_CONFIG.apiKey) {
    errors.push('FLOWISE_API_KEY environment variable is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Tipos para a integração
export interface FlowiseChatflow {
  id: string;
  name: string;
  description?: string;
  type: 'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT';
  flowData: any;
  deployed: boolean;
  isPublic: boolean;
  category?: string;
  chatbotConfig?: any;
  apiConfig?: any;
  createdAt: string;
  updatedAt: string;
}

export interface FlowiseExecution {
  id: string;
  chatflowId: string;
  sessionId: string;
  executionData: any;
  state: 'INPROGRESS' | 'FINISHED' | 'ERROR' | 'TERMINATED' | 'TIMEOUT' | 'STOPPED';
  action?: string;
  isPublic: boolean;
  createdDate: string;
  updatedDate: string;
  stoppedDate?: string;
  duration?: number;
  success: boolean;
  errorMessage?: string;
  resultSummary?: any;
  metrics?: any;
}

export interface FlowiseStats {
  totalExecutions: number;
  successRate: number;
  averageResponseTime: number;
  mostUsedActions: Array<{
    action: string;
    count: number;
  }>;
  lastExecution: string;
  performanceMetrics: {
    throughput: number;
    errorRate: number;
    uptime: number;
  };
  userFeedback: {
    satisfaction: number;
    ratings: Array<{
      score: number;
      comment?: string;
      timestamp: string;
    }>;
  };
}

export interface AgentStats {
  agentId: string;
  flowiseChatflowId?: string;
  stats?: FlowiseStats;
  lastSyncAt?: string;
  isFlowiseConnected: boolean;
}

// Funções utilitárias
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateSuccessRate(executions: FlowiseExecution[]): number {
  if (executions.length === 0) return 0;
  const successful = executions.filter(e => e.success).length;
  return Math.round((successful / executions.length) * 100);
}

export function calculateAverageResponseTime(executions: FlowiseExecution[]): number {
  const executionsWithDuration = executions.filter(e => e.duration);
  if (executionsWithDuration.length === 0) return 0;
  
  const totalTime = executionsWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0);
  return Math.round(totalTime / executionsWithDuration.length);
}

export function getMostUsedActions(executions: FlowiseExecution[]): Array<{ action: string; count: number }> {
  const actionCounts: Record<string, number> = {};
  
  executions.forEach(execution => {
    if (execution.action) {
      actionCounts[execution.action] = (actionCounts[execution.action] || 0) + 1;
    }
  });
  
  return Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 ações
}

export function identifyResponseType(text: string): 'text' | 'data' | 'error' | 'stats' {
  if (text.toLowerCase().includes('error') || text.toLowerCase().includes('failed')) {
    return 'error';
  }
  
  if (text.toLowerCase().includes('statistics') || text.toLowerCase().includes('metrics')) {
    return 'stats';
  }
  
  if (text.includes('{') && text.includes('}')) {
    return 'data';
  }
  
  return 'text';
}

export function calculateConfidence(text: string): number {
  // Lógica simples para calcular confiança baseada em indicadores de texto
  const positiveIndicators = ['success', 'completed', 'done', 'finished', 'ok'];
  const negativeIndicators = ['error', 'failed', 'timeout', 'cancelled'];
  
  const lowerText = text.toLowerCase();
  let score = 50; // Base score
  
  positiveIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) score += 10;
  });
  
  negativeIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) score -= 15;
  });
  
  return Math.max(0, Math.min(100, score));
}
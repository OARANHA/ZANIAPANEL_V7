// Cliente para integração com Flowise API

// Interface para configuração do cliente Flowise
export interface FlowiseConfig {
  baseUrl: string;
  apiKey?: string;
  workspaceId?: string;
}

// Interface para workflow do Flowise
export interface FlowiseWorkflow {
  id: string;
  name: string;
  flowData: string;
  deployed?: boolean;
  isPublic?: boolean;
  type: 'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT';
  workspaceId?: string;
  createdDate: Date;
  updatedDate: Date;
  category?: string;
  chatbotConfig?: string;
  apiConfig?: string;
}

// Interface para resposta do cliente Flowise
export interface FlowiseResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export class FlowiseClient {
  private config: FlowiseConfig;

  constructor(config: FlowiseConfig) {
    this.config = config;
  }

  /**
   * Cria um novo chatflow
   */
  async createChatflow(workflow: Omit<FlowiseWorkflow, 'id' | 'createdDate' | 'updatedDate'>): Promise<FlowiseWorkflow> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/chatflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflow)
      });

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        name: result.name,
        flowData: result.flowData,
        deployed: result.deployed,
        isPublic: result.isPublic,
        type: result.type,
        workspaceId: result.workspaceId,
        createdDate: new Date(result.createdDate),
        updatedDate: new Date(result.updatedDate),
        category: result.category,
        chatbotConfig: result.chatbotConfig,
        apiConfig: result.apiConfig
      };
    } catch (error) {
      console.error('Error creating chatflow:', error);
      throw error;
    }
  }

  /**
   * Obtém um chatflow pelo ID
   */
  async getChatflow(id: string): Promise<FlowiseWorkflow> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/chatflows/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        name: result.name,
        flowData: result.flowData,
        deployed: result.deployed,
        isPublic: result.isPublic,
        type: result.type,
        workspaceId: result.workspaceId,
        createdDate: new Date(result.createdDate),
        updatedDate: new Date(result.updatedDate),
        category: result.category,
        chatbotConfig: result.chatbotConfig,
        apiConfig: result.apiConfig
      };
    } catch (error) {
      console.error('Error getting chatflow:', error);
      throw error;
    }
  }

  /**
   * Atualiza um chatflow
   */
  async updateChatflow(id: string, workflow: Partial<Omit<FlowiseWorkflow, 'id' | 'createdDate' | 'updatedDate'>>): Promise<FlowiseWorkflow> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/chatflows/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflow)
      });

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        name: result.name,
        flowData: result.flowData,
        deployed: result.deployed,
        isPublic: result.isPublic,
        type: result.type,
        workspaceId: result.workspaceId,
        createdDate: new Date(result.createdDate),
        updatedDate: new Date(result.updatedDate),
        category: result.category,
        chatbotConfig: result.chatbotConfig,
        apiConfig: result.apiConfig
      };
    } catch (error) {
      console.error('Error updating chatflow:', error);
      throw error;
    }
  }

  /**
   * Exclui um chatflow
   */
  async deleteChatflow(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/chatflows/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting chatflow:', error);
      throw error;
    }
  }

  /**
   * Lista chatflows com paginação
   */
  async getChatflows(options?: { page?: number; limit?: number; }): Promise<FlowiseResponse<FlowiseWorkflow[]>> {
    try {
      const { page = 1, limit = 10 } = options || {};
      const response = await fetch(`${this.config.baseUrl}/api/v1/chatflows?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      const workflows = result.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        flowData: item.flowData,
        deployed: item.deployed,
        isPublic: item.isPublic,
        type: item.type,
        workspaceId: item.workspaceId,
        createdDate: new Date(item.createdDate),
        updatedDate: new Date(item.updatedDate),
        category: item.category,
        chatbotConfig: item.chatbotConfig,
        apiConfig: item.apiConfig
      }));

      return {
        data: workflows,
        success: true
      };
    } catch (error) {
      console.error('Error listing chatflows:', error);
      throw error;
    }
  }
}

// Factory function para criar cliente
export function createFlowiseClient(config: FlowiseConfig): FlowiseClient {
  return new FlowiseClient(config);
}

// Configuração padrão
export const defaultFlowiseConfig: FlowiseConfig = {
  baseUrl: process.env.NEXT_PUBLIC_FLOWISE_URL || 'http://localhost:3001',
  apiKey: process.env.FLOWISE_API_KEY,
  timeout: 30000,
  retryAttempts: 3
};
// Interfaces
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed' | 'workflow';
  status?: 'active' | 'inactive' | 'training';
  studioMetadata?: {
    nodeCount?: number;
    edgeCount?: number;
    complexityScore?: number;
    workflowId?: string;
    category?: string;
    tags?: string[];
  };
  cliente?: { id: string; name: string; };
  disponivel?: boolean;
  inputTypes?: ('prompt' | 'prompt_system')[];
  flowiseConfig?: {
    exported: boolean;
    flowiseId?: string;
    exportedAt?: string;
    syncStatus?: 'pending' | 'synced' | 'error';
  };
  // Additional Flowise-specific fields
  chatflowUrl?: string;
  exportedToFlowise?: boolean;
  config?: string;
  originalFlowiseData?: any;
  
  // Campos editáveis pós-exportação
  customConfig?: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    systemPrompt?: string;
    welcomeMessage?: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
    customInstructions?: string;
    businessContext?: string;
    clientSpecificData?: {
      [key: string]: any;
    };
  };
  
  // Controle de versões e modificações
  versionInfo?: {
    originalFlowiseId?: string;
    modifiedAt?: string;
    modifiedBy?: string;
    version?: number;
    parentVersion?: string;
    isCustomized?: boolean;
  };
  
  // Status de re-exportação
  reExportStatus?: {
    status: 'pending' | 'exporting' | 'success' | 'error';
    newFlowiseId?: string;
    exportedAt?: string;
    error?: string;
  };
}

export interface Cliente {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  company?: string;
  sector?: string;
  
  // Campos adicionais para personalização
  customSettings?: {
    industry?: string;
    companySize?: string;
    targetAudience?: string;
    brandVoice?: string;
    specificRequirements?: string[];
  };
}
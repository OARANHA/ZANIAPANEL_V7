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
}

export interface Cliente {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  company?: string;
  sector?: string;
}
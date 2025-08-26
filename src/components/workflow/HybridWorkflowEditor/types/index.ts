/**
 * Types compartilhados para o HybridWorkflowEditor
 */

export interface FlowiseWorkflow {
  id: string;
  flowiseId: string;
  name: string;
  description?: string;
  type: 'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT';
  deployed: boolean;
  isPublic: boolean;
  category?: string;
  complexityScore: number;
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;
  capabilities: WorkflowCapabilities;
  nodes?: string; // JSON string
  connections?: string; // JSON string
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  flowData: string; // JSON com estrutura completa
}

export interface WorkflowCapabilities {
  canHandleFileUpload: boolean;
  hasStreaming: boolean;
  supportsMultiLanguage: boolean;
  hasMemory: boolean;
  usesExternalAPIs: boolean;
  hasAnalytics: boolean;
  supportsParallelProcessing: boolean;
  hasErrorHandling: boolean;
}

export interface HybridWorkflowEditorProps {
  workflow: FlowiseWorkflow;
  onSave?: (updatedWorkflow: FlowiseWorkflow) => void;
  onPreview?: () => void;
  onExport?: () => void;
  onPublishToAgents?: () => void;
  className?: string;
}

export interface WorkflowAnalysisResults {
  complexityScore: number;
  bottlenecks: string[];
  optimizationSuggestions: string[];
  performanceMetrics: {
    estimatedExecutionTime: string;
    memoryUsage: string;
    parallelizationPotential: number;
  };
  validationResults: {
    errors: string[];
    warnings: string[];
    isValid: boolean;
  };
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type: string;
    category: string;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
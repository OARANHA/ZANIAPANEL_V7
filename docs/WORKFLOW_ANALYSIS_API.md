# Workflow Analysis API Reference

## Hooks

### useWorkflowAnalysis

Custom hook for workflow analysis with state management.

#### Signature
```typescript
function useWorkflowAnalysis(workflowData: FlowiseWorkflow): UseWorkflowAnalysisReturn
```

#### Parameters
- `workflowData` (FlowiseWorkflow): The workflow data to analyze

#### Returns
```typescript
interface UseWorkflowAnalysisReturn {
  isAnalyzing: boolean;
  analysisResults: WorkflowAnalysisResults | null;
  analyzeWorkflow: () => Promise<void>;
}
```

#### Properties

##### `isAnalyzing: boolean`
Indicates whether analysis is currently in progress.

##### `analysisResults: WorkflowAnalysisResults | null`
Contains the latest analysis results, or null if no analysis has been performed.

##### `analyzeWorkflow: () => Promise<void>`
Triggers workflow analysis. Returns a promise that resolves when analysis is complete.

#### Usage Example
```typescript
import { useWorkflowAnalysis } from './hooks/useWorkflowAnalysis';

function WorkflowEditor({ workflow }) {
  const { isAnalyzing, analysisResults, analyzeWorkflow } = useWorkflowAnalysis(workflow);
  
  const handleAnalyze = async () => {
    await analyzeWorkflow();
    console.log('Analysis complete:', analysisResults);
  };
  
  return (
    <div>
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Analyze Workflow'}
      </button>
      {analysisResults && (
        <AnalysisResults results={analysisResults} />
      )}
    </div>
  );
}
```

## Utility Functions

### calculateComplexityScore

Calculates workflow complexity score based on multiple factors.

#### Signature
```typescript
function calculateComplexityScore(nodes: any[], edges: any[]): number
```

#### Parameters
- `nodes` (any[]): Array of workflow nodes
- `edges` (any[]): Array of workflow edges

#### Returns
- `number`: Complexity score from 0-100

#### Algorithm
The complexity score is calculated using weighted factors:
- Node count (30%)
- Edge count (20%)
- Node type diversity (20%)
- Workflow depth (15%)
- Branching factor (15%)

#### Example
```typescript
const nodes = [/* workflow nodes */];
const edges = [/* workflow edges */];
const score = calculateComplexityScore(nodes, edges);
console.log(`Complexity score: ${score}/100`);
```

### identifyBottlenecks

Identifies performance bottlenecks in the workflow.

#### Signature
```typescript
function identifyBottlenecks(nodes: any[], edges: any[]): Bottleneck[]
```

#### Parameters
- `nodes` (any[]): Array of workflow nodes
- `edges` (any[]): Array of workflow edges

#### Returns
```typescript
interface Bottleneck {
  id: string;
  nodeId: string;
  type: 'performance' | 'memory' | 'cost' | 'complexity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  suggestion: string;
}
```

#### Detection Criteria
- **High Fan-in/Fan-out**: Variable thresholds based on node type:
  - Vector Stores/Databases: >6 connections
  - Memory/Document nodes: >5 connections  
  - LLM/Agent nodes: >4 connections
  - Other nodes: >3 connections
- **Sequential Chains**: Long chains without parallelization
- **Resource Intensive**: Memory/CPU heavy node types
- **Cost Heavy**: Expensive API calls or premium models

#### Example
```typescript
const bottlenecks = identifyBottlenecks(nodes, edges);
bottlenecks.forEach(bottleneck => {
  console.log(`${bottleneck.severity} bottleneck: ${bottleneck.description}`);
});
```

### generateOptimizationSuggestions

Generates actionable optimization recommendations.

#### Signature
```typescript
function generateOptimizationSuggestions(nodes: any[], edges: any[]): OptimizationSuggestion[]
```

#### Parameters
- `nodes` (any[]): Array of workflow nodes
- `edges` (any[]): Array of workflow edges

#### Returns
```typescript
interface OptimizationSuggestion {
  id: string;
  type: 'structure' | 'performance' | 'cost' | 'memory';
  priority: 'low' | 'medium' | 'high';
  targetNodes?: string[];
  description: string;
  impact: string;
  implementation: string;
}
```

#### Suggestion Types
- **Structure**: Workflow organization improvements
- **Performance**: Execution speed optimizations
- **Cost**: Resource usage cost reductions
- **Memory**: Memory usage optimizations

#### Example
```typescript
const suggestions = generateOptimizationSuggestions(nodes, edges);
const highPriority = suggestions.filter(s => s.priority === 'high');
console.log(`Found ${highPriority.length} high-priority optimizations`);
```

### estimateExecutionTime

Estimates workflow execution time in milliseconds.

#### Signature
```typescript
function estimateExecutionTime(nodes: any[], edges: any[]): number
```

#### Parameters
- `nodes` (any[]): Array of workflow nodes
- `edges` (any[]): Array of workflow edges

#### Returns
- `number`: Estimated execution time in milliseconds

#### Calculation Method
- Base time per node type
- Sequential path analysis
- Parallel execution consideration
- Network latency estimation

#### Node Type Base Times
```typescript
const NODE_EXECUTION_TIMES = {
  'Chat Models': 2000,      // 2 seconds
  'LLM': 1500,              // 1.5 seconds
  'Prompts': 100,           // 100ms
  'Memory': 50,             // 50ms
  'Document Stores': 500,   // 500ms
  'Tools': 1000,            // 1 second
  'Chains': 300,            // 300ms
  'Agents': 3000,           // 3 seconds
  'default': 200            // 200ms
};
```

#### Example
```typescript
const executionTime = estimateExecutionTime(nodes, edges);
console.log(`Estimated execution time: ${executionTime / 1000} seconds`);
```

### estimateMemoryUsage

Estimates workflow memory usage in MB.

#### Signature
```typescript
function estimateMemoryUsage(nodes: any[]): number
```

#### Parameters
- `nodes` (any[]): Array of workflow nodes

#### Returns
- `number`: Estimated memory usage in MB

#### Memory Calculation
Base memory usage per node type plus dynamic factors:
- Context window size
- Document store size
- Memory buffer configuration
- Vector embeddings storage

#### Node Type Base Memory
```typescript
const NODE_MEMORY_USAGE = {
  'Chat Models': 50,        // 50MB
  'LLM': 40,                // 40MB
  'Prompts': 1,             // 1MB
  'Memory': 20,             // 20MB
  'Document Stores': 100,   // 100MB
  'Vector Stores': 200,     // 200MB
  'Tools': 10,              // 10MB
  'Agents': 80,             // 80MB
  'default': 5              // 5MB
};
```

#### Example
```typescript
const memoryUsage = estimateMemoryUsage(nodes);
console.log(`Estimated memory usage: ${memoryUsage}MB`);
```

### calculateParallelizationPotential

Calculates the potential for parallel execution (0-100%).

#### Signature
```typescript
function calculateParallelizationPotential(nodes: any[], edges: any[]): number
```

#### Parameters
- `nodes` (any[]): Array of workflow nodes
- `edges` (any[]): Array of workflow edges

#### Returns
- `number`: Parallelization potential as percentage (0-100)

#### Analysis Factors
- Independent execution paths
- Dependency chain analysis
- Node type parallelizability
- Resource contention potential

#### Scoring
- **0-25%**: Highly sequential workflow
- **26-50%**: Some parallel opportunities
- **51-75%**: Good parallelization potential
- **76-100%**: Highly parallelizable

#### Example
```typescript
const potential = calculateParallelizationPotential(nodes, edges);
console.log(`Parallelization potential: ${potential}%`);
```

### validateWorkflowStructure

Validates workflow structure and returns validation results.

#### Signature
```typescript
function validateWorkflowStructure(nodes: any[], edges: any[]): ValidationResult
```

#### Parameters
- `nodes` (any[]): Array of workflow nodes
- `edges` (any[]): Array of workflow edges

#### Returns
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  nodeId?: string;
  edgeId?: string;
  message: string;
  description: string;
  fix?: string;
}

interface ValidationWarning {
  id: string;
  nodeId?: string;
  message: string;
  description: string;
  suggestion: string;
}
```

#### Validation Checks
- Start node presence (intelligent detection)
- Node connectivity
- Circular dependencies
- Required parameter validation
- Type compatibility
- Resource availability

#### Example
```typescript
const validation = validateWorkflowStructure(nodes, edges);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
} else {
  console.log('Workflow is valid');
}
```

## Type Definitions

### Core Interfaces

#### WorkflowAnalysisResults
```typescript
interface WorkflowAnalysisResults {
  complexityScore: number;
  bottlenecks: Bottleneck[];
  optimizationSuggestions: OptimizationSuggestion[];
  performanceMetrics: {
    estimatedExecutionTime: number;
    memoryUsage: number;
    parallelizationPotential: number;
  };
  validationResults: ValidationResult;
}
```

#### FlowiseWorkflow
```typescript
interface FlowiseWorkflow {
  id: string;
  name: string;
  type: 'chatflow' | 'agentflow';
  category?: string;
  flowData: string; // JSON string
  complexityScore?: number;
  updatedAt: string;
}
```

#### FlowiseNode
```typescript
interface FlowiseNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    type: string;
    category: string;
    name: string;
    label: string;
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
    inputParams?: Array<{
      name: string;
      label: string;
      type: string;
      optional?: boolean;
    }>;
  };
}
```

#### FlowiseEdge
```typescript
interface FlowiseEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}
```

## Constants

### Analysis Thresholds
```typescript
export const ANALYSIS_THRESHOLDS = {
  complexity: {
    simple: 30,
    moderate: 50,
    complex: 70,
    high: 85
  },
  performance: {
    executionTime: 30000, // 30 seconds
    memoryUsage: 1024, // 1GB
    nodeLimit: 100
  },
  bottleneck: {
    fanInLimit: 5,
    fanOutLimit: 8,
    depthLimit: 20
  }
};
```

### Node Categories
```typescript
export const NODE_CATEGORIES = {
  CHAT_MODELS: 'Chat Models',
  LLM: 'LLM',
  PROMPTS: 'Prompts',
  MEMORY: 'Memory',
  DOCUMENT_STORES: 'Document Stores',
  VECTOR_STORES: 'Vector Stores',
  TOOLS: 'Tools',
  CHAINS: 'Chains',
  AGENTS: 'Agents',
  AGENT_FLOW: 'Agent Flow'
};
```

## Error Handling

### Common Errors
```typescript
class WorkflowAnalysisError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'WorkflowAnalysisError';
  }
}

// Error codes
export const ERROR_CODES = {
  INVALID_WORKFLOW_DATA: 'INVALID_WORKFLOW_DATA',
  MISSING_NODES: 'MISSING_NODES',
  PARSING_ERROR: 'PARSING_ERROR',
  ANALYSIS_TIMEOUT: 'ANALYSIS_TIMEOUT'
};
```

### Error Handling Example
```typescript
try {
  const results = await analyzeWorkflow();
} catch (error) {
  if (error instanceof WorkflowAnalysisError) {
    console.error(`Analysis error [${error.code}]: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```
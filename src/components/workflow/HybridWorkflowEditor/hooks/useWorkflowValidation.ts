import { useState } from 'react';
import { WorkflowValidator, ValidationResult } from '@/lib/workflow-validator';
import type { FlowiseWorkflow } from '../types';

export function useWorkflowValidation(workflowData: FlowiseWorkflow) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);

  // Validate workflow
  const validateWorkflow = async () => {
    setIsValidating(true);
    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const flowData = JSON.parse(workflowData.flowData);
      const nodes = flowData.nodes || [];
      const edges = flowData.edges || [];
      
      // Perform validation
      const validation = WorkflowValidator.validateWorkflow(nodes, edges);
      setValidationResults(validation);
    } catch (error) {
      console.error('❌ Error validating workflow:', error);
      // Even if parsing fails, show a validation error
      setValidationResults({
        valid: false,
        errors: [{
          id: 'parse_error',
          type: 'critical',
          message: 'Erro ao analisar o workflow',
          description: `Não foi possível analisar a estrutura do workflow. Verifique se o JSON está correto. Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          fix: 'Verifique a estrutura do workflow no editor de código.'
        }],
        warnings: [],
        suggestions: [],
        score: 0,
        metrics: {
          nodeCount: 0,
          edgeCount: 0,
          maxDepth: 0,
          parallelPaths: 0,
          criticalPathLength: 0,
          complexityScore: 0,
          estimatedExecutionTime: '< 1s',
          memoryUsage: 'low',
          costEstimate: 'low'
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    validationResults,
    validateWorkflow
  };
}
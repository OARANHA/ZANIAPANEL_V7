# Workflow Analysis Implementation Guide

## Getting Started

This guide provides step-by-step instructions for implementing and using the Workflow Analysis System in your workflow editor.

## Basic Implementation

### 1. Hook Integration

First, integrate the `useWorkflowAnalysis` hook into your workflow editor component:

```typescript
// WorkflowEditor.tsx
import React from 'react';
import { useWorkflowAnalysis } from './hooks/useWorkflowAnalysis';

function WorkflowEditor({ workflow }) {
  const { 
    isAnalyzing, 
    analysisResults, 
    analyzeWorkflow 
  } = useWorkflowAnalysis(workflow);

  return (
    <div className="workflow-editor">
      {/* Your workflow editor UI */}
      <AnalysisSection 
        isAnalyzing={isAnalyzing}
        results={analysisResults}
        onAnalyze={analyzeWorkflow}
      />
    </div>
  );
}
```

### 2. Analysis Results Display

Create a component to display analysis results:

```typescript
// AnalysisSection.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, RefreshCw } from 'lucide-react';

interface AnalysisSectionProps {
  isAnalyzing: boolean;
  results: WorkflowAnalysisResults | null;
  onAnalyze: () => void;
}

function AnalysisSection({ isAnalyzing, results, onAnalyze }: AnalysisSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Workflow Analysis
          </CardTitle>
          <Button 
            onClick={onAnalyze} 
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {results && (
        <CardContent>
          <AnalysisResults results={results} />
        </CardContent>
      )}
    </Card>
  );
}
```

### 3. Complexity Score Display

Implement a complexity score component with visual indicators:

```typescript
// ComplexityBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ComplexityBadgeProps {
  score: number;
}

function ComplexityBadge({ score }: ComplexityBadgeProps) {
  const getComplexityLevel = (score: number) => {
    if (score <= 30) return { level: 'Simple', color: 'bg-green-500' };
    if (score <= 50) return { level: 'Moderate', color: 'bg-blue-500' };
    if (score <= 70) return { level: 'Complex', color: 'bg-yellow-500' };
    if (score <= 85) return { level: 'High', color: 'bg-orange-500' };
    return { level: 'Very High', color: 'bg-red-500' };
  };

  const { level, color } = getComplexityLevel(score);

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        {level}
      </Badge>
      <span className="text-sm text-muted-foreground">
        Score: {score}/100
      </span>
    </div>
  );
}
```

## Advanced Features

### 1. Bottleneck Visualization

Create a component to display bottlenecks with severity indicators:

```typescript
// BottlenecksList.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface BottlenecksListProps {
  bottlenecks: Bottleneck[];
}

function BottlenecksList({ bottlenecks }: BottlenecksListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  if (bottlenecks.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          No bottlenecks detected. Great work! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Bottlenecks ({bottlenecks.length})</h4>
      {bottlenecks.map((bottleneck) => (
        <Alert key={bottleneck.id} variant={getSeverityVariant(bottleneck.severity)}>
          <div className="flex items-start gap-2">
            {getSeverityIcon(bottleneck.severity)}
            <div className="flex-1">
              <AlertTitle className="flex items-center gap-2">
                {bottleneck.description}
                <Badge variant="outline" className="text-xs">
                  {bottleneck.type}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-1">
                <p className="mb-2">{bottleneck.impact}</p>
                <p className="text-sm font-medium">Suggestion:</p>
                <p className="text-sm">{bottleneck.suggestion}</p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
```

### 2. Optimization Suggestions

Implement a suggestions panel with actionable recommendations:

```typescript
// OptimizationSuggestions.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, DollarSign, Zap } from 'lucide-react';

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
  onApplySuggestion?: (suggestion: OptimizationSuggestion) => void;
}

function OptimizationSuggestions({ 
  suggestions, 
  onApplySuggestion 
}: OptimizationSuggestionsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'cost': return <DollarSign className="w-4 h-4" />;
      case 'structure': return <TrendingUp className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm text-muted-foreground">
              No optimization suggestions at this time.
              Your workflow is well-optimized!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Optimization Suggestions ({suggestions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(suggestion.type)}
                  <h4 className="font-medium">{suggestion.description}</h4>
                </div>
                <Badge 
                  variant="outline"
                  className={getPriorityColor(suggestion.priority)}
                >
                  {suggestion.priority} priority
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Impact:</p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.impact}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Implementation:</p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.implementation}
                  </p>
                </div>
              </div>

              {onApplySuggestion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplySuggestion(suggestion)}
                  className="w-full"
                >
                  Apply Suggestion
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Performance Metrics Dashboard

Create a dashboard for performance metrics:

```typescript
// PerformanceMetrics.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, MemoryStick, Zap } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: {
    estimatedExecutionTime: number;
    memoryUsage: number;
    parallelizationPotential: number;
  };
}

function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatMemory = (mb: number) => {
    if (mb < 1024) return `${mb}MB`;
    return `${(mb / 1024).toFixed(1)}GB`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Execution Time
          </CardTitle>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(metrics.estimatedExecutionTime)}
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated runtime
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Memory Usage
          </CardTitle>
          <MemoryStick className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatMemory(metrics.memoryUsage)}
          </div>
          <p className="text-xs text-muted-foreground">
            Peak memory consumption
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Parallelization
          </CardTitle>
          <Zap className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.parallelizationPotential}%
          </div>
          <Progress 
            value={metrics.parallelizationPotential} 
            className="mt-2" 
          />
          <p className="text-xs text-muted-foreground mt-2">
            Parallel execution potential
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Auto-Analysis Setup

### 1. Debounced Analysis

Implement automatic analysis when workflow changes:

```typescript
// useAutoAnalysis.ts
import { useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

function useAutoAnalysis(workflowData, analyzeWorkflow, enabled = true) {
  const debouncedAnalysis = useCallback(
    debounce(() => {
      if (enabled) {
        analyzeWorkflow();
      }
    }, 2000), // 2 second delay
    [analyzeWorkflow, enabled]
  );

  useEffect(() => {
    if (workflowData.flowData) {
      debouncedAnalysis();
    }
    
    // Cleanup
    return () => {
      debouncedAnalysis.cancel();
    };
  }, [workflowData.flowData, debouncedAnalysis]);

  return { debouncedAnalysis };
}
```

### 2. Background Analysis

Set up periodic background analysis:

```typescript
// useBackgroundAnalysis.ts
import { useEffect, useRef } from 'react';

function useBackgroundAnalysis(
  analyzeWorkflow, 
  interval = 5 * 60 * 1000 // 5 minutes
) {
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      analyzeWorkflow();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [analyzeWorkflow, interval]);

  const stopBackgroundAnalysis = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return { stopBackgroundAnalysis };
}
```

## Integration Examples

### 1. With Auto-Save

Combine analysis with auto-save functionality:

```typescript
// WorkflowEditorWithAnalysis.tsx
import React from 'react';
import { useWorkflowState } from './hooks/useWorkflowState';
import { useAutoSave } from './hooks/useAutoSave';
import { useWorkflowAnalysis } from './hooks/useWorkflowAnalysis';
import { useAutoAnalysis } from './hooks/useAutoAnalysis';

function WorkflowEditorWithAnalysis({ workflow, onSave }) {
  const { workflowData, setWorkflowData } = useWorkflowState(workflow);
  const { autoSaveState } = useAutoSave(workflowData, workflow, onSave);
  const { isAnalyzing, analysisResults, analyzeWorkflow } = useWorkflowAnalysis(workflowData);
  
  // Auto-analyze when workflow changes
  useAutoAnalysis(workflowData, analyzeWorkflow, true);

  return (
    <div className="space-y-6">
      {/* Auto-save status */}
      <AutoSaveStatus state={autoSaveState} />
      
      {/* Analysis results */}
      <AnalysisResults 
        isAnalyzing={isAnalyzing}
        results={analysisResults}
      />
      
      {/* Workflow editor */}
      <WorkflowCanvas 
        workflowData={workflowData}
        onWorkflowChange={setWorkflowData}
      />
    </div>
  );
}
```

### 2. With Validation

Integrate analysis with workflow validation:

```typescript
// useWorkflowValidationAndAnalysis.ts
import { useState, useCallback } from 'react';
import { useWorkflowValidation } from './useWorkflowValidation';
import { useWorkflowAnalysis } from './useWorkflowAnalysis';

function useWorkflowValidationAndAnalysis(workflowData) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { isValidating, validationResults, validateWorkflow } = useWorkflowValidation(workflowData);
  const { isAnalyzing, analysisResults, analyzeWorkflow } = useWorkflowAnalysis(workflowData);

  const validateAndAnalyze = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Run validation and analysis in parallel
      await Promise.all([
        validateWorkflow(),
        analyzeWorkflow()
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [validateWorkflow, analyzeWorkflow]);

  return {
    isProcessing: isProcessing || isValidating || isAnalyzing,
    validationResults,
    analysisResults,
    validateAndAnalyze
  };
}
```

## Best Practices

### 1. Performance Optimization

- Use debounced analysis to avoid excessive API calls
- Implement loading states for better UX
- Cache analysis results when possible
- Use background analysis for large workflows

### 2. User Experience

- Provide clear visual feedback during analysis
- Show progress indicators for long-running analysis
- Group related insights together
- Prioritize high-impact suggestions

### 3. Error Handling

```typescript
// Error handling wrapper
function withAnalysisErrorHandling(Component) {
  return function WrappedComponent(props) {
    const [error, setError] = useState(null);

    const handleAnalysisError = useCallback((error) => {
      setError(error);
      console.error('Analysis error:', error);
    }, []);

    return (
      <div>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        <Component 
          {...props} 
          onAnalysisError={handleAnalysisError}
        />
      </div>
    );
  };
}
```

### 4. Testing

```typescript
// Test example
import { renderHook, act } from '@testing-library/react';
import { useWorkflowAnalysis } from '../useWorkflowAnalysis';

describe('useWorkflowAnalysis', () => {
  const mockWorkflow = {
    id: '1',
    name: 'Test Workflow',
    type: 'chatflow',
    flowData: JSON.stringify({
      nodes: [/* test nodes */],
      edges: [/* test edges */]
    })
  };

  it('should analyze workflow correctly', async () => {
    const { result } = renderHook(() => useWorkflowAnalysis(mockWorkflow));

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.analysisResults).toBe(null);

    await act(async () => {
      await result.current.analyzeWorkflow();
    });

    expect(result.current.analysisResults).toBeDefined();
    expect(result.current.analysisResults.complexityScore).toBeGreaterThanOrEqual(0);
  });
});
```

## Troubleshooting

### Common Issues

1. **Analysis not triggering**: Check workflow data format and ensure flowData is valid JSON
2. **High memory usage**: Reduce analysis frequency for large workflows
3. **Slow analysis**: Implement progressive analysis for complex workflows
4. **Incorrect complexity scores**: Verify node and edge data structure

### Debug Mode

Enable debug logging:

```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (DEBUG_MODE) {
    console.log(`[Workflow Analysis] ${message}`, data);
  }
}
```

This implementation guide provides a comprehensive foundation for integrating workflow analysis into your application.
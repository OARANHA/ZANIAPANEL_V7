import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, AlertTriangle, Target } from 'lucide-react';
import type { WorkflowAnalysisResults } from '../types';

interface WorkflowAnalysisProps {
  analysisResults: WorkflowAnalysisResults;
}

export default function WorkflowAnalysis({ analysisResults }: WorkflowAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Análise de Complexidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analysisResults.complexityScore}/100
            </div>
            <div className="text-sm text-gray-600">Complexidade</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analysisResults.performanceMetrics.estimatedExecutionTime}
            </div>
            <div className="text-sm text-gray-600">Tempo Estimado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analysisResults.performanceMetrics.memoryUsage}
            </div>
            <div className="text-sm text-gray-600">Memória Estimada</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analysisResults.performanceMetrics.parallelizationPotential}%
            </div>
            <div className="text-sm text-gray-600">Potencial de Paralelização</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysisResults.bottlenecks.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Gargalos Identificados:</div>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResults.bottlenecks.map((bottleneck: string, index: number) => (
                    <li key={index} className="text-sm">{bottleneck}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {analysisResults.optimizationSuggestions.length > 0 && (
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Sugestões de Otimização:</div>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResults.optimizationSuggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
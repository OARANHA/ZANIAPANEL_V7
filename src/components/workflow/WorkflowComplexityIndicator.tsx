'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Network
} from 'lucide-react';

interface WorkflowComplexityIndicatorProps {
  complexity?: 'simple' | 'medium' | 'complex';
  score?: number;
  estimatedTime?: string;
  nodeCount?: number;
  className?: string;
}

export function WorkflowComplexityIndicator({
  complexity,
  score,
  estimatedTime = 'N/A',
  nodeCount = 0,
  className = ''
}: WorkflowComplexityIndicatorProps) {
  const getComplexityConfig = () => {
    if (score !== undefined) {
      if (score <= 33) {
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Simples',
          description: 'Workflow básico com poucos nodes'
        };
      } else if (score <= 66) {
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Zap,
          label: 'Médio',
          description: 'Workflow moderado com vários nodes'
        };
      } else {
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          label: 'Complexo',
          description: 'Workflow avançado com muitos nodes'
        };
      }
    }
    
    switch (complexity) {
      case 'simple':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Simples',
          description: 'Workflow básico com poucos nodes'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Zap,
          label: 'Médio',
          description: 'Workflow moderado com vários nodes'
        };
      case 'complex':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          label: 'Complexo',
          description: 'Workflow avançado com muitos nodes'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Network,
          label: 'Desconhecido',
          description: 'Complexidade não determinada'
        };
    }
  };

  const config = getComplexityConfig();
  const Icon = config.icon;

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <span className="font-semibold">Complexidade</span>
          </div>
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          {score !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-medium">{score}/100</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Nodes:</span>
            <span className="font-medium">{nodeCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tempo Estimado:</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{estimatedTime}</span>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
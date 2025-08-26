"use client";

import { Badge } from '@/components/ui/badge';

interface WorkflowComplexityBadgeProps {
  score: number;
  className?: string;
}

export default function WorkflowComplexityBadge({ 
  score, 
  className = "" 
}: WorkflowComplexityBadgeProps) {
  const getComplexityInfo = () => {
    if (score <= 33) {
      return {
        label: 'Simples',
        variant: 'default' as const,
        color: 'bg-green-100 text-green-800 hover:bg-green-200'
      };
    } else if (score <= 66) {
      return {
        label: 'Médio',
        variant: 'secondary' as const,
        color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      };
    } else {
      return {
        label: 'Complexo',
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800 hover:bg-red-200'
      };
    }
  };

  const info = getComplexityInfo();

  return (
    <Badge 
      className={`${className} ${info.color}`}
      variant={info.variant}
    >
      {score}/100
    </Badge>
  );
}
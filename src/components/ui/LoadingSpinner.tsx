'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ 
  text = 'Carregando...', 
  size = 'md',
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn(
      "flex items-center justify-center p-8",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin mr-2 text-primary",
        sizeClasses[size]
      )} />
      <span className="text-muted-foreground font-medium">
        {text}
      </span>
    </div>
  );
}
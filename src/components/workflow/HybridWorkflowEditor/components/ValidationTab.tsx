import React from 'react';
import WorkflowValidationDisplay from '../../WorkflowValidationDisplay';
import type { ValidationResult } from '@/lib/workflow-validator';

interface ValidationTabProps {
  validation: ValidationResult | null;
  isValidating: boolean;
  onRefresh: () => void;
}

export default function ValidationTab({
  validation,
  isValidating,
  onRefresh
}: ValidationTabProps) {
  return (
    <WorkflowValidationDisplay
      validation={validation}
      isValidating={isValidating}
      onRefresh={onRefresh}
    />
  );
}
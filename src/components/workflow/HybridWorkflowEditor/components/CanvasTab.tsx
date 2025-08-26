import React from 'react';
import ReactFlowCanvas from '../../ReactFlowCanvas';
import type { FlowiseWorkflow } from '../types';

interface CanvasTabProps {
  workflowData: FlowiseWorkflow;
  onNodeClick: (node: any) => void;
  onEditNode: (node: any) => void;
  onSave: () => void;
  onPreview?: () => void;
}

export default function CanvasTab({
  workflowData,
  onNodeClick,
  onEditNode,
  onSave,
  onPreview
}: CanvasTabProps) {
  return (
    <ReactFlowCanvas
      workflow={workflowData}
      onNodeClick={onNodeClick}
      onEditNode={onEditNode}
      onSave={onSave}
      onPreview={onPreview}
    />
  );
}
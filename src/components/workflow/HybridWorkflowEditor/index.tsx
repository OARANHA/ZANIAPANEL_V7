"use client";

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import NodeEditorDialog from '../NodeEditorDialog';

// Hooks personalizados
import { useWorkflowState } from './hooks/useWorkflowState';
import { useAutoSave } from './hooks/useAutoSave';
import { useWorkflowValidation } from './hooks/useWorkflowValidation';
import { useWorkflowAnalysis } from './hooks/useWorkflowAnalysis';

// Componentes modulares
import WorkflowHeader from './components/WorkflowHeader';
import WorkflowAnalysis from './components/WorkflowAnalysis';
import WorkflowTabs from './components/WorkflowTabs';

// Types
import type { HybridWorkflowEditorProps } from './types';

export default function HybridWorkflowEditor({
  workflow,
  onSave,
  onPreview,
  onExport,
  onPublishToAgents,
  className = ""
}: HybridWorkflowEditorProps) {
  // Custom hooks para gerenciar estado
  const {
    workflowData,
    setWorkflowData,
    selectedNode,
    isNodeEditorOpen,
    setIsNodeEditorOpen,
    activeTab,
    setActiveTab,
    handleNodeClick,
    handleNodeEdit,
    handleNodeSave
  } = useWorkflowState(workflow);

  const { autoSaveState, markSaved } = useAutoSave(workflowData, workflow, onSave);
  const { isValidating, validationResults, validateWorkflow } = useWorkflowValidation(workflowData);
  const { isAnalyzing, analysisResults, analyzeWorkflow } = useWorkflowAnalysis(workflowData);

  // Auto-validate on workflow changes
  useEffect(() => {
    if (workflowData.flowData) {
      const debounceTimer = setTimeout(() => {
        validateWorkflow();
      }, 1000);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [workflowData.flowData, validateWorkflow]);

  // Handle workflow save
  const handleSave = async () => {
    try {
      console.log('💾 Saving workflow changes to database...');
      
      // Call the API to save the workflow
      const response = await fetch('/api/v1/studio/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_workflow',
          data: {
            workflow: workflowData
          }
        })
      });
      
      const result = await response.json() as { success: boolean; message?: string; error?: string };
      
      if (result.success) {
        console.log('✅ Workflow saved successfully:', result.message);
        
        // Call parent save callback if available
        onSave?.(workflowData);
        
        // Reset auto-save state
        markSaved();
        
        // Force a re-render to ensure UI reflects the saved state
        setWorkflowData({
          ...workflowData,
          updatedAt: new Date().toISOString()
        });
        
        console.log('🔄 Workflow data refreshed after save');
      } else {
        console.error('❌ Failed to save workflow:', result.error);
        throw new Error(result.error || 'Failed to save workflow');
      }
    } catch (error) {
      console.error('❌ Error saving workflow:', error);
      // Show error to user
      console.error('Erro ao salvar workflow: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <WorkflowHeader
          workflowData={workflowData}
          autoSaveState={autoSaveState}
          isAnalyzing={isAnalyzing}
          isSaving={false}
          onAnalyze={analyzeWorkflow}
          onPreview={onPreview}
          onExport={onExport}
          onPublishToAgents={onPublishToAgents}
          onSave={handleSave}
        />
      </Card>
      
      {/* Analysis Results */}
      {analysisResults && (
        <WorkflowAnalysis analysisResults={analysisResults} />
      )}
      
      {/* Main Editor */}
      <WorkflowTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        workflowData={workflowData}
        validationResults={validationResults}
        isValidating={isValidating}
        onNodeClick={handleNodeClick}
        onEditNode={handleNodeEdit}
        onSave={handleSave}
        onPreview={onPreview}
        onValidate={validateWorkflow}
      />
      
      {/* Node Editor Dialog */}
      <NodeEditorDialog
        open={isNodeEditorOpen}
        onOpenChange={setIsNodeEditorOpen}
        node={selectedNode}
        onSave={handleNodeSave}
      />
    </div>
  );
}
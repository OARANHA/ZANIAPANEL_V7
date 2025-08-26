import { useState, useEffect } from 'react';
import type { FlowiseWorkflow } from '../types';

export function useWorkflowState(initialWorkflow: FlowiseWorkflow) {
  const [workflowData, setWorkflowData] = useState(initialWorkflow);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas');

  // Update workflow data when prop changes
  useEffect(() => {
    setWorkflowData(initialWorkflow);
  }, [initialWorkflow]);

  // Handle node click
  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  // Handle node edit
  const handleNodeEdit = (node: any) => {
    setSelectedNode(node);
    setIsNodeEditorOpen(true);
  };

  // Handle node save
  const handleNodeSave = (nodeId: string, updates: any) => {
    try {
      const flowData = JSON.parse(workflowData.flowData);
      const nodeIndex = flowData.nodes.findIndex((n: any) => n.id === nodeId);
      
      if (nodeIndex !== -1) {
        const currentNode = flowData.nodes[nodeIndex];
        
        // Update the node's data properties
        const updatedNodeData = {
          ...currentNode.data,
          label: updates.label || currentNode.data.label,
        };
        
        // Update the node's inputs object with the form data
        const updatedInputs = {
          ...currentNode.data.inputs,
        };
        
        // Apply all updates to the inputs object
        Object.entries(updates).forEach(([key, value]) => {
          if (key !== 'label') {
            updatedInputs[key] = value;
          }
        });
        
        // Update the complete node
        flowData.nodes[nodeIndex] = {
          ...currentNode,
          data: {
            ...updatedNodeData,
            inputs: updatedInputs
          }
        };
        
        const updatedWorkflow = {
          ...workflowData,
          flowData: JSON.stringify(flowData),
          updatedAt: new Date().toISOString()
        };
        
        console.log('💾 Node saved:', nodeId, 'Updates:', updates);
        console.log('📝 Updated inputs:', updatedInputs);
        
        setWorkflowData(updatedWorkflow);
      } else {
        console.error('❌ Node not found:', nodeId);
      }
    } catch (error) {
      console.error('❌ Error updating node:', error);
    }
    
    setIsNodeEditorOpen(false);
  };

  return {
    workflowData,
    setWorkflowData,
    selectedNode,
    setSelectedNode,
    isNodeEditorOpen,
    setIsNodeEditorOpen,
    activeTab,
    setActiveTab,
    handleNodeClick,
    handleNodeEdit,
    handleNodeSave
  };
}
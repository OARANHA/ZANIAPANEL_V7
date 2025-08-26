import { useState, useEffect, useRef } from 'react';
import { AutoSaveManager, AutoSaveState } from '@/lib/auto-save';
import type { FlowiseWorkflow } from '../types';

export function useAutoSave(
  workflowData: FlowiseWorkflow,
  initialWorkflow: FlowiseWorkflow,
  onSave?: (updatedWorkflow: FlowiseWorkflow) => void
) {
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    isDirty: false,
    retryCount: 0,
    error: null
  });
  
  const autoSaveManagerRef = useRef<AutoSaveManager | null>(null);

  // Initialize auto-save manager
  useEffect(() => {
    if (!autoSaveManagerRef.current) {
      const saveCallback = async (data: any) => {
        try {
          // Simulate API call to save workflow
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Call the parent save callback if available
          if (onSave) {
            onSave(data);
          }
          
          console.log('🔄 Auto-save completed successfully');
          return true;
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
          return false;
        }
      };

      autoSaveManagerRef.current = new AutoSaveManager(saveCallback, {
        enabled: true,
        interval: 30000, // 30 seconds
        maxRetries: 3,
        debounceTime: 2000 // 2 seconds
      });

      // Start periodic auto-save
      autoSaveManagerRef.current.startPeriodicSave(workflowData);

      // Set up state update listener
      const updateAutoSaveState = () => {
        if (autoSaveManagerRef.current) {
          setAutoSaveState(autoSaveManagerRef.current.getState());
        }
      };

      // Update state every second
      const stateInterval = setInterval(updateAutoSaveState, 1000);

      return () => {
        clearInterval(stateInterval);
        if (autoSaveManagerRef.current) {
          autoSaveManagerRef.current.destroy();
        }
      };
    }
  }, [onSave]);

  // Trigger auto-save when workflow data changes
  useEffect(() => {
    if (autoSaveManagerRef.current && workflowData !== initialWorkflow) {
      autoSaveManagerRef.current.markDirty(workflowData);
    }
  }, [workflowData, initialWorkflow]);

  const markSaved = () => {
    if (autoSaveManagerRef.current) {
      autoSaveManagerRef.current.markSaved();
    }
  };

  return {
    autoSaveState,
    autoSaveManagerRef,
    markSaved
  };
}
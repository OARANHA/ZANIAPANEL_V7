interface HistoryState {
  nodes: any[];
  edges: any[];
  timestamp: number;
}

interface WorkflowHistory {
  past: HistoryState[];
  present: HistoryState | null;
  future: HistoryState[];
  maxHistorySize: number;
}

export class WorkflowHistoryManager {
  private history: WorkflowHistory = {
    past: [],
    present: null,
    future: [],
    maxHistorySize: 50
  };

  constructor(initialState: HistoryState) {
    this.history.present = initialState;
  }

  // Save current state to history
  saveState(state: HistoryState) {
    if (this.history.present) {
      // Add current state to past
      this.history.past.push({ ...this.history.present });
      
      // Limit history size
      if (this.history.past.length > this.history.maxHistorySize) {
        this.history.past.shift();
      }
    }

    // Set new present state
    this.history.present = { ...state };
    
    // Clear future when new action is performed
    this.history.future = [];
  }

  // Undo last action
  undo(): HistoryState | null {
    if (this.history.past.length === 0) {
      return null;
    }

    // Move current state to future
    if (this.history.present) {
      this.history.future.push({ ...this.history.present });
    }

    // Get last state from past
    const previousState = this.history.past.pop();
    if (previousState) {
      this.history.present = { ...previousState };
      return { ...previousState };
    }

    return null;
  }

  // Redo next action
  redo(): HistoryState | null {
    if (this.history.future.length === 0) {
      return null;
    }

    // Move current state to past
    if (this.history.present) {
      this.history.past.push({ ...this.history.present });
    }

    // Get next state from future
    const nextState = this.history.future.pop();
    if (nextState) {
      this.history.present = { ...nextState };
      return { ...nextState };
    }

    return null;
  }

  // Check if undo is available
  canUndo(): boolean {
    return this.history.past.length > 0;
  }

  // Check if redo is available
  canRedo(): boolean {
    return this.history.future.length > 0;
  }

  // Get current state
  getCurrentState(): HistoryState | null {
    return this.history.present ? { ...this.history.present } : null;
  }

  // Clear history
  clear() {
    this.history.past = [];
    this.history.future = [];
    if (this.history.present) {
      this.history.past.push({ ...this.history.present });
    }
  }

  // Get history info for debugging
  getHistoryInfo() {
    return {
      past: this.history.past.length,
      present: this.history.present ? 'exists' : 'null',
      future: this.history.future.length,
      maxSize: this.history.maxHistorySize
    };
  }
}

// Hook for managing workflow history in React components
export function useWorkflowHistory(initialState: HistoryState) {
  const historyManager = new WorkflowHistoryManager(initialState);
  
  return {
    saveState: (state: HistoryState) => historyManager.saveState(state),
    undo: () => historyManager.undo(),
    redo: () => historyManager.redo(),
    canUndo: () => historyManager.canUndo(),
    canRedo: () => historyManager.canRedo(),
    getCurrentState: () => historyManager.getCurrentState(),
    clear: () => historyManager.clear(),
    getHistoryInfo: () => historyManager.getHistoryInfo()
  };
}
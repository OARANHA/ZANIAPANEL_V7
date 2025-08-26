export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  maxRetries: number;
  debounceTime: number; // in milliseconds
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
  retryCount: number;
  error: string | null;
}

export class AutoSaveManager {
  private config: AutoSaveConfig;
  private state: AutoSaveState;
  private saveTimer: NodeJS.Timeout | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private saveCallback: (data: any) => Promise<boolean>;

  constructor(
    saveCallback: (data: any) => Promise<boolean>,
    config: Partial<AutoSaveConfig> = {}
  ) {
    this.config = {
      enabled: true,
      interval: 30000, // 30 seconds
      maxRetries: 3,
      debounceTime: 1000, // 1 second
      ...config
    };

    this.state = {
      isSaving: false,
      lastSaved: null,
      isDirty: false,
      retryCount: 0,
      error: null
    };

    this.saveCallback = saveCallback;
  }

  // Mark data as dirty and trigger auto-save
  markDirty(data: any) {
    if (!this.config.enabled) return;

    this.state.isDirty = true;
    
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.triggerSave(data);
    }, this.config.debounceTime);
  }

  // Trigger save immediately
  async triggerSave(data: any): Promise<boolean> {
    if (!this.config.enabled || this.state.isSaving) return false;

    try {
      this.state.isSaving = true;
      this.state.error = null;

      const success = await this.saveCallback(data);

      if (success) {
        this.state.lastSaved = new Date();
        this.state.isDirty = false;
        this.state.retryCount = 0;
      } else {
        throw new Error('Save callback returned false');
      }

      return true;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      this.state.retryCount++;

      // Retry if max retries not reached
      if (this.state.retryCount < this.config.maxRetries) {
        console.log(`Auto-save retry ${this.state.retryCount}/${this.config.maxRetries}`);
        
        // Exponential backoff
        const delay = Math.pow(2, this.state.retryCount) * 1000;
        setTimeout(() => this.triggerSave(data), delay);
      }

      return false;
    } finally {
      this.state.isSaving = false;
    }
  }

  // Start periodic auto-save
  startPeriodicSave(data: any) {
    if (!this.config.enabled) return;

    // Clear existing timer
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
    }

    // Set new timer
    this.saveTimer = setInterval(() => {
      if (this.state.isDirty && !this.state.isSaving) {
        this.triggerSave(data);
      }
    }, this.config.interval);
  }

  // Stop periodic auto-save
  stopPeriodicSave() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  // Get current state
  getState(): AutoSaveState {
    return { ...this.state };
  }

  // Update configuration
  updateConfig(config: Partial<AutoSaveConfig>) {
    this.config = { ...this.config, ...config };
    
    // Restart periodic save if interval changed
    if (config.interval !== undefined && this.saveTimer) {
      this.stopPeriodicSave();
      // Note: You might want to pass current data here
      // this.startPeriodicSave(currentData);
    }
  }

  // Force save regardless of dirty state
  async forceSave(data: any): Promise<boolean> {
    this.state.isDirty = true;
    return this.triggerSave(data);
  }

  // Mark as saved (useful for manual saves)
  markSaved() {
    this.state.lastSaved = new Date();
    this.state.isDirty = false;
    this.state.retryCount = 0;
    this.state.error = null;
  }

  // Reset state
  reset() {
    this.state = {
      isSaving: false,
      lastSaved: null,
      isDirty: false,
      retryCount: 0,
      error: null
    };

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  // Cleanup
  destroy() {
    this.stopPeriodicSave();
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

// Hook for React components
export function useAutoSave(
  saveCallback: (data: any) => Promise<boolean>,
  config: Partial<AutoSaveConfig> = {}
) {
  const autoSaveManager = new AutoSaveManager(saveCallback, config);
  
  return {
    markDirty: (data: any) => autoSaveManager.markDirty(data),
    triggerSave: (data: any) => autoSaveManager.triggerSave(data),
    startPeriodicSave: (data: any) => autoSaveManager.startPeriodicSave(data),
    stopPeriodicSave: () => autoSaveManager.stopPeriodicSave(),
    getState: () => autoSaveManager.getState(),
    updateConfig: (config: Partial<AutoSaveConfig>) => autoSaveManager.updateConfig(config),
    forceSave: (data: any) => autoSaveManager.forceSave(data),
    reset: () => autoSaveManager.reset(),
    destroy: () => autoSaveManager.destroy()
  };
}
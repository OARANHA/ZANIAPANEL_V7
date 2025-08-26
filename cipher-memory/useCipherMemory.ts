// Integration hook for Cipher Memory System with Agente V2

import { useState, useEffect } from 'react';
import { 
  createSession, 
  addTask, 
  addDecision, 
  addCodeSnippet,
  getTasksForSession,
  getDecisionsForSession,
  getCodeSnippetsForSession,
  updateSessionActivity,
  Task,
  Decision,
  CodeSnippet
} from './db';

// Types specific to Agente V2 integration
interface AgenteV2MemoryContext {
  sessionId: string | null;
  sessionName: string;
}

interface AgenteV2TaskInput {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: number;
}

interface AgenteV2DecisionInput {
  context: string;
  decision: string;
  rationale: string;
}

interface AgenteV2CodeSnippetInput {
  filename: string;
  language: string;
  content: string;
  description: string;
}

export const useCipherMemory = (sessionName: string = 'Agente V2 Development') => {
  const [memoryContext, setMemoryContext] = useState<AgenteV2MemoryContext>({
    sessionId: null,
    sessionName
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize memory session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Create a new session for this Agente V2 work
        const session = await createSession(sessionName);
        
        setMemoryContext({
          sessionId: session.id,
          sessionName: session.session_name
        });
        
        setIsInitialized(true);
        
        console.log(`Cipher Memory Session initialized: ${session.id}`);
      } catch (error) {
        console.error('Failed to initialize Cipher Memory session:', error);
      }
    };

    initializeSession();
  }, [sessionName]);

  // Record a task in memory
  const recordTask = async (task: AgenteV2TaskInput) => {
    if (!memoryContext.sessionId || !isInitialized) {
      console.warn('Memory system not initialized. Task not recorded.');
      return;
    }

    try {
      await addTask(memoryContext.sessionId, {
        ...task,
        completed_at: task.status === 'completed' ? new Date() : null
      });
      await updateSessionActivity(memoryContext.sessionId);
      console.log(`Task recorded: ${task.title}`);
    } catch (error) {
      console.error('Failed to record task:', error);
    }
  };

  // Record a decision in memory
  const recordDecision = async (decision: AgenteV2DecisionInput) => {
    if (!memoryContext.sessionId || !isInitialized) {
      console.warn('Memory system not initialized. Decision not recorded.');
      return;
    }

    try {
      await addDecision(memoryContext.sessionId, decision);
      await updateSessionActivity(memoryContext.sessionId);
      console.log(`Decision recorded: ${decision.decision.substring(0, 50)}...`);
    } catch (error) {
      console.error('Failed to record decision:', error);
    }
  };

  // Record a code snippet in memory
  const recordCodeSnippet = async (snippet: AgenteV2CodeSnippetInput) => {
    if (!memoryContext.sessionId || !isInitialized) {
      console.warn('Memory system not initialized. Code snippet not recorded.');
      return;
    }

    try {
      await addCodeSnippet(memoryContext.sessionId, snippet);
      await updateSessionActivity(memoryContext.sessionId);
      console.log(`Code snippet recorded: ${snippet.filename}`);
    } catch (error) {
      console.error('Failed to record code snippet:', error);
    }
  };

  // Get all tasks for this session
  const getTasks = async (): Promise<Task[]> => {
    if (!memoryContext.sessionId || !isInitialized) {
      return [];
    }

    try {
      const tasks = await getTasksForSession(memoryContext.sessionId);
      return tasks;
    } catch (error) {
      console.error('Failed to retrieve tasks:', error);
      return [];
    }
  };

  // Get all decisions for this session
  const getDecisions = async (): Promise<Decision[]> => {
    if (!memoryContext.sessionId || !isInitialized) {
      return [];
    }

    try {
      const decisions = await getDecisionsForSession(memoryContext.sessionId);
      return decisions;
    } catch (error) {
      console.error('Failed to retrieve decisions:', error);
      return [];
    }
  };

  // Get all code snippets for this session
  const getCodeSnippets = async (): Promise<CodeSnippet[]> => {
    if (!memoryContext.sessionId || !isInitialized) {
      return [];
    }

    try {
      const snippets = await getCodeSnippetsForSession(memoryContext.sessionId);
      return snippets;
    } catch (error) {
      console.error('Failed to retrieve code snippets:', error);
      return [];
    }
  };

  return {
    // Memory context
    memoryContext,
    isInitialized,
    
    // Memory recording functions
    recordTask,
    recordDecision,
    recordCodeSnippet,
    
    // Memory retrieval functions
    getTasks,
    getDecisions,
    getCodeSnippets
  };
};
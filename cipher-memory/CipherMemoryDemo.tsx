// Demo component showing Cipher Memory integration with Agente V2

import React, { useEffect, useState } from 'react';
import { useCipherMemory } from './useCipherMemory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CipherMemoryDemo() {
  const { 
    memoryContext, 
    isInitialized, 
    recordTask, 
    recordDecision, 
    recordCodeSnippet,
    getTasks,
    getDecisions,
    getCodeSnippets
  } = useCipherMemory('Agente V2 Refactoring Session');
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [snippets, setSnippets] = useState<any[]>([]);

  // Load existing memory data
  useEffect(() => {
    if (!isInitialized) return;

    const loadMemoryData = async () => {
      const [loadedTasks, loadedDecisions, loadedSnippets] = await Promise.all([
        getTasks(),
        getDecisions(),
        getCodeSnippets()
      ]);
      
      setTasks(loadedTasks);
      setDecisions(loadedDecisions);
      setSnippets(loadedSnippets);
    };

    loadMemoryData();
  }, [isInitialized, getTasks, getDecisions, getCodeSnippets]);

  // Demo functions to record different types of information
  const demoRecordTask = async () => {
    await recordTask({
      title: 'Split monolithic component file',
      description: 'Divide the large page.tsx file into smaller, manageable components',
      status: 'in_progress',
      priority: 3
    });
    
    // Refresh tasks list
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
  };

  const demoRecordDecision = async () => {
    await recordDecision({
      context: 'File size exceeded 1000 lines in Agente V2 page component',
      decision: 'Refactor into multiple smaller components with dedicated hooks',
      rationale: 'Improved code maintainability, better performance through memoization, and easier testing'
    });
    
    // Refresh decisions list
    const updatedDecisions = await getDecisions();
    setDecisions(updatedDecisions);
  };

  const demoRecordCodeSnippet = async () => {
    await recordCodeSnippet({
      filename: 'useAgents.ts',
      language: 'typescript',
      content: `export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ... rest of hook logic
};`,
      description: 'Custom hook for managing agent state and API calls'
    });
    
    // Refresh snippets list
    const updatedSnippets = await getCodeSnippets();
    setSnippets(updatedSnippets);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Initializing Cipher Memory System...</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cipher Memory System Demo</CardTitle>
        <CardDescription>
          Demonstrating persistent memory for Agente V2 development
        </CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">Session ID: {memoryContext.sessionId?.substring(0, 8)}...</Badge>
          <Badge variant="default">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={demoRecordTask} variant="outline">
            Record Task
          </Button>
          <Button onClick={demoRecordDecision} variant="outline">
            Record Decision
          </Button>
          <Button onClick={demoRecordCodeSnippet} variant="outline">
            Record Code Snippet
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tasks recorded yet</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.id} className="border-b pb-2 last:border-0">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">{task.description}</div>
                      <Badge variant="secondary" className="mt-1">
                        {task.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Decisions ({decisions.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto">
              {decisions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No decisions recorded yet</p>
              ) : (
                <ul className="space-y-2">
                  {decisions.map((decision) => (
                    <li key={decision.id} className="border-b pb-2 last:border-0">
                      <div className="font-medium">{decision.decision}</div>
                      <div className="text-sm text-muted-foreground">{decision.context}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Code Snippets ({snippets.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto">
              {snippets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No code snippets recorded yet</p>
              ) : (
                <ul className="space-y-2">
                  {snippets.map((snippet) => (
                    <li key={snippet.id} className="border-b pb-2 last:border-0">
                      <div className="font-medium">{snippet.filename}</div>
                      <div className="text-sm text-muted-foreground">{snippet.description}</div>
                      <Badge variant="outline" className="mt-1">
                        {snippet.language}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
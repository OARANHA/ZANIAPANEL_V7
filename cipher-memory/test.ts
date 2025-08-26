#!/usr/bin/env node

// Test script for Cipher Memory System

import { 
  createSession, 
  addTask, 
  addDecision, 
  addCodeSnippet,
  getAllSessions,
  getTasksForSession,
  getDecisionsForSession,
  getCodeSnippetsForSession
} from './db';

async function runTests() {
  console.log('🧪 Running Cipher Memory System Tests...\n');
  
  try {
    // Test 1: Create a session
    console.log('Test 1: Creating a session...');
    const session = await createSession('Test Session');
    console.log(`✅ Session created: ${session.id}\n`);
    
    // Test 2: Add a task
    console.log('Test 2: Adding a task...');
    const task = await addTask(session.id, {
      title: 'Test Task',
      description: 'This is a test task for the Cipher Memory System',
      status: 'pending',
      priority: 1,
      completed_at: null
    });
    console.log(`✅ Task added: ${task.title}\n`);
    
    // Test 3: Add a decision
    console.log('Test 3: Adding a decision...');
    const decision = await addDecision(session.id, {
      context: 'Testing the Cipher Memory System',
      decision: 'Use PostgreSQL for persistent storage',
      rationale: 'PostgreSQL provides reliable ACID transactions and is well-supported'
    });
    console.log(`✅ Decision added: ${decision.decision.substring(0, 30)}...\n`);
    
    // Test 4: Add a code snippet
    console.log('Test 4: Adding a code snippet...');
    const snippet = await addCodeSnippet(session.id, {
      filename: 'test.ts',
      language: 'typescript',
      content: 'console.log("Hello, Cipher Memory!");',
      description: 'Simple test code snippet'
    });
    console.log(`✅ Code snippet added: ${snippet.filename}\n`);
    
    // Test 5: Retrieve all sessions
    console.log('Test 5: Retrieving all sessions...');
    const sessions = await getAllSessions();
    console.log(`✅ Found ${sessions.length} sessions\n`);
    
    // Test 6: Retrieve tasks for session
    console.log('Test 6: Retrieving tasks for session...');
    const tasks = await getTasksForSession(session.id);
    console.log(`✅ Found ${tasks.length} tasks\n`);
    
    // Test 7: Retrieve decisions for session
    console.log('Test 7: Retrieving decisions for session...');
    const decisions = await getDecisionsForSession(session.id);
    console.log(`✅ Found ${decisions.length} decisions\n`);
    
    // Test 8: Retrieve code snippets for session
    console.log('Test 8: Retrieving code snippets for session...');
    const snippets = await getCodeSnippetsForSession(session.id);
    console.log(`✅ Found ${snippets.length} code snippets\n`);
    
    console.log('🎉 All tests passed! Cipher Memory System is working correctly.');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
#!/usr/bin/env node

// Script to start a conversation session with Cipher Memory System

import { 
  createSession, 
  addTask, 
  addDecision, 
  addCodeSnippet,
  addMilestone
} from './db';

async function startConversationSession() {
  console.log('🚀 Starting Cipher Memory Conversation Session...');
  
  try {
    // Create a session for our conversation
    const session = await createSession('ZANAI Painel Development Conversation');
    console.log(`✅ Session created: ${session.id}`);
    console.log(`📝 Session name: ${session.session_name}`);
    console.log(`⏰ Created at: ${session.created_at}`);
    console.log(`🔄 Last activity: ${session.last_activity}`);
    console.log(`📊 Status: ${session.status}\n`);
    
    // Add initial tasks
    const task1 = await addTask(session.id, {
      title: 'Implement Cipher Memory System',
      description: 'Create PostgreSQL-based memory system for development context persistence',
      status: 'in_progress',
      priority: 3,
      completed_at: null
    });
    console.log(`✅ Task added: ${task1.title}`);
    
    const task2 = await addTask(session.id, {
      title: 'Record conversation context',
      description: 'Store important decisions and context from development discussions',
      status: 'pending',
      priority: 2,
      completed_at: null
    });
    console.log(`✅ Task added: ${task2.title}\n`);
    
    // Add initial decisions
    const decision1 = await addDecision(session.id, {
      context: 'User wants to record conversations about the current project',
      decision: 'Use Cipher Memory System with PostgreSQL for persistent storage',
      rationale: 'Allows context preservation and easy retrieval of development discussions'
    });
    console.log(`✅ Decision recorded: ${decision1.decision.substring(0, 50)}...\n`);
    
    const decision2 = await addDecision(session.id, {
      context: 'User specified not to integrate with Agente V2',
      decision: 'Focus only on conversation context recording',
      rationale: 'Simplicity and alignment with user objectives'
    });
    console.log(`✅ Decision recorded: ${decision2.decision.substring(0, 50)}...\n`);
    
    // Add initial code snippet
    const snippet = await addCodeSnippet(session.id, {
      filename: 'conversation-context.md',
      language: 'markdown',
      content: '# ZANAI Painel Development Conversation\n\nThis file stores context from our development discussions.',
      description: 'Initial conversation context file'
    });
    console.log(`✅ Code snippet added: ${snippet.filename}\n`);
    
    // Add milestone
    const milestone = await addMilestone(session.id, {
      title: 'Cipher Memory System Operational',
      description: 'Have a working memory system that records conversation context',
      achieved: false,
      target_date: new Date(Date.now() + 7 * 24 * 60 * 1000), // 1 week from now
      achieved_date: null
    });
    console.log(`✅ Milestone added: ${milestone.title}\n`);
    
    console.log('🎉 Cipher Memory Conversation Session started successfully!');
    console.log('📋 Summary:');
    console.log('   - 1 Session created');
    console.log('   - 2 Tasks added');
    console.log('   - 2 Decisions recorded');
    console.log('   - 1 Code snippet added');
    console.log('   - 1 Milestone created');
    console.log('\n💡 The Cipher Memory System is now ready to record our conversation!');
    
  } catch (error) {
    console.error('💥 Failed to start conversation session:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  startConversationSession().catch(console.error);
}
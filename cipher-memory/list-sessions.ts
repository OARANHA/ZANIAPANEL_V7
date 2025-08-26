#!/usr/bin/env node

// Script to list all sessions in the Cipher Memory System

import { getAllSessions, getTasksForSession, getDecisionsForSession } from './db';

async function listSessions() {
  console.log('🔍 Listing all Cipher Memory Sessions...\n');
  
  try {
    // Get all sessions
    const sessions = await getAllSessions();
    
    if (sessions.length === 0) {
      console.log('📭 No sessions found in the Cipher Memory System.');
      return;
    }
    
    console.log(`📁 Found ${sessions.length} session(s):\n`);
    
    // Display each session with details
    for (const session of sessions) {
      console.log(`🆔 Session ID: ${session.id}`);
      console.log(`📝 Name: ${session.session_name}`);
      console.log(`⏰ Created: ${session.created_at}`);
      console.log(`🔄 Last Activity: ${session.last_activity}`);
      console.log(`📊 Status: ${session.status}`);
      
      // Get tasks for this session
      try {
        const tasks = await getTasksForSession(session.id);
        console.log(`✅ Tasks: ${tasks.length}`);
        
        // Show first few tasks
        tasks.slice(0, 3).forEach(task => {
          console.log(`   - ${task.title} (${task.status})`);
        });
        
        if (tasks.length > 3) {
          console.log(`   ... and ${tasks.length - 3} more tasks`);
        }
      } catch (error) {
        console.log('   ❌ Error retrieving tasks:', error.message);
      }
      
      // Get decisions for this session
      try {
        const decisions = await getDecisionsForSession(session.id);
        console.log(`🧠 Decisions: ${decisions.length}`);
        
        // Show first few decisions
        decisions.slice(0, 2).forEach(decision => {
          console.log(`   - ${decision.decision.substring(0, 50)}...`);
        });
        
        if (decisions.length > 2) {
          console.log(`   ... and ${decisions.length - 2} more decisions`);
        }
      } catch (error) {
        console.log('   ❌ Error retrieving decisions:', error.message);
      }
      
      console.log('─'.repeat(50));
    }
    
  } catch (error) {
    console.error('💥 Failed to list sessions:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  listSessions().catch(console.error);
}
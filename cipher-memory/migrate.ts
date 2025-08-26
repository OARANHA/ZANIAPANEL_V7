#!/usr/bin/env node

// Migration script to create Cipher Memory System tables

import { pool } from './db';

async function runMigration() {
  console.log('🚀 Running Cipher Memory System Migration...');
  
  try {
    // Enable UUID extension
    console.log('🔧 Enabling UUID extension...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ UUID extension enabled\n');
    
    // Create coding_sessions table
    console.log('🔧 Creating coding_sessions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coding_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        last_activity TIMESTAMP DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'active'
      );
    `);
    console.log('✅ coding_sessions table created\n');
    
    // Create tasks table
    console.log('🔧 Creating tasks table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES coding_sessions(id),
        title VARCHAR(255),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP NULL
      );
    `);
    console.log('✅ tasks table created\n');
    
    // Create decisions table
    console.log('🔧 Creating decisions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS decisions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES coding_sessions(id),
        context TEXT,
        decision TEXT,
        rationale TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ decisions table created\n');
    
    // Create code_snippets table
    console.log('🔧 Creating code_snippets table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS code_snippets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES coding_sessions(id),
        filename VARCHAR(255),
        language VARCHAR(50),
        content TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ code_snippets table created\n');
    
    // Create milestones table
    console.log('🔧 Creating milestones table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES coding_sessions(id),
        title VARCHAR(255),
        description TEXT,
        achieved BOOLEAN DEFAULT FALSE,
        target_date DATE,
        achieved_date DATE NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ milestones table created\n');
    
    console.log('🎉 Cipher Memory System Migration completed successfully!');
    console.log('📋 Tables created:');
    console.log('   - coding_sessions');
    console.log('   - tasks');
    console.log('   - decisions');
    console.log('   - code_snippets');
    console.log('   - milestones');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration().catch(console.error);
}
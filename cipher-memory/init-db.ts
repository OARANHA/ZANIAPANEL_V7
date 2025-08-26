#!/usr/bin/env node

// Script to initialize the Cipher Memory System database tables

import { pool } from './db.js';
import * as fs from 'fs';
import * as path from 'path';

async function initializeDatabase() {
  console.log('🚀 Initializing Cipher Memory System Database...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    // Check if schema file exists
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      process.exit(1);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements or comments
      if (!statement || statement.startsWith('--')) {
        continue;
      }
      
      console.log(`🔧 Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      try {
        await pool.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, error);
        throw error;
      }
    }
    
    console.log('🎉 Cipher Memory System Database initialized successfully!');
    console.log('📋 Tables created:');
    console.log('   - coding_sessions');
    console.log('   - tasks');
    console.log('   - decisions');
    console.log('   - code_snippets');
    console.log('   - milestones');
    
  } catch (error) {
    console.error('💥 Failed to initialize Cipher Memory System Database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization if this file is executed directly
// Run the initialization if this file is executed directly
if (import.meta.url === new URL(process.argv[1], `file://${process.cwd()}/`).href) {
  initializeDatabase().catch(console.error);
}
// Cipher Memory System - Initialization Script

import { pool } from './db';
import * as fs from 'fs';
import * as path from 'path';

async function initializeDatabase() {
  console.log('Initializing Cipher Memory System...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await pool.query(statement);
    }
    
    console.log('Cipher Memory System initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize Cipher Memory System:', error);
  } finally {
    await pool.end();
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}
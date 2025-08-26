// Cipher Memory System - Database Connection and Helpers

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Database connection configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'cipherdb',
  user: 'cipheruser',
  password: 'cipherpass',
});

// Types for our memory system
export interface CodingSession {
  id: string;
  session_name: string;
  created_at: Date;
  last_activity: Date;
  status: string;
}

export interface Task {
  id: string;
  session_id: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  created_at: Date;
  completed_at: Date | null;
}

export interface Decision {
  id: string;
  session_id: string;
  context: string;
  decision: string;
  rationale: string;
  created_at: Date;
}

export interface CodeSnippet {
  id: string;
  session_id: string;
  filename: string;
  language: string;
  content: string;
  description: string;
  created_at: Date;
}

export interface Milestone {
  id: string;
  session_id: string;
  title: string;
  description: string;
  achieved: boolean;
  target_date: Date | null;
  achieved_date: Date | null;
  created_at: Date;
}

// Helper functions for the memory system

/**
 * Create a new coding session
 */
export async function createSession(sessionName: string): Promise<CodingSession> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO coding_sessions (session_name) VALUES ($1) RETURNING *',
      [sessionName]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Get all coding sessions
 */
export async function getAllSessions(): Promise<CodingSession[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM coding_sessions ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get a specific session by ID
 */
export async function getSessionById(sessionId: string): Promise<CodingSession | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM coding_sessions WHERE id = $1', [sessionId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
}

/**
 * Add a task to a session
 */
export async function addTask(sessionId: string, task: Omit<Task, 'id' | 'session_id' | 'created_at'>): Promise<Task> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO tasks (session_id, title, description, status, priority, completed_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [sessionId, task.title, task.description, task.status, task.priority, task.completed_at]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Add a decision to a session
 */
export async function addDecision(sessionId: string, decision: Omit<Decision, 'id' | 'session_id' | 'created_at'>): Promise<Decision> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO decisions (session_id, context, decision, rationale) VALUES ($1, $2, $3, $4) RETURNING *',
      [sessionId, decision.context, decision.decision, decision.rationale]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Add a code snippet to a session
 */
export async function addCodeSnippet(sessionId: string, snippet: Omit<CodeSnippet, 'id' | 'session_id' | 'created_at'>): Promise<CodeSnippet> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO code_snippets (session_id, filename, language, content, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sessionId, snippet.filename, snippet.language, snippet.content, snippet.description]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Add a milestone to a session
 */
export async function addMilestone(sessionId: string, milestone: Omit<Milestone, 'id' | 'session_id' | 'created_at'>): Promise<Milestone> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO milestones (session_id, title, description, achieved, target_date, achieved_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [sessionId, milestone.title, milestone.description, milestone.achieved, milestone.target_date, milestone.achieved_date]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Get all tasks for a session
 */
export async function getTasksForSession(sessionId: string): Promise<Task[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM tasks WHERE session_id = $1 ORDER BY created_at DESC', [sessionId]);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get all decisions for a session
 */
export async function getDecisionsForSession(sessionId: string): Promise<Decision[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM decisions WHERE session_id = $1 ORDER BY created_at DESC', [sessionId]);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get all code snippets for a session
 */
export async function getCodeSnippetsForSession(sessionId: string): Promise<CodeSnippet[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM code_snippets WHERE session_id = $1 ORDER BY created_at DESC', [sessionId]);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE coding_sessions SET last_activity = NOW() WHERE id = $1',
      [sessionId]
    );
  } finally {
    client.release();
  }
}

/**
 * Close the database connection pool
 */
export async function closeConnection(): Promise<void> {
  await pool.end();
}

// Export the pool for direct access if needed
export { pool };
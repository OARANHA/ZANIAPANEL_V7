# Cipher Memory System

A persistent memory layer for the ZANAI Painel development workflow, built on PostgreSQL.

## Overview

The Cipher Memory System provides a structured way to store and retrieve development context, decisions, tasks, and code snippets. It helps maintain continuity across coding sessions and enables collaborative development by storing important information in a persistent database.

## Database Schema

The system uses the following tables:

### `coding_sessions`
Stores information about coding sessions:
- `id` - Unique session identifier
- `session_name` - Human-readable session name
- `created_at` - Timestamp when session was created
- `last_activity` - Timestamp of last activity
- `status` - Session status (active, completed, archived)

### `tasks`
Tracks tasks and progress:
- `id` - Unique task identifier
- `session_id` - Reference to parent session
- `title` - Task title
- `description` - Detailed task description
- `status` - Task status (pending, in_progress, completed, blocked)
- `priority` - Task priority level (1-5)
- `created_at` - Timestamp when task was created
- `completed_at` - Timestamp when task was completed

### `decisions`
Records important architectural and implementation decisions:
- `id` - Unique decision identifier
- `session_id` - Reference to parent session
- `context` - Context in which decision was made
- `decision` - The actual decision made
- `rationale` - Reasoning behind the decision
- `created_at` - Timestamp when decision was recorded

### `code_snippets`
Stores useful code snippets:
- `id` - Unique snippet identifier
- `session_id` - Reference to parent session
- `filename` - Associated filename (if applicable)
- `language` - Programming language
- `content` - Actual code content
- `description` - Description of what the code does
- `created_at` - Timestamp when snippet was saved

### `milestones`
Tracks project milestones:
- `id` - Unique milestone identifier
- `session_id` - Reference to parent session
- `title` - Milestone title
- `description` - Detailed milestone description
- `achieved` - Whether milestone has been achieved
- `target_date` - Target completion date
- `achieved_date` - Actual achievement date
- `created_at` - Timestamp when milestone was created

## Usage

### Setting Up the Database

1. Ensure PostgreSQL is running with the correct credentials
2. Run the initialization script:
   ```bash
   npm run cipher-memory:init
   ```

### Using in Code

```typescript
import { createSession, addTask, addDecision } from './db';

// Create a new session
const session = await createSession('Agente V2 Refactoring');

// Add a task
await addTask(session.id, {
  title: 'Split monolithic file',
  description: 'Divide page.tsx into smaller components',
  status: 'in_progress',
  priority: 3
});

// Record an important decision
await addDecision(session.id, {
  context: 'File size exceeded 1000 lines',
  decision: 'Split into multiple components and hooks',
  rationale: 'Improve maintainability and performance'
});
```

## Benefits

1. **Persistence**: Information survives application restarts
2. **Context**: Easy to resume work from where you left off
3. **Collaboration**: Team members can access shared context
4. **History**: Track decisions and their rationales
5. **Metrics**: Measure progress and productivity

## Configuration

The system connects to PostgreSQL using these credentials:
- Host: `localhost`
- Port: `5432`
- Database: `cipherdb`
- Username: `cipheruser`
- Password: `cipherpass`
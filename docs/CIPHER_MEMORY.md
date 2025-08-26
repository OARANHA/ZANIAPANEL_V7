# Cipher Memory System

A persistent memory layer for the ZANAI Painel development workflow, built on PostgreSQL.

## Overview

The Cipher Memory System provides a structured way to store and retrieve development context, decisions, tasks, and code snippets. It helps maintain continuity across coding sessions and enables collaborative development by storing important information in a persistent database.

## Getting Started

### Prerequisites

Make sure you have PostgreSQL running with the following credentials:
- Host: `localhost`
- Port: `5432`
- Database: `cipherdb`
- Username: `cipheruser`
- Password: `cipherpass`

### Installation

1. Run the migration script to create the necessary tables:
   ```bash
   npm run cipher-memory:migrate
   ```

2. Initialize the database (alternative to migration):
   ```bash
   npm run cipher-memory:init
   ```

### Testing

Run the test suite to verify the system is working:
```bash
npm run cipher-memory:test
```

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

## Usage in Code

### Creating a Session

```typescript
import { createSession } from '@/lib/cipher-memory/db';

// Create a new session
const session = await createSession('Agente V2 Refactoring');
```

### Recording Information

```typescript
import { addTask, addDecision, addCodeSnippet } from '@/lib/cipher-memory/db';

// Add a task
await addTask(session.id, {
  title: 'Split monolithic file',
  description: 'Divide page.tsx into smaller components',
  status: 'in_progress',
  priority: 3,
  completed_at: null
});

// Record an important decision
await addDecision(session.id, {
  context: 'File size exceeded 1000 lines',
  decision: 'Split into multiple components and hooks',
  rationale: 'Improve maintainability and performance'
});

// Save a code snippet
await addCodeSnippet(session.id, {
  filename: 'useAgents.ts',
  language: 'typescript',
  content: 'export const useAgents = () => { ... }',
  description: 'Custom hook for managing agent state'
});
```

### Retrieving Information

```typescript
import { 
  getTasksForSession, 
  getDecisionsForSession, 
  getCodeSnippetsForSession 
} from '@/lib/cipher-memory/db';

// Get all tasks for a session
const tasks = await getTasksForSession(session.id);

// Get all decisions for a session
const decisions = await getDecisionsForSession(session.id);

// Get all code snippets for a session
const snippets = await getCodeSnippetsForSession(session.id);
```

## React Hook Integration

The system includes a React hook for easy integration with functional components:

```typescript
import { useCipherMemory } from '@/app/admin/agente-v2/hooks/useCipherMemory';

export default function MyComponent() {
  const { 
    recordTask, 
    recordDecision, 
    recordCodeSnippet,
    getTasks,
    getDecisions,
    getCodeSnippets
  } = useCipherMemory('My Development Session');
  
  // Use the functions to record and retrieve information
  // ...
}
```

## Benefits

1. **Persistence**: Information survives application restarts
2. **Context**: Easy to resume work from where you left off
3. **Collaboration**: Team members can access shared context
4. **History**: Track decisions and their rationales
5. **Metrics**: Measure progress and productivity

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Verify credentials in `cipher-memory/db.ts`
   - Check if the `cipherdb` database exists

2. **Tables Not Found**
   - Run the migration script: `npm run cipher-memory:migrate`
   - Verify the database schema was created correctly

3. **Permission Errors**
   - Ensure the `cipheruser` has proper permissions on the `cipherdb` database
   - Check if the UUID extension is installed: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Support

If you encounter any issues, please check:
1. PostgreSQL is running and accessible
2. Database credentials are correct
3. Required tables have been created
4. The `uuid-ossp` extension is enabled in PostgreSQL

For further assistance, contact the development team.
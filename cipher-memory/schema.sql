-- Cipher Memory System - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for coding sessions
CREATE TABLE IF NOT EXISTS coding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active'
);

-- Table for tasks and progress tracking
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

-- Table for important decisions
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES coding_sessions(id),
    context TEXT,
    decision TEXT,
    rationale TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table for code snippets
CREATE TABLE IF NOT EXISTS code_snippets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES coding_sessions(id),
    filename VARCHAR(255),
    language VARCHAR(50),
    content TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table for project milestones
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
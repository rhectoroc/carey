-- Migration: Session Security Table
-- Purpose: Track user sessions for inactivity timeout and concurrent login prevention.

CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    user_agent TEXT,
    ip_address TEXT
);

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(token);

-- Index for faster user session management
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON admin_sessions(user_id);

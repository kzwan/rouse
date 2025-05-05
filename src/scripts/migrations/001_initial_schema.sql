-- Core company and user tables
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slack_team_id VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    slack_user_id VARCHAR(50) UNIQUE NOT NULL,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    username VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Games catalog
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Content tables for different game types
CREATE TABLE IF NOT EXISTS word_content (
    id BIGSERIAL PRIMARY KEY,
    word VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- General active games table
CREATE TABLE IF NOT EXISTS active_games (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    channel_id VARCHAR(50), -- Channel where game is being played
    content_id BIGINT, -- References specific content table
    content_type VARCHAR(50) NOT NULL, -- Identifies which content table to use
    game_state JSONB NOT NULL, -- Game-specific state data
    status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    CHECK (content_type IN ('word', 'image', 'icebreaker', 'trivia'))
);

-- General scheduled games table
CREATE TABLE IF NOT EXISTS scheduled_games (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    channel_id VARCHAR(50), -- Channel where game will be scheduled
    cron_expression VARCHAR(100) NOT NULL,
    job_id VARCHAR(100) UNIQUE NOT NULL, -- For BullMQ
    game_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Simple stats table
CREATE TABLE IF NOT EXISTS game_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_games_user_game ON active_games(user_id, game_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_active_games_company_game ON active_games(company_id, game_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_active_games_status ON active_games(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_games_user_game ON scheduled_games(user_id, game_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_games_job_id ON scheduled_games(job_id);
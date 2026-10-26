-- SkillGraph database schema
-- PostgreSQL / Supabase

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========== goals ==========
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== skills ==========
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours INTEGER NOT NULL DEFAULT 0 CHECK (estimated_hours >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== users ==========
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'admin')),
  goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
  password_reset_token_hash VARCHAR(64),
  password_reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== goal_skills (junction) ==========
CREATE TABLE IF NOT EXISTS goal_skills (
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (goal_id, skill_id)
);

-- ========== skill_dependencies (directed graph edges) ==========
CREATE TABLE IF NOT EXISTS skill_dependencies (
  id SERIAL PRIMARY KEY,
  prerequisite_skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  dependent_skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_dependency CHECK (prerequisite_skill_id <> dependent_skill_id),
  CONSTRAINT unique_dependency UNIQUE (prerequisite_skill_id, dependent_skill_id)
);

-- ========== user_skills (known skills, not via progress) ==========
CREATE TABLE IF NOT EXISTS user_skills (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

-- ========== progress (in_progress / completed only; locked/available computed) ==========
CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_skill_progress UNIQUE (user_id, skill_id)
);

-- ========== indexes ==========
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_goal_id ON users(goal_id);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token_hash ON users(password_reset_token_hash);
CREATE INDEX IF NOT EXISTS idx_goal_skills_goal_id ON goal_skills(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_skills_skill_id ON goal_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_deps_prereq ON skill_dependencies(prerequisite_skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_deps_dependent ON skill_dependencies(dependent_skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_skill_id ON progress(skill_id);

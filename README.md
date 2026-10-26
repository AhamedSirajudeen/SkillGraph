# SkillGraph

SkillGraph is a graph-driven career-learning roadmap platform. It models skills as nodes and prerequisite relationships as directed edges, then creates a personalized learning order for each learner. The project pairs a React visualization and progress UI with an Express API, PostgreSQL data model, and explicit graph algorithms.


## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Graph Algorithms and Dynamic Skill Unlocking](#graph-algorithms-and-dynamic-skill-unlocking)
- [Database Design](#database-design)
- [Authentication and Authorization](#authentication-and-authorization)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation and Local Setup](#installation-and-local-setup)
- [Running Tests](#running-tests)
- [Known Limitations](#known-limitations)

## Project Overview

A learner selects a career goal and records skills they already know. SkillGraph resolves the goal's required skills and their transitive prerequisites, returns them in dependency order, and recalculates each skill's status from current data.

```text
Career goal + known skills
        ↓
Skill dependency graph
        ↓
DFS prerequisite resolution + topological ordering
        ↓
Personalized roadmap, status calculation, and recommendation
```

For example, in `HTML → CSS → JavaScript → React` and `JavaScript → Node.js → Express → REST API`, completing or marking HTML, CSS, and JavaScript as known makes React and Node.js available. Express remains locked until Node.js is satisfied.

## Key Features

- Learner registration, login, current-user lookup, and development-only password reset flow.
- Backend-enforced learner and admin roles.
- Goal selection and known-skill onboarding.
- Personalized roadmaps generated from a live dependency graph.
- Dynamic `LOCKED`, `AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, and `KNOWN` skill statuses.
- Backend validation that prevents progress updates for locked skills.
- Deterministic next-skill recommendations.
- React Flow graph visualization and Recharts progress visualization.
- Admin workflows for skills, goals, goal-skill mappings, dependencies, users, and platform statistics.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Visualization | React Flow, Recharts, Three.js / React Three Fiber |
| Backend | Node.js, Express |
| Data | PostgreSQL hosted by Supabase, accessed with `pg` and parameterized SQL |
| Security | JSON Web Tokens (`jsonwebtoken`), bcrypt |
| Testing | Node.js built-in test runner |

## Architecture

```text
React client
  │  HTTP via Axios
  ▼
Express routes → controllers → services → repositories
                              │
                              └→ graph services (in-memory algorithms)
  │
  ▼
PostgreSQL / Supabase via pg
```

Routes define endpoint wiring and middleware. Controllers translate HTTP requests and responses. Services implement application rules, including roadmap generation and progress validation. Repositories contain database queries. The graph layer in `backend/src/services/graph/` works with in-memory graph structures and is independently tested.

## Graph Algorithms and Dynamic Skill Unlocking

The dependency graph stores an edge as `prerequisite_skill_id → dependent_skill_id`. Its reverse adjacency map is used to walk from a required skill to all of its prerequisites.

| Module | Implementation |
| --- | --- |
| `dfs.js` | Collects transitive prerequisites and downstream reachable nodes. |
| `topologicalSort.js` | Uses Kahn's algorithm; ties are ordered by skill ID for deterministic output and a cycle causes an error. |
| `cycleDetection.js` | Rejects self-dependencies and prospective edges that would close a cycle; can also inspect an existing graph for cycles. |
| `roadmapGenerator.js` | Resolves relevant skills, topologically orders them, and computes roadmap statuses. |
| `recommendationEngine.js` | Chooses the first available goal-required skill in roadmap order, then falls back to another available prerequisite. |

`LOCKED` and `AVAILABLE` are not database values. On each roadmap request, a skill is considered satisfied when every direct prerequisite is either `COMPLETED` in `progress` or present in `user_skills` as known. `IN_PROGRESS` and `COMPLETED` are persisted in `progress`; a completed status takes precedence over known status in the displayed roadmap.

## Database Design

Supabase is used as a managed PostgreSQL host only. The application does not use the Supabase client SDK, Supabase Auth, or the REST API.

| Table | Purpose and key relationships |
| --- | --- |
| `goals` | Career goals; `name` is unique. |
| `skills` | Skill catalog with difficulty and non-negative estimated hours; `name` is unique. |
| `users` | Learner/admin accounts, optional `goal_id`, password hash, and password-reset token fields. Deleting a goal sets `goal_id` to `NULL`. |
| `goal_skills` | Goal-to-skill junction table with a composite primary key. |
| `skill_dependencies` | Directed prerequisite edges. It rejects self-references and duplicate edges. |
| `user_skills` | Skills a learner already knows; composite key of user and skill. |
| `progress` | Per-user skill progress, limited to `in_progress` or `completed`, with one row per user/skill. |

Foreign keys cascade when their owning user, skill, or goal relationship is deleted where defined in the schema. The schema also indexes foreign-key and lookup columns, including user email, user goal, reset-token hash, junction keys, dependency endpoints, and progress/user-skill keys. See [`backend/src/database/schema.sql`](backend/src/database/schema.sql).

## Authentication and Authorization

- Registration always creates a `learner`; there is no public admin-registration route.
- Passwords are hashed with bcrypt using 12 salt rounds.
- JWTs contain `id` and `role`; expiration is configured with `JWT_EXPIRES_IN`.
- Authenticated routes require `Authorization: Bearer <token>`. The middleware verifies the token and reloads the user from the database before assigning `req.user`.
- `requireRole("admin")` protects admin-only catalog, dependency, goal, and administrative endpoints.
- The seed command can create an admin user from `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `ADMIN_NAME` when no user already has that email.

The password-reset service creates and stores only a SHA-256 hash of a random token. Because no SMTP provider is configured, it returns a local development reset URL outside production and refuses reset requests in production mode.

## API Overview

All API routes are prefixed with `/api`. Responses use `{ success, data }` on success or `{ success: false, message }` on failure.

| Endpoint | Methods | Access |
| --- | --- | --- |
| `/health` | `GET` | Public health check (not under `/api`) |
| `/api/auth` | `POST /register`, `POST /login`, `POST /forgot-password`, `POST /reset-password` | Public |
| `/api/auth/me` | `GET` | Authenticated |
| `/api/skills` | `GET /`, `GET /:id` | Authenticated |
| `/api/skills` | `POST /`, `PUT /:id`, `DELETE /:id`, `GET /admin/catalog` | Admin |
| `/api/goals` | `GET /`, `GET /:id` | Authenticated |
| `/api/goals` | `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:goalId/skills`, `DELETE /:goalId/skills/:skillId` | Admin |
| `/api/user-skills` | `GET /`, `POST /`, `DELETE /:skillId` | Authenticated |
| `/api/progress` | `GET /`, `PUT /:skillId` | Authenticated |
| `/api/roadmap` | `GET /`, `POST /goal` | Authenticated |
| `/api/graph` | `GET /` | Authenticated |
| `/api/recommendations` | `GET /` | Authenticated |
| `/api/users/profile` | `PUT` | Authenticated |
| `/api/dependencies` | `GET /`, `POST /`, `DELETE /:id` | Admin |
| `/api/admin` | `GET /stats`, `GET /users` | Admin |

## Project Structure

```text
skillgraph/
├── backend/
│   ├── src/
│   │   ├── controllers/     # HTTP request handling
│   │   ├── database/        # connection, schema, seed, runners, migrations
│   │   ├── middleware/      # authentication, roles, error handling
│   │   ├── repositories/    # PostgreSQL queries
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # business logic
│   │   │   └── graph/       # graph algorithms and roadmap logic
│   │   └── server.js
│   ├── tests/graph.test.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  context/  layouts/  pages/  routes/  services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```

## Prerequisites

- Node.js and npm.
- A PostgreSQL database. A Supabase PostgreSQL project is supported by the supplied connection configuration.
- A database connection string and a long, private JWT secret.

## Environment Configuration

Copy the example file before starting the backend:

```powershell
cd backend
Copy-Item .env.example .env
```

Set only your local, private values in `backend/.env`:

```dotenv
PORT=5000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@skillgraph.dev
ADMIN_PASSWORD=replace_with_a_strong_password
ADMIN_NAME=SkillGraph Admin
```

For Supabase, copy the PostgreSQL URI from the project's database connection settings into `DATABASE_URL`. The connection module enables SSL with certificate verification disabled when that URL contains `supabase`; other URLs use the driver's default non-SSL setting. Never commit `.env` or real credentials.

## Installation and Local Setup

From the repository root:

```powershell
cd backend
npm install
npm run db:schema
npm run db:seed
npm run dev
```

`db:schema` applies `schema.sql`; `db:seed` loads the catalog, goals, dependencies, mappings, and optionally the configured admin account. The backend listens on `http://localhost:5000` by default.

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000` during development. To create and serve a production frontend build:

```powershell
cd frontend
npm run build
npm run preview
```

## Running Tests

Run the backend graph tests with:

```powershell
cd backend
npm test
```

 The suite verifies DFS traversal, cycle detection, topological sorting, prerequisite resolution, status unlocking, locked-reason formatting, and deterministic recommendations using in-memory graphs. It does not connect to PostgreSQL.

## Known Limitations

- No frontend test suite or API integration test suite is included.
- The frontend build, development servers, database schema/seed commands, live Supabase connectivity, and end-to-end API behavior were not executed during this documentation review.
- Password-reset delivery is not production-ready because no email provider is configured; development returns a reset URL and production returns a configuration error.
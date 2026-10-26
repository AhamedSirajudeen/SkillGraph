-- SkillGraph seed data
-- Idempotent-ish: uses ON CONFLICT DO NOTHING where natural keys exist

-- ========== skills ==========
INSERT INTO skills (name, description, category, difficulty, estimated_hours) VALUES
('HTML', 'Markup language for structuring web content.', 'Frontend', 'beginner', 10),
('CSS', 'Stylesheet language for designing web page layout and appearance.', 'Frontend', 'beginner', 15),
('JavaScript', 'Core scripting language of the web, used for interactivity and logic.', 'Frontend', 'beginner', 40),
('React', 'Component-based JavaScript library for building user interfaces.', 'Frontend', 'intermediate', 35),
('Node.js', 'JavaScript runtime for building server-side applications.', 'Backend', 'intermediate', 25),
('Express', 'Minimal Node.js web framework for building APIs and servers.', 'Backend', 'intermediate', 20),
('REST API', 'Designing and consuming RESTful HTTP APIs.', 'Backend', 'intermediate', 20),
('SQL', 'Querying and managing relational databases.', 'Database', 'beginner', 20),
('PostgreSQL', 'Advanced open-source relational database system.', 'Database', 'intermediate', 20),
('MongoDB', 'Document-oriented NoSQL database.', 'Database', 'intermediate', 15),
('Mongoose', 'Object data modeling (ODM) library for MongoDB and Node.js.', 'Database', 'intermediate', 10),
('Git', 'Distributed version control system.', 'Tools', 'beginner', 8),
('GitHub', 'Hosting and collaboration platform for Git repositories.', 'Tools', 'beginner', 5),
('Python', 'General-purpose programming language popular for backend and data work.', 'Backend', 'beginner', 30),
('Flask', 'Lightweight Python web framework.', 'Backend', 'intermediate', 15)
ON CONFLICT (name) DO NOTHING;

-- ========== goals ==========
INSERT INTO goals (name, description) VALUES
('Frontend Developer', 'Build modern, interactive user interfaces for the web.'),
('Backend Developer', 'Design and build server-side applications and APIs.'),
('MERN Developer', 'Full-stack development with MongoDB, Express, React and Node.js.'),
('Python Developer', 'Build applications and services using Python and Flask.'),
('Full Stack Developer', 'End-to-end web development across frontend, backend and databases.'),
('Data Analyst', 'Work with data using SQL and Python to derive insights.')
ON CONFLICT (name) DO NOTHING;

-- ========== skill_dependencies ==========
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'HTML' AND d.name = 'CSS'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'CSS' AND d.name = 'JavaScript'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'JavaScript' AND d.name = 'React'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'JavaScript' AND d.name = 'Node.js'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'Node.js' AND d.name = 'Express'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'Express' AND d.name = 'REST API'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'Git' AND d.name = 'GitHub'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'SQL' AND d.name = 'PostgreSQL'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'MongoDB' AND d.name = 'Mongoose'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'Python' AND d.name = 'Flask'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'Node.js' AND d.name = 'MongoDB'
ON CONFLICT DO NOTHING;
INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
SELECT p.id, d.id FROM skills p, skills d WHERE p.name = 'REST API' AND d.name = 'MongoDB'
ON CONFLICT DO NOTHING;

-- ========== goal_skills ==========
INSERT INTO goal_skills (goal_id, skill_id)
SELECT g.id, s.id FROM goals g, skills s
WHERE g.name = 'Frontend Developer' AND s.name IN ('HTML','CSS','JavaScript','React','Git','GitHub')
ON CONFLICT DO NOTHING;

INSERT INTO goal_skills (goal_id, skill_id)
SELECT g.id, s.id FROM goals g, skills s
WHERE g.name = 'Backend Developer' AND s.name IN ('JavaScript','Node.js','Express','REST API','SQL','PostgreSQL','Git','GitHub')
ON CONFLICT DO NOTHING;

INSERT INTO goal_skills (goal_id, skill_id)
SELECT g.id, s.id FROM goals g, skills s
WHERE g.name = 'MERN Developer' AND s.name IN ('HTML','CSS','JavaScript','React','Node.js','Express','REST API','MongoDB','Mongoose','Git','GitHub')
ON CONFLICT DO NOTHING;

INSERT INTO goal_skills (goal_id, skill_id)
SELECT g.id, s.id FROM goals g, skills s
WHERE g.name = 'Python Developer' AND s.name IN ('Python','Flask','SQL','PostgreSQL','Git','GitHub')
ON CONFLICT DO NOTHING;

INSERT INTO goal_skills (goal_id, skill_id)
SELECT g.id, s.id FROM goals g, skills s
WHERE g.name = 'Full Stack Developer' AND s.name IN ('HTML','CSS','JavaScript','React','Node.js','Express','REST API','SQL','PostgreSQL','MongoDB','Git','GitHub')
ON CONFLICT DO NOTHING;

INSERT INTO goal_skills (goal_id, skill_id)
SELECT g.id, s.id FROM goals g, skills s
WHERE g.name = 'Data Analyst' AND s.name IN ('SQL','PostgreSQL','Python','Git','GitHub')
ON CONFLICT DO NOTHING;

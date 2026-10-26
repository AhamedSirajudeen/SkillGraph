require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { pool } = require('./connection');

async function runSeed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in.');
    process.exit(1);
  }

  const seedPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  try {
    console.log('Applying seed.sql (skills, goals, dependencies, goal_skills)...');
    await pool.query(sql);
    console.log('Seed data applied.');

    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.warn(
        'ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping admin account creation. ' +
          'Set them and re-run "npm run db:seed" to create an admin account.'
      );
    } else {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
      if (existing.rows.length > 0) {
        console.log('Admin account already exists, skipping creation.');
      } else {
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await pool.query(
          `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')`,
          [ADMIN_NAME || 'Admin', ADMIN_EMAIL, hash]
        );
        console.log(`Admin account created for ${ADMIN_EMAIL}.`);
      }
    }
  } catch (err) {
    console.error('Failed to apply seed data:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runSeed();

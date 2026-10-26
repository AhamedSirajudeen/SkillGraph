require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function runSchema() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in.');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Applying schema.sql to the database...');
  try {
    await pool.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Failed to apply schema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runSchema();

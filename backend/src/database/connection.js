const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to backend/.env (see .env.example).");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};

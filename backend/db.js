const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Esto le dice a Node que acepte el certificado de Supabase
  }
});

module.exports = pool;
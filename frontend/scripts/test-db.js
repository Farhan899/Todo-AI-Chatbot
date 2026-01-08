const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');

    const client = await pool.connect();
    console.log('✓ Successfully connected to database');

    const result = await client.query('SELECT NOW()');
    console.log('✓ Query executed successfully:', result.rows[0]);

    client.release();
    await pool.end();

    console.log('\n✓ Database connection test passed!');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

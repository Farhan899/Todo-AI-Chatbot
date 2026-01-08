import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Remove sslmode from connection string and use Pool's SSL option instead
const dbUrl = process.env.DATABASE_URL?.replace(/\?sslmode=require$/, '');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

export default betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL as string || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours (in seconds)
  },
});

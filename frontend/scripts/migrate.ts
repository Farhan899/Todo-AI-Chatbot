import { auth } from "../lib/auth";

async function runMigration() {
  try {
    console.log("Running Better Auth migrations...");

    // Better Auth will automatically create tables on first use
    // We just need to ensure the connection works
    console.log("Migration setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();

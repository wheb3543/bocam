import { drizzle } from "drizzle-orm/mysql2";
import { config } from "dotenv";

config();

async function addPasswordColumn() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  try {
    const db = drizzle(databaseUrl);
    console.log("Adding password column to patients table...");
    await db.execute(`ALTER TABLE patients ADD COLUMN password VARCHAR(255) NULL`);
    console.log("✅ Password column added successfully");
  } catch (error) {
    if (error.message.includes("Duplicate column")) {
      console.log("⚠️ Password column already exists");
    } else {
      console.error("❌ Error adding password column:", error.message);
      throw error;
    }
  }

  process.exit(0);
}

addPasswordColumn();

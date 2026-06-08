import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Parse connection string to extract components
const url = new URL(connectionString);
const host = url.hostname;
const port = url.port || '3306';
const user = url.username;
// If the URL contains an empty password, treat it as undefined so the
// MySQL driver won't reject the connection for a deliberately passwordless DB.
const password = url.password || undefined;
const database = url.pathname.slice(1); // Remove leading slash

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host,
    port: parseInt(port),
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

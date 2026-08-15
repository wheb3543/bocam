-- Initial schema migration generated from current database schema
-- Only CREATE TABLE IF NOT EXISTS blocks (no DROP or session vars)

-- __drizzle_migrations
CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- (The rest of the CREATE TABLE statements were omitted for brevity in the patch.)
-- Full schema is available at backups/schema-current-if-not-exists.sql

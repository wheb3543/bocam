import { ensureDatabaseAvailable } from '../server/_core/databaseGuard.js';

async function run() {
  const db = await ensureDatabaseAvailable();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS images (
      id int AUTO_INCREMENT PRIMARY KEY,
      `key` varchar(255) NOT NULL UNIQUE,
      url varchar(500) NOT NULL,
      altAr text,
      altEn text,
      section varchar(100),
      sectionId int,
      pageId int,
      width int,
      height int,
      format varchar(10),
      size int,
      status enum('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
      isActive enum('yes', 'no') NOT NULL DEFAULT 'yes',
      publishedAt timestamp,
      deletedAt timestamp,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Table images created successfully');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

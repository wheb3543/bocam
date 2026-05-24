import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Database connection details
const DB_HOST = 'gateway02.us-east-1.prod.aws.tidbcloud.com';
const DB_PORT = 4000;
const DB_USER = '2xtgvXGdr7mxJSP.root';
const DB_PASSWORD = '5iQN6bbdle0K4JiaV41w';
const DB_NAME = 'HgGpRPs4xs9xrzjfX4xmFY';

// Tables to backup
const TABLES_TO_BACKUP = [
  'whatsapp_conversations',
  'campRegistrations',
  'appointments',
  'offerLeads'
];

// Backup directory
const BACKUP_DIR = path.join(process.cwd(), 'backups');

async function createBackup() {
  console.log('🔄 Starting database backup...');
  
  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Create timestamp for backup file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(BACKUP_DIR, `phone-tables-backup-${timestamp}.sql`);

  // Build mysqldump command
  const tablesList = TABLES_TO_BACKUP.join(' ');
  const command = `mysqldump -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} ${tablesList} > "${backupFile}"`;

  console.log(`📦 Running mysqldump command...`);
  console.log(`📄 Backup file: ${backupFile}`);

  try {
    await execAsync(command);
    
    // Check if file was created and has content
    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Backup completed successfully!');
    console.log(`📊 File size: ${fileSizeMB} MB`);
    console.log(`📍 Location: ${backupFile}`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    
    // Fallback: Use Node.js to export data if mysqldump is not available
    console.log('🔄 Attempting fallback backup using Node.js...');
    return await createFallbackBackup();
  }
}

async function createFallbackBackup() {
  console.log('📦 Creating fallback backup using Node.js...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(BACKUP_DIR, `phone-tables-backup-fallback-${timestamp}.sql`);
  
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const sqlContent = [];
    
    for (const table of TABLES_TO_BACKUP) {
      console.log(`📥 Exporting table: ${table}`);
      
      // Get table structure
      const [structure] = await connection.query(`SHOW CREATE TABLE ${table}`);
      sqlContent.push(`-- Table structure for ${table}`);
      sqlContent.push(`DROP TABLE IF EXISTS \`${table}\`;`);
      sqlContent.push(structure[0]['Create Table'] + ';');
      sqlContent.push('');
      
      // Get table data
      const [rows] = await connection.query(`SELECT * FROM ${table}`);
      
      if (rows.length > 0) {
        sqlContent.push(`-- Data for ${table}`);
        sqlContent.push(`LOCK TABLES \`${table}\` WRITE;`);
        
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "\\'")}'`;
            if (typeof val === 'boolean') return val ? 1 : 0;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          });
          
          sqlContent.push(`INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});`);
        }
        
        sqlContent.push(`UNLOCK TABLES;`);
        sqlContent.push('');
      }
    }
    
    fs.writeFileSync(backupFile, sqlContent.join('\n'));
    
    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Fallback backup completed successfully!');
    console.log(`📊 File size: ${fileSizeMB} MB`);
    console.log(`📍 Location: ${backupFile}`);
    
    await connection.end();
    return backupFile;
  } catch (error) {
    console.error('❌ Fallback backup failed:', error.message);
    await connection.end();
    throw error;
  }
}

// Run backup
createBackup()
  .then((backupFile) => {
    console.log('\n🎉 Backup process completed!');
    console.log(`📁 Backup saved to: ${backupFile}`);
  })
  .catch((error) => {
    console.error('\n💥 Backup process failed:', error);
    process.exit(1);
  });

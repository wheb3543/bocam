import mysql from 'mysql2/promise';
import readline from 'readline';

// Database connection details
const DB_HOST = 'gateway02.us-east-1.prod.aws.tidbcloud.com';
const DB_PORT = 4000;
const DB_USER = '2xtgvXGdr7mxJSP.root';
const DB_PASSWORD = '5iQN6bbdle0K4JiaV41w';
const DB_NAME = 'HgGpRPs4xs9xrzjfX4xmFY';

// Table configurations with phone number columns
const TABLE_CONFIG = {
  whatsapp_conversations: { phoneColumn: 'phoneNumber', idColumn: 'id' },
  campRegistrations: { phoneColumn: 'phone', idColumn: 'id' },
  appointments: { phoneColumn: 'phone', idColumn: 'id' },
  offerLeads: { phoneColumn: 'phone', idColumn: 'id' }
};

// Yemeni prefixes for 9-digit numbers
const YEMENI_PREFIXES = ['70', '71', '73', '77', '78'];
const YEMENI_COUNTRY_CODE = '967';

// Analysis results storage
const analysisResults = {
  sanitization: {},
  normalization: {},
  deduplication: {}
};

// Create database connection
async function createConnection() {
  return await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
}

// Sanitize phone number (remove non-numeric characters)
function sanitizePhone(phone) {
  if (!phone) return null;
  return phone.replace(/[^0-9]/g, '');
}

// Normalize phone number (add 967 for Yemeni numbers)
function normalizePhone(phone) {
  const sanitized = sanitizePhone(phone);
  if (!sanitized) return null;
  
  // If already has country code or is international, return as is
  if (sanitized.length > 10) return sanitized;
  
  // If 9-digit number with Yemeni prefix, add country code
  if (sanitized.length === 9 && YEMENI_PREFIXES.some(prefix => sanitized.startsWith(prefix))) {
    return YEMENI_COUNTRY_CODE + sanitized;
  }
  
  return sanitized;
}

// Phase 1: Analyze data and generate report
async function analyzeData(connection) {
  console.log('\n🔍 Phase 1: Analyzing data...\n');
  
  for (const [tableName, config] of Object.entries(TABLE_CONFIG)) {
    console.log(`📊 Analyzing table: ${tableName}`);
    
    const { phoneColumn, idColumn } = config;
    
    // Get all phone numbers
    const [rows] = await connection.query(
      `SELECT ${idColumn}, ${phoneColumn} FROM ${tableName} WHERE ${phoneColumn} IS NOT NULL AND ${phoneColumn} != ''`
    );
    
    const totalRecords = rows.length;
    let needsSanitization = 0;
    let needsNormalization = 0;
    const phoneStats = {};
    
    for (const row of rows) {
      const originalPhone = row[phoneColumn];
      const sanitizedPhone = sanitizePhone(originalPhone);
      const normalizedPhone = normalizePhone(originalPhone);
      
      // Check if needs sanitization
      if (originalPhone !== sanitizedPhone) {
        needsSanitization++;
      }
      
      // Check if needs normalization
      if (sanitizedPhone !== normalizedPhone) {
        needsNormalization++;
      }
      
      // Track phone number lengths
      const len = sanitizedPhone ? sanitizedPhone.length : 0;
      phoneStats[len] = (phoneStats[len] || 0) + 1;
    }
    
    analysisResults.sanitization[tableName] = {
      totalRecords,
      needsSanitization,
      percentage: ((needsSanitization / totalRecords) * 100).toFixed(2)
    };
    
    analysisResults.normalization[tableName] = {
      needsNormalization,
      percentage: totalRecords > 0 ? ((needsNormalization / totalRecords) * 100).toFixed(2) : 0
    };
    
    console.log(`   Total records: ${totalRecords}`);
    console.log(`   Needs sanitization: ${needsSanitization} (${analysisResults.sanitization[tableName].percentage}%)`);
    console.log(`   Needs normalization: ${needsNormalization} (${analysisResults.normalization[tableName].percentage}%)`);
    console.log(`   Phone length distribution:`, phoneStats);
    console.log('');
  }
  
  // Analyze duplicates in whatsapp_conversations
  console.log(`🔍 Analyzing duplicates in whatsapp_conversations...`);
  
  const [conversations] = await connection.query(`
    SELECT id, phoneNumber, createdAt
    FROM whatsapp_conversations
    WHERE phoneNumber IS NOT NULL AND phoneNumber != ''
  `);
  
  const phoneMap = new Map();
  let duplicateCount = 0;
  const duplicateGroups = [];
  
  for (const conv of conversations) {
    const normalized = sanitizePhone(conv.phoneNumber);
    if (!normalized) continue;
    
    if (phoneMap.has(normalized)) {
      const existing = phoneMap.get(normalized);
      existing.push(conv);
      if (existing.length === 2) {
        duplicateCount++;
        duplicateGroups.push(existing);
      }
    } else {
      phoneMap.set(normalized, [conv]);
    }
  }
  
  analysisResults.deduplication.whatsapp_conversations = {
    duplicateCount,
    duplicateGroups: duplicateGroups.map(group => ({
      normalizedPhone: sanitizePhone(group[0].phoneNumber),
      conversations: group.map(c => ({
        id: c.id,
        phoneNumber: c.phoneNumber,
        createdAt: c.createdAt
      }))
    }))
  };
  
  console.log(`   Duplicate phone numbers found: ${duplicateCount}`);
  console.log(`   Total conversations affected: ${conversations.length - phoneMap.size + duplicateCount}`);
  console.log('');
}

// Print detailed report
function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 DETAILED ANALYSIS REPORT');
  console.log('='.repeat(80) + '\n');
  
  console.log('🧹 PHASE 1: SANITIZATION REPORT');
  console.log('-'.repeat(80));
  for (const [tableName, stats] of Object.entries(analysisResults.sanitization)) {
    console.log(`\n📊 Table: ${tableName}`);
    console.log(`   Total records: ${stats.totalRecords}`);
    console.log(`   Records needing sanitization: ${stats.needsSanitization}`);
    console.log(`   Percentage: ${stats.percentage}%`);
  }
  
  console.log('\n\n🌍 PHASE 2: NORMALIZATION REPORT');
  console.log('-'.repeat(80));
  for (const [tableName, stats] of Object.entries(analysisResults.normalization)) {
    console.log(`\n📊 Table: ${tableName}`);
    console.log(`   Records needing normalization: ${stats.needsNormalization}`);
    console.log(`   Percentage: ${stats.percentage}%`);
  }
  
  console.log('\n\n🔗 PHASE 3: DEDUPLICATION REPORT');
  console.log('-'.repeat(80));
  const dedupStats = analysisResults.deduplication.whatsapp_conversations;
  console.log(`\n📊 Table: whatsapp_conversations`);
  console.log(`   Duplicate phone numbers: ${dedupStats.duplicateCount}`);
  console.log(`   Conversations to be merged: ${dedupStats.duplicateCount}`);
  
  if (dedupStats.duplicateGroups.length > 0) {
    console.log(`\n   Sample duplicate groups (first 5):`);
    dedupStats.duplicateGroups.slice(0, 5).forEach((group, i) => {
      const ids = group.conversations.map(c => c.id).join(', ');
      console.log(`   ${i + 1}. Phone: ${group.normalizedPhone}, IDs: [${ids}]`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('⚠️  WARNING: This operation will modify the database.');
  console.log('⚠️  Please review the report carefully before proceeding.');
  console.log('='.repeat(80) + '\n');
}

// Phase 2: Execute sanitization
async function executeSanitization(connection) {
  console.log('\n🧹 Phase 2: Executing sanitization...\n');
  
  for (const [tableName, config] of Object.entries(TABLE_CONFIG)) {
    const { phoneColumn, idColumn } = config;
    const stats = analysisResults.sanitization[tableName];
    
    if (stats.needsSanitization === 0) {
      console.log(`✅ ${tableName}: No sanitization needed`);
      continue;
    }
    
    console.log(`🔄 ${tableName}: Sanitizing ${stats.needsSanitization} records...`);
    
    const [rows] = await connection.query(
      `SELECT ${idColumn}, ${phoneColumn} FROM ${tableName} WHERE ${phoneColumn} IS NOT NULL AND ${phoneColumn} != ''`
    );
    
    let updated = 0;
    for (const row of rows) {
      const originalPhone = row[phoneColumn];
      const sanitizedPhone = sanitizePhone(originalPhone);
      
      if (originalPhone !== sanitizedPhone) {
        await connection.query(
          `UPDATE ${tableName} SET ${phoneColumn} = ? WHERE ${idColumn} = ?`,
          [sanitizedPhone, row[idColumn]]
        );
        updated++;
        
        if (updated % 100 === 0) {
          console.log(`   Progress: ${updated}/${stats.needsSanitization}`);
        }
      }
    }
    
    console.log(`✅ ${tableName}: Sanitized ${updated} records`);
  }
}

// Phase 3: Execute normalization
async function executeNormalization(connection) {
  console.log('\n🌍 Phase 3: Executing normalization...\n');
  
  for (const [tableName, config] of Object.entries(TABLE_CONFIG)) {
    const { phoneColumn, idColumn } = config;
    const stats = analysisResults.normalization[tableName];
    
    if (stats.needsNormalization === 0) {
      console.log(`✅ ${tableName}: No normalization needed`);
      continue;
    }
    
    console.log(`🔄 ${tableName}: Normalizing ${stats.needsNormalization} records...`);
    
    const [rows] = await connection.query(
      `SELECT ${idColumn}, ${phoneColumn} FROM ${tableName} WHERE ${phoneColumn} IS NOT NULL AND ${phoneColumn} != ''`
    );
    
    let updated = 0;
    for (const row of rows) {
      const originalPhone = row[phoneColumn];
      const normalizedPhone = normalizePhone(originalPhone);
      
      if (originalPhone !== normalizedPhone) {
        await connection.query(
          `UPDATE ${tableName} SET ${phoneColumn} = ? WHERE ${idColumn} = ?`,
          [normalizedPhone, row[idColumn]]
        );
        updated++;
        
        if (updated % 100 === 0) {
          console.log(`   Progress: ${updated}/${stats.needsNormalization}`);
        }
      }
    }
    
    console.log(`✅ ${tableName}: Normalized ${updated} records`);
  }
}

// Phase 4: Execute deduplication for whatsapp_conversations
async function executeDeduplication(connection) {
  console.log('\n🔗 Phase 4: Executing deduplication for whatsapp_conversations...\n');
  
  const dedupStats = analysisResults.deduplication.whatsapp_conversations;
  
  if (dedupStats.duplicateCount === 0) {
    console.log(`✅ No duplicates found`);
    return;
  }
  
  console.log(`🔄 Merging ${dedupStats.duplicateCount} duplicate conversations...`);
  
  let merged = 0;
  for (const group of dedupStats.duplicateGroups) {
    // Get conversations array from the group structure
    const groupArray = group.conversations;
    
    // Sort by createdAt (oldest first)
    groupArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Keep the oldest conversation, merge others into it
    const keepConversation = groupArray[0];
    const conversationsToDelete = groupArray.slice(1);
    
    // Move messages from duplicate conversations to the kept one
    for (const convToDelete of conversationsToDelete) {
      await connection.query(
        `UPDATE whatsapp_messages SET conversationId = ? WHERE conversationId = ?`,
        [keepConversation.id, convToDelete.id]
      );
      
      // Delete the duplicate conversation
      await connection.query(
        `DELETE FROM whatsapp_conversations WHERE id = ?`,
        [convToDelete.id]
      );
    }
    
    merged++;
    console.log(`   Progress: ${merged}/${dedupStats.duplicateCount}`);
  }
  
  console.log(`✅ Merged ${merged} duplicate conversations`);
}

// Ask for user confirmation
function askConfirmation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n⚠️  Do you want to proceed with the sanitization and normalization? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Main execution
async function main() {
  console.log('🚀 Phone Number Sanitization and Normalization Script');
  console.log('='.repeat(80));
  
  let connection = await createConnection();
  console.log('✅ Connected to database\n');
  
  try {
    // Phase 1: Analyze data
    await analyzeData(connection);
    
    // Close connection before asking for confirmation
    await connection.end();
    console.log('✅ Disconnected from database\n');
    
    // Print report
    printReport();
    
    // Ask for confirmation
    const confirmed = await askConfirmation();
    
    if (!confirmed) {
      console.log('\n❌ Operation cancelled by user');
      return;
    }
    
    // Reconnect for execution
    console.log('\n🔄 Reconnecting to database...');
    connection = await createConnection();
    console.log('✅ Connected to database\n');
    
    // Phase 2: Execute sanitization
    await executeSanitization(connection);
    
    // Phase 3: Execute normalization
    await executeNormalization(connection);
    
    // Phase 4: Execute deduplication
    await executeDeduplication(connection);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ All operations completed successfully!');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
  }
}

// Run the script
main();

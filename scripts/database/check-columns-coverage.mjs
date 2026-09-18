import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

// Parse connection string
const url = new URL(DATABASE_URL);
const host = url.hostname;
const port = url.port || '3306';
const user = url.username;
const password = url.password;
const database = url.pathname.slice(1);

const connection = mysql.createPool({
  host,
  port: parseInt(port),
  user,
  password,
  database,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkColumnsCoverage() {
  console.log('🔍 جاري التحقق من تغطية الأعمدة في جميع الجداول...\n');

  try {
    const tables = [
      'users',
      'campaigns',
      'leads',
      'doctors',
      'appointments',
      'offers',
      'camps',
      'offerLeads',
      'campRegistrations',
      'teams',
      'projects',
      'tasks',
      'whatsapp_conversations',
      'whatsapp_messages',
      'whatsapp_templates',
      'whatsapp_broadcasts',
      'whatsapp_auto_replies',
      'whatsapp_analytics',
      'scheduled_messages',
      'quick_replies',
      'saved_searches',
      'message_settings',
      'message_templates',
      'comments',
      'followUpTasks',
      'userPreferences',
      'sharedColumnTemplates',
      'savedFilters',
      'auditLogs',
      'patients',
      'patientOtps',
      'patientResults',
      'pwaInstalls',
      'visitSessions',
      'abandonedForms',
      'trackingEvents',
      'whatsapp_notifications',
      'whatsapp_blocked_numbers',
      'whatsapp_account_alerts',
      'whatsapp_security_events',
      'whatsapp_phone_quality',
      'whatsapp_conversation_quality',
      'whatsapp_user_opt_ins',
      'whatsapp_template_quality',
      'whatsapp_webhook_events',
      'whatsapp_contacts',
      'whatsapp_orders',
      'whatsapp_products',
      'whatsapp_referrals',
      'whatsapp_reactions',
      'whatsapp_transactions',
      'settings',
      'accessRequests',
      'leadStatusHistory',
      'campaignOffers',
      'campaignCamps',
      'campaignDoctors',
      'teamMembers',
      'taskDeliverables',
      'task_comments',
      'task_attachments',
    ];

    let totalColumns = 0;
    let filledColumns = 0;
    let emptyColumns = 0;
    let tablesWithMissingData = [];

    for (const table of tables) {
      try {
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        
        // Get sample data to check which columns are filled
        const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
        
        if (rows.length === 0) {
          console.log(`⚠️  ${table}: لا توجد بيانات للتحقق`);
          continue;
        }

        const row = rows[0];
        let tableFilled = 0;
        let tableEmpty = 0;
        let missingColumns = [];

        for (const column of columns) {
          totalColumns++;
          const columnName = column.Field;
          const value = row[columnName];
          
          // Check if column is filled (not null and not empty string)
          if (value !== null && value !== '' && value !== 0) {
            filledColumns++;
            tableFilled++;
          } else {
            emptyColumns++;
            tableEmpty++;
            missingColumns.push(columnName);
          }
        }

        const coverage = ((tableFilled / columns.length) * 100).toFixed(1);
        
        if (coverage < 100) {
          tablesWithMissingData.push({
            table,
            coverage,
            missing: missingColumns.length,
            total: columns.length
          });
          console.log(`⚠️  ${table}: ${coverage}% مغطى (${tableFilled}/${columns.length} أعمدة)`);
        } else {
          console.log(`✅ ${table}: ${coverage}% مغطى (${tableFilled}/${columns.length} أعمدة)`);
        }

      } catch (error) {
        console.log(`❌ ${table}: خطأ - ${error.message}`);
      }
    }

    console.log('\n📊 ملخص التغطية:');
    console.log(`  - إجمالي الأعمدة: ${totalColumns}`);
    console.log(`  - الأعمدة المملوءة: ${filledColumns}`);
    console.log(`  - الأعمدة الفارغة: ${emptyColumns}`);
    console.log(`  - نسبة التغطية العامة: ${((filledColumns / totalColumns) * 100).toFixed(1)}%`);

    if (tablesWithMissingData.length > 0) {
      console.log('\n⚠️  الجداول التي تحتوي على أعمدة فارغة:');
      tablesWithMissingData.forEach(item => {
        console.log(`  - ${item.table}: ${item.coverage}% (${item.missing}/${item.total} أعمدة فارغة)`);
      });
    } else {
      console.log('\n🎉 جميع الأعمدة في جميع الجداول مملوءة بنسبة 100%!');
    }

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

checkColumnsCoverage();
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

async function verifySeed() {
  console.log('🔍 جاري التحقق من البيانات التجريبية...\n');

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

    let totalRecords = 0;
    let tablesWithData = 0;

    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        totalRecords += count;
        if (count > 0) {
          tablesWithData++;
          console.log(`✅ ${table}: ${count} سجل`);
        } else {
          console.log(`⚠️  ${table}: 0 سجل`);
        }
      } catch (error) {
        console.log(`❌ ${table}: خطأ - ${error.message}`);
      }
    }

    console.log('\n📊 ملخص التحقق:');
    console.log(`  - الجداول التي تحتوي على بيانات: ${tablesWithData}/${tables.length}`);
    console.log(`  - إجمالي السجلات: ${totalRecords}`);
    console.log(`  - نسبة النجاح: ${((tablesWithData / tables.length) * 100).toFixed(1)}%`);

    if (tablesWithData === tables.length) {
      console.log('\n🎉 جميع الجداول تحتوي على بيانات تجريبية بنجاح!');
    } else {
      console.log('\n⚠️  بعض الجداول لا تحتوي على بيانات');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

verifySeed();
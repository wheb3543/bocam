#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve } from 'path';

const requiredVars = ['DATABASE_URL', 'OAUTH_SERVER_URL', 'VITE_APP_ID'];

const optionalVars = ['JWT_SECRET', 'REDIS_URL', 'WHATSAPP_ACCESS_TOKEN'];

console.log('🔍 Checking environment variables...\n');

// Load .env file if it exists. In managed development the required values are
// injected into process.env and may intentionally have no editable .env file.
const envVars = { ...process.env };
let envContent = '';
try {
  envContent = readFileSync(resolve('.env'), 'utf-8');
} catch (error) {
  console.log('ℹ️  لم يُعثر على ملف .env؛ سيُستخدم إعداد بيئة التشغيل المدمج إن كان متاحاً.');
}

// Parse .env file
envContent.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#') && valueParts.length > 0) {
    // لا تتجاوز القيمة المدمجة؛ فهي قد تكون اعتماداً إنتاجياً مخصصاً للمشروع.
    envVars[key.trim()] = envVars[key.trim()] || valueParts.join('=').trim();
  }
});

// Check required variables
const missing = [];
const found = [];

requiredVars.forEach((varName) => {
  if (envVars[varName]) {
    found.push(varName);
  } else {
    missing.push(varName);
  }
});

if (found.length > 0) {
  console.log('✅ Required variables found:');
  found.forEach((v) => console.log(`   - ${v}`));
  console.log('');
}

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach((v) => console.error(`   - ${v}`));
  console.log('\n💡 Please add these variables to your .env file');
  console.log('   You can copy them from .env.example\n');
  process.exit(1);
}

// Check optional variables
const missingOptional = [];
optionalVars.forEach((varName) => {
  if (!envVars[varName]) {
    missingOptional.push(varName);
  }
});

if (missingOptional.length > 0) {
  console.log('⚠️  Optional variables not set (project will work without them):');
  missingOptional.forEach((v) => console.log(`   - ${v}`));
  console.log('');
}

console.log('✅ Environment check passed!\n');

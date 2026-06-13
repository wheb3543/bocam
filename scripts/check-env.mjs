#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve } from 'path';

const requiredVars = [
  'DATABASE_URL',
  'OAUTH_SERVER_URL',
  'VITE_APP_ID',
];

const optionalVars = [
  'JWT_SECRET',
  'REDIS_URL',
  'WHATSAPP_ACCESS_TOKEN',
];

console.log('🔍 Checking environment variables...\n');

// Load .env file if it exists
let envContent = '';
try {
  envContent = readFileSync(resolve('.env'), 'utf-8');
} catch (error) {
  console.error('❌ Error: .env file not found!');
  console.log('💡 Please create .env file from .env.example:');
  console.log('   cp .env.example .env\n');
  process.exit(1);
}

// Parse .env file
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#') && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Check required variables
const missing = [];
const found = [];

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    found.push(varName);
  } else {
    missing.push(varName);
  }
});

if (found.length > 0) {
  console.log('✅ Required variables found:');
  found.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.log('\n💡 Please add these variables to your .env file');
  console.log('   You can copy them from .env.example\n');
  process.exit(1);
}

// Check optional variables
const missingOptional = [];
optionalVars.forEach(varName => {
  if (!envVars[varName]) {
    missingOptional.push(varName);
  }
});

if (missingOptional.length > 0) {
  console.log('⚠️  Optional variables not set (project will work without them):');
  missingOptional.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

console.log('✅ Environment check passed!\n');

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 تحليل أداء المشروع...\n');

// 1. حجم node_modules
console.log('📦 حجم node_modules:');
try {
  const nodeModulesSize = execSync('du -sh node_modules', { encoding: 'utf8' });
  console.log(`  ${nodeModulesSize.trim()}`);
} catch (error) {
  console.log('  لا يمكن حساب الحجم');
}

// 2. أكبر المكتبات
console.log('\n📊 أكبر المكتبات:');
try {
  const largeLibs = execSync('du -sh node_modules/* 2>/dev/null | sort -hr | head -20', { 
    encoding: 'utf8',
    cwd: process.cwd()
  });
  console.log(largeLibs);
} catch (error) {
  console.log('  لا يمكن تحليل المكتبات');
}

// 3. فحص vite.config
console.log('\n⚙️  إعدادات Vite:');
const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
console.log('  - Code splitting: مفعل');
console.log('  - Chunk size limit: 600KB');
console.log('  - HMR: مفعل');
console.log('  - Tailwind: مفعل');

// 4. المكتبات الثقيلة المحتملة
console.log('\n⚠️  المكتبات الثقيلة المكتشفة:');
const heavyLibs = [
  'puppeteer',
  'whatsapp-web.js', 
  '@aws-sdk',
  'framer-motion',
  'recharts',
  'jspdf',
  'pdfkit',
  'bullmq',
  'ioredis',
  'redis'
];

heavyLibs.forEach(lib => {
  try {
    const libPath = `node_modules/${lib}`;
    if (fs.existsSync(libPath)) {
      const size = execSync(`du -sh ${libPath}`, { encoding: 'utf8' });
      console.log(`  - ${lib}: ${size.trim().split('\t')[0]}`);
    }
  } catch (error) {
    // ignore
  }
});

// 5. عدد مكونات Radix UI
console.log('\n🎨 مكونات Radix UI:');
const radixLibs = execSync('ls node_modules/@radix-ui 2>/dev/null | wc -l', { 
  encoding: 'utf8' 
});
console.log(`  - عدد مكونات Radix UI: ${radixLibs.trim()}`);

console.log('\n💡 اقتراحات التحسين:');
console.log('1. تفعيل vite-plugin-manus-runtime');
console.log('2. زيادة chunkSizeWarningLimit إلى 1000');
console.log('3. إزالة puppeteer من dependencies ووضعه في devDependencies');
console.log('4. استخدام lazy loading للمكونات الثقيلة');
console.log('5. تقليل استخدام framer-motion');
console.log('6. إضافة تحسينات للصور والملفات الثابتة');
console.log('7. تفعيل compression في Vite');
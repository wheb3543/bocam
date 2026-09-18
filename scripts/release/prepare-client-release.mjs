import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const JavaScriptObfuscator = require('javascript-obfuscator');
const root = process.cwd();
const sourceDist = path.join(root, 'dist');
const releaseDir = path.join(root, 'release');

if (!fs.existsSync(path.join(sourceDist, 'index.js'))) {
  throw new Error('dist/index.js غير موجود. شغّل pnpm build أولاً.');
}

fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(path.join(releaseDir, 'dist'), { recursive: true });
fs.cpSync(path.join(sourceDist, 'public'), path.join(releaseDir, 'dist/public'), {
  recursive: true,
});

const serverCode = fs.readFileSync(path.join(sourceDist, 'index.js'), 'utf8');
const obfuscated = JavaScriptObfuscator.obfuscate(serverCode, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.35,
  deadCodeInjection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  sourceMap: false,
});
fs.writeFileSync(path.join(releaseDir, 'dist/index.js'), obfuscated.getObfuscatedCode());

for (const directory of ['tenants']) {
  fs.cpSync(path.join(root, directory), path.join(releaseDir, directory), {
    recursive: true,
    filter: (source) =>
      !source.includes(`${path.sep}node_modules${path.sep}`) &&
      !/^\.env(?:\.|$)/.test(path.basename(source)),
  });
}
fs.cpSync(path.join(root, 'license-keys/public-key.pem'), path.join(releaseDir, 'license-keys/public-key.pem'));
fs.writeFileSync(
  path.join(releaseDir, 'package.json'),
  JSON.stringify(
    {
      name: 'bocam-client-release',
      private: true,
      type: 'module',
      engines: { node: '>=22.13.0' },
      scripts: { start: 'NODE_ENV=production node dist/index.js' },
      dependencies: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).dependencies,
    },
    null,
    2
  ) + '\n'
);

fs.writeFileSync(
  path.join(releaseDir, '.env.example'),
  `NODE_ENV=production\nPORT=3000\nLICENSE_DOMAIN=portal.example.sa\nBOCAM_PUBLIC_URL=https://portal.example.sa\nIDEA_HUB_URL=https://your-idea-hub.example\nIDEA_HUB_SYSTEM_ID=1\nDATABASE_URL=mysql://user:password@host:3306/database\nJWT_SECRET=replace-with-a-long-random-secret\n`
);

fs.writeFileSync(
  path.join(releaseDir, 'DEPLOYMENT.txt'),
  'حزمة تشغيل BOCAM للعميل. لا تضع ملف .env الحقيقي داخل مستودع عام.\n' +
    '1) انسخ .env.example إلى .env وعدّل القيم.\n' +
    '2) ثبّت Node.js 22 أو أحدث ثم نفّذ npm ci --omit=dev --ignore-scripts --no-audit.\n' +
    '3) اطلب الترخيص من Idea Hub؛ يجب أن يطابق LICENSE_DOMAIN الدومين المستخدم.\n' +
    '4) شغّل pnpm start خلف HTTPS ومرّر متغيرات البيئة من مدير الاستضافة.\n'
);

console.log(`Client release created at ${path.relative(root, releaseDir)}`);

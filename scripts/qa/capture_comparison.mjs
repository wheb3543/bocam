import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = '/Users/applestore/.gemini/antigravity-ide/brain/d31d491c-ea49-4fe2-b45f-2206f20a9595/scratch/screenshots';
fs.mkdirSync(outDir, { recursive: true });

async function capture() {
  console.log('Launching chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  if (!fs.existsSync(path.join(outDir, 'ref_top.png'))) {
    console.log('Capturing reference site https://hail.saudigermanhealth.com/ar ...');
    try {
      const refPage = await context.newPage();
      await refPage.goto('https://hail.saudigermanhealth.com/ar', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await refPage.waitForTimeout(4000);
      await refPage.screenshot({ path: path.join(outDir, 'ref_top.png') });
      await refPage.screenshot({ path: path.join(outDir, 'ref_full.png'), fullPage: true });
      console.log('Reference site captured successfully!');
    } catch (err) {
      console.error('Error capturing ref page:', err.message);
    }
  } else {
    console.log('Reference site screenshots already exist, skipping ref capture.');
  }

  console.log('Capturing local site http://localhost:3000/ ...');
  try {
    const localPage = await context.newPage();
    await localPage.addInitScript(() => {
      window.localStorage.setItem(
        'sgh_privacy_policy_consent',
        JSON.stringify({ version: '2026-03-01', acceptedAt: new Date().toISOString() })
      );
      window.localStorage.setItem('sgh_cookie_consent', 'true');
    });
    await localPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await localPage.waitForSelector('#main-content', { timeout: 15000 });
    await localPage.waitForTimeout(1000);
    await localPage.screenshot({ path: path.join(outDir, 'local_top.png'), animations: 'disabled', timeout: 15000 });
    await localPage.screenshot({ path: path.join(outDir, 'local_full.png'), fullPage: true, animations: 'disabled', timeout: 20000 });
    console.log('Local site captured successfully!');
  } catch (err) {
    console.error('Error capturing local page:', err.message);
  }

  await browser.close();
  console.log('All screenshots captured in', outDir);
}

capture().catch(console.error);

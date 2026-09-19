import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://hail.saudigermanhealth.com/ar', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000); // wait for slider to settle

  const html = await page.content();
  fs.writeFileSync('scripts/qa/ref_html.txt', html);
  await browser.close();
})();

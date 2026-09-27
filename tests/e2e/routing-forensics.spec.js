import { test } from '@playwright/test';

test('Forensic Routing Analysis', async ({ page }) => {
  const bypassHeader = process.env.VERCEL_PROTECTION_BYPASS_TOKEN || '';
  
  const jsAsset = '/assets/index-DVRt2DeN.js';
  const cssAsset = '/assets/index-ocNlJP9l.css';
  
  console.log('--- FORENSIC ANALYSIS START ---');

  // 1. Inspect JS Asset precisely
  const jsResponse = await page.request.get(jsAsset, {
    headers: { 'x-vercel-protection-bypass': bypassHeader }
  });
  const jsBody = await jsResponse.text();
  const jsType = jsResponse.headers()['content-type'] || 'unknown';
  const jsLen = jsResponse.headers()['content-length'] || 'unknown';
  
  console.log(`JS ASSET: ${jsAsset}`);
  console.log(`Status: ${jsResponse.status()}`);
  console.log(`Content-Type: ${jsType}`);
  console.log(`Content-Length: ${jsLen}`);
  console.log(`First 100 chars: ${jsBody.substring(0, 100)}`);
  console.log(`Contains "id=root": ${jsBody.includes('id="root"')}`);
  
  // 2. Inspect CSS Asset precisely
  const cssResponse = await page.request.get(cssAsset, {
    headers: { 'x-vercel-protection-bypass': bypassHeader }
  });
  const cssBody = await cssResponse.text();
  const cssType = cssResponse.headers()['content-type'] || 'unknown';
  const cssLen = cssResponse.headers()['content-length'] || 'unknown';
  
  console.log(`CSS ASSET: ${cssAsset}`);
  console.log(`Status: ${cssResponse.status()}`);
  console.log(`Content-Type: ${cssType}`);
  console.log(`Content-Length: ${cssLen}`);
  console.log(`First 100 chars: ${cssBody.substring(0, 100)}`);
  console.log(`Contains "id=root": ${cssBody.includes('id="root"')}`);
  
  // 3. Inspect a known non-existent asset to see if it also returns index.html
  const fakeAsset = '/assets/this-file-does-not-exist-12345.js';
  const fakeResponse = await page.request.get(fakeAsset, {
    headers: { 'x-vercel-protection-bypass': bypassHeader }
  });
  const fakeBody = await fakeResponse.text();
  console.log(`FAKE ASSET: ${fakeAsset} | Status: ${fakeResponse.status()} | IndexHTML: ${fakeBody.includes('id="root"')}`);
  
  console.log('--- FORENSIC ANALYSIS END ---');
});

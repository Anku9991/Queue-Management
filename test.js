import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to http://localhost:4173/poster');
  await page.goto('http://localhost:4173/poster', { waitUntil: 'networkidle2' });
  
  console.log('Navigating to http://localhost:4173/admin');
  await page.goto('http://localhost:4173/admin', { waitUntil: 'networkidle2' });

  await browser.close();
})();

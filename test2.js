import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('Navigating to http://localhost:4173/staff');
  await page.goto('http://localhost:4173/staff', { waitUntil: 'networkidle2' });
  
  console.log('Navigating to http://localhost:4173/tv');
  await page.goto('http://localhost:4173/tv', { waitUntil: 'networkidle2' });

  await browser.close();
})();

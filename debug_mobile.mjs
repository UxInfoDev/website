import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[PAGE_ERROR]: ${err.message}`);
  });

  page.on('requestfailed', request => {
    console.error(`[REQUEST_FAILED]: ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('Navigating to https://www.uxinfotech.com/ ...');
  try {
    await page.goto('https://www.uxinfotech.com/', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('Front end loaded successfully on mobile emulator.');
  } catch (err) {
    console.error('Error loading front end:', err.message);
  }

  console.log('Navigating to https://www.uxinfotech.com/admin ...');
  try {
    await page.goto('https://www.uxinfotech.com/admin', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('Admin end loaded successfully on mobile emulator.');
  } catch (err) {
    console.error('Error loading admin end:', err.message);
  }

  await browser.close();
})();

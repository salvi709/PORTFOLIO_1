const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/Sarthak Salvi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const distDir = path.resolve(__dirname, '../dist');
  const indexHtml = path.join(distDir, 'index.html');
  const fileUrl = 'file:///' + indexHtml.replace(/\\/g, '/');
  console.log(`Loading from local file: ${fileUrl}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log('\n--- 1. Loading portfolio page ---');
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Verify Section 05 presence and structure
    console.log('\n--- 2. Checking Section 05 content & requirements ---');
    const servicesSection = await page.$('#services');
    assert.ok(servicesSection, 'Section #services must exist');

    // Section number
    const sectionNum = await page.$eval('#services .eyebrow', el => el.textContent.trim());
    console.log('Section eyebrow:', sectionNum);
    assert.ok(sectionNum.includes('05'), 'Eyebrow must contain 05');
    assert.ok(sectionNum.includes('WHAT I CAN BUILD FOR YOU'), 'Eyebrow must contain WHAT I CAN BUILD FOR YOU');

    // Cards check
    const cards = await page.$$('#services .service-tumble-card');
    console.log(`Found ${cards.length} tumble cards in Section 05`);
    assert.equal(cards.length, 4, 'Must have exactly 4 service cards');

    // Verify no separate services-grid exists
    const oldGrid = await page.$('#services .services-grid');
    assert.equal(oldGrid, null, 'Must NOT have duplicate services-grid outside template cards');

    // Verify text of all 4 cards
    const cardContents = await page.$$eval('#services .service-tumble-card', els => els.map(el => ({
      title: el.querySelector('.service-tumble-card__title')?.textContent.trim(),
      desc: el.querySelector('.service-tumble-card__desc')?.textContent.trim(),
      eyebrow: el.querySelector('.service-tumble-card__eyebrow')?.textContent.trim(),
    })));
    console.log('Cards detected in DOM:', cardContents);

    assert.equal(cardContents[0].title, 'Websites & Web Experiences');
    assert.equal(cardContents[0].desc, 'Landing pages, personal portfolios, business websites and interactive web applications.');

    assert.equal(cardContents[1].title, 'UI/UX & Interface Design');
    assert.equal(cardContents[1].desc, 'Website interfaces, dashboards, wireframes and interactive prototypes.');

    assert.equal(cardContents[2].title, 'Video & Visual Storytelling');
    assert.equal(cardContents[2].desc, 'Cinematic editing, promotional videos, short-form content and motion graphics.');

    assert.equal(cardContents[3].title, 'AI & Data-driven Experiences');
    assert.equal(cardContents[3].desc, 'AI-powered prototypes, intelligent applications and data visualization dashboards.');

    // Check Test D: No internal scrollbars or nested scroll containers in Section 05
    console.log('\n--- Test D: Checking for no nested scroll containers ---');
    const scrollableAreas = await page.$$eval('#services *', els => {
      return els.filter(el => {
        const style = window.getComputedStyle(el);
        return (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
      }).map(el => el.className);
    });
    console.log('Scrollable inner elements in Section 05:', scrollableAreas);
    assert.equal(scrollableAreas.length, 0, 'Must have zero internal scrollable elements');

    // Test A: Downward scrolling through Section 05
    console.log('\n--- Test A: Downward scrolling through Card 01 -> 04 ---');
    const stInfo = await page.evaluate(() => {
      const el = document.getElementById('services');
      const work = document.getElementById('work');
      return {
        servicesTop: el.getBoundingClientRect().top + window.scrollY,
        servicesHeight: el.offsetHeight,
        workTop: work ? work.getBoundingClientRect().top + window.scrollY : null,
      };
    });
    console.log('Section geometry:', stInfo);

    // Scroll to start of Section 05
    await page.evaluate(y => window.scrollTo(0, y), stInfo.servicesTop);
    await page.waitForTimeout(600);

    let activePill = await page.$eval('#services .services-pill--active .services-pill__num', el => el.textContent.trim());
    console.log(`At start of Section 05 (scrollY = ${stInfo.servicesTop}): active pill is ${activePill}`);
    assert.equal(activePill, '01', 'Card 01 must be active initially');

    // Scroll 33% through Section 05
    const step = (stInfo.servicesHeight - 900) / 3;
    await page.evaluate((y) => window.scrollTo(0, y), stInfo.servicesTop + step * 1);
    await page.waitForTimeout(600);
    activePill = await page.$eval('#services .services-pill--active .services-pill__num', el => el.textContent.trim());
    console.log(`At 33% through Section 05: active pill is ${activePill}`);
    assert.equal(activePill, '02', 'Card 02 must be active after first tumble');

    // Scroll 66% through Section 05
    await page.evaluate((y) => window.scrollTo(0, y), stInfo.servicesTop + step * 2);
    await page.waitForTimeout(600);
    activePill = await page.$eval('#services .services-pill--active .services-pill__num', el => el.textContent.trim());
    console.log(`At 66% through Section 05: active pill is ${activePill}`);
    assert.equal(activePill, '03', 'Card 03 must be active after second tumble');

    // Scroll 100% through Section 05
    await page.evaluate((y) => window.scrollTo(0, y), stInfo.servicesTop + step * 3);
    await page.waitForTimeout(600);
    activePill = await page.$eval('#services .services-pill--active .services-pill__num', el => el.textContent.trim());
    console.log(`At 100% through Section 05: active pill is ${activePill}`);
    assert.equal(activePill, '04', 'Card 04 must be active at final state');

    // Test B: Final card and release of pin to Selected Work
    console.log('\n--- Test B: Final card & transition to Selected Work ---');
    await page.evaluate(y => window.scrollTo(0, y + 250), stInfo.servicesTop + stInfo.servicesHeight);
    await page.waitForTimeout(600);
    const workVisible = await page.evaluate(() => {
      const work = document.getElementById('work');
      const rect = work.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    console.log('Is Selected Work visible after Section 05 finishes?', workVisible);
    assert.ok(workVisible, 'Selected Work must appear naturally after Card 04 finishes');

    // Test C: Upward scrolling reversal
    console.log('\n--- Test C: Upward scrolling reverses cards ---');
    await page.evaluate((y) => window.scrollTo(0, y), stInfo.servicesTop + step * 3);
    await page.waitForTimeout(600);
    activePill = await page.$eval('#services .services-pill--active .services-pill__num', el => el.textContent.trim());
    console.log(`Upward scroll: back to final state: pill is ${activePill}`);
    assert.equal(activePill, '04');

    await page.evaluate((y) => window.scrollTo(0, y), stInfo.servicesTop + step * 2);
    await page.waitForTimeout(600);
    activePill = await page.$eval('#services .services-pill--active .services-pill__num', el => el.textContent.trim());
    console.log(`Upward scroll: to 66%: pill is ${activePill}`);
    assert.equal(activePill, '03', 'Card 03 must reverse correctly');

    await page.evaluate((y) => window.scrollTo(0, y), stInfo.servicesTop + step * 1);
    await page.waitForTimeout(600);
    activePill = await page.$eval('#services .services-pill--active .services-pill__num', el => el.textContent.trim());
    console.log(`Upward scroll: to 33%: pill is ${activePill}`);
    assert.equal(activePill, '02', 'Card 02 must reverse correctly');

    await page.evaluate((y) => window.scrollTo(0, y), stInfo.servicesTop);
    await page.waitForTimeout(600);
    activePill = await page.$eval('#services .services-pill--active .services-pill__num', el => el.textContent.trim());
    console.log(`Upward scroll: back to top: pill is ${activePill}`);
    assert.equal(activePill, '01', 'Card 01 must reverse back to front');

    // Test E: Responsive behavior on tablet and mobile
    console.log('\n--- Test E: Responsive behavior on Tablet & Mobile ---');
    // Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(400);
    let noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    console.log('Tablet: document.scrollWidth <= window.innerWidth?', noHScroll);
    assert.ok(noHScroll, 'Tablet must have no horizontal scroll overflow');

    // Mobile (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    console.log('Mobile: document.scrollWidth <= window.innerWidth?', noHScroll);
    assert.ok(noHScroll, 'Mobile must have no horizontal scroll overflow');

    // Take screenshot of mobile Section 05
    await page.evaluate(() => {
      const el = document.getElementById('services');
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(500);
    const screenshotDir = path.resolve(__dirname, '../review/cinematic');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, 'services-mobile.png') });

    // Desktop screenshot
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const el = document.getElementById('services');
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotDir, 'services-desktop.png') });

    console.log('\n========================================');
    console.log('ALL 5 TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

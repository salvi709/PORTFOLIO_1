const { chromium } = require('C:/Users/Sarthak Salvi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const failures=[]; const checks=[];
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>failures.push(e.message));
 await page.goto(process.env.PORTFOLIO_URL || 'http://127.0.0.1:3000'); await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(2400);
 const snap=async(name)=>page.screenshot({path:`review/polish/${name}.png`});
 await snap('desktop-hero');
 assert.match(await page.locator('.hero-tagline em').evaluate(e=>getComputedStyle(e).fontFamily),/Modero/); checks.push('Local Modero applied to supporting text');
 const story=await page.locator('.scroll-story').boundingBox();
 for(const [name,t] of [['build',.28],['create',.54],['merge',.79]]){await page.evaluate(y=>scrollTo(0,y),(story.height-900)*t);await page.waitForTimeout(1200);await snap(`desktop-${name}`);}
 await page.locator('nav a[href="#work"]').first().click();await page.waitForTimeout(900);await page.mouse.wheel(0,80);await page.waitForTimeout(700);await snap('desktop-wheel-ring');
 await page.locator('nav a').filter({hasText:'Edits'}).click();await page.waitForTimeout(1200);
 assert.match(await page.locator('.works-wheel h3').innerText(),/Cinematic Edit/i);checks.push('Edits navigation selects first film');await snap('desktop-wheel-active');
 const opener=page.locator('.wheel-index-button').first(); await opener.click();await page.waitForTimeout(700);
 assert.equal(await page.locator('dialog').evaluate(e=>e.open),true);
 assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close project preview');
 for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('dialog')),true);}
 checks.push('Modal opens with close focus and contains Tab focus');
 await snap('desktop-modal');
 for(let i=0;i<7;i++){await page.keyboard.press('ArrowRight');await page.waitForTimeout(160);assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');}
 assert.match(await page.locator('#preview-modal-title').innerText(),/Splitzy/i);checks.push('Project next navigation wraps and preserves scroll lock');
 await page.keyboard.press('Escape');await page.waitForTimeout(400);assert.equal(await page.locator('dialog').count(),0);assert.equal(await opener.evaluate(e=>e===document.activeElement),true);checks.push('Escape closes and restores opener focus');
 for(const id of ['about','skills','contact']){await page.locator(`nav a[href="#${id}"]`).click();await page.waitForTimeout(1100);await snap(`desktop-${id}`);}
 await page.locator('.exploring-section').scrollIntoViewIfNeeded();await snap('desktop-exploring');
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});await page.goto(process.env.PORTFOLIO_URL || 'http://127.0.0.1:3000');await page.waitForTimeout(2300);
  assert.equal(await page.locator('.works-wheel').count(),0);assert.equal(await page.locator('.work-list-card').count(),7);
  assert.equal(await page.locator('.pin-spacer').count(),0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth);assert.equal(overflow,false,`overflow at ${width}`);
  if(width===390)await snap('mobile-hero');
  if(width<=600){await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.locator('nav a[href="#work"]').first().focus();await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');}
  await page.locator('#work').evaluate(e=>e.scrollIntoView({block:'start'}));await page.waitForTimeout(1000);if(width===390)await snap('mobile-work');
  await page.locator('.work-list-card').first().click();await page.waitForTimeout(600);if(width===390)await snap('mobile-modal');
  assert.equal(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
  await page.locator('button[title="Next project (→)"]').click();await page.waitForTimeout(250);assert.match(await page.locator('#preview-modal-title').innerText(),/Cinematic Edit/i);
  await page.getByRole('button',{name:'Close project preview'}).click();await page.waitForTimeout(400);
  for(const id of ['about','skills','contact']){await page.locator(`#${id}`).scrollIntoViewIfNeeded();await page.waitForTimeout(1100);if(width===390)await snap(`mobile-${id}`);}
  checks.push(`${width}px: no page overflow, seven usable cards, no pinned sections, modal navigation`);
 }
 await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(process.env.PORTFOLIO_URL || 'http://127.0.0.1:3000');await page.waitForTimeout(500);
 assert.equal(await page.locator('.pin-spacer').count(),0);assert.equal(await page.locator('.custom-cursor').count(),0);assert.equal(await page.locator('.work-list-card').count(),7);
 const invisible=await page.locator('.section-heading h2').evaluateAll(nodes=>nodes.some(e=>getComputedStyle(e).opacity==='0'));assert.equal(invisible,false);
 checks.push('Reduced motion: static story, all projects, visible headings, no custom cursor');
 assert.deepEqual(failures,[]);checks.push('No browser runtime errors');
 fs.writeFileSync('review/polish/results.json',JSON.stringify({checks,failures},null,2));console.log(JSON.stringify({checks,failures},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

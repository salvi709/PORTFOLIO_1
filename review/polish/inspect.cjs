const { chromium } = require('C:/Users/Sarthak Salvi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3000');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(3500);
 await page.screenshot({path:'review/polish/desktop-hero.png'});
 console.log('title',await page.title(),'errors',errors);
 await page.locator('nav a[href="#work"]').first().click(); await page.waitForTimeout(1400);
 await page.screenshot({path:'review/polish/desktop-wheel-ring.png'});
 console.log('wheel',await page.locator('.wheel-viewport').boundingBox());
 await page.mouse.wheel(0,1000); await page.waitForTimeout(1300);
 await page.screenshot({path:'review/polish/desktop-wheel-active.png'});
 await page.locator('.wheel-index-button').first().click();await page.waitForTimeout(750);
 await page.screenshot({path:'review/polish/desktop-modal.png'});
 console.log('dialog',await page.locator('dialog').evaluate(e=>e.open),'focus',await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')));
 await page.keyboard.press('Escape'); await page.waitForTimeout(400);
 for(const id of ['about','skills','contact']){await page.locator(`nav a[href="#${id}"]`).click(); await page.waitForTimeout(1200);await page.screenshot({path:`review/polish/desktop-${id}.png`});}
 console.log('final errors',errors);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
